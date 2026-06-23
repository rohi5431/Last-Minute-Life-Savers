# 3-Minute Demo Script

A repeatable, rehearsed flow for presenting Last-Minute Life Saver to judges. Target: **3 minutes**. Keep moving — don't explain every button.

---

## Before you start

1. Run `python scripts/demo_check.py` — confirm everything is green.
2. Have the frontend open at **http://localhost:5173**, logged in as **`demo@lifesaver.app` / `demo1234`** (the demo-mode banner confirms you're on the seeded account).
3. Have a second tab ready at **http://localhost:8000/docs** (in case a judge asks about the API).
4. Close Slack/Discord/notifications on your machine so the demo's live notifications aren't drowned out.
5. Have your backup recording cued (see FINAL_CHECKLIST.md).

---

## Timeline

### 0:00 — Hook (15 seconds)

> "We've all been here. It's the night before a deadline, you're staring at a blank page, and panic sets in. What if you could just say what you need to do — and get an instant, prioritized plan that fits around your actual day?"

*Click to the Dashboard. Leave the seeded dashboard on screen so judges see a populated board + analytics immediately — it already looks alive.*

### 0:15 — Goal input (30 seconds)

*Scroll to / focus the GoalInput card at the top of the Dashboard.*

> "I'll drop in a real goal with a tight deadline."

*Type:* **"Launch the beta landing page"** *in the title, set the deadline to tomorrow 11pm, add a short description like "Hero section, email capture, deploy."*

*Click **Plan my goal**.*

> "Behind the scenes, four AI agents take over. First, a clarifier checks whether my goal is specific enough. Then a planner decomposes it, a prioritizer ranks it by urgency, and a scheduler slots it into working hours."

*Wait ~5s for the green "AI generated N tasks" card to appear inline.*

### 0:45 — AI decomposition (30 seconds)

> "There it is — the AI broke 'launch the beta' into prioritized subtasks and placed them on my timeline, all within seconds."

*Scroll to the Task Board. Point at the kanban columns. Tap one task's checkbox to mark it done in real time — the board reflows.*

> "Tasks are grouped by priority or status. Tap a task to advance it through to-done — the backend updates instantly."

### 1:15 — Scheduling + calendar (40 seconds)

*Navigate to the **Schedule** page (sidebar).*

> "Now the magic. I connected my Google Calendar."

*Point at the imported calendar events grid (synced from the seed).*

> "The scheduler pulls my real events and avoids conflicts when placing tasks. It even detects when a task overlaps something on my calendar."

*Point at any conflict in the **Schedule conflicts** panel (if none are present, click **Sync events** then **Optimize schedule**).*

> "Here's the wow moment — I click **Optimize**, and the AI finds a new free slot for each conflicting or missed task, respecting my calendar and my deadline."

*Click **Optimize schedule**. Watch the reschedule notifications pop. The timeline updates live.*

### 1:55 — Re-prioritization + live notification (35 seconds)

> "This isn't a static plan. Every few minutes, a background worker re-scores my tasks based on deadline proximity and what I've actually finished."

*Tap the **NotificationBell** in the navbar. Show the unread badge and the dropdown. Point out the contextual messages — "Priority bumped…", "Auto-rescheduled…", "starts soon…".*

> "Notifications feel personal — they mention the task, the remaining duration, and the deadline. And they're pushed live over a WebSocket."

*Point at the small green dot next to the bell — "that's the live connection." If time allows, tap a notification to mark it read and watch the badge decrement.*

### 2:30 — Analytics wrap-up (20 seconds)

*Navigate to **Analytics**.*

> "Everything rolls up into a live dashboard — completion rate, my streak, a productivity score, and how my tasks break down by priority. This updates in real time as I complete work."

*Point at the donut + radial gauge + priority bars.*

### 2:50 — Close (10 seconds)

> "Last-Minute Life Saver turns the scariest moment of a project — the night before — into a plan you can actually execute. AI decomposes the goal, schedules it around your real life, and keeps you on track in real time. Thank you."

---

## Pro tips

- **If the AI plan is slow to generate**, don't stand in silence — narrate: *"the planner is calling the LLM now…"*. The polls resolve within ~20s.
- **If a demo action throws an error**, don't debug live. Say *"let me show you the seeded version"* and refresh — the seed always works.
- **If the calendar features aren't configured** (no Google creds), skip the 1:15 step and spend the extra time on analytics — the rest of the flow stands alone.
- **If WebSocket looks disconnected** (amber dot), just refresh the page — the hook reconnects automatically but a refresh guarantees green.
- **Don't read the script verbatim.** Internalize the beats; talk like a user, not a manual.

---

## Backup recording plan

Record a clean 3-minute run exactly following this script, with the seeded demo data. Frame the browser at 1440×900. Capture audio separately (narrate over the recording). Have it cued on a phone/laptop as a fallback if the live demo fails. See FINAL_CHECKLIST.md for the recording checklist.
