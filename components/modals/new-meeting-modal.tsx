'use client'

import { useState } from 'react'
import { Video, X, Copy } from 'lucide-react'

interface NewMeetingModalProps {
  onClose: () => void
  onStart: (meetingId: string) => void
}

export function NewMeetingModal({ onClose, onStart }: NewMeetingModalProps) {
  const [loading, setLoading] = useState(false)
  const personalId = '845 221 9034'

  const handleStart = async () => {
    setLoading(true)
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/meetings`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: 'Instant Meeting',
            meeting_type: 'instant',
          }),
        }
      )
      const meeting = await res.json()
      onStart(meeting.meeting_id.replace(/ /g, ''))
    } catch {
      // Fallback: create a local meeting ID
      const id = `${Math.floor(100 + Math.random() * 899)}${Math.floor(100 + Math.random() * 899)}${Math.floor(1000 + Math.random() * 8999)}`
      onStart(id)
    }
  }

  const handleCopy = () => {
    const link = `${window.location.origin}/meeting/${personalId.replace(/ /g, '')}`
    navigator.clipboard?.writeText(link)
  }

  return (
    <div className="modal-overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2>New Meeting</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            <X />
          </button>
        </div>
        <div className="modal-body">
          <p className="modal-description">
            Start an instant meeting or copy the invite link to share.
          </p>

          <div className="instant-meeting-info">
            <div className="meeting-ready-dot" />
            <div className="info-text">
              <strong>Alex&apos;s Personal Meeting Room</strong>
              <span>Meeting ID: {personalId}</span>
            </div>
          </div>

          <button className="btn-primary btn-full" onClick={handleStart} disabled={loading}>
            <Video />
            {loading ? 'Starting...' : 'Start Meeting'}
          </button>

          <button className="btn-outline-full" onClick={handleCopy}>
            <Copy />
            Copy Invite Link
          </button>
        </div>
      </div>
    </div>
  )
}
