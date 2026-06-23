"""Google Calendar sync: OAuth2 flow, event import, conflict detection.

Designed to degrade gracefully when credentials are not configured (returns
an explanatory error rather than crashing) so the demo path still works.
"""
import logging
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, List, Optional, Tuple

from sqlalchemy.orm import Session

from app.config import settings
from app.models.integration import CalendarToken, CalendarEvent

logger = logging.getLogger(__name__)


# -------------------- OAuth flow --------------------

def build_oauth_flow(state: str = None):
    """Create the OAuth flow object used for both start and callback."""
    try:
        from google_auth_oauthlib.flow import Flow
    except ImportError as e:
        raise RuntimeError("google-auth-oauthlib is not installed") from e

    client_config = {
        "web": {
            "client_id": settings.GOOGLE_CLIENT_ID,
            "client_secret": settings.GOOGLE_CLIENT_SECRET,
            "auth_uri": "https://accounts.google.com/o/oauth2/auth",
            "token_uri": "https://oauth2.googleapis.com/token",
            "redirect_uris": [settings.GOOGLE_REDIRECT_URI],
        }
    }
    flow = Flow.from_client_config(
        client_config,
        scopes=settings.calendar_scopes_list,
        redirect_uri=settings.GOOGLE_REDIRECT_URI,
        state=state,
    )
    flow.prompt = "consent"
    return flow


def get_oauth_start_url(state: str) -> str:
    flow = build_oauth_flow(state=state)
    authorization_url, _ = flow.authorization_url(
        access_type="offline",
        include_granted_scopes="true",
        prompt="consent",
    )
    return authorization_url


def exchange_oauth_code(code: str) -> Dict[str, Any]:
    """Exchange the auth code for credentials and return serializable tokens."""
    flow = build_oauth_flow()
    flow.fetch_token(code=code)
    creds = flow.credentials

    token_data = {
        "access_token": creds.token,
        "refresh_token": getattr(creds, "refresh_token", None),
        "token_uri": "https://oauth2.googleapis.com/token",
        "client_id": settings.GOOGLE_CLIENT_ID,
        "client_secret": settings.GOOGLE_CLIENT_SECRET,
        "scopes": ",".join(settings.calendar_scopes_list),
    }
    # Some accounts don't return a refresh_token on re-connect. Persist if present.
    return token_data


def save_calendar_token(db: Session, user_id: int, token_data: Dict[str, Any]) -> CalendarToken:
    existing = db.query(CalendarToken).filter(
        CalendarToken.user_id == user_id, CalendarToken.provider == "google"
    ).first()

    if existing:
        for k, v in token_data.items():
            setattr(existing, k, v)
        existing.connected = True
        existing.updated_at = datetime.utcnow()
        token = existing
    else:
        token = CalendarToken(user_id=user_id, provider="google", connected=True, **token_data)
        db.add(token)
    db.commit()
    db.refresh(token)
    return token


def get_credentials(db: Session, user_id: int):
    """Build a google Credentials object from stored token data, if connected."""
    row = db.query(CalendarToken).filter(
        CalendarToken.user_id == user_id, CalendarToken.provider == "google"
    ).first()
    if not row or not row.connected or not row.access_token:
        return None
    try:
        from google.oauth2.credentials import Credentials
    except ImportError:
        return None

    return Credentials(
        token=row.access_token,
        refresh_token=row.refresh_token,
        token_uri=row.token_uri,
        client_id=row.client_id,
        client_secret=row.client_secret,
        scopes=(row.scopes.split(",") if row.scopes else settings.calendar_scopes_list),
    )


def is_connected(db: Session, user_id: int) -> bool:
    row = db.query(CalendarToken).filter(
        CalendarToken.user_id == user_id, CalendarToken.provider == "google"
    ).first()
    return bool(row and row.connected and row.access_token)


