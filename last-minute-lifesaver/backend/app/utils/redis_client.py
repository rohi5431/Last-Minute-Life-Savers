import json
from typing import Optional, Dict, Any
import redis
from app.config import settings
import logging

logger = logging.getLogger(__name__)


class RedisClient:
    def __init__(self):
        self._client = None

    @property
    def client(self):
        if self._client is None:
            self._client = redis.from_url(settings.REDIS_URL, decode_responses=True)
        return self._client

    def set_context(self, key: str, data: Dict[str, Any], expire: int = 3600) -> bool:
        try:
            full_key = f"ctx:{key}"
            self.client.setex(full_key, expire, json.dumps(data))
            return True
        except Exception as e:
            logger.error(f"Failed to set context: {e}")
            return False

    def get_context(self, key: str) -> Optional[Dict[str, Any]]:
        try:
            full_key = f"ctx:{key}"
            data = self.client.get(full_key)
            if data:
                return json.loads(data)
            return None
        except Exception as e:
            logger.error(f"Failed to get context: {e}")
            return None

    def delete_context(self, key: str) -> bool:
        try:
            full_key = f"ctx:{key}"
            self.client.delete(full_key)
            return True
        except Exception as e:
            logger.error(f"Failed to delete context: {e}")
            return False

    def cache_agent_result(self, user_id: int, agent_name: str, result: Dict[str, Any], expire: int = 1800) -> bool:
        try:
            key = f"agent_result:{user_id}:{agent_name}"
            self.client.setex(key, expire, json.dumps(result))
            return True
        except Exception as e:
            logger.error(f"Failed to cache agent result: {e}")
            return False

    def get_agent_result(self, user_id: int, agent_name: str) -> Optional[Dict[str, Any]]:
        try:
            key = f"agent_result:{user_id}:{agent_name}"
            data = self.client.get(key)
            if data:
                return json.loads(data)
            return None
        except Exception as e:
            logger.error(f"Failed to get agent result: {e}")
            return None

    def set_goal_plan(self, goal_id: int, plan: Dict[str, Any], expire: int = 7200) -> bool:
        try:
            key = f"goal_plan:{goal_id}"
            self.client.setex(key, expire, json.dumps(plan))
            return True
        except Exception as e:
            logger.error(f"Failed to set goal plan: {e}")
            return False

    def get_goal_plan(self, goal_id: int) -> Optional[Dict[str, Any]]:
        try:
            key = f"goal_plan:{goal_id}"
            data = self.client.get(key)
            if data:
                return json.loads(data)
            return None
        except Exception as e:
            logger.error(f"Failed to get goal plan: {e}")
            return None


redis_client = RedisClient()
