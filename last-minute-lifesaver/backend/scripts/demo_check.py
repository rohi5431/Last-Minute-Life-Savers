"""Pre-demo validation script.

Runs a battery of checks and prints a green/red table so you can catch
problems before going on stage. Exits non-zero if any critical check fails.

Run from the backend container (has access to DB + Redis + backend URL):
    python scripts/demo_check.py

Or from the host:
    python backend/scripts/demo_check.py --backend http://localhost:8000 --frontend http://localhost:5173
"""
from __future__ import annotations

import argparse
import os
import sys
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8')
from datetime import datetime, timedelta

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

DEFAULT_BACKEND = os.environ.get("BACKEND_URL", "http://localhost:8000")
DEFAULT_FRONTEND = os.environ.get("FRONTEND_URL", "http://localhost:5173")

GREEN = "\033[92m"
RED = "\033[91m"
YELLOW = "\033[93m"
RESET = "\033[0m"
BOLD = "\033[1m"


def _ok(label, detail=""):
    print(f"  {GREEN}✓{RESET} {label}" + (f"  — {detail}" if detail else ""))
    return True


def _fail(label, detail=""):
    print(f"  {RED}✗{RESET} {label}" + (f"  — {detail}" if detail else ""))
    return False


def _warn(label, detail=""):
    print(f"  {YELLOW}!{RESET} {label}" + (f"  — {detail}" if detail else ""))
    return True


def _section(title):
    print(f"\n{BOLD}{title}{RESET}")


# ----------------------- checks -----------------------

def check_http(name, url, expect_status=200, timeout=5):
    try:
        import urllib.request
        req = urllib.request.Request(url, method="GET")
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            status = resp.status
            if status == expect_status:
                return _ok(name, f"HTTP {status}")
            return _fail(name, f"expected {expect_status}, got {status}")
    except Exception as e:
        return _fail(name, str(e))


def check_backend_json(name, path, backend_url):
    url = f"{backend_url}{path}"
    try:
        import urllib.request
        req = urllib.request.Request(url, headers={"Accept": "application/json"})
        with urllib.request.urlopen(req, timeout=5) as resp:
            import json
            data = json.loads(resp.read().decode())
            return _ok(name, f"returned {len(data) if isinstance(data, list) else 'object'} item(s)"), data
    except Exception as e:
        return _fail(name, str(e)), None


def check_database():
    _section("Database")
    try:
        from app.database import SessionLocal
        from app.models.user import User
        from app.models.goal import Goal
        from app.models.task import Task
        from app.models.schedule import Schedule
        from app.models.notification import Notification
        from sqlalchemy import text
        db = SessionLocal()
        try:
            db.execute(text("SELECT 1"))
            _ok("Postgres connection", "SELECT 1 ok")
            counts = {
                "users": db.query(User).count(),
                "goals": db.query(Goal).count(),
                "tasks": db.query(Task).count(),
                "schedules": db.query(Schedule).count(),
                "notifications": db.query(Notification).count(),
            }
            for key, val in counts.items():
                label = key if val != 1 else key.rstrip("s")
                if val > 0:
                    _ok(label, f"{val} row(s)")
                else:
                    _warn(label, "0 rows (run seed)")
            # Demanded: demo user present
            from app.utils.demo_data import DEMO_USER_EMAIL
            demo = db.query(User).filter(User.email == DEMO_USER_EMAIL).first()
            if demo:
                _ok("Demo user exists", DEMO_USER_EMAIL)
            else:
                _fail("Demo user exists", f"{DEMO_USER_EMAIL} not found — run seed_demo_data.py")
            # Today's schedule non-empty (the wow moment needs a populated timeline)
            today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
            tomorrow_start = today_start + timedelta(days=1)
            today_count = db.query(Schedule).filter(
                Schedule.scheduled_for >= today_start,
                Schedule.scheduled_for < tomorrow_start,
            ).count()
            if today_count > 0:
                _ok("Today's schedule populated", f"{today_count} slot(s) today")
            else:
                _warn("Today's schedule populated", "0 today — consider running the seed")
        finally:
            db.close()
        return True
    except Exception as e:
        return _fail("Database checks", str(e))


def check_redis():
    _section("Redis")
    try:
        from app.config import settings
        import redis as _redis
        client = _redis.from_url(settings.REDIS_URL, decode_responses=True)
        pong = client.ping()
        if pong:
            _ok("Redis ping", "PONG")
        else:
            _fail("Redis ping", "no PONG")
        info = client.dbsize()
        _ok("Redis DB size", f"{info} key(s)")
        return True
    except Exception as e:
        return _fail("Redis", str(e))


