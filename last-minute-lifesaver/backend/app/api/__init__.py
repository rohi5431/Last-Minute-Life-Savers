from app.api.auth import router as auth_router
from app.api.goals import router as goals_router
from app.api.tasks import router as tasks_router
from app.api.schedule import router as schedule_router
from app.api.notifications import router as notifications_router
from app.api.integrations import router as integrations_router

__all__ = [
    "auth_router",
    "goals_router",
    "tasks_router",
    "schedule_router",
    "notifications_router",
    "integrations_router",
]
