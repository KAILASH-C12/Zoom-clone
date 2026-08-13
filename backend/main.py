"""
FastAPI application entry point.
Configures CORS, registers routes, database models, and CRDT WebSockets connection manager.
"""

from typing import List, Dict, Any
import datetime
from fastapi import FastAPI, Depends, HTTPException, Query, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from database import engine, get_db, Base
from models import Meeting, User
import crud
import schemas

# Create all tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Zoom Clone API",
    description="Backend API for the Zoom meeting platform clone",
    version="1.0.0",
)

# CORS — allow Next.js dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── WebSockets CRDT Connection Manager ───────────────────────────────────────

class CRDTRoomState:
    def __init__(self, meeting_id: str):
        self.meeting_id = meeting_id
        self.clock: int = 0
        self.participants: Dict[str, Dict[str, Any]] = {}
        self.messages: List[Dict[str, Any]] = []

    def get_clock(self) -> int:
        self.clock += 1
        return self.clock

    def update_participant(self, p_id: str, p_data: dict) -> dict:
        self.clock = max(self.clock, p_data.get("lamportClock", 0)) + 1
        p_data["lamportClock"] = self.clock
        self.participants[str(p_id)] = p_data
        return p_data

    def remove_participant(self, p_id: str):
        self.participants.pop(str(p_id), None)

    def add_message(self, msg_data: dict) -> dict:
        self.clock = max(self.clock, msg_data.get("lamportClock", 0)) + 1
        msg_data["lamportClock"] = self.clock
        self.messages.append(msg_data)
        # Keep sorted by Lamport clock
        self.messages.sort(key=lambda m: m.get("lamportClock", 0))
        return msg_data


class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, List[WebSocket]] = {}
        self.room_states: Dict[str, CRDTRoomState] = {}
        # Map websocket id -> participant_id for targeted signaling
        self.socket_to_participant: Dict[int, str] = {}
        # Map "meeting_id:participant_id" -> websocket for targeted delivery
        self.participant_to_socket: Dict[str, WebSocket] = {}

    def get_room_state(self, meeting_id: str) -> CRDTRoomState:
        clean_id = meeting_id.replace(" ", "")
        if clean_id not in self.room_states:
            self.room_states[clean_id] = CRDTRoomState(clean_id)
        return self.room_states[clean_id]

    async def connect(self, meeting_id: str, websocket: WebSocket):
        clean_id = meeting_id.replace(" ", "")
        await websocket.accept()
        if clean_id not in self.active_connections:
            self.active_connections[clean_id] = []
        self.active_connections[clean_id].append(websocket)

        # Transmit CRDT Room Sync Snapshot upon join
        room_state = self.get_room_state(clean_id)
        sync_payload = {
            "type": "room_sync",
            "data": {
                "meetingId": clean_id,
                "clock": room_state.clock,
                "participants": list(room_state.participants.values()),
                "messages": room_state.messages,
            },
        }
        await websocket.send_json(sync_payload)

    def register_participant(self, meeting_id: str, participant_id: str, websocket: WebSocket):
        """Associate a websocket with a participant ID for targeted signaling."""
        clean_id = meeting_id.replace(" ", "")
        self.socket_to_participant[id(websocket)] = participant_id
        self.participant_to_socket[f"{clean_id}:{participant_id}"] = websocket

    def disconnect(self, meeting_id: str, websocket: WebSocket):
        clean_id = meeting_id.replace(" ", "")
        if clean_id in self.active_connections:
            if websocket in self.active_connections[clean_id]:
                self.active_connections[clean_id].remove(websocket)
            if not self.active_connections[clean_id]:
                del self.active_connections[clean_id]
        # Clean up participant mapping
        p_id = self.socket_to_participant.pop(id(websocket), None)
        if p_id:
            self.participant_to_socket.pop(f"{clean_id}:{p_id}", None)

    async def broadcast(self, meeting_id: str, message: dict, exclude_socket: WebSocket = None):
        """Broadcast to all connections in the room, optionally excluding one socket."""
        clean_id = meeting_id.replace(" ", "")
        if clean_id in self.active_connections:
            for connection in list(self.active_connections[clean_id]):
                if exclude_socket and connection == exclude_socket:
                    continue
                try:
                    await connection.send_json(message)
                except Exception:
                    pass

    async def send_to_participant(self, meeting_id: str, target_participant_id: str, message: dict):
        """Send a message to a specific participant's socket."""
        clean_id = meeting_id.replace(" ", "")
        key = f"{clean_id}:{target_participant_id}"
        ws = self.participant_to_socket.get(key)
        if ws:
            try:
                await ws.send_json(message)
            except Exception:
                pass