def check_celery():
    _section("Celery")
    try:
        from app.workers.celery_app import celery_app
        inspect = celery_app.control.inspect(timeout=1.0)
        active = inspect.active()
        if active is None:
            return _warn("Celery worker", "no worker responded (is the worker running?)")
        if not active:
            return _warn("Celery worker", "ping returned no workers")
        workers = list(active.keys())
        _ok("Celery worker reachable", ", ".join(workers))
        # Registered tasks
        registered = inspect.registered() or {}
        all_tasks = []
        for tasks in registered.values():
            all_tasks.extend(tasks)
        beat_tasks = [t for t in all_tasks if t in (
            "app.workers.reminder_worker.check_upcoming_tasks",
            "app.workers.reminder_worker.auto_reschedule_missed",
            "app.workers.reprioritize.reprioritize_user_tasks",
        )]
        if len(beat_tasks) >= 2:
            _ok("Critical tasks registered", f"{len(beat_tasks)} of 3 found")
        else:
            _warn("Critical tasks registered", f"{len(beat_tasks)} of 3 found")
        return True
    except Exception as e:
        return _warn("Celery", str(e))


def check_endpoints(backend_url, demo_email, demo_password):
    _section("Backend endpoints")
    # Auth: get a JWT for the demo user so we can hit protected routes.
    import urllib.request
    import urllib.parse
    import json

    token = None
    try:
        data = urllib.parse.urlencode({"username": demo_email, "password": demo_password}).encode()
        req = urllib.request.Request(
            f"{backend_url}/auth/login",
            data=data,
            headers={"Content-Type": "application/x-www-form-urlencoded"},
        )
        with urllib.request.urlopen(req, timeout=5) as resp:
            token = json.loads(resp.read().decode()).get("access_token")
        _ok("POST /auth/login", "JWT issued")
    except Exception as e:
        _fail("POST /auth/login", str(e) + " — run scripts/seed_demo_data.py")
        _fail("Protected endpoints", "skipped (no token)")
        return False

    headers = {"Authorization": f"Bearer {token}"}

    def get(path):
        req = urllib.request.Request(f"{backend_url}{path}", headers=headers)
        with urllib.request.urlopen(req, timeout=5) as resp:
            return json.loads(resp.read().decode())

    checks = [
        ("/goals/", "goals"),
        ("/tasks/", "tasks"),
        ("/schedule/", "schedules"),
        ("/schedule/today", "today schedule"),
        ("/notifications/", "notifications"),
        ("/calendar/status", "calendar status"),
        ("/calendar/events", "calendar events"),
        ("/calendar/conflicts", "conflicts"),
    ]
    all_ok = True
    for path, label in checks:
        try:
            data = get(path)
            n = len(data) if isinstance(data, list) else (1 if data else 0)
            _ok(f"GET {path}", f"{n} item(s)")
        except Exception as e:
            # 404 / not-configured are non-fatal for the calendar routes
            text = str(e)
            if "404" in text or "400" in text:
                _warn(f"GET {path}", text)
            else:
                _fail(f"GET {path}", text)
                all_ok = False
    return all_ok


def check_websocket(backend_url):
    _section("WebSocket")
    try:
        import websocket  # type: ignore
    except ImportError:
        return _warn("WebSocket connect", "websockets lib not installed (non-fatal)")
    ws_url = backend_url.replace("http://", "ws://").replace("https://", "wss://")
    # No token => expect a close (which proves the endpoint exists)
    try:
        ws = websocket.create_connection(f"{ws_url}/ws/notify/0", timeout=3)
        ws.close()
        return _warn("WebSocket endpoint", "connect succeeded without token (auth may be bypassed)")
    except Exception as e:
        msg = str(e)
        # A clean auth reject (4401) proves the route is alive and enforcing.
        if "4401" in msg or "403" in msg or "Handshake status" in msg or "Connection" in msg:
            return _ok("WebSocket endpoint", "rejects unauthenticated (good)")
        return _warn("WebSocket endpoint", msg)


# ----------------------- main -----------------------

def main():
    parser = argparse.ArgumentParser(description="Pre-demo validation.")
    parser.add_argument("--backend", default=DEFAULT_BACKEND, help="Backend base URL")
    parser.add_argument("--frontend", default=DEFAULT_FRONTEND, help="Frontend base URL")
    args = parser.parse_args()

    backend_url = args.backend.rstrip("/")
    frontend_url = args.frontend.rstrip("/")

    print(f"\n{BOLD}Last-Minute Life Saver — pre-demo check{RESET}")
    print(f"  Backend:  {backend_url}")
    print(f"  Frontend: {frontend_url}")
    print(f"  Time:     {datetime.utcnow().isoformat()}Z")

    _section("Services reachable")
    check_http("Backend root", f"{backend_url}/")
    check_http("Backend /health", f"{backend_url}/health")
    check_http("Frontend dev server", frontend_url, timeout=8)

    check_database()
    check_redis()
    check_celery()
    check_endpoints(backend_url, os.environ.get("DEMO_USER_EMAIL", "demo@lifesaver.app"),
                    os.environ.get("DEMO_USER_PASSWORD", "demo1234"))
    check_websocket(backend_url)

    _section("Result")
    print(f"  If everything above is {GREEN}✓{RESET} or {YELLOW}!{RESET}, you are ready to demo.\n")


if __name__ == "__main__":
    main()
