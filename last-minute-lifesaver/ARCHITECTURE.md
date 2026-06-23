# Architecture

A high-level, presentation-ready breakdown of how Last-Minute Life Saver is built and how data flows through it.

---

## System overview

```
┌────────────────────────────────────────────────────────────────────┐
│                          Frontend (React + Vite)                    │
│                                                                      │
│  Pages ─── Dashboard · Tasks · Calendar · Analytics · Settings      │
│  Components ── GoalInput · TaskBoard · TaskCard · Timeline ·        │
│               NotificationBell · AnalyticsDash · Sidebar · Navbar   │
│  State ────── AuthContext (JWT) · TaskContext (tasks/goals/notif)    │
│  Realtime ─── useWebSocket ─┐                                        │
└─────────────────────────────┼───────────────────────────────────────┘
                              │
              HTTP /api  +  WS /ws/notify/{user_id}
                              │
┌─────────────────────────────▼───────────────────────────────────────┐
│                      Backend (FastAPI)                               │
│                                                                      │
│  Routers ─── auth · goals · tasks · schedule · notifications ·      │
│              integrations (calendar)                                │
│  Events ─────── WebSocketManager + Dispatcher                       │
│  ┌────────────────────────────────────────────┐                      │
│  │       AI agents (orchestrator)             │                      │
│  │   Clarifier → Planner → Prioritizer →      │                      │
│  │   Scheduler                                 │                      │
│  └────────────────────────────────────────────┘                      │
└──────┬──────────────────┬──────────────────┬────────────────────────┘
       │                  │                  │
       ▼                  ▼                  ▼
┌─────────────┐   ┌──────────────┐   ┌──────────────────┐
│ PostgreSQL  │   │    Redis     │   │   Celery workers │
│ (source     │   │ (cache +     │   │  + Beat scheduler│
│  of truth)  │   │  context)    │   │                  │
└─────────────┘   └──────────────┘   └──────────────────┘
```

---

## Component breakdown

### Frontend (React + Vite + Tailwind)

| Area | Responsibility |
|------|----------------|
| `pages/` | Route-level views: Dashboard, Tasks, Calendar, Analytics, Settings, Login, Signup |
| `components/` | Reusable UI: goal input, kanban task board, timeline, notification bell, analytics charts, sidebar/navbar, auth + app layouts |
| `context/AuthContext` | JWT storage, login/logout/signup, auto-logout on 401 |
| `context/TaskContext` | Central store for goals, tasks, schedules, notifications, analytics; receives WebSocket events and updates state |
| `services/api.js` | Axios instance with JWT interceptor, helpers for every backend endpoint, WebSocket URL resolution |
| `hooks/useWebSocket` | Connects to `/ws/notify/{user_id}`, parses JSON, dispatches to TaskContext, exponential-backoff reconnect |
| `hooks/useGoals` | Polls `/goals/{id}/plan` until the AI finishes planning (planner runs async via FastAPI BackgroundTasks) |

The frontend communicates with the backend over two channels:
1. **REST** for all CRUD/auth/calendar operations (Axios, JWT bearer auth).
2. **WebSocket** for live pushes (notifications, task updates, schedule changes, reprioritization).

### Backend (FastAPI)

| Layer | Responsibility |
|------|----------------|
| `api/` | Route handlers — thin HTTP layer that validates, calls services, and dispatches WebSocket events |
| `agents/` | LLM agent implementations: Clarifier, Planner, Prioritizer, Scheduler, Orchestrator |
| `services/` | Domain logic: `scheduler_service` (conflict-aware fitting), `priority_service` (scoring + rescore), `reminder_service` (context-aware messages), `task_splitter` (normalize + split) |
| `events/` | `WebSocketManager` (per-user connection registry) + `dispatcher` (fire-and-forget helpers, sync→async safe) |
| `utils/` | `llm_client` (Groq/Ollama), `redis_client` (cache + context), `calendar_sync` (OAuth + event import + conflict detection) |
| `models/` | SQLAlchemy ORM: User, Goal, Task, Schedule, Notification, CalendarToken, CalendarEvent |
| `workers/` | Celery tasks + Beat schedule: reminders, autonomous reschedule, re-prioritization, notification dispatch |
| `core/` | Security (JWT + bcrypt), deps (DB + current-user) |

### Data layer

- **PostgreSQL** — the source of truth for users, goals, tasks, schedules, notifications, and calendar integration state.
- **Redis** — used for two things:
  1. **Celery broker + result backend** for async tasks.
  2. **AI context cache** — stores the latest goal plan (`goal_plan:{id}`), agent results (`agent_result:{user_id}:{agent}`), and user context (`ctx:user:{user_id}:latest_goal`) so the frontend can poll `/goals/{id}/plan` without re-running the LLM.

---

## Backend request flow (goal creation)

```
POST /goals/ (with JWT)
   │
   ▼
auth → resolve current_user
   │
   ▼
create Goal row (status=active)
   │
   ▼
schedule BackgroundTasks job ── run_ai_planning(goal_id, ...)
   │                                                    │
   │  HTTP 201 returned immediately                     ▼
   │                                    Clarifier ──(?)──▶ cache plan
   │                                       │                       (needs clarification)
   │                                       │ no
   ▼                                       ▼
frontend polls GET /goals/{id}/plan    Planner ──▶ Prioritizer ──▶ Scheduler
                                       │
                                       ▼
                              create Task rows + Schedule rows
                              cache plan in Redis (goal_plan:{id})
```

The frontend's `useGoalPlan` hook polls `/goals/{id}/plan` every 2s until the plan is ready (or clarification is requested), then refreshes the task board.

---

