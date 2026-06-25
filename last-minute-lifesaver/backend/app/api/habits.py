from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from app.core.deps import get_db, get_current_user
from app.models.user import User
from app.models.habit import Habit, HabitLog
from app.schemas.habit import HabitCreate, HabitResponse

router = APIRouter(prefix="/habits", tags=["habits"])

@router.post("/", response_model=HabitResponse, status_code=status.HTTP_201_CREATED)
def create_habit(habit_data: HabitCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    habit = Habit(
        user_id=current_user.id,
        title=habit_data.title,
        frequency=habit_data.frequency,
        streak=0
    )
    db.add(habit)
    db.commit()
    db.refresh(habit)
    return habit

@router.get("/", response_model=List[HabitResponse])
def list_habits(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(Habit).filter(Habit.user_id == current_user.id).all()

@router.post("/{habit_id}/complete", response_model=HabitResponse)
def complete_habit(habit_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    habit = db.query(Habit).filter(Habit.id == habit_id, Habit.user_id == current_user.id).first()
    if not habit:
        raise HTTPException(status_code=404, detail="Habit not found")
    
    now = datetime.utcnow()
    if habit.last_completed:
        time_diff = now - habit.last_completed
        if time_diff.total_seconds() < 72000:  # 20 hours
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Habit already completed today")
        
        if time_diff.total_seconds() < 172800:  # 48 hours
            habit.streak += 1
        else:
            habit.streak = 1
    else:
        habit.streak = 1
        
    habit.last_completed = now
    log = HabitLog(habit_id=habit.id, completed_at=now)
    db.add(log)
    db.commit()
    db.refresh(habit)
    return habit

@router.delete("/{habit_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_habit(habit_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    habit = db.query(Habit).filter(Habit.id == habit_id, Habit.user_id == current_user.id).first()
    if not habit:
        raise HTTPException(status_code=404, detail="Habit not found")
    db.delete(habit)
    db.commit()
    return None
