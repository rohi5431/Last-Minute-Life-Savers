from celery import Celery
from app.config import settings

celery_app = Celery(
    "lifesaver",
    broker=settings.REDIS_URL,
    backend=settings.REDIS_URL,
    include=[
        "app.workers.reminder_worker",
        "app.workers.reprioritize",
        "app.workers.notification",
    ],
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    beat_schedule={
        "check-upcoming-reminders": {
            "task": "app.workers.reminder_worker.check_upcoming_tasks",
            "schedule": 60.0,
        },
        "auto-reschedule-missed-tasks": {
            "task": "app.workers.reminder_worker.auto_reschedule_missed",
            "schedule": 300.0,
        },
        "reprioritize-tasks": {
            "task": "app.workers.reprioritize.reprioritize_user_tasks",
            "schedule": 600.0,
        },
    },
)
