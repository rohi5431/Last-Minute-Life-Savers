from typing import List, Dict, Any
from datetime import datetime, timedelta


def validate_tasks(tasks: List[Dict[str, Any]]) -> bool:
    if not tasks or len(tasks) < 1:
        return False
    if len(tasks) > 15:
        return False
    for task in tasks:
        if not task.get("title"):
            return False
        if "duration_min" in task and task["duration_min"] < 5:
            return False
    return True


def normalize_tasks(tasks: List[Dict[str, Any]], goal_id: int) -> List[Dict[str, Any]]:
    normalized = []
    for i, task in enumerate(tasks):
        normalized_task = {
            "goal_id": goal_id,
            "title": task.get("title", f"Task {i + 1}"),
            "duration_min": max(5, min(480, task.get("duration_min", 30))),
            "priority": task.get("priority", 3),
            "status": "pending",
            "notes": task.get("notes", ""),
        }
        if task.get("deadline_offset_hrs"):
            normalized_task["scheduled_at"] = datetime.utcnow() + timedelta(hours=task["deadline_offset_hrs"])
        normalized.append(normalized_task)
    return normalized


def split_large_tasks(tasks: List[Dict[str, Any]], max_duration: int = 120) -> List[Dict[str, Any]]:
    result = []
    for task in tasks:
        duration = task.get("duration_min", 30)
        if duration <= max_duration:
            result.append(task)
        else:
            num_parts = (duration + max_duration - 1) // max_duration
            part_duration = duration // num_parts
            for i in range(num_parts):
                part_task = task.copy()
                part_task["title"] = f"{task.get('title')} (Part {i + 1}/{num_parts})"
                part_task["duration_min"] = part_duration if i < num_parts - 1 else duration - (part_duration * (num_parts - 1))
                result.append(part_task)
    return result


def create_task_objects(plan_result: Dict[str, Any], goal_id: int) -> List[Dict[str, Any]]:
    tasks = plan_result.get("tasks", [])
    if not validate_tasks(tasks):
        return []
    normalized = normalize_tasks(tasks, goal_id)
    split_tasks = split_large_tasks(normalized)
    return split_tasks
