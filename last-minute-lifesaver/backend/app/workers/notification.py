"""Notification dispatch worker.

Provides Celery tasks to create a notification record in the DB and push a
realtime WebSocket update for the affected user. Used by flows that run
outside the request cycle (e.g. background AI completion, beat-triggered
jobs) so the frontend bell stays live without polling.
"""
from datetime import datetime
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.config import settings
from app.models.notification import Notification
from app.workers.celery_app import celery_app
from app.events.dispatcher import dispatch_notification, dispatch_refresh
import logging

logger = logging.getLogger(__name__)

engine = create_engine(settings.DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@celery_app.task
def push_notification(user_id: int, message: str, task_id: int = None):
    """Create a notification row and broadcast it over WebSocket."""
    db = SessionLocal()
    try:
        now = datetime.utcnow()
        notification = Notification(
            user_id=int(user_id),
            task_id=task_id if task_id else None,
            message=message,
            is_read=False,
            sent_at=now,
        )
        db.add(notification)
        db.commit()
        db.refresh(notification)

        dispatch_notification(int(user_id), {
            "id": notification.id,
            "user_id": int(user_id),
            "task_id": task_id if task_id else None,
            "message": message,
            "is_read": False,
            "sent_at": now.isoformat(),
        })
        return {"status": "success", "notification_id": notification.id}
    except Exception as e:
        db.rollback()
        logger.error(f"push_notification failed: {e}")
        return {"status": "error", "message": str(e)}
    finally:
        db.close()


@celery_app.task
def broadcast_refresh(user_id: int):
    """Fire-and-forget refresh event so a client re-pulls all data."""
    dispatch_refresh(int(user_id))
    return {"status": "success"}
