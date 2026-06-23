from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.api import (
    auth_router, goals_router, tasks_router, schedule_router,
    notifications_router, integrations_router,
)
from app.core.security import decode_access_token
from app.events.websocket_manager import ws_manager
import logging

app = FastAPI(
    title="Last-Minute Life Saver",
    description="AI-powered deadline management system",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(goals_router)
app.include_router(tasks_router)
app.include_router(schedule_router)
app.include_router(notifications_router)
app.include_router(integrations_router)


@app.get("/")
def root():
    return {"message": "Last-Minute Life Saver Backend Running"}


@app.get("/health")
def health_check():
    return {"status": "healthy"}


@app.websocket("/ws/notify/{user_id}")
async def websocket_notify(websocket: WebSocket, user_id: int):
    """User-scoped live notifications channel.

    Authenticates via a `token` query param (JWT). Accepts the connection only
    when the token's subject matches the requested user_id, so a user cannot
    subscribe to another user's notifications.
    """
    token = websocket.query_params.get("token")
    if not token:
        await websocket.close(code=4401)
        return
    payload = decode_access_token(token)
    if not payload or str(payload.get("sub")) != str(user_id):
        await websocket.close(code=4403)
        return

    await websocket.accept()
    await ws_manager.connect(user_id, websocket)
    try:
        # Heartbeat: read loop keeps the connection alive and detects drops.
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        pass
    except Exception:
        pass
    finally:
        await ws_manager.disconnect(user_id, websocket)