manager = ConnectionManager()


# ── Root & Health Check ───────────────────────────────────────────────────────

@app.on_event("startup")
def on_startup():
    """Ensure database has default user on startup."""
    db = SessionLocal()
    try:
        user = crud.get_default_user(db)
        if not user:
            default_user = User(
                display_name="Alex Rivera",
                email="alex.rivera@example.com",
                avatar_url=None,
                is_default=True,
            )
            db.add(default_user)
            db.commit()
    except Exception:
        pass
    finally:
        db.close()


@app.get("/")
def root():
    return {
        "status": "online",
        "service": "Zoom Clone API & WebSockets Backend",
        "docs": "/docs",
        "health": "/api/health",
        "websocket_endpoint": "/ws/meeting/{meeting_id}"
    }


@app.get("/api/health")
def health_check():
    return {"status": "ok", "service": "zoom-clone-api"}


# ── User Endpoints ────────────────────────────────────────────────────────────

@app.get("/api/users/me", response_model=schemas.UserResponse)
def get_current_user(db: Session = Depends(get_db)):
    """Get the default logged-in user."""
    user = crud.get_default_user(db)
    if not user:
        raise HTTPException(status_code=404, detail="No default user found. Run seed.py first.")
    return user


# ── Meeting Endpoints ─────────────────────────────────────────────────────────

@app.post("/api/meetings", response_model=schemas.MeetingResponse)
def create_meeting(data: schemas.MeetingCreate, db: Session = Depends(get_db)):
    """Create a new meeting (instant or scheduled)."""
    user = crud.get_default_user(db)
    if not user:
        raise HTTPException(status_code=400, detail="No default user. Run seed.py.")

    meeting = crud.create_meeting(db, host_id=user.id, data=data)
    meeting.participant_count = crud.get_participant_count(db, meeting.id)
    meeting.host = user
    return meeting


@app.get("/api/meetings", response_model=schemas.MeetingListResponse)
def list_meetings(db: Session = Depends(get_db)):
    """List upcoming and recent meetings for the current user."""
    user = crud.get_default_user(db)
    if not user:
        raise HTTPException(status_code=400, detail="No default user. Run seed.py.")

    data = crud.get_meetings_for_user(db, user.id)

    for m in data["upcoming"] + data["recent"]:
        m.participant_count = crud.get_participant_count(db, m.id)
        m.host = user

    return data


@app.get("/api/meetings/{meeting_id}", response_model=schemas.MeetingResponse)
def get_meeting(meeting_id: str, db: Session = Depends(get_db)):
    """Get a meeting by its public meeting ID."""
    meeting = crud.get_meeting_by_meeting_id(db, meeting_id)
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")

    meeting.participant_count = crud.get_participant_count(db, meeting.id)
    return meeting


@app.delete("/api/meetings/{meeting_id}")
def delete_meeting(meeting_id: str, db: Session = Depends(get_db)):
    """Delete a scheduled meeting."""
    meeting = crud.get_meeting_by_meeting_id(db, meeting_id)
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    if meeting.status == "active":
        raise HTTPException(status_code=400, detail="Cannot delete an active meeting")

    crud.delete_meeting(db, meeting.id)
    return {"detail": "Meeting deleted"}


@app.post("/api/meetings/{meeting_id}/end")
def end_meeting(meeting_id: str, db: Session = Depends(get_db)):
    """End an active meeting."""
    meeting = crud.get_meeting_by_meeting_id(db, meeting_id)
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")

    updated = crud.end_meeting(db, meeting.id)
    return {"detail": "Meeting ended", "meeting_id": updated.meeting_id}


