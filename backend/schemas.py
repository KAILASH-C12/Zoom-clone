"""
Pydantic schemas for request/response validation.
Separates Create (input) from Response (output) models.
"""

from datetime import datetime
from typing import Optional, List

from pydantic import BaseModel, Field


# ── User Schemas ──────────────────────────────────────────────────────────────

class UserResponse(BaseModel):
    id: int
    display_name: str
    email: str
    avatar_url: Optional[str] = None
    is_default: bool
    created_at: datetime

    class Config:
        from_attributes = True


# ── Meeting Schemas ───────────────────────────────────────────────────────────

class MeetingCreate(BaseModel):
    title: str = Field(default="Instant Meeting", max_length=200)
    description: Optional[str] = None
    meeting_type: str = Field(default="instant", pattern="^(instant|scheduled)$")
    start_time: Optional[datetime] = None
    duration: Optional[int] = Field(default=30, ge=15, le=180)  # minutes
    passcode: Optional[str] = None


class MeetingResponse(BaseModel):
    id: int
    meeting_id: str
    title: str
    description: Optional[str] = None
    host_id: int
    meeting_type: str
    status: str
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    duration: Optional[int] = None
    invite_link: Optional[str] = None
    passcode: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    host: Optional[UserResponse] = None
    participant_count: Optional[int] = None

    class Config:
        from_attributes = True


class MeetingListResponse(BaseModel):
    upcoming: List[MeetingResponse]
    recent: List[MeetingResponse]


# ── Participant Schemas ───────────────────────────────────────────────────────

class ParticipantJoin(BaseModel):
    display_name: str = Field(max_length=100)
    meeting_id: str  # The public meeting ID string (e.g., "884 291 6732")


class ParticipantUpdate(BaseModel):
    is_muted: Optional[bool] = None
    has_video: Optional[bool] = None


class ParticipantResponse(BaseModel):
    id: int
    meeting_id: int
    user_id: Optional[int] = None
    display_name: str
    role: str
    is_muted: bool
    has_video: bool
    joined_at: datetime
    left_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ── Chat Message Schemas ──────────────────────────────────────────────────────

class ChatMessageCreate(BaseModel):
    sender_name: str = Field(max_length=100)
    content: str = Field(min_length=1, max_length=2000)


class ChatMessageResponse(BaseModel):
    id: int
    meeting_id: int
    sender_name: str
    sender_id: Optional[int] = None
    content: str
    timestamp: datetime

    class Config:
        from_attributes = True

