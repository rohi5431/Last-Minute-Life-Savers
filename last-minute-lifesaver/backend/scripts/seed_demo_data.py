"""Seed the database with realistic demo data.

Idempotent + demo-safe: ensures the demo user exists (creating or resetting
its password), wipes that user's existing goals/tasks/schedules/notifications,
and reinserts a fresh, time-relative dataset so the dashboard always looks
alive the moment you log in.

Run from the backend container:
    python scripts/seed_demo_data.py
or from the host (with backend deps on PYTHONPATH):
    cd backend && python scripts/seed_demo_data.py

The seed does NOT run any AI agents — it writes the final planned state
directly, so it works even when Groq/Ollama are unavailable.
"""
from __future__ import annotations

import os
import sys
from datetime import datetime, timedelta

# Make `app.*` importable when run as a script (cwd may be backend/).
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import SessionLocal, engine  # noqa: E402
from app.core.security import get_password_hash  # noqa: E402
from app.models.user import User  # noqa: E402
from app.models.goal import Goal  # noqa: E402
from app.models.task import Task  # noqa: E402
from app.models.schedule import Schedule  # noqa: E402
from app.models.notification import Notification  # noqa: E402
from app.models.integration import CalendarToken, CalendarEvent  # noqa: E402
from app.models.habit import Habit, HabitLog  # noqa: E402
from app.utils.demo_data import build_demo_plan, DEMO_USER_EMAIL, DEMO_USER_PASSWORD  # noqa: E402


def _ensure_tables_exist(db):
    """Best-effort: create tables if migrations haven't been run yet.

    Safe to call when tables already exist (Table.create checks).
    """
    from app.database import Base
    import app.models  # noqa: F401 — ensures all models are registered on Base

    Base.metadata.create_all(bind=engine, checkfirst=True)


def _get_or_create_demo_user(db) -> User:
    user = db.query(User).filter(User.email == DEMO_USER_EMAIL).first()
    if user:
        # Keep credentials deterministic for the demo.
        user.hashed_password = get_password_hash(DEMO_USER_PASSWORD)
        db.commit()
        return user

    user = User(email=DEMO_USER_EMAIL, hashed_password=get_password_hash(DEMO_USER_PASSWORD))
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def _wipe_demo_user_data(db, user: User) -> None:
    """Delete all demo-user-owned rows so re-seeding is deterministic.

    Order respects FK constraints (notifications/schedules -> tasks -> goals).
    """
    db.query(Notification).filter(Notification.user_id == user.id).delete()
    db.query(Schedule).filter(Schedule.user_id == user.id).delete()
    db.query(CalendarEvent).filter(CalendarEvent.user_id == user.id).delete()
    db.query(CalendarToken).filter(CalendarToken.user_id == user.id).delete()
    db.query(HabitLog).filter(HabitLog.habit_id.in_(
        db.query(Habit.id).filter(Habit.user_id == user.id)
    )).delete(synchronize_session=False)
    db.query(Habit).filter(Habit.user_id == user.id).delete(synchronize_session=False)
    # Tasks reference goals; delete goals cascades to tasks via FK ondelete cascade,
    # but we still remove tasks explicitly to be safe across DBs.
    db.query(Task).filter(Task.goal_id.in_(
        db.query(Goal.id).filter(Goal.user_id == user.id)
    )).delete(synchronize_session=False)
    db.query(Goal).filter(Goal.user_id == user.id).delete(synchronize_session=False)
    db.commit()


def _insert_demo_calendar_context(db, user: User) -> int:
    """Insert a few calendar events so the conflict + timeline views look rich."""
    now = datetime.utcnow()
    events = [
        ("Daily standup", now + timedelta(hours=2, minutes=15), 15, "Zoom"),
        ("Office hours", now + timedelta(hours=5), 60, "Room 204"),
        ("Lunch with mentor", now + timedelta(hours=7, minutes=30), 45, "Café Nero"),
        ("Team design review", now + timedelta(days=1, hours=2), 60, "Figma call"),
    ]
    count = 0
    for title, start, duration, location in events:
        ev = CalendarEvent(
            user_id=user.id,
            external_id=f"demo_{title.lower().replace(' ', '_')}",
            provider="google",
            title=title,
            start_at=start,
            end_at=start + timedelta(minutes=duration),
            location=location,
            imported_at=now,
        )
        db.add(ev)
        count += 1
    db.commit()
    return count


