# Zoom Clone — Video Conferencing Platform

A full-stack video conferencing web application that replicates Zoom's design, user experience, and core meeting workflows.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 16 (React 19, App Router) |
| **Backend** | Python 3.12 + FastAPI |
| **Database** | SQLite (via SQLAlchemy ORM) |
| **Styling** | Vanilla CSS (Zoom Workplace design system) |
| **Icons** | Lucide React |

## Features

### Core Features
- **Landing Dashboard** — Zoom Workplace-style home with action buttons, upcoming & recent meetings
- **Instant Meeting** — Create meetings instantly with unique ID and shareable invite link
- **Join Meeting** — Join via Meeting ID or invite link with display name
- **Schedule Meetings** — Title, description, date/time picker, duration, auto-generated link
- **Meeting Room** — Dark-themed video grid with control bar, timer, encryption badge
- **Meetings List** — Two-panel view with upcoming/previous tabs and meeting details

### Bonus Features
- **Host Controls** — Mute all participants, remove participant from meeting
- **Participants Panel** — Slide-in panel showing all active participants
- **Responsive Design** — Mobile, tablet, and desktop support
- **Default User** — Pre-seeded user (Alex Rivera) — no login required

## Database Schema

```
users (id, display_name, email, avatar_url, is_default, created_at)
  │
  ├── meetings (id, meeting_id, title, description, host_id FK, meeting_type,
  │             status, start_time, end_time, duration, invite_link, passcode,
  │             created_at, updated_at)
  │
  └── participants (id, meeting_id FK, user_id FK, display_name, role,
                    is_muted, has_video, joined_at, left_at)
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/users/me` | Get current user |
| POST | `/api/meetings` | Create meeting |
| GET | `/api/meetings` | List meetings |
| GET | `/api/meetings/{id}` | Get meeting |
| DELETE | `/api/meetings/{id}` | Delete meeting |
| POST | `/api/meetings/{id}/end` | End meeting |
| POST | `/api/meetings/{id}/join` | Join meeting |
| POST | `/api/meetings/{id}/leave` | Leave meeting |
| GET | `/api/meetings/{id}/participants` | Get participants |
| PUT | `/api/meetings/{id}/participants/{pid}` | Update participant |
| POST | `/api/meetings/{id}/mute-all` | Mute all (host) |
| POST | `/api/meetings/{id}/remove-participant` | Remove participant |

## Setup Instructions

### Prerequisites
- Node.js 18+ and pnpm
- Python 3.12+

### Backend Setup

```bash
cd backend
pip install -r requirements.txt
python seed.py          # Seed the database
python -m uvicorn main:app --reload --port 8000
```

The API will be running at `http://localhost:8000`.
API docs available at `http://localhost:8000/docs`.

### Frontend Setup

```bash
pnpm install
pnpm dev
```

The app will be running at `http://localhost:3000`.

## Assumptions

1. **No Authentication** — A default user (Alex Rivera) is pre-seeded and assumed logged in
2. **No Real Video/Audio** — Meeting room shows a simulated UI with participant tiles (no WebRTC)
3. **SQLite** — Single-file database suitable for development and evaluation
4. **Participant Simulation** — Mock participants are shown in meeting rooms when the API is unavailable

## Project Structure

```
zoom-clone/
├── app/                          # Next.js pages (App Router)
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Home dashboard
│   ├── globals.css              # Design system
│   ├── meetings/page.tsx        # Meetings list
│   ├── meeting/[id]/page.tsx    # Meeting room
│   └── join/page.tsx            # Join meeting
├── components/
│   ├── sidebar.tsx              # Left navigation
│   ├── topbar.tsx               # Top header bar
│   ├── home-dashboard.tsx       # Home tab content
│   ├── meetings-list.tsx        # Meetings tab
│   ├── meeting-room.tsx         # In-meeting experience
│   └── modals/                  # Modal dialogs
├── lib/
│   └── api.ts                   # API client
├── backend/
│   ├── main.py                  # FastAPI app
│   ├── database.py              # SQLite config
│   ├── models.py                # ORM models
│   ├── schemas.py               # Pydantic schemas
│   ├── crud.py                  # DB operations
│   └── seed.py                  # Seed script
└── README.md
```
