# Final Checklist

Run through this before going on stage. Five minutes here saves a demo meltdown.

---

## Environment

- [ ] Docker is running with ≥4GB RAM allocated
- [ ] `docker-compose up --build` completes with all 6 services healthy
  - [ ] `postgres` healthy
  - [ ] `redis` healthy
  - [ ] `backend` responding
  - [ ] `frontend` responding
  - [ ] `celery_worker` running
  - [ ] `celery_beat` running
- [ ] `alembic upgrade head` ran clean (both migrations applied)
- [ ] `backend/.env` has `GROQ_API_KEY` set (or you've confirmed the seed writes data directly without it)
- [ ] (Optional) `GOOGLE_CLIENT_ID` + `GOOGLE_CLIENT_SECRET` set if you'll demo calendar sync

## Demo data

- [ ] `python scripts/seed_demo_data.py` ran and printed a summary
- [ ] `python scripts/demo_check.py` shows green across:
  - [ ] Backend `/health`
  - [ ] Frontend reachable
  - [ ] Postgres connection + row counts > 0
  - [ ] Redis ping PONG
  - [ ] Celery worker responded
  - [ ] `GET /goals/`, `/tasks/`, `/schedule/`, `/notifications/` all returned data
  - [ ] Demo user `demo@lifesaver.app` exists
- [ ] Logged in as `demo@lifesaver.app` / `demo1234` and the **Demo mode** banner shows
- [ ] Dashboard shows a populated Task Board, Today's Timeline, and Analytics
- [ ] NotificationBell has unread items

## Live features (the wow moment)

- [ ] Created a fresh goal → AI generated tasks within ~20s (inline "AI generated N tasks" card appeared)
- [ ] Tapped a task checkbox → status updated on the board without refresh
- [ ] Opened Schedule page → imported calendar events + timeline populated
- [ ] Clicked **Optimize schedule** → at least one task rescheduled → notifications appeared in the bell
- [ ] NotificationBell dot is **green** (WebSocket live) — if amber, refresh the page
- [ ] A periodic task reminder/notification fired during a dry run (or you've confirmed Celery Beat is scheduling)
- [ ] Analytics page renders donut + radial + priority bars with seeded data

## Stability

- [ ] Refreshed the page mid-flow → app recovered (no white screen)
- [ ] Logged out and back in → JWT flow works
- [ ] Tested on the projector / demo laptop's resolution
- [ ] Closed Slack/Discord/notifications on the demo machine
- [ ] Verified the demo machine has internet (for Groq + Google) or confirmed the offline seed-only path

## Backup plan

- [ ] Recorded a clean 3-minute run following DEMO_SCRIPT.md (1440×900, narrated)
- [ ] Recording is cued on a second device (phone/laptop) ready to play
- [ ] Know the fallback line: *"let me show you the seeded version"* + refresh

## Pitch

- [ ] Rehearsed the DEMO_SCRIPT.md flow at least 3 times timed to ≤3:00
- [ ] Internalized the beats (don't read verbatim)
- [ ] Opening hook memorized
- [ ] Closing impact statement memorized
- [ ] Know which 2-second pauses to use for emphasis on:
  - the "AI generated N tasks" moment
  - the "Optimize schedule" reschedule moment
  - the live notification pop-up

## Quick recovery commands

```bash
# Reset to a clean demo state, 30 seconds before stage:
docker-compose exec backend python scripts/demo_reset.py --yes

# Validate everything is green:
docker-compose exec backend python scripts/demo_check.py

# If something hangs, nuclear option:
docker-compose down -v && docker-compose up --build
docker-compose exec backend alembic upgrade head
docker-compose exec backend python scripts/seed_demo_data.py
```

---

**If every box above is checked, you are ready. Breathe. You've got this.**
