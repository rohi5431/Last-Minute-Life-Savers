# 🚀 Last-Minute Life Saver

> **Stop Planning. Start Executing.**

An AI-powered productivity companion that proactively helps users **plan, prioritize, schedule, and complete tasks before deadlines are missed**.

Built for the **Google AI Hackathon**, this project transforms traditional reminder systems into an intelligent AI assistant capable of autonomous planning and real-time adaptation.

---

# 📌 Problem Statement

Students, professionals, and entrepreneurs frequently miss important deadlines such as:

- 📚 Assignments
- 💼 Interviews
- 📅 Meetings
- 💳 Bill Payments
- 📈 Project Milestones
- 🎯 Personal Goals

Traditional productivity applications rely on passive reminders that users often ignore.

The challenge is to build an **AI-powered productivity companion** that moves beyond reminders and actively assists users in completing tasks before deadlines are missed.

---

# 💡 Solution

Last-Minute Life Saver uses multiple AI agents to intelligently:

- Understand user goals
- Break large goals into smaller tasks
- Prioritize work
- Generate optimal schedules
- Detect conflicts
- Continuously adapt plans
- Send proactive reminders
- Reschedule missed work automatically

Instead of asking

> **"What should I do?"**

the application tells the user

> **"Here's your optimized plan to finish everything on time."**

---

# 🎯 Key Features

## 🧠 AI Goal Planner

Convert a single goal into actionable subtasks.

Example

Goal:

Build Hackathon Project

↓

Tasks

- Setup Backend
- Design Database
- Build API
- Create Frontend
- Testing
- Deployment

---

## ⚡ Intelligent Prioritization

AI automatically scores every task based on:

- Deadline
- Importance
- Estimated effort
- Dependencies
- User context

---

## 📅 Smart Scheduling

Automatically generates the best schedule.

Supports:

- Time blocking
- Focus sessions
- Free slot optimization
- Daily planning

---

## 🔄 Dynamic Re-Prioritization

If the user misses a task,

the system automatically:

- Recalculates priorities
- Updates schedule
- Adjusts reminders

---

## 📆 Google Calendar Integration

Synchronizes with Google Calendar.

Features

- Conflict detection
- Automatic event creation
- Schedule optimization

---

## 🔔 Context-Aware Notifications

Receive reminders based on:

- Time remaining
- User progress
- Current workload
- Upcoming meetings

---

## 📊 Productivity Analytics

Interactive dashboard showing

- Completion rate
- Productivity score
- Daily progress
- Weekly trends
- Streaks
- Missed deadlines

---

## 📡 Real-Time Updates

Uses WebSockets to provide

- Instant notifications
- Live dashboard updates
- Task synchronization

---

## 🤖 Multi-Agent AI System

The project uses multiple specialized AI agents.

### Goal Clarifier Agent

Clarifies vague goals.

### Planner Agent

Breaks goals into subtasks.

### Prioritizer Agent

Assigns intelligent priorities.

### Scheduler Agent

Creates optimized schedules.

---

# ⚙️ AI Workflow

```text
User Goal
      │
      ▼
Goal Clarifier Agent
      │
      ▼
Task Planner Agent
      │
      ▼
Priority Scoring Agent
      │
      ▼
Schedule Optimizer
      │
      ▼
Calendar Conflict Detection
      │
      ▼
Notification Engine
      │
      ▼
Real-Time Dashboard
      │
      ▼
Continuous Replanning
```

---

# 🏗️ System Architecture

```text
React Frontend
        │
        ▼
FastAPI Backend
        │
 ┌──────┼───────────────┐
 ▼      ▼               ▼
PostgreSQL         Redis Cache
        │
        ▼
Celery Workers
        │
        ▼
AI Orchestrator
        │
 ┌──────┼───────────────┐
 ▼      ▼               ▼
Planner
Prioritizer
Scheduler
Clarifier
        │
        ▼
Gemini / Groq / Ollama
        │
        ▼
Google Calendar API
        │
        ▼
WebSocket Notifications
```

---

# 🛠 Tech Stack

## Frontend

- React
- Tailwind CSS
- Framer Motion
- React Router
- Axios
- Recharts
- Lucide React

---

## Backend

- FastAPI
- SQLAlchemy
- Alembic
- JWT Authentication
- Pydantic

---

## AI

- Google Gemini
- LangChain
- LangGraph
- Groq
- Ollama

---

## Database

- PostgreSQL

---

## Background Processing

- Celery
- Redis

---

## Real-Time Communication

- WebSockets

---

## Integrations

- Google Calendar API

---

# 📂 Project Structure

```
backend/
frontend/
docker-compose.yml
README.md
.env.example
```

---

# 🚀 Getting Started

## Clone Repository

```bash
git clone https://github.com/YOUR_USERNAME/last-minute-life-saver.git
```

---

## Backend

```bash
cd backend

python -m venv venv

pip install -r requirements.txt

uvicorn app.main:app --reload
```

---

## Frontend

```bash
cd frontend

npm install

npm run dev
```

---

# 🔑 Environment Variables

```env
DATABASE_URL=

REDIS_URL=

SECRET_KEY=

GOOGLE_API_KEY=

GROQ_API_KEY=

GOOGLE_CLIENT_ID=

GOOGLE_CLIENT_SECRET=

JWT_SECRET_KEY=

OPENAI_API_KEY=
```

---

# 🌟 Future Enhancements

- Voice Assistant
- AI Chat Productivity Coach
- WhatsApp Notifications
- Email Automation
- Team Collaboration
- Mobile App
- Wearable Device Support
- AI Habit Tracking
- Offline Mode

---

# 🎥 Demo

Live Demo

> Coming Soon

---

# 📸 Screenshots

- Landing Page
- Login
- Dashboard
- Task Board
- Analytics
- Timeline
- Calendar

---

# 👨‍💻 Team

**Rohit Kumar**

Backend & AI Engineer

---

# 📄 License

MIT License

---

# ❤️ Acknowledgements

- Google AI
- FastAPI
- React
- Tailwind CSS
- Framer Motion
- PostgreSQL
- Redis
- Celery
- LangChain
- Google Calendar API

---

# ⭐ If you like this project

Please give this repository a ⭐ on GitHub.

---

## 🚀 Stop Planning. Start Executing.

