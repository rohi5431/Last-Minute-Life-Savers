from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel


class CalendarEventOut(BaseModel):
    id: int
    external_id: str
    provider: str
    title: str
    start_at: datetime
    end_at: datetime
    location: Optional[str] = None

    class Config:
        from_attributes = True


class CalendarConnectionStatus(BaseModel):
    connected: bool
    provider: str = "google"
    last_synced_at: Optional[datetime] = None
    event_count: int = 0


class SyncResult(BaseModel):
    imported: int
    conflicts: List[dict] = []
    message: str = "Sync complete"


class OptimizeResult(BaseModel):
    rescheduled: int
    conflicts_resolved: int
    message: str = "Schedule optimized"


class ConflictInfo(BaseModel):
    task_id: int
    task_title: str
    conflict_with: str
    overlap_start: datetime
    overlap_end: datetime
    message: str
