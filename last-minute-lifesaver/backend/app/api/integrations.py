"""Calendar integration endpoints.

OAuth flow + event import + conflict detection + schedule optimization.
Also wires websocket broadcasts so the frontend updates live after sync/optimize.
"""
import logging
from datetime import datetime
from typing import List

from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session

from app.core.deps import get_current_user, get_db
from app.config import settings
from app.models.user import User
from app.models.task import Task
from app.models.schedule import Schedule
from app.models.goal import Goal
from app.utils import calendar_sync
from app.schemas import (
    CalendarConnectionStatus, CalendarEventOut, SyncResult, OptimizeResult, ConflictInfo,
)
from app.events.dispatcher import (
    dispatch_schedule_update, dispatch_notification, dispatch_refresh,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/calendar", tags=["calendar"])

STATE_PREFIX = "lmls_user_"


@router.post("/oauth/start")
def start_oauth(current_user: User = Depends(get_current_user)):
    """Begin Google OAuth. Returns an authorization URL to redirect the browser to."""
    if not settings.GOOGLE_CLIENT_ID or not settings.GOOGLE_CLIENT_SECRET:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Google Calendar integration is not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET.",
        )
    state = f"{STATE_PREFIX}{current_user.id}"
    auth_url = calendar_sync.get_oauth_start_url(state)
    # Encode user_id in session state so the callback knows the user.
    return {"authorization_url": auth_url}


@router.get("/oauth/callback")
def oauth_callback(code: str = None, state: str = None, error: str = None, db: Session = Depends(get_db)):
    """OAuth redirect target. Exchanges code for tokens, stores them, redirects to frontend."""
    if error:
        return RedirectResponse(url=f"{settings.FRONTEND_URL}/calendar?oauth_error={error}")

    if not state or not state.startswith(STATE_PREFIX):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid OAuth state")
    if not code:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Missing authorization code")

    user_id = int(state.replace(STATE_PREFIX, ""))
    try:
        token_data = calendar_sync.exchange_oauth_code(code)
    except Exception as e:
        logger.error(f"OAuth token exchange failed: {e}")
        return RedirectResponse(
            url=f"{settings.FRONTEND_URL}/calendar?oauth_error=token_exchange_failed"
        )

    calendar_sync.save_calendar_token(db, user_id, token_data)
    return RedirectResponse(url=f"{settings.FRONTEND_URL}/calendar?oauth_success=true")


def _connection_status(db: Session, user_id: int) -> CalendarConnectionStatus:
    from app.models.integration import CalendarToken, CalendarEvent
    token = db.query(CalendarToken).filter(
        CalendarToken.user_id == user_id, CalendarToken.provider == "google"
    ).first()
    event_count = db.query(CalendarEvent).filter(CalendarEvent.user_id == user_id).count()
    return CalendarConnectionStatus(
        connected=bool(token and token.connected and token.access_token),
        provider="google",
        last_synced_at=token.last_synced_at if token else None,
        event_count=event_count,
    )


