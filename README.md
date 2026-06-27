# 🚀 Last-Minute Life Saver

<div align="center">

### **Turn panic into a plan in seconds.**

*Drop a goal and a deadline — our AI decomposes it into prioritized tasks, intelligently schedules them around your calendar, autonomously adapts to changes, and keeps you on track with real-time guidance.*

---

![Hackathon](https://img.shields.io/badge/Google%20AI-Hackathon-blue?style=for-the-badge\&logo=google)
![React](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-61DAFB?style=for-the-badge\&logo=react)
![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?style=for-the-badge\&logo=fastapi)
![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=for-the-badge\&logo=python)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-4169E1?style=for-the-badge\&logo=postgresql)
![Redis](https://img.shields.io/badge/Redis-Queue%20%26%20Cache-DC382D?style=for-the-badge\&logo=redis)
![Docker](https://img.shields.io/badge/Docker-Containerized-2496ED?style=for-the-badge\&logo=docker)
![License](https://img.shields.io/badge/License-MIT-success?style=for-the-badge)

</div>

---

# 🌐 Live Deployment

> 🚀 **Experience the live version of Last-Minute Life Saver**

**🔗 Live Application:**  
https://YOUR_DEPLOYMENT_LINK

> Replace `YOUR_DEPLOYMENT_LINK` with your deployed application URL.



# 🌍 The Problem

Every day, students, professionals, freelancers, and entrepreneurs struggle to meet important deadlines.

Existing productivity applications rely on passive reminders that users often ignore. They notify users but rarely help them decide **what to do next**, **when to do it**, or **how to recover when plans fail**.

As responsibilities grow, priorities change, meetings overlap, and deadlines become increasingly difficult to manage.

---


# 💡 Our Solution

**Last-Minute Life Saver** is an AI-powered productivity companion that transforms a simple goal into a complete execution strategy.

Instead of acting as another reminder application, it behaves like an intelligent productivity partner capable of:

* Understanding user intent
* Breaking goals into actionable tasks
* Prioritizing work dynamically
* Building optimized schedules
* Detecting conflicts automatically
* Rescheduling missed work
* Delivering live updates through WebSockets
* Continuously adapting plans as deadlines approach

> **From Panic → Planning → Execution**

---

# ✨ Features Showcase

## 🤖 Goal → AI Plan

Simply enter:

* Goal
* Deadline

The Multi-Agent AI system automatically generates:

* Actionable subtasks
* Estimated durations
* Priorities
* Daily execution schedule

---

## 🧠 Multi-Agent AI Workflow

Specialized AI agents collaborate together.

| Agent               | Responsibility                                                 |
| ------------------- | -------------------------------------------------------------- |
| 🎯 Clarifier Agent  | Understands and clarifies user goals                           |
| 📋 Planner Agent    | Breaks goals into executable subtasks                          |
| ⚡ Prioritizer Agent | Assigns urgency and importance scores                          |
| 📅 Scheduler Agent  | Finds the optimal schedule based on deadlines and availability |

---



## 📅 Smart Calendar Scheduling

* Google Calendar integration
* Working hour optimization
* Automatic free-slot discovery
* Time-block scheduling
* Calendar conflict avoidance

---

## 🔄 Conflict Detection & Autonomous Rescheduling

When:

* a meeting overlaps a task
* a deadline changes
* the user misses a task

The AI automatically:

* detects conflicts
* recalculates priorities
* rebuilds the schedule
* updates every dependent task
* notifies the user instantly

---

## ⚡ Real-Time Synchronization

Powered by FastAPI WebSockets.

Users instantly receive:

* Task updates
* Schedule changes
* Priority adjustments
* Notifications
* Progress synchronization

without refreshing the application.

---

## ⏳ Urgency Reprioritization

Background Celery workers continuously monitor tasks.

Every 10 minutes:

* urgency scores are recalculated
* priorities are updated
* schedules are optimized
* overdue work is redistributed

---

## 📊 Productivity Analytics

Interactive dashboard including:

* Completion Rate
* Productivity Score
* Focus Time
* Daily Progress
* Weekly Trends
* Streak Tracking
* Priority Distribution

---

## 🎨 Premium Productivity Experience

Modern AI-first interface featuring:

* 🌌 Glassmorphism
* ✨ Animated gradients
* 🌙 Dark mode
* 🎙 Floating Voice Assistant
* 📈 Panic Meter
* 🔥 Habit Tracker
* 📅 Timeline View
* 📋 Kanban Board

---

# 🛠 Technology Stack

| Category             | Technologies                                                     |
| -------------------- | ---------------------------------------------------------------- |
| **Frontend**         | React, Vite, Tailwind CSS, Framer Motion, Recharts, Lucide React |
| **Backend**          | FastAPI, SQLAlchemy, Alembic, Python-JOSE, Pydantic              |
| **AI Orchestration** | LangChain, LangGraph, Groq API (Llama 3.3 70B), Ollama           |
| **Real-Time**        | FastAPI WebSockets                                               |
| **Background Jobs**  | Celery, Celery Beat                                              |
| **Cache & Queue**    | Redis                                                            |
| **Database**         | PostgreSQL                                                       |
| **Integrations**     | Google Calendar API v3 (OAuth2)                                  |
| **Infrastructure**   | Docker, Docker Compose                                           |

---

# 🏗 System Architecture

```text
                     User
                       │
                       ▼
              React Dashboard
                       │
                       ▼
              FastAPI API Gateway
                       │
     ┌─────────────────┼─────────────────┐
     ▼                 ▼                 ▼
 Authentication      AI Engine       Analytics
                       │
         ┌─────────────┼──────────────┐
         ▼             ▼              ▼
  Clarifier      Planner Agent   Prioritizer
                       │
                       ▼
               Scheduler Agent
                       │
                       ▼
        Google Calendar Integration
                       │
                       ▼
         PostgreSQL + Redis + Celery
                       │
                       ▼
      WebSocket Notification Service
                       │
                       ▼
            Live React Dashboard
```

---

# 🤖 Multi-Agent Workflow

```text
User Goal
      │
      ▼
Clarifier Agent
      │
      ▼
Planner Agent
      │
      ▼
Priority Engine
      │
      ▼
Scheduler Agent
      │
      ▼
Calendar Conflict Detection
      │
      ▼
Task Allocation
      │
      ▼
WebSocket Notifications
      │
      ▼
Analytics Dashboard
```
# AI-Powered Multi-Agent System Architecture
  <img
    src="https://github.com/user-attachments/assets/b5786921-9c08-4fac-98fa-4f69b46d1d02"
    alt="AI-Powered Multi-Agent System Architecture"
    width="700"
    height="700"
  />


---

# 📂 Repository Structure

```text
backend/
├── app/
├── agents/
├── api/
├── models/
├── schemas/
├── workers/
├── utils/
├── scripts/
├── alembic/
└── tests/

src/
├── components/
├── pages/
├── hooks/
├── context/
├── services/
└── assets/

dist/
docker-compose.yml
README.md
```

---

# 🚀 Quick Start

## Prerequisites

* Docker
* Docker Compose

---

## 1️⃣ Configure Environment

Create:

```text
backend/.env
```

Required variables:

```env
GROQ_API_KEY=your_key

SECRET_KEY=your_secret

DATABASE_URL=postgresql://...

REDIS_URL=redis://redis:6379/0

GOOGLE_CLIENT_ID=

GOOGLE_CLIENT_SECRET=
```

---

## 2️⃣ Start Containers

```bash
docker-compose up --build
```

---

## 3️⃣ Run Database Migrations

```bash
docker-compose exec backend alembic upgrade head
```

---

## 4️⃣ Seed Demo Data

```bash
docker-compose exec backend python scripts/seed_demo_data.py
```

---

## 5️⃣ Open the Application

| Service         | URL                        |
| --------------- | -------------------------- |
| 🌐 Frontend     | http://localhost:5173      |
| ⚙ Backend API   | http://localhost:8000      |
| 📚 Swagger Docs | http://localhost:8000/docs |

---

# 🧪 Demo Account

To help hackathon judges explore the application immediately, a seeded demo account is included.

| Email                                           | Password |
| ----------------------------------------------- | -------- |
| [demo@lifesaver.app](mailto:demo@lifesaver.app) | demo1234 |

The demo account comes preloaded with:

* ✅ Multiple Goals
* ✅ Scheduled Tasks
* ✅ AI Generated Plans
* ✅ Notifications
* ✅ Productivity Analytics
* ✅ Calendar Events
* ✅ Habits
* ✅ Dashboard Statistics

No setup is required.

---

# 📸 Screenshots

| Sign Up Page | Login Page |
|--------------|------------|
| <img src="https://github.com/user-attachments/assets/a577e2b8-f9ad-4899-bb5f-d318c95547f8" width="450"/> | <img src="https://github.com/user-attachments/assets/994ff4bd-7a0d-4823-8003-733fd47c842b" width="450"/> |

| Landing Page | Landing Page |
|--------------|------------|
| <img src="https://github.com/user-attachments/assets/e0293bb8-97f5-494b-8e88-d60eedb537be" width="450"/> | <img src="https://github.com/user-attachments/assets/d7c82df3-566d-4825-8b5e-dacf3cfa693e" width="450"/> |

| Landing Page | Dashboard |
|--------------|-----------|
| <img src="https://github.com/user-attachments/assets/5309713f-cefa-4933-bff8-9a794f15e520" width="450"/> | <img src="https://github.com/user-attachments/assets/09f76697-6f2e-4783-8054-43219c0d37ae" width="450"/> |

| Task Board | Analytics |
|-------------|-----------|
| <img width="450" alt="image" src="https://github.com/user-attachments/assets/308ebb95-6bee-46ae-80b4-5ec79f25c5d7" />| <img width="450" alt="image" src="https://github.com/user-attachments/assets/8eb2d378-6560-4064-b814-4b3d6ef478a7" />|

| AI Planner | Scheduler |
|-------------|-----------|
| <img width="450" alt="image" src="https://github.com/user-attachments/assets/43ea3e3e-7695-4e33-9a89-becc7734dbb9" />| <img width="450" alt="image" src="https://github.com/user-attachments/assets/88851b4a-6f69-4054-b797-ae38f4cb95b0" />|

| Habit Tracker | Focus Room |
|----------------|------------|
|<img width="450" alt="image" src="https://github.com/user-attachments/assets/f13690b7-1e70-45a0-9da5-1e242812f815" />| <img width="450" alt="image" src="https://github.com/user-attachments/assets/0c42a9ad-7b19-4059-ac52-b842037c9156" />|

# 🔧 Troubleshooting

## Invalid AI API Key

Verify:

```env
GROQ_API_KEY
```

Restart Docker after updating.

---

## PostgreSQL Connection Failed

Check:

```bash
docker-compose ps
```

Ensure the PostgreSQL container is running.

---

## Redis Not Connected

Restart Redis:

```bash
docker-compose restart redis
```

---

## Port Already in Use

Check whether ports **5173**, **8000**, **5432**, or **6379** are occupied and stop the conflicting process, or update the exposed ports in `docker-compose.yml`.

---

## WebSocket Not Connecting

Verify:

* Backend is running
* Redis is available
* Browser Console has no CORS errors

---

# 🌟 Future Roadmap

* 🎤 Voice Commands
* 🤖 AI Productivity Coach
* 📱 Mobile Application
* 👥 Team Collaboration
* 📧 Gmail Integration
* 📞 WhatsApp Notifications
* ⌚ Smartwatch Support
* 🌍 Multi-language AI Assistant

---
<p align="center">
<img width="300" alt="image" src="https://github.com/user-attachments/assets/a4b0e36b-d217-4122-86d1-b24c88e7f35d" />
</p>
---
# 🏆 Hackathon Details

| **Hackathon Name** | **VIBEzSHIP – Coding Ninjas × Google for Developers Hackathon 2026** |
|--------------------|----------------------------------------------------------------------|
| **Participation Type** | Individual |
| **Problem Statement** | The Last-Minute Life Saver |
| **Project Name** | Last-Minute Life Saver |
| **Developed By** | Rohit Kumar |
| **Technology Track** | AI Productivity & Automation |
| **Submission Type** | AI-Powered Web Application |

---

---



# 👨‍💻 Team

**Rohit Kumar**

Backend • AI • Full Stack Development

---

# ❤️ Built for Google AI Hackathon

> **Stop Planning. Start Executing.**

Transform goals into intelligent execution plans with AI.