def disconnect_calendar(db: Session, user_id: int) -> None:
    row = db.query(CalendarToken).filter(
        CalendarToken.user_id == user_id, CalendarToken.provider == "google"
    ).first()
    if row:
        row.connected = False
        row.access_token = None
        db.commit()
    db.query(CalendarEvent).filter(CalendarEvent.user_id == user_id).delete()
    db.commit()


# -------------------- Event import --------------------

def _parse_google_dt(value: Optional[str]) -> Optional[datetime]:
    if not value:
        return None
    if "T" in value:
        return datetime.fromisoformat(value.replace("Z", "+00:00")).astimezone(timezone.utc).replace(tzinfo=None)
    # All-day event date.
    return datetime.fromisoformat(value + "T00:00:00")


def import_calendar_events(db: Session, user_id: int, max_results: int = 50) -> Tuple[int, List[CalendarEvent]]:
    """Fetch upcoming events from Google Calendar and upsert them into the DB.

    Returns (imported_count, events). Raises RuntimeError when not configured.
    """
    creds = get_credentials(db, user_id)
    if not creds:
        raise RuntimeError("Google Calendar is not connected for this user")

    try:
        from googleapiclient.discovery import build
    except ImportError as e:
        raise RuntimeError("google-api-python-client is not installed") from e

    service = build("calendar", "v3", credentials=creds)
    now = datetime.utcnow()
    time_min = now.isoformat() + "Z"
    time_max_dt = now + timedelta(days=30)

    resp = service.events().list(
        calendarId="primary",
        timeMin=time_min,
        maxResults=max_results,
        singleEvents=True,
        orderBy="startTime",
    ).execute()

    items = resp.get("items", [])
    upserted = 0
    saved_events = []

    existing = db.query(CalendarEvent).filter(CalendarEvent.user_id == user_id).all()
    existing_map = {(e.external_id, e.provider): e for e in existing}

    for item in items:
        external_id = item.get("id")
        if not external_id:
            continue
        start_raw = (item.get("start") or {})
        end_raw = (item.get("end") or {})
        start_at = _parse_google_dt(start_raw.get("dateTime") or start_raw.get("date"))
        end_at = _parse_google_dt(end_raw.get("dateTime") or end_raw.get("date"))
        if not start_at or not end_at:
            continue

        title = item.get("summary", "Busy")
        location = item.get("location")

        key = (external_id, "google")
        if key in existing_map:
            ev = existing_map[key]
            ev.title = title
            ev.start_at = start_at
            ev.end_at = end_at
            ev.location = location
            ev.imported_at = datetime.utcnow()
        else:
            ev = CalendarEvent(
                user_id=user_id,
                external_id=external_id,
                provider="google",
                title=title,
                start_at=start_at,
                end_at=end_at,
                location=location,
            )
            db.add(ev)
        saved_events.append(ev)
        upserted += 1

    token = db.query(CalendarToken).filter(
        CalendarToken.user_id == user_id, CalendarToken.provider == "google"
    ).first()
    if token:
        token.last_synced_at = datetime.utcnow()
        token.updated_at = datetime.utcnow()

    db.commit()
    return upserted, saved_events


def list_calendar_events(db: Session, user_id: int) -> List[CalendarEvent]:
    return (
        db.query(CalendarEvent)
        .filter(CalendarEvent.user_id == user_id)
        .order_by(CalendarEvent.start_at.asc())
        .all()
    )


def events_as_busy_blocks(db: Session, user_id: int) -> List[Dict[str, Any]]:
    return [
        {
            "title": e.title,
            "start": e.start_at,
            "end": e.end_at,
            "source": "calendar",
        }
        for e in list_calendar_events(db, user_id)
    ]


# -------------------- Conflict detection --------------------

def _overlap(a_start, a_end, b_start, b_end) -> bool:
    return a_start < b_end and b_start < a_end


