"""Context-aware reminder generation.

Builds personalized, action-oriented reminder messages based on:
  - current task progress (pending / in progress)
  - remaining duration
  - deadline urgency (relative to the owning goal's deadline)
  - whether the task was missed (scheduled slot in the past)
"""
from datetime import datetime, timedelta
from typing import Optional, Dict, Any


def _humanize_duration(minutes: int) -> str:
    if minutes < 60:
        return f"{minutes}m"
    h, m = divmod(minutes, 60)
    return f"{h}h {m}m" if m else f"{h}h"


def _humanize_hours(hours: float) -> str:
    if hours < 1:
        return f"{int(hours * 60)}m"
    if hours < 24:
        return f"{hours:.0f}h"
    days = hours / 24
    return f"{days:.1f}d"


def build_reminder(task, goal=None, now: datetime = None) -> Dict[str, Any]:
    now = now or datetime.utcnow()
    duration = task.duration_min or 30
    title = task.title

    # Deadline urgency
    if goal and goal.deadline:
        hours_left = (goal.deadline - now).total_seconds() / 3600
        if hours_left <= 0:
            deadline_phrase = "Deadline has passed"
        elif hours_left < 3:
            deadline_phrase = f"only {_humanize_hours(hours_left)} until deadline"
        elif hours_left < 24:
            deadline_phrase = f"deadline in {_humanize_hours(hours_left)}"
        else:
            deadline_phrase = f"{_humanize_hours(hours_left)} until deadline"
    else:
        deadline_phrase = None

    # Missed task
    missed = (
        task.status not in ("completed",)
        and task.scheduled_at is not None
        and task.scheduled_at < now
    )

    # Progress
    if task.status == "in_progress":
        progress_phrase = "you're already mid-way through"
    elif task.status == "completed" or task.completed_at:
        return {"title": title, "message": f"Nice — \"{title}\" is done!", "kind": "success"}
    else:
        progress_phrase = None

    # Compose message
    parts = []

    if missed:
        parts.append(f"You missed the planned slot for \"{title}\"")
        if duration:
            parts.append(f"(about {_humanize_duration(duration)} of focused work)")
        if deadline_phrase:
            parts.append(f"with {deadline_phrase}")
        message = ". ".join(parts) + ". Want me to find a new slot?"
    elif task.scheduled_at:
        minutes_to = (task.scheduled_at - now).total_seconds() / 60
        if 0 <= minutes_to <= 15:
            parts.append(f"\"{title}\" starts soon")
            if deadline_phrase:
                parts.append(deadline_phrase)
            message = ". ".join(parts) + f". Blocked out {_humanize_duration(duration)} — go."
        elif minutes_to < 0:
            # Overdue relative to slot but not flagged missed yet
            message = f"Time to start \"{title}\" — it was scheduled to begin a moment ago."
        else:
            message = f"Coming up: \"{title}\" at {task.scheduled_at.strftime('%H:%M')}. {_humanize_duration(duration)} block."
    else:
        # Unscheduled task
        if deadline_phrase:
            message = f"\"{title}\" needs a slot — {deadline_phrase}. Around {_humanize_duration(duration)} of work."
        else:
            message = f"\"{title}\" is ready when you are — {_humanize_duration(duration)} of work."

    if progress_phrase:
        message += f" ({progress_phrase})"

    return {"title": title, "message": message, "kind": "reminder"}
