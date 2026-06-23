from datetime import datetime
from pydantic import BaseModel


class ScheduleResponse(BaseModel):
    id: int
    user_id: int
    task_id: int
    scheduled_for: datetime
    created_at: datetime

    class Config:
        from_attributes = True
