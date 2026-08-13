'use client'

import { useState } from 'react'
import { Calendar, X } from 'lucide-react'

interface ScheduleMeetingModalProps {
  onClose: () => void
  onScheduled: () => void
}

export function ScheduleMeetingModal({ onClose, onScheduled }: ScheduleMeetingModalProps) {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const defaultDate = tomorrow.toISOString().split('T')[0]

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState(defaultDate)
  const [time, setTime] = useState('10:00')
  const [duration, setDuration] = useState('30')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSchedule = async () => {
    if (!title.trim()) {
      setError('Please enter a meeting title')
      return
    }

    setError('')
    setLoading(true)

    try {
      const startTime = new Date(`${date}T${time}:00`).toISOString()

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/meetings`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: title.trim(),
            description: description.trim() || null,
            meeting_type: 'scheduled',
            start_time: startTime,
            duration: parseInt(duration),
          }),
        }
      )

      if (!res.ok) {
        throw new Error('Failed to schedule meeting')
      }

      onScheduled()
    } catch {
      setError('Failed to schedule meeting. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2>Schedule Meeting</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            <X />
          </button>
        </div>
        <div className="modal-body">
          <p className="modal-description">
            Plan ahead — set a date and time, and share the invite link with your team.
          </p>

          <div className="form-group">
            <label className="form-label">Meeting Title</label>
            <input
              className="form-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Weekly Planning"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description (optional)</label>
            <textarea
              className="form-textarea"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add meeting agenda or notes..."
              rows={3}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Date</label>
              <input
                className="form-input"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Time</label>
              <input
                className="form-input"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Duration</label>
            <select
              className="form-select"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
            >
              <option value="15">15 minutes</option>
              <option value="30">30 minutes</option>
              <option value="45">45 minutes</option>
              <option value="60">1 hour</option>
              <option value="90">1 hour 30 minutes</option>
              <option value="120">2 hours</option>
            </select>
          </div>

          {error && <p className="form-error">{error}</p>}

          <button
            className="btn-primary btn-full"
            onClick={handleSchedule}
            disabled={loading}
            style={{ marginTop: 4 }}
          >
            <Calendar />
            {loading ? 'Scheduling...' : 'Schedule Meeting'}
          </button>
        </div>
      </div>
    </div>
  )
}