# ── Participant Endpoints ─────────────────────────────────────────────────────

@app.post("/api/meetings/{meeting_id}/join", response_model=schemas.ParticipantResponse)
def join_meeting(meeting_id: str, data: schemas.ParticipantJoin, db: Session = Depends(get_db)):
    """Join a meeting as a participant."""
    meeting = crud.get_meeting_by_meeting_id(db, meeting_id)
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    if meeting.status == "ended":
        raise HTTPException(status_code=400, detail="This meeting has already ended")

    user = crud.get_default_user(db)
    user_id = user.id if user and data.display_name == user.display_name else None

    participant = crud.join_meeting(
        db,
        meeting_pk=meeting.id,
        display_name=data.display_name,
        user_id=user_id,
    )
    return participant


@app.post("/api/meetings/{meeting_id}/leave")
def leave_meeting(
    meeting_id: str,
    participant_id: int = Query(...),
    db: Session = Depends(get_db),
):
    """Leave a meeting."""
    participant = crud.leave_meeting(db, participant_id)
    if not participant:
        raise HTTPException(status_code=404, detail="Participant not found")
    return {"detail": "Left the meeting"}


@app.get(
    "/api/meetings/{meeting_id}/participants",
    response_model=list[schemas.ParticipantResponse],
)
def get_participants(meeting_id: str, db: Session = Depends(get_db)):
    """Get active participants in a meeting."""
    meeting = crud.get_meeting_by_meeting_id(db, meeting_id)
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    return crud.get_participants(db, meeting.id, active_only=True)


@app.put(
    "/api/meetings/{meeting_id}/participants/{participant_id}",
    response_model=schemas.ParticipantResponse,
)
def update_participant(
    meeting_id: str,
    participant_id: int,
    data: schemas.ParticipantUpdate,
    db: Session = Depends(get_db),
):
    """Update participant state (mute/video)."""
    participant = crud.update_participant(db, participant_id, data)
    if not participant:
        raise HTTPException(status_code=404, detail="Participant not found")
    return participant


@app.post("/api/meetings/{meeting_id}/mute-all")
def mute_all(meeting_id: str, db: Session = Depends(get_db)):
    """Mute all participants except the host."""
    meeting = crud.get_meeting_by_meeting_id(db, meeting_id)
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")

    participants = crud.get_participants(db, meeting.id)
    host_p = next((p for p in participants if p.role == "host"), None)
    host_p_id = host_p.id if host_p else -1

    count = crud.mute_all_participants(db, meeting.id, host_p_id)
    return {"detail": f"Muted {count} participants"}


@app.post("/api/meetings/{meeting_id}/remove-participant")
def remove_participant(
    meeting_id: str,
    participant_id: int = Query(...),
    db: Session = Depends(get_db),
):
    """Remove a participant from the meeting (host control)."""
    success = crud.remove_participant(db, participant_id)
    if not success:
        raise HTTPException(status_code=404, detail="Participant not found")
    return {"detail": "Participant removed"}


# ── Chat Endpoints ────────────────────────────────────────────────────────────

@app.get(
    "/api/meetings/{meeting_id}/messages",
    response_model=List[schemas.ChatMessageResponse],
)
def get_chat_messages(meeting_id: str, db: Session = Depends(get_db)):
    """Get all chat messages for a meeting."""
    meeting = crud.get_meeting_by_meeting_id(db, meeting_id)
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    return crud.get_chat_messages(db, meeting.id)


