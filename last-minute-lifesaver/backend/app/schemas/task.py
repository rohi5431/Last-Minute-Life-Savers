from datetime import datetime
from typing import Optional, Any
from pydantic import BaseModel


class TaskBase(BaseModel):
    title: str
    duration_min: Optional[int] = None
    priority: Optional[str] = "medium"
    notes: Optional[str] = None


class TaskCreate(TaskBase):
    goal_id: int
    scheduled_at: Optional[datetime] = None


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    duration_min: Optional[int] = None
    priority: Optional[str] = None
    scheduled_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    status: Optional[str] = None
    notes: Optional[str] = None
    ai_metadata: Optional[dict] = None


class TaskResponse(TaskBase):
    id: int
    goal_id: int
    scheduled_at: Optional[datetime]
    completed_at: Optional[datetime]
    status: str
    ai_metadata: Optional[Any]
    created_at: datetime

    class Config:
        from_attributes = True
