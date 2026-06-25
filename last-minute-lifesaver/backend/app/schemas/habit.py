from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional
from app.models.habit import HabitFrequency

class HabitBase(BaseModel):
    title: str = Field(..., max_length=140)
    frequency: HabitFrequency = HabitFrequency.daily

class HabitCreate(HabitBase):
    pass

class HabitLogResponse(BaseModel):
    id: int
    habit_id: int
    completed_at: datetime

    class Config:
        from_attributes = True

class HabitResponse(HabitBase):
    id: int
    user_id: int
    streak: int
    last_completed: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True
