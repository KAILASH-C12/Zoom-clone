"""
CRUD operations — all database interactions go through this module.
Keeps route handlers thin and business logic testable.
"""

import random
import string
from datetime import datetime, timedelta
from typing import Optional, List

from sqlalchemy.orm import Session
from sqlalchemy import func

from models import User, Meeting, Participant, ChatMessage
from schemas import MeetingCreate, ParticipantUpdate, ChatMessageCreate


def _generate_meeting_id() -> str:
    """Generate a Zoom-style meeting ID like '884 291 6732'."""
    part1 = random.randint(100, 999)
    part2 = random.randint(100, 999)
    part3 = random.randint(1000, 9999)
    return f"{part1} {part2} {part3}"


def _generate_passcode(length: int = 6) -> str:
    """Generate a random alphanumeric passcode."""
    return "".join(random.choices(string.ascii_letters + string.digits, k=length))


def _build_invite_link(meeting_id: str) -> str:
    """Build a shareable invite link from a meeting ID."""
    clean_id = meeting_id.replace(" ", "")
    return f"http://localhost:3000/meeting/{clean_id}"


# ── User Operations ──────────────────────────────────────────────────────────

def get_default_user(db: Session) -> Optional[User]:
    """Get the pre-seeded default user."""
    return db.query(User).filter(User.is_default == True).first()


def get_user(db: Session, user_id: int) -> Optional[User]:
    return db.query(User).filter(User.id == user_id).first()


# ── Meeting Operations ────────────────────────────────────────────────────────

def create_meeting(db: Session, host_id: int, data: MeetingCreate) -> Meeting:
    """Create a new meeting (instant or scheduled)."""
    meeting_id = _generate_meeting_id()

    # Ensure uniqueness
    while db.query(Meeting).filter(Meeting.meeting_id == meeting_id).first():
        meeting_id = _generate_meeting_id()

    now = datetime.utcnow()
    passcode = data.passcode or _generate_passcode()

    meeting = Meeting(
        meeting_id=meeting_id,
        title=data.title,
        description=data.description,
        host_id=host_id,
        meeting_type=data.meeting_type,
        status="active" if data.meeting_type == "instant" else "upcoming",
        start_time=data.start_time or now,
        duration=data.duration or 30,
        invite_link=_build_invite_link(meeting_id),
        passcode=passcode,
        created_at=now,
        updated_at=now,
    )
    db.add(meeting)
    db.commit()
    db.refresh(meeting)

    # Auto-add host as participant
    host = get_user(db, host_id)
    if host:
        host_participant = Participant(
            meeting_id=meeting.id,
            user_id=host_id,
            display_name=host.display_name,
            role="host",
            is_muted=False,
            has_video=True,
            joined_at=now,
        )
        db.add(host_participant)
        db.commit()

    return meeting


def get_meeting_by_meeting_id(db: Session, meeting_id: str) -> Optional[Meeting]:
    """Lookup a meeting by its public meeting ID string."""
    # Support both "884 291 6732" and "8842916732" formats
    clean = meeting_id.replace(" ", "")
    meeting = db.query(Meeting).filter(
        func.replace(Meeting.meeting_id, " ", "") == clean
    ).first()
    return meeting


def get_meeting(db: Session, meeting_pk: int) -> Optional[Meeting]:
    """Lookup a meeting by its primary key."""
    return db.query(Meeting).filter(Meeting.id == meeting_pk).first()


def get_meetings_for_user(db: Session, user_id: int) -> dict:
    """Get upcoming and recent meetings for a user."""
    now = datetime.utcnow()

    upcoming = (
        db.query(Meeting)
        .filter(
            Meeting.host_id == user_id,
            Meeting.status.in_(["upcoming", "active"]),
        )
        .order_by(Meeting.start_time.asc())
        .all()
    )

    recent = (
        db.query(Meeting)
        .filter(
            Meeting.host_id == user_id,
            Meeting.status == "ended",
        )
        .order_by(Meeting.start_time.desc())
        .limit(10)
        .all()
    )

    return {"upcoming": upcoming, "recent": recent}


