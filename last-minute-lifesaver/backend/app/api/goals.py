from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
from app.core.deps import get_db, get_current_user
from app.models.user import User
from app.models.goal import Goal
from app.models.task import Task
from app.models.schedule import Schedule
from app.schemas import GoalCreate, GoalUpdate, GoalResponse
from app.agents.orchestrator import orchestrator
from app.services.task_splitter import create_task_objects
from app.services.priority_service import rank_tasks
from app.services.scheduler_service import fit_tasks_in_schedule
from datetime import datetime
import logging

router = APIRouter(prefix="/goals", tags=["goals"])
logger = logging.getLogger(__name__)


def run_ai_planning(goal_id: int, user_id: int, goal_title: str, goal_description: str, deadline: datetime):
    from app.database import SessionLocal
    db = SessionLocal()
    try:
        ai_result = orchestrator.process_goal(
            user_id=user_id,
            goal_id=goal_id,
            goal_title=goal_title,
            goal_description=goal_description,
            deadline=deadline
        )

        if ai_result.get("clarification", {}).get("needs_clarification"):
            logger.info(f"Goal {goal_id} needs clarification")
            return

        plan = ai_result.get("plan")
        priority = ai_result.get("priority")
        schedule = ai_result.get("schedule")

        if not plan or not plan.get("tasks"):
            logger.warning(f"No tasks generated for goal {goal_id}")
            return

        task_objects = create_task_objects(plan, goal_id)
        created_tasks = []

        for task_data in task_objects:
            task = Task(**task_data)
            db.add(task)
            db.flush()
            created_tasks.append(task)

        db.commit()

        if priority and priority.get("scored_tasks"):
            ranked = rank_tasks(task_objects, priority["scored_tasks"], deadline)
            scheduled = fit_tasks_in_schedule(task_objects, ranked, schedule.get("schedule_plan", []), deadline)

            for item in scheduled:
                task_id = item["task_id"]
                scheduled_for = item["scheduled_for"]
                if task_id <= len(created_tasks):
                    task = created_tasks[task_id - 1]
                    task.scheduled_at = scheduled_for
                    schedule_record = Schedule(
                        user_id=user_id,
                        task_id=task.id,
                        scheduled_for=scheduled_for
                    )
                    db.add(schedule_record)

        db.commit()
        logger.info(f"AI planning completed for goal {goal_id}")
    except Exception as e:
        logger.error(f"AI planning failed for goal {goal_id}: {e}")
        db.rollback()
    finally:
        db.close()


@router.post("/", response_model=GoalResponse, status_code=status.HTTP_201_CREATED)
def create_goal(
    goal_data: GoalCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    goal = Goal(
        user_id=current_user.id,
        title=goal_data.title,
        description=goal_data.description,
        deadline=goal_data.deadline,
    )
    db.add(goal)
    db.commit()
    db.refresh(goal)

    background_tasks.add_task(
        run_ai_planning,
        goal.id,
        current_user.id,
        goal.title,
        goal.description,
        goal.deadline
    )

    return goal


@router.get("/", response_model=List[GoalResponse])
def list_goals(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    goals = db.query(Goal).filter(Goal.user_id == current_user.id).all()
    return goals


@router.get("/{goal_id}", response_model=GoalResponse)
def get_goal(goal_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    goal = db.query(Goal).filter(Goal.id == goal_id, Goal.user_id == current_user.id).first()
    if not goal:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Goal not found")
    return goal


@router.delete("/{goal_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_goal(goal_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    goal = db.query(Goal).filter(Goal.id == goal_id, Goal.user_id == current_user.id).first()
    if not goal:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Goal not found")
    db.delete(goal)
    db.commit()
    return None


@router.get("/{goal_id}/plan")
def get_goal_plan(goal_id: int, current_user: User = Depends(get_current_user)):
    plan = orchestrator.get_cached_plan(goal_id)
    if not plan:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Plan not found")
    return plan
