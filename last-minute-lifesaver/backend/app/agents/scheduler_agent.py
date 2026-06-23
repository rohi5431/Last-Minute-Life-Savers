from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta
from app.utils.llm_client import llm_client
from app.prompts import SCHEDULER_PROMPT
import logging

logger = logging.getLogger(__name__)


class SchedulerAgent:
    def __init__(self):
        self.system_prompt = SCHEDULER_PROMPT

    def schedule(
        self,
        tasks: List[Dict[str, Any]],
        scored_tasks: List[Dict[str, Any]],
        deadline: Optional[datetime] = None
    ) -> Dict[str, Any]:
        prompt = self._build_prompt(tasks, scored_tasks, deadline)
        try:
            result = llm_client.call_json(prompt)
            if self._validate_output(result):
                return result
            return self._rules_based_schedule(tasks, scored_tasks, deadline)
        except Exception as e:
            logger.error(f"Scheduler agent failed: {e}")
            return self._rules_based_schedule(tasks, scored_tasks, deadline)

    def _build_prompt(
        self,
        tasks: List[Dict[str, Any]],
        scored_tasks: List[Dict[str, Any]],
        deadline: Optional[datetime]
    ) -> str:
        current_time = datetime.utcnow()
        tasks_info = []
        for i, task in enumerate(tasks):
            score_info = next((s for s in scored_tasks if s["task_id"] == i + 1), {})
            tasks_info.append(
                f"Task {i+1}: {task.get('title')} - Duration: {task.get('duration_min', 30)}min - Priority Score: {score_info.get('priority_score', 5)}"
            )

        tasks_str = "\n".join(tasks_info)
        deadline_str = f"\nDeadline: {deadline.isoformat()}" if deadline else ""
        current_str = f"\nCurrent time: {current_time.isoformat()}Z"

        return f"{self.system_prompt}\n\nTasks to schedule:{current_str}{deadline_str}\n\n{tasks_str}"

    def _validate_output(self, output: Dict[str, Any]) -> bool:
        if not output or "schedule_plan" not in output:
            return False
        if not isinstance(output["schedule_plan"], list):
            return False
        try:
            for item in output["schedule_plan"]:
                if "task_id" not in item:
                    return False
                if "scheduled_for" in item:
                    datetime.fromisoformat(item["scheduled_for"].replace("Z", "+00:00"))
            return True
        except (ValueError, TypeError):
            return False

    def _rules_based_schedule(
        self,
        tasks: List[Dict[str, Any]],
        scored_tasks: List[Dict[str, Any]],
        deadline: Optional[datetime]
    ) -> Dict[str, Any]:
        current_time = datetime.utcnow()
        sorted_tasks = sorted(
            enumerate(tasks),
            key=lambda x: next((s["priority_score"] for s in scored_tasks if s["task_id"] == x[0] + 1), 5),
            reverse=True
        )

        schedule_plan = []
        next_slot = current_time.replace(minute=0, second=0, microsecond=0) + timedelta(hours=1)

        for i, (idx, task) in enumerate(sorted_tasks):
            duration = task.get("duration_min", 30)
            schedule_plan.append({
                "task_id": idx + 1,
                "scheduled_for": next_slot.strftime("%Y-%m-%dT%H:%M:%SZ"),
                "reason": "Scheduled based on priority score"
            })
            next_slot += timedelta(minutes=duration)

        return {"schedule_plan": schedule_plan}


scheduler_agent = SchedulerAgent()
