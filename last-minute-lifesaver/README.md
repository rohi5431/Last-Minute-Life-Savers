# Last-Minute Life Saver

> Turn panic into a plan in seconds. Drop a goal and a deadline; the AI splits it into prioritized tasks, fits them around your calendar, and nudges you in real time.

Last-Minute Life Saver is a hackathon-built, AI-powered deadline management system. A multi-agent backend decomposes a goal into subtasks, ranks them by urgency, schedules them into your day, detects calendar conflicts, autonomously reschedules missed work, and pushes live updates to a polished React dashboard over WebSocket.

---

## What it does

- **Goal → AI plan.** Enter a goal + deadline; the clarifier/planner/prioritizer/scheduler agents produce a prioritized, time-boxed plan in seconds.
- **Smart scheduling.** Tasks are placed into working-hours slots, avoiding your imported Google Calendar events and existing tasks.
- **Conflict detection & autonomous reschedule.** When a task clashes with a calendar event or its slot is missed, the system finds a new free slot and notifies you live.
- **Re-prioritization.** A Celery Beat worker re-scores tasks every few minutes based on deadline proximity, missed slots, and progress.
- **Context-aware reminders.** Reminders mention remaining duration, deadline urgency, and whether you missed the slot — never generic.
- **Realtime everywhere.** WebSocket `/ws/notify/{user_id}` pushes new notifications, task updates, schedule changes, and reprioritization events to the frontend.
- **Analytics.** Completion rate, streak, productivity score, and priority breakdown — all live.

---

## Tech stack

| Layer | Tech |
|------|------|
| Frontend | React, Vite, Tailwind CSS, Recharts, React Router, lucide-react |
| Backend | FastAPI, SQLAlchemy, Alembic, Pydantic |
| AI | LangChain / LangGraph, Groq (primary), Ollama (fallback) |
| Realtime | FastAPI WebSocket + in-process connection manager |
| Async jobs | Celery + Celery Beat (Redis broker) |
| Data | PostgreSQL, Redis (cache + context) |
| Integrations | Google Calendar API v3 (OAuth2) |
| Infra | Docker, Docker Compose |

---

## Project structure

```
last-minute-lifesaver/
├── backend/
│   ├── app/
│   │   ├── agents/        # Clarifier, planner, prioritizer, scheduler, orchestrator
│   │   ├── api/           # auth, goals, tasks, schedule, notifications, integrations
│   │   ├── core/          # security, deps
│   │   ├── events/        # WebSocket manager + event dispatcher
│   │   ├── models/        # User, Goal, Task, Schedule, Notification, CalendarToken, CalendarEvent
│   │   ├── prompts/       # LLM prompt templates
│   │   ├── schemas/       # Pydantic schemas
│   │   ├── services/      # scheduler, priority, reminder, task_splitter
│   │   ├── utils/         # llm_client, redis_client, calendar_sync, demo_data
│   │   ├── workers/       # celery_app, reminder_worker, reprioritize, notification
│   │   ├── config.py
│   │   ├── database.py
│   │   └── main.py
│   ├── alembic/           # DB migrations (001 initial, 002 calendar integration)
│   ├── scripts/           # seed_demo_data.py, demo_reset.py, demo_check.py
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/    # GoalInput, TaskBoard, TaskCard, Timeline, ScheduleCard,
│   │   │                  # NotificationBell, AnalyticsDash, Navbar, Sidebar,
│   │   │                  # AppLayout, AuthLayout, DemoBanner
│   │   ├── context/       # AuthContext, TaskContext
│   │   ├── hooks/         # useWebSocket, useGoals, useTasks
│   │   ├── pages/         # Dashboard, Login, Signup, Tasks, Calendar, Analytics, Settings
│   │   ├── services/      # api.js (Axios + JWT + WS config)
│   │   └── utils/         # format.js
│   └── package.json
└── docker-compose.yml
```

---

## Quick start (Docker)

### Prerequisites

