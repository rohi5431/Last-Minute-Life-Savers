"""In-process WebSocket connection manager.

Tracks per-user connections so any FastAPI handler (or a Celery task that
re-enters the app via a lightweight HTTP call) can push realtime events to the
correct user. Uses asyncio queues so broadcasts are non-blocking and safe to
call from a worker thread.
"""
import asyncio
import json
import logging
from collections import defaultdict
from typing import Any, Dict, Optional, Set

logger = logging.getLogger(__name__)


class WebSocketManager:
    def __init__(self):
        self._connections: Dict[int, Set[Any]] = defaultdict(set)
        self._lock = asyncio.Lock()

    async def connect(self, user_id: int, websocket: Any) -> None:
        async with self._lock:
            self._connections[user_id].add(websocket)
        logger.info(f"WS connected: user_id={user_id}, total={len(self._connections[user_id])}")

    async def disconnect(self, user_id: int, websocket: Any) -> None:
        async with self._lock:
            self._connections[user_id].discard(websocket)
            if not self._connections[user_id]:
                self._connections.pop(user_id, None)
        logger.info(f"WS disconnected: user_id={user_id}")

    async def send_personal(self, user_id: int, message: Dict[str, Any]) -> None:
        payload = json.dumps(message, default=str)
        conns = list(self._connections.get(user_id, set()))
        dead = []
        for ws in conns:
            try:
                await ws.send_text(payload)
            except Exception as e:
                logger.warning(f"WS send failed (user_id={user_id}): {e}")
                dead.append(ws)
        if dead:
            async with self._lock:
                for ws in dead:
                    self._connections[user_id].discard(ws)

    async def broadcast(self, message: Dict[str, Any]) -> None:
        payload = json.dumps(message, default=str)
        for user_id, conns in list(self._connections.items()):
            for ws in list(conns):
                try:
                    await ws.send_text(payload)
                except Exception:
                    pass

    def has_connections(self, user_id: int) -> bool:
        return bool(self._connections.get(user_id))


ws_manager = WebSocketManager()
