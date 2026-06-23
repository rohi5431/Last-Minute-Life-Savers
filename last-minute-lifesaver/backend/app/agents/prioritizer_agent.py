from typing import Dict, Any, List
from app.utils.llm_client import llm_client
from app.prompts import PRIORITIZER_PROMPT
import logging

logger = logging.getLogger(__name__)


class PrioritizerAgent:
    def __init__(self):
        self.system_prompt = PRIORITIZER_PROMPT

    def prioritize(self, tasks: List[Dict[str, Any]]) -> Dict[str, Any]:
        prompt = self._build_prompt(tasks)
        try:
            result = llm_client.call_json(prompt)
            if self._validate_output(result):
                return result
            return self._rules_based_prioritization(tasks)
        except Exception as e:
            logger.error(f"Prioritizer agent failed: {e}")
            return self._rules_based_prioritization(tasks)

    def _build_prompt(self, tasks: List[Dict[str, Any]]) -> str:
        tasks_str = "\n".join([
            f"Task {i+1}: {t.get('title', 'Unknown')} - Duration: {t.get('duration_min', 30)}min - Base Priority: {t.get('priority', 3)}"
            for i, t in enumerate(tasks)
        ])
        return f"{self.system_prompt}\n\nTasks to prioritize:\n{tasks_str}"

    def _validate_output(self, output: Dict[str, Any]) -> bool:
        if not output or "scored_tasks" not in output:
            return False
        if not isinstance(output["scored_tasks"], list):
            return False
        for task in output["scored_tasks"]:
            if not all(k in task for k in ["task_id", "priority_score"]):
                return False
        return True

    def _rules_based_prioritization(self, tasks: List[Dict[str, Any]]) -> Dict[str, Any]:
        scored_tasks = []
        for i, task in enumerate(tasks):
            base_priority = task.get("priority", 3)
            duration = task.get("duration_min", 30)

            score = base_priority * 2
            if duration <= 30:
                score += 1
            elif duration >= 120:
                score -= 1

            score = max(1, min(10, score))

            scored_tasks.append({
                "task_id": i + 1,
                "priority_score": score,
                "reason": "Rules-based scoring: base priority and duration considered"
            })

        return {"scored_tasks": scored_tasks}


prioritizer_agent = PrioritizerAgent()