- Docker + Docker Compose

### 1. Configure environment

```bash
cd last-minute-lifesaver
cp backend/.env.example backend/.env
```

Edit `backend/.env` and set:
- `GROQ_API_KEY` — your [Groq](https://console.groq.com) API key (for AI planning)
- `SECRET_KEY` — a random string
- (Optional, for Google Calendar) `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI`

> The app runs without Google credentials — calendar features simply report "not configured" instead of crashing.

### 2. Start all services

```bash
docker-compose up --build
```

This brings up: `postgres`, `redis`, `backend`, `frontend`, `celery_worker`, `celery_beat`.

### 3. Run database migrations

```bash
docker-compose exec backend alembic upgrade head
```

### 4. Seed demo data

```bash
docker-compose exec backend python scripts/seed_demo_data.py
```

### 5. Open the app

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend | http://localhost:8000 |
| API docs (Swagger) | http://localhost:8000/docs |
| API docs (ReDoc) | http://localhost:8000/redoc |

Log in with the seeded demo account (see below) or sign up fresh.

---

## Demo credentials

After running the seed script, use:

| Field | Value |
|-------|-------|
| Email | `demo@lifesaver.app` |
| Password | `demo1234` |

The seeded account has 3 goals, ~12 tasks (some completed, some scheduled across today/tomorrow), 5 notifications, and 4 imported calendar events — enough to make every screen look alive immediately.

---

## Run commands

| Action | Command |
|--------|---------|
| Start everything | `docker-compose up --build` |
| Run migrations | `docker-compose exec backend alembic upgrade head` |
| Seed demo data | `docker-compose exec backend python scripts/seed_demo_data.py` |
| Reset demo data | `docker-compose exec backend python scripts/demo_reset.py --yes` |
| Pre-demo check | `docker-compose exec backend python scripts/demo_check.py` |
| Tail backend logs | `docker-compose logs -f backend` |
| Tail Celery logs | `docker-compose logs -f celery_worker` |
| Stop services | `docker-compose down` |
| Stop + wipe volumes | `docker-compose down -v` |

### Local development (without Docker)

You can run the frontend and backend directly for a faster dev loop:

**Backend:**
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
# in another shell:
celery -A app.workers.celery_app worker --loglevel=info
celery -A app.workers.celery_app beat --loglevel=info
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

The Vite dev server proxies `/api` and `/ws` to `http://localhost:8000`, so no CORS config is needed for local dev.

---

## Seeding & resetting demo data

The seed is **idempotent and time-relative** — it always derives deadlines/schedules from "now," so the dashboard looks alive the moment you log in. It writes the final planned state directly (no AI call needed), so it works even when Groq/Ollama are unavailable.

**Seed:**
```bash
docker-compose exec backend python scripts/seed_demo_data.py
```

**Reset (wipe demo user's data and re-seed):**
```bash
docker-compose exec backend python scripts/demo_reset.py --yes
```

**Validate before presenting:**
```bash
docker-compose exec backend python scripts/demo_check.py
```
This checks backend health, frontend reachability, DB + Redis connectivity, Celery worker status, key endpoints, and demo data presence, printing a green/red report.

---

## API overview

### Auth
- `POST /auth/register` — JSON `{email, password}` → `{id, email, created_at}`
- `POST /auth/login` — form-encoded `{username, password}` → `{access_token, token_type}`

### Goals
- `POST /goals/` — create a goal (triggers AI planning in the background)
- `GET /goals/` — list goals
- `GET /goals/{id}` — get a goal
- `GET /goals/{id}/plan` — fetch the cached AI plan (clarification/tasks/schedule)
- `DELETE /goals/{id}` — delete a goal

### Tasks
- `GET /tasks/?goal_id=` — list tasks (optional filter)
- `POST /tasks/` — create a task
- `PATCH /tasks/{id}` — update status/priority/scheduled_at/completed_at

### Schedule
- `GET /schedule/` — all scheduled slots
- `GET /schedule/today` — today's slots only

### Notifications
- `GET /notifications/` — list notifications
- `PATCH /notifications/{id}/read` — mark as read

### Calendar integration
- `POST /calendar/oauth/start` — returns a Google OAuth URL
- `GET /calendar/oauth/callback` — OAuth redirect target
- `GET /calendar/status` — connection status
- `POST /calendar/sync` — import events + detect conflicts
- `GET /calendar/events` — list imported events
- `GET /calendar/conflicts` — list detected conflicts
- `POST /calendar/optimize` — reschedule conflicting/missed tasks

### Realtime
- `WS /ws/notify/{user_id}?token=<JWT>` — user-scoped live channel

---

## Realtime updates

The frontend's `useWebSocket` hook connects to `/ws/notify/{user_id}` with the JWT as a query param, authenticating against the token's `sub` claim. The backend's in-process `WebSocketManager` tracks per-user connections and the `dispatcher` module provides fire-and-forget helpers (`dispatch_notification`, `dispatch_task_update`, `dispatch_schedule_update`, `dispatch_reprioritization`, `dispatch_refresh`) that any handler or Celery worker can call. The hook reconnects with exponential backoff on drop.

---

## AI agent flow

```
Goal + deadline
   │
   ▼
Clarifier  ──(needs clarification?)──▶ asks the user questions
   │ no
   ▼
Planner  ─────────────────────────────▶ 3–7 subtasks with durations
   │
   ▼
Prioritizer  ───────────────────────▶ scored + ranked (deadline, duration, AI)
   │
   ▼
Scheduler  ──────────────────────────▶ slotted into working hours,
                                       avoiding calendar + task conflicts
   │
   ▼
Redis cache + DB  ───────────────────▶ frontend polls /goals/{id}/plan
                                       then WebSocket pushes updates
```

Celery Beat runs three periodic jobs: upcoming reminders (60s), autonomous reschedule of missed tasks (5m), and smart re-prioritization (10m).

---

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| `docker-compose up` fails to build | ensure Docker has ≥4GB RAM; run `docker-compose build --no-cache` |
| `alembic upgrade head` errors | make sure postgres is healthy: `docker-compose ps`; if fresh, run `docker-compose down -v` then `up --build` |
| AI planning returns no tasks | check `GROQ_API_KEY` in `backend/.env`; the seed writes tasks directly so the demo still works without the LLM |
| 401 on all API calls | JWT expired — log out and back in; the frontend auto-logs-out on 401 |
| WebSocket won't connect | confirm the backend is up and the token is valid; the hook shows an amber dot while reconnecting |
| Calendar sync says "not configured" | set `GOOGLE_CLIENT_ID` + `GOOGLE_CLIENT_SECRET` in `backend/.env` and restart the backend; the demo works without it |
| Celery tasks not running | ensure `celery_worker` + `celery_beat` containers are up: `docker-compose up celery_worker celery_beat` |
| Dashboard empty after seed | run `docker-compose exec backend python scripts/demo_check.py`; log in as `demo@lifesaver.app` |
| Port 5173/8000 already in use | change the host port mapping in `docker-compose.yml` |

---

## Development status

- **Phase 1** — Infrastructure (Postgres, Redis, FastAPI scaffold, Alembic, Docker)
- **Phase 2** — Backend API (auth, goals, tasks, schedule, notifications)
- **Phase 3** — AI agent core (clarifier, planner, prioritizer, scheduler, orchestrator)
- **Phase 4** — React frontend (dashboard, task board, timeline, analytics, auth)
- **Phase 5** — Integrations (Google Calendar OAuth, conflict detection, autonomous reschedule, smart re-prioritization, context-aware reminders, WebSocket live updates)
- **Phase 6** — Demo readiness (seeded data, reset/check scripts, README, architecture, demo script, final checklist)

---

## License

Built for a hackathon. Use it, fork it, demo it.
