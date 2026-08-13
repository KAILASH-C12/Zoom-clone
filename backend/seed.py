"""
Database seed script — populates the database with sample data.
Run: python seed.py
"""

from datetime import datetime, timedelta

from database import engine, SessionLocal, Base
from models import User, Meeting, Participant, ChatMessage


def seed():
    """Drop and recreate all tables, then insert sample data."""
    # Recreate tables
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()

    try:
        # ── Users ─────────────────────────────────────────────────────────
        default_user = User(
            display_name="Alex Rivera",
            email="alex.rivera@example.com",
            avatar_url=None,
            is_default=True,
        )
        user2 = User(
            display_name="Jordan Kim",
            email="jordan.kim@example.com",
            avatar_url=None,
            is_default=False,
        )
        user3 = User(
            display_name="Priya Shah",
            email="priya.shah@example.com",
            avatar_url=None,
            is_default=False,
        )
        user4 = User(
            display_name="Sam Wilson",
            email="sam.wilson@example.com",
            avatar_url=None,
            is_default=False,
        )
        user5 = User(
            display_name="Maya Chen",
            email="maya.chen@example.com",
            avatar_url=None,
            is_default=False,
        )

        db.add_all([default_user, user2, user3, user4, user5])
        db.commit()

        now = datetime.utcnow()

        # ── Upcoming Scheduled Meetings ───────────────────────────────────
        meeting1 = Meeting(
            meeting_id="884 291 6732",
            title="Product Design Sync",
            description="Weekly product design review and feedback session",
            host_id=default_user.id,
            meeting_type="scheduled",
            status="upcoming",
            start_time=now + timedelta(hours=2),
            duration=45,
            invite_link="http://localhost:3000/meeting/8842916732",
            passcode="Dsgn45",
            created_at=now - timedelta(days=1),
            updated_at=now - timedelta(days=1),
        )

        meeting2 = Meeting(
            meeting_id="719 440 2851",
            title="Weekly Team Standup",
            description="Quick sync on sprint progress and blockers",
            host_id=default_user.id,
            meeting_type="scheduled",
            status="upcoming",
            start_time=now + timedelta(days=1, hours=1),
            duration=30,
            invite_link="http://localhost:3000/meeting/7194402851",
            passcode="Stnd30",
            created_at=now - timedelta(days=3),
            updated_at=now - timedelta(days=3),
        )

        meeting3 = Meeting(
            meeting_id="403 118 9264",
            title="Client Kickoff - Northstar",
            description="Initial kickoff meeting with the Northstar project team",
            host_id=default_user.id,
            meeting_type="scheduled",
            status="upcoming",
            start_time=now + timedelta(days=2, hours=4),
            duration=60,
            invite_link="http://localhost:3000/meeting/4031189264",
            passcode="Nrth60",
            created_at=now - timedelta(days=2),
            updated_at=now - timedelta(days=2),
        )

        # ── Recent / Ended Meetings ───────────────────────────────────────
        meeting4 = Meeting(
            meeting_id="552 837 1490",
            title="Q3 Planning Session",
            description="Quarterly planning and OKR review",
            host_id=default_user.id,
            meeting_type="scheduled",
            status="ended",
            start_time=now - timedelta(days=1, hours=3),
            end_time=now - timedelta(days=1, hours=2),
            duration=60,
            invite_link="http://localhost:3000/meeting/5528371490",
            passcode="Q3Pln",
            created_at=now - timedelta(days=5),
            updated_at=now - timedelta(days=1, hours=2),
        )

        meeting5 = Meeting(
            meeting_id="931 662 4078",
            title="1:1 with Jordan",
            description="Weekly one-on-one sync",
            host_id=default_user.id,
            meeting_type="instant",
            status="ended",
            start_time=now - timedelta(days=2, hours=5),
            end_time=now - timedelta(days=2, hours=4, minutes=30),
            duration=30,
            invite_link="http://localhost:3000/meeting/9316624078",
            passcode="1on1J",
            created_at=now - timedelta(days=2, hours=5),
            updated_at=now - timedelta(days=2, hours=4, minutes=30),
        )

        db.add_all([meeting1, meeting2, meeting3, meeting4, meeting5])
        db.commit()

        # ── Participants for Recent Meetings ──────────────────────────────
        # Q3 Planning Session participants
        db.add_all([
            Participant(
                meeting_id=meeting4.id, user_id=default_user.id,
                display_name="Alex Rivera", role="host",
                is_muted=False, has_video=True,
                joined_at=meeting4.start_time, left_at=meeting4.end_time,
            ),
            Participant(
                meeting_id=meeting4.id, user_id=user2.id,
                display_name="Jordan Kim", role="participant",
                is_muted=False, has_video=True,
                joined_at=meeting4.start_time + timedelta(minutes=2),
                left_at=meeting4.end_time,
            ),
            Participant(
                meeting_id=meeting4.id, user_id=user3.id,
                display_name="Priya Shah", role="participant",
                is_muted=True, has_video=False,
                joined_at=meeting4.start_time + timedelta(minutes=5),
                left_at=meeting4.end_time,
            ),
            Participant(
                meeting_id=meeting4.id, user_id=user5.id,
                display_name="Maya Chen", role="participant",
                is_muted=False, has_video=True,
                joined_at=meeting4.start_time + timedelta(minutes=1),
                left_at=meeting4.end_time,
            ),
        ])

        # 1:1 with Jordan participants
        db.add_all([
            Participant(
                meeting_id=meeting5.id, user_id=default_user.id,
                display_name="Alex Rivera", role="host",
                is_muted=False, has_video=True,
                joined_at=meeting5.start_time, left_at=meeting5.end_time,
            ),
            Participant(
                meeting_id=meeting5.id, user_id=user2.id,
                display_name="Jordan Kim", role="participant",
                is_muted=False, has_video=True,
                joined_at=meeting5.start_time + timedelta(minutes=1),
                left_at=meeting5.end_time,
            ),
        ])

        # ── Chat Messages ──────────────────────────────────────────────────
        db.add_all([
            ChatMessage(
                meeting_id=meeting1.id,
                sender_name="Alex Rivera",
                sender_id=default_user.id,
                content="Welcome everyone to the Product Design Sync!",
                timestamp=now - timedelta(minutes=10),
            ),
            ChatMessage(
                meeting_id=meeting1.id,
                sender_name="Jordan Kim",
                sender_id=user2.id,
                content="Hey Alex! I have the UI wireframes ready to review.",
                timestamp=now - timedelta(minutes=8),
            ),
            ChatMessage(
                meeting_id=meeting4.id,
                sender_name="Priya Shah",
                sender_id=user3.id,
                content="Great summary on Q3 targets!",
                timestamp=meeting4.end_time - timedelta(minutes=5),
            ),
        ])

        db.commit()
        print("[OK] Database seeded successfully!")
        print(f"   - {db.query(User).count()} users")
        print(f"   - {db.query(Meeting).count()} meetings")
        print(f"   - {db.query(Participant).count()} participants")
        print(f"   - {db.query(ChatMessage).count()} chat messages")

    finally:
        db.close()


if __name__ == "__main__":
    seed()

