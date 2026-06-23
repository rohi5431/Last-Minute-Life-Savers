"""Event dispatcher.

Provides a single `dispatch_user_event` entry point that other modules
(API handlers, services, Celery workers) call to push realtime updates to a
specific user over WebSocket. Runs the coroutine on the running event loop
when called from async context, and spawns a thread-safe task when called
from a sync context (e.g. Celery worker threads).
"""
import asyncio
import logging
from typing import Any, Dict, Optional

from app.events.websocket_manager import ws_manager

logger = logging.getLogger(__name__)


def dispatch_user_event(user_id: int, event_type: str, payload: Dict[str, Any]) -> None:
    """Fire-and-forget push of an event to a user's websocket connections."""
    message = {"type": event_type, "payload": payload}
    try:
        loop = asyncio.get_running_loop()
        loop.create_task(ws_manager.send_personal(user_id, message))
    except RuntimeError:
        # No running loop (e.g. called from a Celery worker thread).
        # Spin up a short-lived loop to flush the message.
        try:
            new_loop = asyncio.new_event_loop()
            try:
                new_loop.run_until_complete(ws_manager.send_personal(user_id, message))
            finally:
                new_loop.close()
        except Exception as e:
            logger.warning(f"dispatch_user_event fallback failed: {e}")
    except Exception as e:
        logger.warning(f"dispatch_user_event failed: {e}")


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
