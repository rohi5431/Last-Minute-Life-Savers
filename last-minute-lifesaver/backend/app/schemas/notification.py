from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class NotificationResponse(BaseModel):
    id: int
    user_id: int
    task_id: Optional[int]
    message: str
    is_read: bool
    sent_at: datetime

    class Config:
        from_attributes = True
