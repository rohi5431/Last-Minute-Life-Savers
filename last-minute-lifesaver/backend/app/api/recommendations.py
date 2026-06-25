from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Dict, Any
from datetime import datetime
from app.core.deps import get_db, get_current_user
from app.models.user import User
from app.models.task import Task
from app.models.goal import Goal
from app.utils.llm_client import llm_client

router = APIRouter(prefix="/productivity", tags=["productivity"])

class AssistantRequest(BaseModel):
    message: str

@router.get("/recommendations")
def get_recommendations(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    tasks = db.query(Task).join(Goal).filter(Goal.user_id == current_user.id).all()
    goals = db.query(Goal).filter(Goal.user_id == current_user.id).all()
    
    fallbacks = [
        {"id": "tip-1", "tip": "Set clear daily goals.", "context": "Focus on 3 main tasks today to build momentum.", "priority": "high"},
        {"id": "tip-2", "tip": "Use time boxing.", "context": "Block out specific hours for your high-priority tasks.", "priority": "medium"},
        {"id": "tip-3", "tip": "Eliminate distractions.", "context": "Turn off notifications for 45 minutes to unlock deep work.", "priority": "low"}
    ]
    
    task_titles = [t.title for t in tasks[:10]]
    goal_titles = [g.title for g in goals]
    
    prompt = f"""
    You are an AI Productivity Coach.
    Here are the user's current goals: {goal_titles}
    Here are the user's current tasks: {task_titles}
    
    Generate exactly 3 personalized, highly actionable productivity recommendations/tips for this user.
    Each tip must have:
    - id: unique string (e.g. tip-1, tip-2, tip-3)
    - tip: short title of the recommendation
    - context: detailed explanation of why they should do this and how it helps
    - priority: high, medium, or low
    
    Return ONLY a JSON list of objects. No extra text or formatting tags.
    """
    try:
        data = llm_client.call_json(prompt)
        if isinstance(data, list) and len(data) > 0:
            return data
        elif isinstance(data, dict) and "recommendations" in data:
            return data["recommendations"]
        return fallbacks
    except Exception:
        return fallbacks

@router.post("/assistant")
def ask_assistant(req: AssistantRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    msg = req.message.lower()
    
    if "optimize" in msg or "schedule" in msg or "reschedule" in msg or "conflict" in msg:
        from app.api.integrations import optimize_schedule
        try:
            res = optimize_schedule(db=db, current_user=current_user)
            return {
                "response": "I have successfully optimized your schedule to resolve conflicts and block focus time around your calendar events.",
                "action_taken": "schedule_optimization",
                "details": str(res.message if hasattr(res, "message") else res)
            }
        except Exception as e:
            return {
                "response": f"I tried to optimize your schedule, but ran into an issue: {str(e)}",
                "action_taken": "schedule_optimization_error"
            }
            
    tasks = db.query(Task).join(Goal).filter(Goal.user_id == current_user.id).all()
    goals = db.query(Goal).filter(Goal.user_id == current_user.id).all()
    
    from app.models.habit import Habit
    habits = db.query(Habit).filter(Habit.user_id == current_user.id).all()
    
    goal_summary = [f"- Goal: '{g.title}' (Status: {g.status}, Deadline: {g.deadline.strftime('%Y-%m-%d %H:%M') if g.deadline else 'None'})" for g in goals]
    task_summary = [f"- Task: '{t.title}' (Priority: {t.priority}, Status: {t.status}, Scheduled: {t.scheduled_at.strftime('%Y-%m-%d %H:%M') if t.scheduled_at else 'No'})" for t in tasks]
    habit_summary = [f"- Habit: '{h.title}' (Streak: {h.streak} days, Freq: {h.frequency})" for h in habits]
    
    goal_str = "\n".join(goal_summary) if goal_summary else "  None"
    task_str = "\n".join(task_summary[:15]) if task_summary else "  None"
    habit_str = "\n".join(habit_summary) if habit_summary else "  None"
    
    prompt = f"""
    You are a proactive, supportive AI productivity companion named LifeSaver.
    You have direct access to the user's goals, tasks, and habits.
    
    Here is the user's current productivity context:
    GOALS:
    {goal_str}
    
    TASKS (showing up to 15):
    {task_str}
    
    HABITS:
    {habit_str}
    
    The user is asking/commanding you: "{req.message}"
    
    Give a short, encouraging, specific, and actionable answer directly referencing their actual tasks/goals if applicable (max 3 sentences).
    """
    try:
        response_text = llm_client.call(prompt)
        return {"response": response_text}
    except Exception:
        return {"response": "I'm here to help you stay on top of your deadlines and tasks! Let me know if you'd like me to optimize your schedule."}