## AI agent flow

The orchestrator runs the agents in sequence and caches each intermediate result:

1. **Clarifier** — decides if the goal is specific enough. If not, returns clarifying questions (the frontend shows them inline in the GoalInput card). If clear, proceeds.
2. **Planner** — calls the LLM (Groq primary, Ollama fallback) to decompose the goal into 3–7 time-boxed subtasks.
3. **Prioritizer** — scores each task: 40% AI score + 30% deadline proximity + 10% duration + 20% base priority.
4. **Scheduler** — fits ranked tasks into working-hours slots (08:00–22:00), skipping busy blocks from calendar events and existing tasks. Falls back when the LLM's suggested slot is invalid.

All results are cached in Redis under `goal_plan:{goal_id}` so subsequent reads are instant.

---

## Realtime notification flow

```
Something changes (task created / missed / reprioritized / calendar synced)
   │
   ▼
service or worker calls dispatcher.dispatch_notification(user_id, payload)
   │
   ▼
WebSocketManager.send_personal(user_id, {type, payload})
   │
   ▼
FastAPI pushes JSON over the user's /ws/notify/{user_id} connection
   │
   ▼
frontend useWebSocket onmessage → TaskContext.handleLiveEvent
   │
   ▼
component re-renders (NotificationBell, Timeline, TaskBoard, AnalyticsDash)
```

The dispatcher is **sync→async safe**: when called from a Celery worker thread (no running event loop), it spins up a short-lived loop to flush the message. The frontend hook reconnects with exponential backoff if the socket drops, and shows an amber connection dot while reconnecting.

Event types the frontend handles:
- `notification` / `new_notification` — prepend to the bell
- `task_created` / `task_updated` — upsert into the task board
- `schedule_updated` — update the timeline
- `reprioritized` — refresh tasks + analytics so new priorities show
- `refresh` — re-pull all data (used by the autonomous reschedule worker)

---

## Calendar sync flow

```
User clicks "Connect Google Calendar"
   │
   ▼
POST /calendar/oauth/start → returns Google OAuth URL
   │
   ▼
browser redirects → Google consent → callback URL
   │
   ▼
GET /calendar/oauth/callback?code=...
   │
   ▼
exchange code → store CalendarToken (access + refresh) in DB
   │
   ▼
redirect to frontend /calendar?oauth_success=true

User clicks "Sync events"
   │
   ▼
POST /calendar/sync
   │
   ▼
fetch upcoming events from Google Calendar API v3
   │
   ▼
normalize + upsert into calendar_events table
   │
   ▼
detect_conflicts(tasks, calendar_events) → overlaps?
   │
   ▼
push a notification per conflict over WebSocket
   │
   ▼
frontend Calendar page shows conflicts + (optionally) auto-resolves

User clicks "Optimize schedule"
   │
   ▼
POST /calendar/optimize
   │
   ▼
for each conflicting + missed task:
  find_free_slot(busy_blocks, duration, deadline)
  update Task.scheduled_at + Schedule row
  dispatch schedule_updated + notification events
```

The scheduler uses `find_free_slot` which walks working-hours windows and returns the earliest conflict-free slot, respecting the goal's deadline. This powers both the manual "Optimize" button and the autonomous reschedule worker.

---

## Async workers (Celery + Beat)

Three periodic jobs keep the system "feeling alive" without user interaction:

| Schedule | Task | Effect |
|----------|------|--------|
| every 60s | `check_upcoming_tasks` | Sends context-aware reminders for tasks starting within 15 min |
| every 5 min | `auto_reschedule_missed` | Finds tasks whose slot passed, moves them to a free slot, bumps priority to high, notifies the user |
| every 10 min | `reprioritize_user_tasks` | Re-scores all active tasks (deadline proximity, missed slots, progress); bumps priority in DB + fires notification when a task escalates to high |

All three push WebSocket events so the frontend updates without a manual refresh.

---

## Authentication & security

- **JWT** bearer tokens (HS256), 7-day expiry, issued by `POST /auth/login` (OAuth2 password flow, form-encoded).
- Passwords hashed with bcrypt via passlib.
- The WebSocket endpoint authenticates via a `token` query param and validates that the token's `sub` matches the requested `user_id`, so a user cannot subscribe to another user's channel.
- Row-level access: every query filters by `current_user.id`, so a user only ever sees their own goals/tasks/schedules/notifications.
- Google OAuth tokens are stored in the `calendar_tokens` table (per-user, scoped to `calendar.readonly`).

---

## Deployment topology

Docker Compose runs six services:

| Service | Container | Port | Notes |
|---------|-----------|------|-------|
| postgres | lifesaver-postgres | 5432 | source of truth |
| redis | lifesaver-redis | 6379 | cache + Celery broker |
| backend | lifesaver-backend | 8000 | FastAPI (uvicorn) |
| frontend | lifesaver-frontend | 5173 | Vite dev server |
| celery_worker | lifesaver-celery-worker | — | async task execution |
| celery_beat | lifesaver-celery-beat | — | periodic task scheduler |

For production, replace the Vite dev server with a built static bundle and serve via nginx/Cloudflare Pages; everything else stays the same.

---

## Design principles

- **AI is a background worker, not a blocker.** Goal creation returns immediately; the frontend polls for the plan. The demo never waits on an LLM.
- **Realtime is opt-in and resilient.** The app works without WebSocket (just slower); the hook reconnects automatically.
- **Calendar is a graceful enhancement.** When Google credentials aren't configured, calendar features report "not configured" and never crash the app.
- **Demo path is deterministic.** The seed writes the final planned state directly (no LLM dependency) so the dashboard is always alive, even offline.