def seed() -> dict:
    db = SessionLocal()
    try:
        _ensure_tables_exist(db)
        user = _get_or_create_demo_user(db)
        _wipe_demo_user_data(db, user)

        plan = build_demo_plan()
        now = plan["now"]

        task_lookup = {}  # (goal_index, task_index) -> Task obj
        total_tasks = 0
        total_scheduled = 0
        total_completed = 0

        for g_idx, g_data in enumerate(plan["goals"]):
            goal = Goal(
                user_id=user.id,
                title=g_data["title"],
                description=g_data.get("description"),
                deadline=g_data.get("deadline"),
                status="active",
                created_at=now - timedelta(hours=1, minutes=g_idx * 10),
            )
            db.add(goal)
            db.flush()  # for goal.id

            for t_idx, t_data in enumerate(g_data["tasks"]):
                scheduled_at = None
                if t_data.get("schedule_hours_from_now") is not None:
                    offset_h = t_data["schedule_hours_from_now"]
                    direction = 1 if offset_h >= 0 else -1
                    abs_h = abs(offset_h)
                    scheduled_at = now + timedelta(hours=offset_h)

                status_val = t_data.get("status", "pending")
                completed_at = t_data.get("completed_at")
                if status_val == "completed" and not completed_at:
                    completed_at = now - timedelta(hours=1, minutes=t_idx * 5)

                task = Task(
                    goal_id=goal.id,
                    title=t_data["title"],
                    duration_min=t_data.get("duration_min", 30),
                    priority=t_data.get("priority", "medium"),
                    scheduled_at=scheduled_at,
                    completed_at=completed_at,
                    status=status_val,
                    notes=t_data.get("notes"),
                    ai_metadata=t_data.get("metadata", {}),
                    created_at=now - timedelta(minutes=55, seconds=t_idx * 30),
                )
                db.add(task)
                db.flush()
                task_lookup[(g_idx, t_idx)] = task

                total_tasks += 1
                if scheduled_at:
                    total_scheduled += 1
                    db.add(Schedule(
                        user_id=user.id,
                        task_id=task.id,
                        scheduled_for=scheduled_at,
                        created_at=now,
                    ))
                if status_val == "completed":
                    total_completed += 1

        # Notifications reference tasks we just created.
        notif_count = 0
        for n_data in plan["notifications"]:
            task = task_lookup.get(n_data["task_index"]) if n_data.get("task_index") else None
            db.add(Notification(
                user_id=user.id,
                task_id=task.id if task else None,
                message=n_data["message"],
                is_read=n_data.get("is_read", False),
                sent_at=n_data["sent_at"],
            ))
            notif_count += 1

        cal_count = _insert_demo_calendar_context(db, user)

        # Seed habits
        habits_data = [
            ("Morning planning ritual", "daily", 5, now - timedelta(days=1)),
            ("Review task priority matrix", "daily", 2, now),
            ("Weekly calendar cleanup", "weekly", 12, now - timedelta(days=3))
        ]
        
        for title, freq, streak, last_comp in habits_data:
            habit = Habit(
                user_id=user.id,
                title=title,
                frequency=freq,
                streak=streak,
                last_completed=last_comp,
                created_at=now - timedelta(days=15)
            )
            db.add(habit)
            db.flush()
            
            # Log completions
            for d in range(streak):
                comp_at = last_comp - timedelta(days=d)
                db.add(HabitLog(habit_id=habit.id, completed_at=comp_at))

        db.commit()
        summary = {
            "status": "ok",
            "user": DEMO_USER_EMAIL,
            "goals": len(plan["goals"]),
            "tasks": total_tasks,
            "scheduled": total_scheduled,
            "completed": total_completed,
            "notifications": notif_count,
            "calendar_events": cal_count,
        }
        return summary
    except Exception as e:
        db.rollback()
        raise
    finally:
        db.close()


def _print_summary(summary: dict) -> None:
    print("\n" + "=" * 56)
    print("  Last-Minute Life Saver — demo data seeded")
    print("=" * 56)
    print(f"  Login email:     {summary['user']}")
    print(f"  Login password:  {DEMO_USER_PASSWORD}")
    print("-" * 56)
    print(f"  Goals:           {summary['goals']}")
    print(f"  Tasks:           {summary['tasks']} ({summary['completed']} done, {summary['scheduled']} scheduled)")
    print(f"  Notifications:   {summary['notifications']}")
    print(f"  Calendar events: {summary['calendar_events']}")
    print("=" * 56)
    print("\n  Next: open http://localhost:5173 and log in with the credentials above.\n")


if __name__ == "__main__":
    summary = seed()
    _print_summary(summary)
