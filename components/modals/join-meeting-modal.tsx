'use client'

import { useState } from 'react'
import { Users, X } from 'lucide-react'

interface JoinMeetingModalProps {
  onClose: () => void
  onJoin: (meetingId: string, displayName: string) => void
}

export function JoinMeetingModal({ onClose, onJoin }: JoinMeetingModalProps) {
  const [meetingId, setMeetingId] = useState('')
  const [displayName, setDisplayName] = useState('Alex Rivera')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleJoin = async () => {
    if (!meetingId.trim()) {
      setError('Please enter a Meeting ID or invite link')
      return
    }
    if (!displayName.trim()) {
      setError('Please enter your display name')
      return
    }

    setError('')
    setLoading(true)

    // Extract meeting ID from link if needed
    let cleanId = meetingId.trim()
    // Handle invite links like http://localhost:3000/meeting/8842916732
    const linkMatch = cleanId.match(/meeting\/(\d+)/)
    if (linkMatch) {
      cleanId = linkMatch[1]
    }
    // Remove spaces
    cleanId = cleanId.replace(/\s/g, '')

    try {
      // Validate meeting exists
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/meetings/${cleanId}`
      )
      if (!res.ok) {
        setError('Meeting not found. Please check the Meeting ID and try again.')
        setLoading(false)
        return
      }
      onJoin(cleanId, displayName)
    } catch {
      // If API is unreachable, proceed anyway (for demo)
      onJoin(cleanId, displayName)
    }
  }

  return (
    <div className="modal-overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2>Join Meeting</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            <X />
          </button>
        </div>
        <div className="modal-body">
          <p className="modal-description">
            Enter the meeting ID or invite link to join an existing meeting.
          </p>

          <div className="form-group">
            <label className="form-label">Meeting ID or Invite Link</label>
            <input
              className="form-input"
              value={meetingId}
              onChange={(e) => setMeetingId(e.target.value)}
              placeholder="e.g. 884 291 6732"
              onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Your Name</label>
            <input
              className="form-input"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Enter your display name"
            />
          </div>

          {error && <p className="form-error">{error}</p>}

          <button
            className="btn-primary btn-full"
            onClick={handleJoin}
            disabled={loading}
            style={{ marginTop: 8 }}
          >
            <Users />
            {loading ? 'Joining...' : 'Join Meeting'}
          </button>
        </div>
      </div>
    </div>
  )
}
