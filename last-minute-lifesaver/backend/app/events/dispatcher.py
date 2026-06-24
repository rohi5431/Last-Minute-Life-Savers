"""Event dispatcher.

Provides a unified interface for API handlers, services, and Celery workers
to push real-time updates to users. Publishes events to a Redis Pub/Sub channel
so that all running FastAPI/Uvicorn processes receive the event and push
them over their active WebSocket connections.
"""
import json
import logging
from typing import Any, Dict
import redis
from app.config import settings

logger = logging.getLogger(__name__)

# Re-use connection pool for efficiency across requests/tasks
redis_pool = redis.ConnectionPool.from_url(settings.REDIS_URL, decode_responses=True)


def dispatch_user_event(user_id: int, event_type: str, payload: Dict[str, Any]) -> None:
    """Publish an event to the Redis 'lmls_events' channel.

    This is sync-safe, thread-safe, and extremely fast. It operates
    seamlessly in both async FastAPI route contexts and sync Celery worker threads.
    """
    message = {"type": event_type, "payload": payload}
    envelope = {
        "user_id": int(user_id) if user_id is not None else None,
        "message": message
    }
    try:
        client = redis.Redis(connection_pool=redis_pool)
        client.publish("lmls_events", json.dumps(envelope, default=str))
    except Exception as e:
        logger.error(f"Failed to publish event to Redis: {e}")


def dispatch_notification(user_id: int, notification: Dict[str, Any]) -> None:
    dispatch_user_event(user_id, "notification", notification)


def dispatch_task_update(user_id: int, task: Dict[str, Any], change: str = "updated") -> None:
    dispatch_user_event(user_id, "task_updated" if change == "updated" else "task_created", task)


def dispatch_schedule_update(user_id: int, schedule: Dict[str, Any]) -> None:
    dispatch_user_event(user_id, "schedule_updated", schedule)


def dispatch_reprioritization(user_id: int, changes: Dict[str, Any]) -> None:
    dispatch_user_event(user_id, "reprioritized", changes)


def dispatch_refresh(user_id: int) -> None:
    dispatch_user_event(user_id, "refresh", {"user_id": user_id})
