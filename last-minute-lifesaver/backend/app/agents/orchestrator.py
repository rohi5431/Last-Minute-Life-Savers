from typing import Dict, Any, Optional
from datetime import datetime
from app.agents.planner_agent import planner_agent
from app.agents.prioritizer_agent import prioritizer_agent
from app.agents.scheduler_agent import scheduler_agent
from app.agents.clarifier_chain import clarifier_chain
from app.utils.redis_client import redis_client
import logging

logger = logging.getLogger(__name__)


class Orchestrator:
    def __init__(self):
        self.planner = planner_agent
        self.prioritizer = prioritizer_agent
        self.scheduler = scheduler_agent
        self.clarifier = clarifier_chain

    def process_goal(
        self,
        user_id: int,
        goal_id: int,
        goal_title: str,
        goal_description: Optional[str] = None,
        deadline: Optional[datetime] = None
    ) -> Dict[str, Any]:
        result = {
            "goal_id": goal_id,
            "clarification": None,
            "plan": None,
            "priority": None,
            "schedule": None,
        }

        clarification_result = self.clarifier.clarify(goal_title, goal_description)
        result["clarification"] = clarification_result

        if clarification_result.get("needs_clarification"):
            redis_client.cache_agent_result(user_id, "clarifier", clarification_result)
            redis_client.set_goal_plan(goal_id, result)
            return result

        plan_result = self.planner.plan(goal_title, goal_description, deadline)
        result["plan"] = plan_result

        if not plan_result.get("tasks"):
            redis_client.set_goal_plan(goal_id, result)
            return result

        priority_result = self.prioritizer.prioritize(plan_result["tasks"])
        result["priority"] = priority_result

        schedule_result = self.scheduler.schedule(
            plan_result["tasks"],
            priority_result.get("scored_tasks", []),
            deadline
        )
        result["schedule"] = schedule_result

        redis_client.cache_agent_result(user_id, "planner", plan_result)
        redis_client.cache_agent_result(user_id, "prioritizer", priority_result)
        redis_client.cache_agent_result(user_id, "scheduler", schedule_result)
        redis_client.set_goal_plan(goal_id, result)
        redis_client.set_context(f"user:{user_id}:latest_goal", {"goal_id": goal_id, "title": goal_title})

        logger.info(f"Goal {goal_id} processed successfully for user {user_id}")
        return result

    def get_cached_plan(self, goal_id: int) -> Optional[Dict[str, Any]]:
        return redis_client.get_goal_plan(goal_id)

    def reprocess_goal(
        self,
        user_id: int,
        goal_id: int,
        goal_title: str,
        goal_description: Optional[str] = None,
        deadline: Optional[datetime] = None
    ) -> Dict[str, Any]:
        redis_client.delete_context(f"goal_plan:{goal_id}")
        return self.process_goal(user_id, goal_id, goal_title, goal_description, deadline)


orchestrator = Orchestrator()
