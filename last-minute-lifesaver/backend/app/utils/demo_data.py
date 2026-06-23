"""Demo data definitions for Last-Minute Life Saver.

Keeps seed/reset scripts deterministic and visually strong for the demo.
All timestamps are derived from `now` so the dashboard always looks alive
right after seeding (today's schedule is populated, deadlines are soon).
"""
from datetime import datetime, timedelta

DEMO_USER_EMAIL = "demo@lifesaver.app"
DEMO_USER_PASSWORD = "demo1234"

DEMO_USER = {
    "email": DEMO_USER_EMAIL,
    "password": DEMO_USER_PASSWORD,
    # Full name is used only for display niceties in docs/scripts.
    "name": "Demo User",
}


def _in(hours=0, days=0, minutes=0):
    """Helper: now + offset, naive UTC."""
    return datetime.utcnow() + timedelta(hours=hours, days=days, minutes=minutes)


def build_demo_plan():
    """Return a structured plan of goals + tasks + schedules + notifications.

    Each goal carries a `tasks` list; each task may carry `schedule_hours_from_now`
    (place on today's timeline) and an optional `notification`. This keeps the
    seed fully self-contained.
    """
    now = datetime.utcnow()

    goals = [
        {
            "title": "Submit hackathon project",
            "description": "Final integration, demo polish, and submission for the judge review.",
            "deadline": _in(hours=46),
            "tasks": [
                {
                    "title": "Wire up WebSocket live notifications",
                    "duration_min": 45,
                    "priority": "high",
                    "status": "in_progress",
                    "notes": "Endpoint /ws/notify/{user_id}",
                    "schedule_hours_from_now": -0.5,  # started 30m ago — in progress
                    "metadata": {"ai_score": 9.1, "priority_score": 9.1},
                },
                {
                    "title": "Seed realistic demo data",
                    "duration_min": 30,
                    "priority": "high",
                    "status": "pending",
                    "notes": "Run scripts/seed_demo_data.py",
                    "schedule_hours_from_now": 1.5,
                    "metadata": {"ai_score": 8.6, "priority_score": 8.6},
                },
                {
                    "title": "Record 3-minute backup demo video",
                    "duration_min": 60,
                    "priority": "medium",
                    "status": "pending",
                    "schedule_hours_from_now": 3.5,
                    "metadata": {"ai_score": 7.0, "priority_score": 7.0},
                },
                {
                    "title": "Practice the pitch twice",
                    "duration_min": 30,
                    "priority": "medium",
                    "status": "pending",
                    "schedule_hours_from_now": 6,
                    "metadata": {"ai_score": 6.4, "priority_score": 6.4},
                },
                {
                    "title": "Final compile + ship build",
                    "duration_min": 20,
                    "priority": "low",
                    "status": "pending",
                    "schedule_hours_from_now": 28,
                    "metadata": {"ai_score": 5.2, "priority_score": 5.2},
                },
            ],
        },
        {
            "title": "Finish data structures final",
            "description": "4 chapters to review, focus on graphs + dynamic programming.",
            "deadline": _in(days=5),
            "tasks": [
                {
                    "title": "Review graph algorithms",
                    "duration_min": 90,
                    "priority": "high",
                    "status": "pending",
                    "schedule_hours_from_now": 26,
                    "metadata": {"ai_score": 8.0, "priority_score": 8.0},
                },
                {
                    "title": "DP problem set (15 problems)",
                    "duration_min": 120,
                    "priority": "medium",
                    "status": "pending",
                    "schedule_hours_from_now": 50,
                    "metadata": {"ai_score": 6.8, "priority_score": 6.8},
                },
                {
                    "title": "Mock exam under timed conditions",
                    "duration_min": 60,
                    "priority": "low",
                    "status": "pending",
                    "schedule_hours_from_now": 74,
                    "metadata": {"ai_score": 5.0, "priority_score": 5.0},
                },
                {
                    "title": "Cheatsheet: complexity table",
                    "duration_min": 25,
                    "priority": "low",
                    "status": "completed",
                    "completed_at": _in(hours=-2),
                    "metadata": {"ai_score": 4.2, "priority_score": 4.2},
                },
            ],
        },
        {
            "title": "Launch side-project landing page",
            "description": "Single page, email capture, deployed for the demo audience.",
            "deadline": _in(days=2),
            "tasks": [
                {
                    "title": "Design hero section in Figma",
                    "duration_min": 45,
                    "priority": "medium",
                    "status": "completed",
                    "completed_at": _in(hours=-5),
                    "metadata": {"ai_score": 6.0, "priority_score": 6.0},
                },
                {
                    "title": "Implement responsive hero + email form",
                    "duration_min": 60,
                    "priority": "high",
                    "status": "pending",
                    "schedule_hours_from_now": 4.5,
                    "metadata": {"ai_score": 7.4, "priority_score": 7.4},
                },
                {
                    "title": "Deploy to staging + custom domain",
                    "duration_min": 30,
                    "priority": "medium",
                    "status": "pending",
                    "schedule_hours_from_now": 30,
                    "metadata": {"ai_score": 5.8, "priority_score": 5.8},
                },
            ],
        },
    ]

    # Cross-goal notifications to make the bell feel alive.
    notifications = [
        {
            "message": 'Priority bumped: "Seed realistic demo data" is now high priority — deadline is near.',
            "sent_at": _in(minutes=-8),
            "task_index": (0, 1),  # goal 0, task 1
            "is_read": False,
        },
        {
            "message": 'Auto-rescheduled "Practice the pitch twice" to tomorrow 06:00 to avoid a conflict.',
            "sent_at": _in(minutes=-22),
            "task_index": (0, 3),
            "is_read": False,
        },
        {
            "message": 'Reminder: "Wire up WebSocket live notifications" starts soon. Blocked out 45m — go.',
            "sent_at": _in(minutes=-35),
            "task_index": (0, 0),
            "is_read": False,
        },
        {
            "message": 'Nice — "Cheatsheet: complexity table" is done!',
            "sent_at": _in(hours=-2),
            "task_index": (1, 3),
            "is_read": True,
        },
        {
            "message": 'Calendar sync imported 5 events. Found 1 conflict with "Implement responsive hero + email form".',
            "sent_at": _in(hours=-1),
            "task_index": (2, 1),
            "is_read": True,
        },
    ]

    return {
        "user": DEMO_USER,
        "goals": goals,
        "notifications": notifications,
        "now": now,
    }


# Credentials surfaced in scripts + docs.
DEMO_TOKEN_TTL_HOURS = 24 * 7  # 7 days, matches ACCESS_TOKEN_EXPIRE_MINUTES default
