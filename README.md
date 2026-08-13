# Ultra-Premium Zoom Clone — Web Conferencing Platform

A full-stack video conferencing web application replicating Zoom's official design system, marketing landing page, and logged-in workplace experience with live webcam video, screen sharing, real-time WebSockets chat & reactions, host controls, team chat, interactive whiteboard, FastAPI + SQLite backend, and Clerk authentication readiness.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 16 (React 19, App Router) |
| **Smooth Scrolling** | Lenis (`lenis`) smooth physics scroll |
| **Authentication** | Clerk (`@clerk/nextjs`) ready + demo mode fallback |
| **Backend** | Python 3.12 + FastAPI + WebSockets |
| **Database** | SQLite (via SQLAlchemy ORM) |
| **Real-time** | WebSockets (`/ws/meeting/{id}`) |
| **Styling** | Vanilla CSS (Zoom Workplace & Official Marketing UI) |
| **Icons** | Lucide React |

---

## Features

### 🌟 Official Marketing Landing Page
- **Hero & Announcement Bar**: "Find out what's possible when work connects", AI Note Taker banner.
- **Product Carousel**: Interactive cards for Contact Center, Workvivo, Meetings, and AI Companion.
- **AI Note Taker Showcase**: Executive summary & action item preview card.
- **"YOUR WORKSPACE — Ready when you are"**: Quick launch action buttons connected directly to the FastAPI backend.
- **Trust & Ratings**: Gartner, G2, TrustRadius rating badges (4.5/5, 4.6/5, 8.5/10).

### 📹 In-Meeting Experience
- **Live Media Stream**: Real camera stream via `getUserMedia` with initial avatar fallback.
- **Screen Share**: 1-click screen sharing via `getDisplayMedia`.
- **Real-Time WebSockets Chat**: Persistent `ChatMessage` table in SQLite with slide-out chat drawer.
- **Floating Emoji Reactions**: Live animated emoji overlays (👏, ❤️, 👍, 😮, 🎉, 🔥).
- **Host Controls**: Mute All, Unmute All, Remove Participant, Lock Meeting.

### 💼 Workplace SPA Tabs
- **Home Dashboard**: Digital clock widget, upcoming meetings, recent activity timeline.
- **Meetings Management**: Upcoming vs Recent tabs with search, invite link copy, start, and delete actions.
- **Workplace Team Chat**: Channels (`#general`, `#engineering`) and direct messaging interface.
- **Interactive Whiteboard**: Canvas drawing tools, colors, stroke size, erase, clear, and PNG export.

---

## Clerk Authentication Setup Instructions

To enable live Clerk Sign-In & Sign-Up modals:

1. Create a free account at [https://clerk.com](https://clerk.com) and create an application.
2. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
3. Paste your publishable key and secret key in `.env.local`:
   ```env
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_YOUR_CLERK_PUBLISHABLE_KEY
   CLERK_SECRET_KEY=sk_test_YOUR_CLERK_SECRET_KEY
   ```
4. Restart the Next.js dev server:
   ```bash
   npm run dev
   ```
   *Note: If no Clerk keys are provided, the app runs smoothly in Demo Mode.*

---

## Database Schema (SQLite)

```
users (id, display_name, email, avatar_url, is_default, created_at)
  │
  ├── meetings (id, meeting_id, title, description, host_id FK, meeting_type,
  │             status, start_time, end_time, duration, invite_link, passcode,
  │             created_at, updated_at)
  │      │
  │      ├── participants (id, meeting_id FK, user_id FK, display_name, role,
  │      │                 is_muted, has_video, joined_at, left_at)
  │      │
  │      └── chat_messages (id, meeting_id FK, sender_name, sender_id FK,
  │                         content, timestamp)
```

---

## Local Setup & Execution

### 1. Backend Setup (FastAPI + SQLite)
```bash
cd backend
pip install -r requirements.txt
python seed.py                                # Seed SQLite database
python -m uvicorn main:app --reload --port 8000
```
API endpoints will run at `http://localhost:8000`.  
Interactive API docs at `http://localhost:8000/docs`.

### 2. Frontend Setup (Next.js)
```bash
pnpm install # or npm install
npm run dev
```
Open `http://localhost:3000` in your browser.

---

## Deployment Guide

### Push Git Commits to GitHub
```bash
git push -u origin master --force
```

### Deploy Frontend to Vercel
1. Import repository `https://github.com/KAILASH-C12/Zoom-clone.git` on [Vercel](https://vercel.com).
2. Set Environment Variables:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - `CLERK_SECRET_KEY`
   - `NEXT_PUBLIC_API_URL` (URL of your deployed FastAPI backend)
3. Click **Deploy**.

### Deploy Backend to Render or Railway
1. Create a new Web Service pointing to `backend/`.
2. Build Command: `pip install -r requirements.txt`
3. Start Command: `uvicorn main:app --host 0.0.0.0 --port 8000`