@router.get("/status", response_model=CalendarConnectionStatus)
def get_status(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return _connection_status(db, current_user.id)


@router.post("/sync", response_model=SyncResult)
def sync_calendar(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    try:
        imported, events = calendar_sync.import_calendar_events(db, current_user.id)
    except RuntimeError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        logger.error(f"Calendar sync failed: {e}")
        raise HTTPException(status_code=status.HTTP_502_BAD_REQUEST, detail="Calendar sync failed")

    # Detect conflicts against user's scheduled tasks.
    user_tasks = (
        db.query(Task).join(Goal).filter(Goal.user_id == current_user.id).all()
    )
    conflicts = calendar_sync.detect_conflicts(db, current_user.id, user_tasks, events)

    # Notify the user of each conflict live.
    for c in conflicts:
        dispatch_notification(
            current_user.id,
            {
                "user_id": current_user.id,
                "message": c["message"],
                "is_read": False,
                "sent_at": datetime.utcnow().isoformat(),
            },
        )

    dispatch_refresh(current_user.id)
    return SyncResult(
        imported=imported,
        conflicts=conflicts,
        message=f"Imported {imported} calendar event(s)" + (f", {len(conflicts)} conflict(s) found" if conflicts else ""),
    )


@router.get("/events", response_model=List[CalendarEventOut])
def list_events(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    events = calendar_sync.list_calendar_events(db, current_user.id)
    return events


@router.get("/conflicts", response_model=List[ConflictInfo])
def get_conflicts(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    user_tasks = (
        db.query(Task).join(Goal).filter(Goal.user_id == current_user.id).all()
    )
    conflicts = calendar_sync.detect_conflicts(db, current_user.id, user_tasks)
    return conflicts


@router.post("/oauth/disconnect")
def disconnect(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    calendar_sync.disconnect_calendar(db, current_user.id)
    dispatch_refresh(current_user.id)
    return {"status": "disconnected"}


@router.post("/optimize", response_model=OptimizeResult)
def optimize_schedule(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Re-schedule tasks that conflict with calendar events or that were missed.

    For each conflicting/missed task, find a free working-hours slot using the
    calendar + existing tasks as busy blocks, update the task + its schedule row,
    and push a realtime notification.
    """
    from datetime import timedelta
    user_tasks = (
        db.query(Task).join(Goal).filter(Goal.user_id == current_user.id).all()
    )
    now = datetime.utcnow()

    # Calendar events for conflict detection.
    calendar_events = calendar_sync.list_calendar_events(db, current_user.id)
    conflicts = calendar_sync.detect_conflicts(db, current_user.id, user_tasks, calendar_events)

    conflicting_task_ids = {c["task_id"] for c in conflicts}
    missed_task_ids = {
        t.id for t in user_tasks
        if t.status not in ("completed",) and t.scheduled_at and t.scheduled_at < now
    }

    target_ids = conflicting_task_ids | missed_task_ids
    if not target_ids:
        dispatch_refresh(current_user.id)
        return OptimizeResult(rescheduled=0, conflicts_resolved=0, message="Nothing to optimize — no conflicts or missed tasks.")

    # Build busy blocks from calendar + non-target tasks.
    from datetime import timedelta as _td
    busy = [b for b in calendar_sync.events_as_busy_blocks(db, current_user.id)]
    for t in user_tasks:
        if t.id in target_ids:
            continue
        if t.scheduled_at and t.status != "completed":
            busy.append({
                "title": t.title,
                "start": t.scheduled_at,
                "end": t.scheduled_at + _td(minutes=t.duration_min or 30),
                "source": "task",
            })

    rescheduled = 0
    for task in user_tasks:
        if task.id not in target_ids:
            continue
        duration = task.duration_min or 30
        # Find goal deadline if available
        goal = db.query(Goal).filter(Goal.id == task.goal_id).first()
        deadline = goal.deadline if goal else None

        new_slot = calendar_sync.find_free_slot(busy, duration, start_from=now, deadline=deadline)
        if not new_slot:
            new_slot = now + timedelta(minutes=15)
            if deadline and new_slot + timedelta(minutes=duration) > deadline:
                new_slot = max(now, deadline - timedelta(minutes=duration))

        task.scheduled_at = new_slot
        # Update / create schedule row
        sch = db.query(Schedule).filter(
            Schedule.task_id == task.id, Schedule.user_id == current_user.id
        ).first()
        if sch:
            sch.scheduled_for = new_slot
        else:
            sch = Schedule(user_id=current_user.id, task_id=task.id, scheduled_for=new_slot)
            db.add(sch)
        # Add the new slot to busy set so subsequent tasks don't collide.
        busy.append({
            "title": task.title,
            "start": new_slot,
            "end": new_slot + timedelta(minutes=duration),
            "source": "task",
        })

        dispatch_schedule_update(current_user.id, {
            "user_id": current_user.id,
            "task_id": task.id,
            "scheduled_for": new_slot.isoformat(),
        })
        dispatch_notification(current_user.id, {
            "user_id": current_user.id,
            "task_id": task.id,
            "message": f'Rescheduled "{task.title}" to {new_slot.strftime("%a %H:%M")} to avoid a conflict.',
            "is_read": False,
            "sent_at": now.isoformat(),
        })
        rescheduled += 1

    db.commit()
    dispatch_refresh(current_user.id)
    return OptimizeResult(
        rescheduled=rescheduled,
        conflicts_resolved=len(conflicting_task_ids),
        message=f"Rescheduled {rescheduled} task(s) to fit your calendar.",
    )
