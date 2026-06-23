from typing import List
from datetime import datetime, date
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.deps import get_db, get_current_user
from app.models.user import User
from app.models.schedule import Schedule
from app.schemas import ScheduleResponse

router = APIRouter(prefix="/schedule", tags=["schedule"])


@router.get("/", response_model=List[ScheduleResponse])
def get_schedule(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    schedules = db.query(Schedule).filter(Schedule.user_id == current_user.id).all()
    return schedules


@router.get("/today", response_model=List[ScheduleResponse])
def get_today_schedule(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    today = date.today()
    tomorrow = date.today()
    from datetime import timedelta
    tomorrow = today + timedelta(days=1)

    schedules = db.query(Schedule).filter(
        Schedule.user_id == current_user.id,
        Schedule.scheduled_for >= datetime.combine(today, datetime.min.time()),
        Schedule.scheduled_for < datetime.combine(tomorrow, datetime.min.time()),
    ).all()
    return schedules