def end_meeting(db: Session, meeting_pk: int) -> Optional[Meeting]:
    """Mark a meeting as ended and set end_time."""
    meeting = get_meeting(db, meeting_pk)
    if not meeting:
        return None

    meeting.status = "ended"
    meeting.end_time = datetime.utcnow()
    meeting.updated_at = datetime.utcnow()

    # Mark all active participants as left
    active_participants = (
        db.query(Participant)
        .filter(Participant.meeting_id == meeting_pk, Participant.left_at == None)
        .all()
    )
    for p in active_participants:
        p.left_at = datetime.utcnow()

    db.commit()
    db.refresh(meeting)
    return meeting


def delete_meeting(db: Session, meeting_pk: int) -> bool:
    """Delete a scheduled meeting."""
    meeting = get_meeting(db, meeting_pk)
    if not meeting:
        return False
    db.delete(meeting)
    db.commit()
    return True


# ── Participant Operations ────────────────────────────────────────────────────

def join_meeting(
    db: Session,
    meeting_pk: int,
    display_name: str,
    user_id: Optional[int] = None,
) -> Optional[Participant]:
    """Add a participant to a meeting."""
    meeting = get_meeting(db, meeting_pk)
    if not meeting:
        return None

    # Activate the meeting if it was upcoming
    if meeting.status == "upcoming":
        meeting.status = "active"
        meeting.start_time = datetime.utcnow()
        meeting.updated_at = datetime.utcnow()

    participant = Participant(
        meeting_id=meeting_pk,
        user_id=user_id,
        display_name=display_name,
        role="participant",
        is_muted=False,
        has_video=True,
        joined_at=datetime.utcnow(),
    )
    db.add(participant)
    db.commit()
    db.refresh(participant)
    return participant


def leave_meeting(db: Session, participant_id: int) -> Optional[Participant]:
    """Mark a participant as having left the meeting."""
    participant = db.query(Participant).filter(Participant.id == participant_id).first()
    if not participant:
        return None
    participant.left_at = datetime.utcnow()
    db.commit()
    db.refresh(participant)
    return participant


def get_participants(db: Session, meeting_pk: int, active_only: bool = True) -> List[Participant]:
    """Get participants for a meeting."""
    query = db.query(Participant).filter(Participant.meeting_id == meeting_pk)
    if active_only:
        query = query.filter(Participant.left_at == None)
    return query.order_by(Participant.joined_at.asc()).all()


def update_participant(db: Session, participant_id: int, data: ParticipantUpdate) -> Optional[Participant]:
    """Update a participant's mute/video state."""
    participant = db.query(Participant).filter(Participant.id == participant_id).first()
    if not participant:
        return None
    if data.is_muted is not None:
        participant.is_muted = data.is_muted
    if data.has_video is not None:
        participant.has_video = data.has_video
    db.commit()
    db.refresh(participant)
    return participant


def get_participant_count(db: Session, meeting_pk: int) -> int:
    """Count active participants in a meeting."""
    return (
        db.query(Participant)
        .filter(Participant.meeting_id == meeting_pk, Participant.left_at == None)
        .count()
    )


def mute_all_participants(db: Session, meeting_pk: int, host_participant_id: int) -> int:
    """Mute all participants except the host. Returns count of muted participants."""
    count = (
        db.query(Participant)
        .filter(
            Participant.meeting_id == meeting_pk,
            Participant.id != host_participant_id,
            Participant.left_at == None,
        )
        .update({"is_muted": True})
    )
    db.commit()
    return count


def remove_participant(db: Session, participant_id: int) -> bool:
    """Remove a participant from a meeting (host control)."""
    participant = db.query(Participant).filter(Participant.id == participant_id).first()
    if not participant:
        return False
    participant.left_at = datetime.utcnow()
    db.commit()
    return True


# ── Chat Operations ───────────────────────────────────────────────────────────

def create_chat_message(
    db: Session,
    meeting_pk: int,
    sender_name: str,
    content: str,
    sender_id: Optional[int] = None,
) -> ChatMessage:
    """Create and persist a new chat message in a meeting."""
    message = ChatMessage(
        meeting_id=meeting_pk,
        sender_name=sender_name,
        sender_id=sender_id,
        content=content,
        timestamp=datetime.utcnow(),
    )
    db.add(message)
    db.commit()
    db.refresh(message)
    return message


def get_chat_messages(db: Session, meeting_pk: int) -> List[ChatMessage]:
    """Retrieve all chat messages for a meeting ordered by timestamp."""
    return (
        db.query(ChatMessage)
        .filter(ChatMessage.meeting_id == meeting_pk)
        .order_by(ChatMessage.timestamp.asc())
        .all()
    )