def detect_conflicts(
    db: Session, user_id: int, tasks: List, calendar_events: List[CalendarEvent] = None
) -> List[Dict[str, Any]]:
    """Detect overlaps between scheduled tasks and calendar events.

    Returns list of conflict descriptors with task + conflict source + overlap.
    """
    if calendar_events is None:
        calendar_events = list_calendar_events(db, user_id)

    conflicts = []
    for task in tasks:
        if not task.scheduled_at:
            continue
        duration = task.duration_min or 30
        t_start = task.scheduled_at
        t_end = t_start + timedelta(minutes=duration)

        # Calendar conflicts
        for ev in calendar_events:
            if (_overlap(t_start, t_end, ev.start_at, ev.end_at)):
                conflicts.append({
                    "task_id": task.id,
                    "task_title": task.title,
                    "conflict_with": f"Calendar: {ev.title}",
                    "overlap_start": max(t_start, ev.start_at),
                    "overlap_end": min(t_end, ev.end_at),
                    "message": f'"{task.title}" overlaps calendar event "{ev.title}"',
                })

        # Task-vs-task conflicts
        for other in tasks:
            if other.id == task.id or not other.scheduled_at:
                continue
            o_duration = other.duration_min or 30
            o_start = other.scheduled_at
            o_end = o_start + timedelta(minutes=o_duration)
            if o_start < t_start:
                continue  # report each pair once
            if _overlap(t_start, t_end, o_start, o_end):
                conflicts.append({
                    "task_id": task.id,
                    "task_title": task.title,
                    "conflict_with": f"Task: {other.title}",
                    "overlap_start": max(t_start, o_start),
                    "overlap_end": min(t_end, o_end),
                    "message": f'"{task.title}" overlaps task "{other.title}"',
                })

    # Dedupe by (task_id, conflict_with)
    seen = set()
    unique = []
    for c in conflicts:
        key = (c["task_id"], c["conflict_with"])
        if key in seen:
            continue
        seen.add(key)
        unique.append(c)
    return unique


def find_free_slot(
    busy_blocks: List[Dict[str, Any]], duration_min: int, start_from: datetime = None,
    deadline: datetime = None, working_hours: Tuple[int, int] = (8, 22),
) -> Optional[datetime]:
    """Find the earliest free working-hours slot of >= duration_min."""
    start_from = start_from or datetime.utcnow()
    # Sort busy blocks by start.
    blocks = sorted(
        [b for b in busy_blocks if b.get("end", datetime.max) > start_from],
        key=lambda b: b["start"],
    )

    cursor = start_from
    # Snap into working hours
    wh_start, wh_end = working_hours
    cursor = cursor.replace(second=0, microsecond=0)
    if cursor.hour < wh_start:
        cursor = cursor.replace(hour=wh_start, minute=0)
    if cursor.hour >= wh_end:
        cursor = (cursor + timedelta(days=1)).replace(hour=wh_start, minute=0, second=0, microsecond=0)

    day_cap = 14  # limit search horizon to ~2 weeks
    for _ in range(day_cap):
        day_end = cursor.replace(hour=wh_end, minute=0, second=0, microsecond=0)
        # Gap-finding within today's working window
        slot_cursor = cursor
        while slot_cursor + timedelta(minutes=duration_min) <= day_end:
            slot_end = slot_cursor + timedelta(minutes=duration_min)
            conflict = any(
                _overlap(slot_cursor, slot_end, b["start"], b["end"])
                for b in blocks
            )
            if not conflict:
                if deadline and slot_end > deadline:
                    return None
                return slot_cursor
            # Advance past the blocking event
            blockers = [b for b in blocks if _overlap(slot_cursor, slot_end, b["start"], b["end"])]
            if blockers:
                slot_cursor = max(b["end"] for b in blockers)
                if slot_cursor.hour >= wh_end:
                    break
            else:
                slot_cursor += timedelta(minutes=duration_min)
        # Next working day
        cursor = (cursor + timedelta(days=1)).replace(hour=wh_start, minute=0, second=0, microsecond=0)
        if deadline and cursor > deadline:
            return None
    return None
