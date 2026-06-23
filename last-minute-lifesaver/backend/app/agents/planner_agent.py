from typing import Dict, Any, List, Optional
from datetime import datetime
from app.utils.llm_client import llm_client
from app.prompts import TASK_PLANNER_PROMPT
import logging

logger = logging.getLogger(__name__)


class PlannerAgent:
    def __init__(self):
        self.system_prompt = TASK_PLANNER_PROMPT

    def plan(self, goal_title: str, goal_description: Optional[str] = None, deadline: Optional[datetime] = None) -> Dict[str, Any]:
        prompt = self._build_prompt(goal_title, goal_description, deadline)
        try:
            result = llm_client.call_json(prompt)
            if self._validate_output(result):
                return result
            return self._fallback_planning(goal_title, deadline)
        except Exception as e:
            logger.error(f"Planner agent failed: {e}")
            return self._fallback_planning(goal_title, deadline)

    def _build_prompt(self, goal_title: str, goal_description: Optional[str], deadline: Optional[datetime]) -> str:
        user_prompt = f"Goal: {goal_title}"
        if goal_description:
            user_prompt += f"\nDescription: {goal_description}"
        if deadline:
            user_prompt += f"\nDeadline: {deadline.isoformat()}"

        return f"{self.system_prompt}\n\n{user_prompt}"

    def _validate_output(self, output: Dict[str, Any]) -> bool:
        if not output or "tasks" not in output:
            return False
        if not isinstance(output["tasks"], list):
            return False
        for task in output["tasks"]:
            if not all(k in task for k in ["title", "duration_min", "priority"]):
                return False
        return True

    def _fallback_planning(self, goal_title: str, deadline: Optional[datetime]) -> Dict[str, Any]:
        return {
            "tasks": [
                {
                    "title": f"Plan and research for: {goal_title}",
                    "duration_min": 30,
                    "priority": 4,
                    "deadline_offset_hrs": 24 if not deadline else 12
                },
                {
                    "title": f"Execute main work for: {goal_title}",
                    "duration_min": 60,
                    "priority": 5,
                    "deadline_offset_hrs": 48 if not deadline else 24
                },
                {
                    "title": f"Review and finalize: {goal_title}",
                    "duration_min": 30,
                    "priority": 3,
                    "deadline_offset_hrs": 72 if not deadline else 48
                }
            ]
        }


planner_agent = PlannerAgent()
