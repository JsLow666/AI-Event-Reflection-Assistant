# 🧠 AI Event & Reflection Assistant

An AI-powered full-stack application that helps users **track events, reflect on them, and generate insights** using a multi-agent backend built with **FastAPI** and **Google ADK**, paired with a modern frontend.

This project demonstrates how **agent-based AI systems** can coordinate tasks such as event understanding, reflection, and context-aware responses in a clean, extensible architecture.

---

## ✨ Features

- 📅 **Event Management**
  - Create and retrieve events via REST API
  - Designed for AI-driven event understanding and enrichment

- 📝 **Reflection & Notes**
  - Store personal notes and reflections
  - Prepared for AI-based summarization and insight generation

- 🤖 **Multi-Agent AI Backend**
  - Built using **Google ADK (`google.adk.agents`)**
  - Specialized agents with tools and prompts
  - Clean separation of responsibilities between agents

- ⚡ **FastAPI Backend**
  - High-performance async Python backend
  - RESTful APIs for frontend integration

- 🎨 **Frontend (Vibe-coded)**
  - Consumes backend APIs
  - Designed for fast iteration and clean UX

---

## 🏗️ System Architecture

Frontend (React)
|
| HTTP (REST)
v
FastAPI Backend
|
|-- Event APIs (/events)
|-- Notes APIs (/notes)
|
v
Google ADK Agents
├─ Event Understanding Agent
├─ Reflection Agent

---

## 🔌 Backend API Endpoints

### Events
- `GET /events`  
  Retrieve all stored events

- `POST /events`  
  Create a new event

### Notes
- `GET /notes`  
  Retrieve all notes/reflections

- `POST /notes`  
  Create a new note/reflection

Base URL (local):
http://127.0.0.1:8000

---

## 🛠️ Tech Stack

### Backend
- **Python 3.10+**
- **FastAPI**
- **Google ADK (`google.adk.agents`)**
- **Uvicorn**

### Frontend
- **React (vibe-coded)**
- **Fetch API**

---

## 🚀 Getting Started

### 1️⃣ Backend Setup

```bash
cd Backend

Install dependencies:
pip install -r requirements.txt

Run the server:
uvicorn main:app --reload

Backend will run at:
http://127.0.0.1:8000

Swagger docs available at:
http://127.0.0.1:8000/docs

### 2️⃣ Frontend Setup
cd frontend
npm install
npm start

Frontend runs at:
http://localhost:3000

---

🌐 CORS Configuration

CORS is enabled in the backend to allow local frontend development:

allow_origins = [
  "http://localhost:3000",
  "http://127.0.0.1:3000"
]

---

## 🧩 Agent Design Philosophy
- Single Responsibility: Each agent handles one concern
- Extensibility: New agents (e.g. planner, summarizer) can be added easily
- Explainability-ready: Designed to support reasoning and reflection

---

🧠 Future Improvements
AI-powered event insights and summaries
User authentication
Persistent database (PostgreSQL / Firebase)
Deployment (Vercel + Cloud Run)
Timeline & calendar visualization
Natural language chat interface

---

🏆 Use Cases
Personal productivity & reflection
AI journaling
Smart event tracking
Hackathons & AI agent demos
Educational projects on agent systems