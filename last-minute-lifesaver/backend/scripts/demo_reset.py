"""Reset the demo environment back to a known-good state.

Equivalent to running seed_demo_data.py but always wipes the demo user's
rows first (even if a previous demo session logged in and changed things).
Use this 30 seconds before going on stage.

Run from the backend container:
    python scripts/demo_reset.py

Options:
    --keep-calendar   keep imported Google Calendar events/tokens (default: wipe)
    --yes             skip the confirmation prompt
"""
from __future__ import annotations

import argparse
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import SessionLocal  # noqa: E402
from app.models.user import User  # noqa: E402
from app.models.goal import Goal  # noqa: E402
from app.models.task import Task  # noqa: E402
from app.models.schedule import Schedule  # noqa: E402
from app.models.notification import Notification  # noqa: E402
from app.models.integration import CalendarToken, CalendarEvent  # noqa: E402
from app.utils.demo_data import DEMO_USER_EMAIL  # noqa: E402
from scripts.seed_demo_data import seed  # noqa: E402


def reset(keep_calendar: bool = False) -> dict:
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == DEMO_USER_EMAIL).first()
        if user:
            db.query(Notification).filter(Notification.user_id == user.id).delete()
            db.query(Schedule).filter(Schedule.user_id == user.id).delete()
            if not keep_calendar:
                db.query(CalendarEvent).filter(CalendarEvent.user_id == user.id).delete()
                db.query(CalendarToken).filter(CalendarToken.user_id == user.id).delete()
            db.query(Task).filter(Task.goal_id.in_(
                db.query(Goal.id).filter(Goal.user_id == user.id)
            )).delete(synchronize_session=False)
            db.query(Goal).filter(Goal.user_id == user.id).delete(synchronize_session=False)
            db.commit()
        else:
            db.commit()
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()

    # Re-seed deterministically.
    return seed()


def main():
    parser = argparse.ArgumentParser(description="Reset the demo environment.")
    parser.add_argument("--keep-calendar", action="store_true", help="Keep imported calendar data")
    parser.add_argument("--yes", action="store_true", help="Skip confirmation")
    args = parser.parse_args()

    if not args.yes:
        print("This will WIPE all demo user data and re-seed. Continue? [y/N] ", end="", flush=True)
        try:
            answer = input().strip().lower()
        except EOFError:
            answer = "n"
        if answer not in ("y", "yes"):
            print("Aborted.")
            return 1

    print("\nResetting demo environment...")
    summary = reset(keep_calendar=args.keep_calendar)
    print("\nReset complete. Demo is ready.")
    print(f"  Login: {summary['user']}  (password: see docs)\n")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