@app.post(
    "/api/meetings/{meeting_id}/messages",
    response_model=schemas.ChatMessageResponse,
)
async def create_chat_message(
    meeting_id: str,
    data: schemas.ChatMessageCreate,
    db: Session = Depends(get_db),
):
    """Create a new chat message and broadcast via WebSocket with CRDT ordering."""
    meeting = crud.get_meeting_by_meeting_id(db, meeting_id)
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")

    user = crud.get_default_user(db)
    user_id = user.id if user and data.sender_name == user.display_name else None

    msg = crud.create_chat_message(
        db,
        meeting_pk=meeting.id,
        sender_name=data.sender_name,
        content=data.content,
        sender_id=user_id,
    )

    clean_id = meeting_id.replace(" ", "")
    room_state = manager.get_room_state(clean_id)
    msg_data = {
        "id": msg.id,
        "meetingId": clean_id,
        "senderName": msg.sender_name,
        "senderId": msg.sender_id,
        "content": msg.content,
        "timestamp": msg.timestamp.isoformat(),
        "lamportClock": room_state.get_clock(),
    }
    room_state.add_message(msg_data)

    payload = {
        "type": "chat_message",
        "data": msg_data,
    }
    await manager.broadcast(clean_id, payload)
    return msg


# ── Real-Time CRDT & WebRTC WebSocket Endpoint ────────────────────────────────

@app.websocket("/ws/meeting/{meeting_id}")
async def websocket_meeting(websocket: WebSocket, meeting_id: str):
    """Real-time WebSockets endpoint for CRDT presence sync, WebRTC signaling, and chat."""
    clean_id = meeting_id.replace(" ", "")
    await manager.connect(clean_id, websocket)
    room_state = manager.get_room_state(clean_id)
    current_participant_id = None

    try:
        while True:
            data = await websocket.receive_json()
            event_type = data.get("type")

            if event_type == "join_presence":
                participant = data.get("participant", {})
                current_participant_id = str(participant.get("id"))
                # Register socket <-> participant mapping for targeted signaling
                manager.register_participant(clean_id, current_participant_id, websocket)
                updated_p = room_state.update_participant(current_participant_id, participant)
                # Broadcast to everyone EXCEPT the sender
                await manager.broadcast(clean_id, {
                    "type": "presence_sync",
                    "participant": updated_p,
                    "all_participants": list(room_state.participants.values()),
                }, exclude_socket=websocket)

            elif event_type == "presence_update":
                participant = data.get("participant", {})
                current_participant_id = str(participant.get("id"))
                manager.register_participant(clean_id, current_participant_id, websocket)
                updated_p = room_state.update_participant(current_participant_id, participant)
                # Broadcast to everyone EXCEPT the sender
                await manager.broadcast(clean_id, {
                    "type": "presence_sync",
                    "participant": updated_p,
                    "all_participants": list(room_state.participants.values()),
                }, exclude_socket=websocket)

            elif event_type == "chat_message":
                msg_payload = data.get("data", {})
                synced_msg = room_state.add_message(msg_payload)
                # Broadcast to everyone EXCEPT the sender (sender already has it locally)
                await manager.broadcast(clean_id, {
                    "type": "chat_message",
                    "data": synced_msg,
                }, exclude_socket=websocket)

            elif event_type in ["webrtc_offer", "webrtc_answer", "webrtc_ice"]:
                # Targeted delivery: send to a specific participant, not broadcast
                target_id = data.get("target")
                if target_id:
                    await manager.send_to_participant(clean_id, target_id, data)
                else:
                    # Fallback: broadcast to all except sender
                    await manager.broadcast(clean_id, data, exclude_socket=websocket)

            elif event_type in ["screen_share_started", "screen_share_stopped"]:
                # Relay screen share events to all other participants
                await manager.broadcast(clean_id, data, exclude_socket=websocket)

            else:
                await manager.broadcast(clean_id, data, exclude_socket=websocket)

    except WebSocketDisconnect:
        manager.disconnect(clean_id, websocket)
        if current_participant_id:
            room_state.remove_participant(current_participant_id)
            await manager.broadcast(clean_id, {
                "type": "peer_left",
                "participant_id": current_participant_id,
                "all_participants": list(room_state.participants.values()),
            })
    except Exception:
        manager.disconnect(clean_id, websocket)
        if current_participant_id:
            room_state.remove_participant(current_participant_id)
            await manager.broadcast(clean_id, {
                "type": "peer_left",
                "participant_id": current_participant_id,
                "all_participants": list(room_state.participants.values()),
            })
