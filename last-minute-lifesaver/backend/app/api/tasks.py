from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.deps import get_db, get_current_user
from app.models.user import User
from app.models.goal import Goal
from app.models.task import Task
from app.models.schedule import Schedule
from app.schemas import TaskCreate, TaskUpdate, TaskResponse

router = APIRouter(prefix="/tasks", tags=["tasks"])


@router.post("/", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
def create_task(task_data: TaskCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    goal = db.query(Goal).filter(Goal.id == task_data.goal_id, Goal.user_id == current_user.id).first()
    if not goal:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Goal not found")

    task = Task(
        goal_id=task_data.goal_id,
        title=task_data.title,
        duration_min=task_data.duration_min,
        priority=task_data.priority,
        scheduled_at=task_data.scheduled_at,
        notes=task_data.notes,
    )
    db.add(task)
    db.commit()
    db.refresh(task)

    if task.scheduled_at:
        schedule = Schedule(
            user_id=current_user.id,
            task_id=task.id,
            scheduled_for=task.scheduled_at,
        )
        db.add(schedule)
        db.commit()

    return task


@router.get("/", response_model=List[TaskResponse])
def list_tasks(goal_id: int = None, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    query = db.query(Task).join(Goal).filter(Goal.user_id == current_user.id)
    if goal_id:
        query = query.filter(Task.goal_id == goal_id)
    tasks = query.all()
    return tasks


@router.patch("/{task_id}", response_model=TaskResponse)
def update_task(task_id: int, task_data: TaskUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    task = db.query(Task).join(Goal).filter(Task.id == task_id, Goal.user_id == current_user.id).first()
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")

    update_data = task_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(task, field, value)

    if task_data.scheduled_at:
        existing_schedule = db.query(Schedule).filter(
            Schedule.task_id == task.id,
            Schedule.user_id == current_user.id
        ).first()

        if existing_schedule:
            existing_schedule.scheduled_for = task_data.scheduled_at
        else:
            new_schedule = Schedule(
                user_id=current_user.id,
                task_id=task.id,
                scheduled_for=task_data.scheduled_at,
            )
            db.add(new_schedule)

    db.commit()
    db.refresh(task)
    return task
