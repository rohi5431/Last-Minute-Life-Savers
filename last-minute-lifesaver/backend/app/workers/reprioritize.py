"""Smart re-prioritization worker.

Periodically re-scores each user's tasks based on deadline proximity, missed
slots, and progress, updates the priority in the DB, and pushes a live event
when a task's priority changes significantly.
"""
from datetime import datetime
from sqlalchemy import create_engine, func
from sqlalchemy.orm import sessionmaker
from app.config import settings
from app.models.task import Task
from app.models.goal import Goal
from app.models.notification import Notification
from app.workers.celery_app import celery_app
from app.services.priority_service import rescore_task
from app.events.dispatcher import dispatch_reprioritization, dispatch_notification, dispatch_refresh
import logging

logger = logging.getLogger(__name__)

engine = create_engine(settings.DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@celery_app.task
def reprioritize_user_tasks():
    db = SessionLocal()
    try:
        now = datetime.utcnow()
        # Active goals only
        goals = db.query(Goal).filter(Goal.status == "active").all()
        changes = []
        notifications_sent = 0

        for goal in goals:
            tasks = db.query(Task).filter(Task.goal_id == goal.id).all()
            for task in tasks:
                if task.status == "completed":
                    continue
                result = rescore_task(task, goal=goal, now=now)
                if not result["changed"]:
                    continue

                old_priority = task.priority
                old_score = None
                meta = task.ai_metadata or {}
                old_score = meta.get("priority_score")

                task.priority = result["priority"]
                meta["priority_score"] = result["score"]
                meta["last_rescored_at"] = now.isoformat()
                meta["rescore_reason"] = result["reason"]
                task.ai_metadata = meta

                changes.append({
                    "task_id": task.id,
                    "task_title": task.title,
                    "old_priority": old_priority,
                    "new_priority": result["priority"],
                    "score": result["score"],
                    "reason": result["reason"],
                    "goal_id": goal.id,
                })

                # Notify on significant bumps (to high).
                if result["priority"] == "high" and old_priority != "high":
                    notification = Notification(
                        user_id=goal.user_id,
                        task_id=task.id,
                        message=f"Priority bumped: \"{task.title}\" is now high priority — {result['reason']}.",
                        is_read=False,
                        sent_at=now,
                    )
                    db.add(notification)
                    db.commit()
                    db.refresh(notification)
                    dispatch_notification(goal.user_id, {
                        "id": notification.id,
                        "user_id": goal.user_id,
                        "task_id": task.id,
                        "message": notification.message,
                        "is_read": False,
                        "sent_at": now.isoformat(),
                    })
                    notifications_sent += 1

        db.commit()

        if changes:
            # Group changes by user and dispatch.
            user_changes = {}
            for c in changes:
                goal = db.query(Goal).filter(Goal.id == c["goal_id"]).first()
                if not goal:
                    continue
                user_changes.setdefault(goal.user_id, []).append(c)
            for user_id, items in user_changes.items():
                dispatch_reprioritization(user_id, {"changes": items})
                dispatch_refresh(user_id)

        return {
            "status": "success",
            "tasks_re_scored": len(changes),
            "notifications_sent": notifications_sent,
        }
    except Exception as e:
        db.rollback()
        logger.error(f"reprioritize_user_tasks failed: {e}")
        return {"status": "error", "message": str(e)}
    finally:
        db.close()
