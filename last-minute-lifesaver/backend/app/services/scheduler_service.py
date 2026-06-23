from typing import List, Dict, Any
from datetime import datetime, timedelta


def get_working_hours():
    return (8, 22)


def is_working_hour(dt: datetime) -> bool:
    start, end = get_working_hours()
    return start <= dt.hour < end


def next_working_slot(dt: datetime) -> datetime:
    start, end = get_working_hours()
    if dt.hour < start:
        return dt.replace(hour=start, minute=0, second=0, microsecond=0)
    elif dt.hour >= end:
        next_day = dt + timedelta(days=1)
        return next_day.replace(hour=start, minute=0, second=0, microsecond=0)
    return dt


def _overlap(a_start, a_end, b_start, b_end) -> bool:
    return a_start < b_end and b_start < a_end


def fit_tasks_in_schedule(
    tasks: List[Dict[str, Any]],
    ranked_tasks: List[Dict[str, Any]],
    schedule_plan: List[Dict[str, Any]],
    deadline: datetime = None,
    busy_blocks: List[Dict[str, Any]] = None,
) -> List[Dict[str, Any]]:
    """Fit tasks into schedule, skipping conflicts with busy blocks.

    busy_blocks: list of {title, start, end, source} representing calendar
    events or already-scheduled tasks. When provided, conflicts are avoided
    instead of blindly stacking tasks.
    """
    if not schedule_plan:
        return create_default_schedule(ranked_tasks, deadline, busy_blocks)

    scheduled = []
    current_time = datetime.utcnow()
    current_time = next_working_slot(current_time)
    busy_blocks = busy_blocks or []

    for ranked in ranked_tasks:
        task = ranked["task"]
        task_id = ranked["task_id"]
        duration = task.get("duration_min", 30)

        plan_match = next((p for p in schedule_plan if p.get("task_id") == task_id), None)
        if plan_match and "scheduled_for" in plan_match:
            try:
                scheduled_time = datetime.fromisoformat(plan_match["scheduled_for"].replace("Z", "+00:00")).replace(tzinfo=None)
                # If plan time conflicts with a busy block, push later.
                scheduled_time = _avoid_conflicts(scheduled_time, duration, busy_blocks)
                if scheduled_time > current_time:
                    scheduled.append({
                        "task_id": task_id,
                        "task": task,
                        "scheduled_for": scheduled_time,
                        "reason": plan_match.get("reason", "AI suggested time")
                    })
                    current_time = scheduled_time + timedelta(minutes=duration)
                    # Add this slot to busy blocks so subsequent tasks don't double-book.
                    busy_blocks = busy_blocks + [{
                        "start": scheduled_time,
                        "end": scheduled_time + timedelta(minutes=duration),
                        "title": task.get("title"),
                        "source": "task",
                    }]
                    continue
            except (ValueError, TypeError):
                pass

        current_time = next_working_slot(current_time)
        current_time = _avoid_conflicts(current_time, duration, busy_blocks)
        scheduled.append({
            "task_id": task_id,
            "task": task,
            "scheduled_for": current_time,
            "reason": "Auto-scheduled based on priority"
        })
        current_time += timedelta(minutes=duration)
        busy_blocks = busy_blocks + [{
            "start": scheduled[-1]["scheduled_for"],
            "end": scheduled[-1]["scheduled_for"] + timedelta(minutes=duration),
            "title": task.get("title"),
            "source": "task",
        }]

        if current_time.hour >= 22:
            current_time = next_working_slot(current_time)

    return scheduled


def _avoid_conflicts(start: datetime, duration_min: int, busy_blocks: List[Dict[str, Any]]) -> datetime:
    """Push `start` forward past any overlapping busy block, within working hours."""
    cursor = start
    end = cursor + timedelta(minutes=duration_min)
    guard = 0
    while True:
        collides = False
        for b in busy_blocks:
            if _overlap(cursor, end, b["start"], b["end"]):
                cursor = b["end"]
                end = cursor + timedelta(minutes=duration_min)
                collides = True
                break
        if not collides:
            break
        guard += 1
        if guard > 200:
            break
    # Snap to working hours if pushed past end-of-day.
    if not is_working_hour(cursor):
        cursor = next_working_slot(cursor)
    return cursor


def create_default_schedule(
    ranked_tasks: List[Dict[str, Any]], deadline: datetime = None,
    busy_blocks: List[Dict[str, Any]] = None,
) -> List[Dict[str, Any]]:
    busy_blocks = busy_blocks or []
    scheduled = []
    current_time = next_working_slot(datetime.utcnow())

    for ranked in ranked_tasks:
        task = ranked["task"]
        duration = task.get("duration_min", 30)

        current_time = _avoid_conflicts(current_time, duration, busy_blocks)
        scheduled.append({
            "task_id": ranked["task_id"],
            "task": task,
            "scheduled_for": current_time,
            "reason": "Scheduled by priority ranking"
        })
        busy_blocks = busy_blocks + [{
            "start": current_time,
            "end": current_time + timedelta(minutes=duration),
            "title": task.get("title"),
            "source": "task",
        }]
        current_time += timedelta(minutes=duration)

        if current_time.hour >= 22:
            current_time = next_working_slot(current_time)

    return scheduled


def optimize_schedule(
    scheduled_tasks: List[Dict[str, Any]], deadline: datetime = None
) -> List[Dict[str, Any]]:
    optimized = []

    for item in scheduled_tasks:
        scheduled_time = item["scheduled_for"]
        task_duration = item["task"].get("duration_min", 30)

        if deadline and scheduled_time + timedelta(minutes=task_duration) > deadline:
            scheduled_time = deadline - timedelta(minutes=task_duration)
            if scheduled_time < datetime.utcnow():
                scheduled_time = datetime.utcnow()
            item["reason"] = "Adjusted to meet deadline"

        optimized.append(item)

    return optimized


def reschedule_missed_task(
    task_scheduled_at: datetime,
    duration_min: int,
    busy_blocks: List[Dict[str, Any]],
    deadline: datetime = None,
    now: datetime = None,
) -> datetime:
    """Find a fresh slot for a task that was missed or is in conflict."""
    from app.utils.calendar_sync import find_free_slot
    start_from = now or datetime.utcnow()
    # Include the old slot as cleared by treating it as not busy.
    new_slot = find_free_slot(busy_blocks, duration_min, start_from=start_from, deadline=deadline)
    return new_slot or (start_from + timedelta(hours=1))
