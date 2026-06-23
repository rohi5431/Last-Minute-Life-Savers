from typing import List, Dict, Any
from datetime import datetime


def calculate_deadline_score(deadline: datetime = None) -> float:
    if not deadline:
        return 3.0
    now = datetime.utcnow()
    hours_until = (deadline - now).total_seconds() / 3600
    if hours_until < 1:
        return 10.0
    elif hours_until < 6:
        return 8.0
    elif hours_until < 24:
        return 6.0
    elif hours_until < 72:
        return 4.0
    elif hours_until < 168:
        return 2.0
    return 1.0


def calculate_duration_score(duration_min: int) -> float:
    if duration_min <= 15:
        return 2.0
    elif duration_min <= 30:
        return 1.5
    elif duration_min <= 60:
        return 1.0
    elif duration_min <= 120:
        return 0.5
    return 0.0


def combine_scores(
    ai_score: float,
    deadline_score: float,
    duration_score: float,
    base_priority: int
) -> float:
    weighted = (ai_score * 0.4) + (deadline_score * 0.3) + (duration_score * 0.1) + (base_priority * 0.2)
    return max(1, min(10, round(weighted, 1)))


def rank_tasks(
    tasks: List[Dict[str, Any]],
    scored_tasks: List[Dict[str, Any]],
    deadline: datetime = None
) -> List[Dict[str, Any]]:
    ranked = []
    for i, task in enumerate(tasks):
        task_id = i + 1
        ai_score = next((s["priority_score"] for s in scored_tasks if s["task_id"] == task_id), 5)
        deadline_score = calculate_deadline_score(deadline)
        duration_score = calculate_duration_score(task.get("duration_min", 30))
        base_priority = task.get("priority", 3)

        final_score = combine_scores(ai_score, deadline_score, duration_score, base_priority)

        ranked.append({
            "task": task,
            "task_id": task_id,
            "final_score": final_score,
            "breakdown": {
                "ai_score": ai_score,
                "deadline_score": deadline_score,
                "duration_score": duration_score,
                "base_priority": base_priority,
            }
        })

    ranked.sort(key=lambda x: x["final_score"], reverse=True)
    return ranked


# -------------------- Smart re-prioritization (Phase 5) --------------------

PRIORITY_BY_SCORE = [
    (7.5, "high"),
    (4.5, "medium"),
    (0.0, "low"),
]


def score_to_priority(score: float) -> str:
    for threshold, label in PRIORITY_BY_SCORE:
        if score >= threshold:
            return label
    return "low"


def rescore_task(task, goal=None, now: datetime = None) -> Dict[str, Any]:
    """Compute a fresh priority + score for a persisted Task model object.

    Factors in:
      - deadline proximity of the owning goal
      - whether the task is scheduled and the scheduled time has passed (missed)
      - completion progress (status / completed_at)
      - duration
    Returns {"score": float, "priority": str, "reason": str, "changed": bool}
    """
    now = now or datetime.utcnow()
    deadline = getattr(goal, "deadline", None) if goal else None

    deadline_score = calculate_deadline_score(deadline)

    duration_score = calculate_duration_score(task.duration_min or 30)

    base_priority_value = {"high": 3, "medium": 2, "low": 1}.get(task.priority, 2)

    # Missed-task boost: scheduled time passed but not completed.
    missed_boost = 0.0
    reason = "stable"
    if task.status != "completed" and task.scheduled_at:
        if task.scheduled_at < now:
            missed_boost = 2.0
            reason = "scheduled slot missed"

    score = combine_scores(
        ai_score=5.0,
        deadline_score=deadline_score,
        duration_score=duration_score,
        base_priority=base_priority_value,
    ) + missed_boost
    score = max(1, min(10, score))

    new_priority = score_to_priority(score)
    changed = new_priority != task.priority

    if missed_boost > 0:
        reason = "missed slot — bumped"
    elif task.status == "in_progress":
        reason = "in progress"

    return {
        "score": round(score, 2),
        "priority": new_priority,
        "reason": reason,
        "changed": changed,
    }
