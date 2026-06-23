from datetime import datetime, timedelta
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.config import settings
from app.models.task import Task
from app.models.notification import Notification
from app.models.goal import Goal
from app.models.schedule import Schedule
from app.workers.celery_app import celery_app
from app.services.reminder_service import build_reminder
from app.services.scheduler_service import reschedule_missed_task
from app.utils.calendar_sync import events_as_busy_blocks
from app.events.dispatcher import dispatch_notification, dispatch_schedule_update, dispatch_refresh
import logging

logger = logging.getLogger(__name__)

engine = create_engine(settings.DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@celery_app.task
def send_reminder(task_id: int, user_id: int, message: str = None):
    db = SessionLocal()
    try:
        task = db.query(Task).filter(Task.id == task_id).first()
        if not task:
            return {"status": "error", "message": "Task not found"}

        goal = db.query(Goal).filter(Goal.id == task.goal_id).first()
        reminder = build_reminder(task, goal=goal)
        notification_message = message or reminder["message"]

        notification = Notification(
            user_id=user_id,
            task_id=task_id,
            message=notification_message,
            is_read=False,
            sent_at=datetime.utcnow(),
        )
        db.add(notification)
        db.commit()
        db.refresh(notification)

        dispatch_notification(user_id, {
            "id": notification.id,
            "user_id": user_id,
            "task_id": task_id,
            "message": notification_message,
            "is_read": False,
            "sent_at": notification.sent_at.isoformat(),
        })
        return {"status": "success", "notification_id": notification.id}
    except Exception as e:
        db.rollback()
        logger.error(f"send_reminder failed: {e}")
        return {"status": "error", "message": str(e)}
    finally:
        db.close()


@celery_app.task
def check_upcoming_tasks():
    """Periodic: send context-aware reminders for tasks starting soon, and
    flag missed tasks for autonomous rescheduling."""
    db = SessionLocal()
    try:
        now = datetime.utcnow()
        upcoming = now + timedelta(minutes=15)

        tasks = db.query(Task).filter(
            Task.scheduled_at != None,
            Task.scheduled_at > now,
            Task.scheduled_at <= upcoming,
            Task.status == "pending",
        ).all()

        notifications_created = 0
        for task in tasks:
            goal = db.query(Goal).filter(Goal.id == task.goal_id).first()
            if not goal:
                continue

            existing = db.query(Notification).filter(
                Notification.task_id == task.id,
                Notification.sent_at >= now - timedelta(minutes=30),
            ).first()
            if existing:
                continue

            reminder = build_reminder(task, goal=goal)
            notification = Notification(
                user_id=goal.user_id,
                task_id=task.id,
                message=reminder["message"],
                is_read=False,
                sent_at=datetime.utcnow(),
            )
            db.add(notification)
            db.commit()
            db.refresh(notification)
            notifications_created += 1

            dispatch_notification(goal.user_id, {
                "id": notification.id,
                "user_id": goal.user_id,
                "task_id": task.id,
                "message": reminder["message"],
                "is_read": False,
                "sent_at": notification.sent_at.isoformat(),
            })

        return {"status": "success", "notifications_created": notifications_created}
    except Exception as e:
        db.rollback()
        logger.error(f"check_upcoming_tasks failed: {e}")
        return {"status": "error", "message": str(e)}
    finally:
        db.close()


@celery_app.task
def auto_reschedule_missed():
    """Periodic: detect tasks whose scheduled slot has passed without completion,
    find a new free slot (respecting calendar events + existing tasks), move them,
    notify the user, and broadcast a live schedule update."""
    db = SessionLocal()
    try:
        now = datetime.utcnow()
        from app.models.user import User
        # Find missed tasks grouped by user.
        missed_tasks = db.query(Task).filter(
            Task.scheduled_at != None,
            Task.scheduled_at < now,
            Task.status.notin_(["completed"]),
        ).all()

        if not missed_tasks:
            return {"status": "success", "rescheduled": 0}

        rescheduled = 0
        for task in missed_tasks:
            goal = db.query(Goal).filter(Goal.id == task.goal_id).first()
            if not goal:
                continue
            user_id = goal.user_id

            # Build busy blocks: calendar + other scheduled tasks.
            busy = list(events_as_busy_blocks(db, user_id))
            other_tasks = db.query(Task).join(Goal).filter(
                Goal.user_id == user_id, Task.id != task.id
            ).all()
            for ot in other_tasks:
                if ot.scheduled_at and ot.status != "completed":
                    busy.append({
                        "title": ot.title,
                        "start": ot.scheduled_at,
                        "end": ot.scheduled_at + timedelta(minutes=ot.duration_min or 30),
                        "source": "task",
                    })

            duration = task.duration_min or 30
            new_slot = reschedule_missed_task(
                task_scheduled_at=task.scheduled_at,
                duration_min=duration,
                busy_blocks=busy,
                deadline=goal.deadline,
                now=now,
            )

            task.scheduled_at = new_slot
            sch = db.query(Schedule).filter(
                Schedule.task_id == task.id, Schedule.user_id == user_id
            ).first()
            if sch:
                sch.scheduled_for = new_slot
            else:
                db.add(Schedule(user_id=user_id, task_id=task.id, scheduled_for=new_slot))

            # Bump priority since it's missed.
            task.priority = "high"

            reminder = build_reminder(task, goal=goal)
            notification = Notification(
                user_id=user_id,
                task_id=task.id,
                message=f"Auto-rescheduled \"{task.title}\" to {new_slot.strftime('%a %H:%M')}. {reminder['message']}",
                is_read=False,
                sent_at=now,
            )
            db.add(notification)

            user = db.query(User).filter(User.id == user_id).first()
            if user:
                dispatch_schedule_update(user_id, {
                    "user_id": user_id,
                    "task_id": task.id,
                    "scheduled_for": new_slot.isoformat(),
                })
                dispatch_notification(user_id, {
                    "id": notification.id if notification.id else None,
                    "user_id": user_id,
                    "task_id": task.id,
                    "message": notification.message,
                    "is_read": False,
                    "sent_at": now.isoformat(),
                })
            rescheduled += 1

        db.commit()
        # Push a single refresh per affected user so the frontend re-fetches.
        affected = {t.goal and db.query(Goal).filter(Goal.id == t.goal_id).first().user_id for t in missed_tasks if t.goal}
        for uid in affected:
            dispatch_refresh(int(uid))
        return {"status": "success", "rescheduled": rescheduled}
    except Exception as e:
        db.rollback()
        logger.error(f"auto_reschedule_missed failed: {e}")
        return {"status": "error", "message": str(e)}
    finally:
        db.close()
