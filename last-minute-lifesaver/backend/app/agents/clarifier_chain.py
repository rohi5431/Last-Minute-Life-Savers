from typing import Dict, Any, List
from app.utils.llm_client import llm_client
from app.prompts import CLARIFIER_PROMPT
import logging

logger = logging.getLogger(__name__)


class ClarifierChain:
    def __init__(self):
        self.system_prompt = CLARIFIER_PROMPT
        self.min_goal_length = 10
        self.vague_keywords = ["study", "learn", "finish", "complete", "do", "work on", "start"]

    def clarify(self, goal_title: str, goal_description: str = None) -> Dict[str, Any]:
        if self._is_clear(goal_title, goal_description):
            return {"needs_clarification": False}

        prompt = self._build_prompt(goal_title, goal_description)
        try:
            result = llm_client.call_json(prompt)
            if self._validate_output(result):
                return result
            return self._default_clarification(goal_title)
        except Exception as e:
            logger.error(f"Clarifier chain failed: {e}")
            return self._default_clarification(goal_title)

    def _is_clear(self, goal_title: str, goal_description: str = None) -> bool:
        if len(goal_title) < self.min_goal_length:
            return False
        combined_text = f"{goal_title} {goal_description or ''}".lower()
        for keyword in self.vague_keywords:
            if combined_text.strip() == keyword:
                return False
        has_specifics = any(c.isdigit() for c in combined_text) or \
                       any(word in combined_text for word in ["by", "before", "on", "at", "assignment", "project", "exam", "paper", "report"])
        return has_specifics

    def _build_prompt(self, goal_title: str, goal_description: str = None) -> str:
        user_prompt = f"Goal: {goal_title}"
        if goal_description:
            user_prompt += f"\nDescription: {goal_description}"
        return f"{self.system_prompt}\n\n{user_prompt}"

    def _validate_output(self, output: Dict[str, Any]) -> bool:
        if not output or "needs_clarification" not in output:
            return False
        if output["needs_clarification"] is True:
            if "questions" not in output or not isinstance(output["questions"], list):
                return False
        return True

    def _default_clarification(self, goal_title: str) -> Dict[str, Any]:
        return {
            "needs_clarification": True,
            "questions": [
                "What is the deadline for this goal?",
                "What specific deliverable should be completed?",
                "How long do you estimate this will take?",
                "What are the main steps or milestones involved?"
            ]
        }


clarifier_chain = ClarifierChain()
