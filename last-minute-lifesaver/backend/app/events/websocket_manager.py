"""In-process + Redis Pub/Sub WebSocket connection manager.

Tracks local WebSocket connections and subscribes to a Redis Pub/Sub channel
so that Celery workers and other backend processes can broadcast events
real-time to users connected to any FastAPI/Uvicorn instance.
"""
import asyncio
import json
import logging
from collections import defaultdict
from typing import Any, Dict, Set
import redis.asyncio as aioredis
from app.config import settings

logger = logging.getLogger(__name__)


class WebSocketManager:
    def __init__(self):
        self._connections: Dict[int, Set[Any]] = defaultdict(set)
        self._lock = asyncio.Lock()
        self._listener_task = None

    async def connect(self, user_id: int, websocket: Any) -> None:
        async with self._lock:
            self._connections[user_id].add(websocket)
        logger.info(f"WS connected locally: user_id={user_id}, total={len(self._connections[user_id])}")

    async def disconnect(self, user_id: int, websocket: Any) -> None:
        async with self._lock:
            self._connections[user_id].discard(websocket)
            if not self._connections[user_id]:
                self._connections.pop(user_id, None)
        logger.info(f"WS disconnected locally: user_id={user_id}")

    async def send_personal_local(self, user_id: int, message: Dict[str, Any]) -> None:
        """Send a message directly to local connections for this user."""
        payload = json.dumps(message, default=str)
        async with self._lock:
            conns = list(self._connections.get(user_id, set()))
        
        dead = []
        for ws in conns:
            try:
                await ws.send_text(payload)
            except Exception as e:
                logger.warning(f"Local WS send failed (user_id={user_id}): {e}")
                dead.append(ws)
        
        if dead:
            async with self._lock:
                for ws in dead:
                    self._connections[user_id].discard(ws)

    async def broadcast_local(self, message: Dict[str, Any]) -> None:
        """Broadcast a message directly to all local connections."""
        payload = json.dumps(message, default=str)
        async with self._lock:
            user_conns = list(self._connections.items())
            
        for user_id, conns in user_conns:
            for ws in list(conns):
                try:
                    await ws.send_text(payload)
                except Exception:
                    pass

    def has_connections(self, user_id: int) -> bool:
        return bool(self._connections.get(user_id))

    async def start_pubsub_listener(self) -> None:
        """Subscribes to Redis pub/sub channel and routes events to local connections."""
        logger.info("Starting Redis WebSocket Pub/Sub listener...")
        while True:
            try:
                client = aioredis.from_url(settings.REDIS_URL, decode_responses=True)
                pubsub = client.pubsub()
                await pubsub.subscribe("lmls_events")
                logger.info("Successfully subscribed to Redis channel 'lmls_events'")
                
                while True:
                    # Non-blocking get_message with timeout to allow graceful task cancellation
                    message = await pubsub.get_message(ignore_subscribe_messages=True, timeout=1.0)
                    if message and message.get("type") == "message":
                        try:
                            data = json.loads(message["data"])
                            user_id = data.get("user_id")
                            msg_payload = data.get("message")
                            
                            if user_id is not None:
                                await self.send_personal_local(int(user_id), msg_payload)
                            else:
                                await self.broadcast_local(msg_payload)
                        except Exception as parse_error:
                            logger.error(f"Error parsing pubsub message: {parse_error}")
                            
            except asyncio.CancelledError:
                logger.info("Redis Pub/Sub listener cancelled.")
                break
            except Exception as e:
                logger.error(f"Redis Pub/Sub listener error: {e}. Retrying in 5 seconds...")
                await asyncio.sleep(5)


ws_manager = WebSocketManager()
