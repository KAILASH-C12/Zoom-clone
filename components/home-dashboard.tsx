'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Video,
  Users,
  Calendar,
  Monitor,
  Clock,
  Copy,
  Check,
} from 'lucide-react'
import type { Meeting } from '@/lib/api'

interface HomeDashboardProps {
  onNewMeeting: () => void
  onJoinMeeting: () => void
  onScheduleMeeting: () => void
}

export function HomeDashboard({
  onNewMeeting,
  onJoinMeeting,
  onScheduleMeeting,
}: HomeDashboardProps) {
  const router = useRouter()
  const [meetings, setMeetings] = useState<{ upcoming: Meeting[]; recent: Meeting[] }>({
    upcoming: [],
    recent: [],
  })
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchMeetings = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/meetings`
      )
      if (res.ok) {
        const data = await res.json()
        setMeetings(data)
      }
    } catch {
      // API unreachable — use empty state
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMeetings()
  }, [])

  const copyInvite = (meetingId: string) => {
    const link = `${window.location.origin}/meeting/${meetingId.replace(/ /g, '')}`
    navigator.clipboard?.writeText(link)
    setCopiedId(meetingId)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const formatTime = (dateStr: string | null) => {
    if (!dateStr) return ''
    const d = new Date(dateStr)
    return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
  }

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return ''
    const d = new Date(dateStr)
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    if (d.toDateString() === today.toDateString()) return 'Today'
    if (d.toDateString() === tomorrow.toDateString()) return 'Tomorrow'
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
  }

  const goToMeeting = (meetingId: string) => {
    router.push(`/meeting/${meetingId.replace(/ /g, '')}`)
  }

  return (
    <div className="dashboard">
      {/* Greeting */}
      <div className="dashboard-greeting">
        <h1>Good {getTimeGreeting()}, Alex</h1>
        <p>Your meetings and schedule at a glance</p>
      </div>

      {/* Action Buttons */}
      <div className="action-buttons">
        <button className="action-btn" onClick={onNewMeeting}>
          <div className="action-btn-icon orange">
            <Video />
          </div>
          <span className="action-btn-label">New Meeting</span>
        </button>

        <button className="action-btn" onClick={onJoinMeeting}>
          <div className="action-btn-icon blue">
            <Users />
          </div>
          <span className="action-btn-label">Join</span>
        </button>

        <button className="action-btn" onClick={onScheduleMeeting}>
          <div className="action-btn-icon teal">
            <Calendar />
          </div>
          <span className="action-btn-label">Schedule</span>
        </button>

        <button className="action-btn" onClick={() => {}}>
          <div className="action-btn-icon purple">
            <Monitor />
          </div>
          <span className="action-btn-label">Share Screen</span>
        </button>
      </div>

      {/* Upcoming Meetings */}
      <div className="meetings-section">
        <div className="section-header">
          <h2>Upcoming Meetings</h2>
          <button onClick={() => router.push('/meetings')}>View all</button>
        </div>

        {loading ? (
          <div className="empty-state">
            <p>Loading meetings...</p>
          </div>
        ) : meetings.upcoming.length === 0 ? (
          <div className="empty-state">
            <Calendar />
            <p>No upcoming meetings. Schedule one to get started.</p>
          </div>
        ) : (
          meetings.upcoming.map((m) => (
            <div
              key={m.meeting_id}
              className="meeting-card"
              onClick={() => goToMeeting(m.meeting_id)}
            >
              <div className="meeting-time-badge">
                <div className="time">{formatTime(m.start_time)}</div>
                <div className="date">{formatDate(m.start_time)}</div>
              </div>

              <div className="meeting-divider" />

              <div className="meeting-info">
                <div className="title">{m.title}</div>
                <div className="meta">
                  <span className="meeting-id-text">{m.meeting_id}</span>
                  <span>·</span>
                  <span>{m.duration} min</span>
                  {m.status === 'active' && (
                    <span className="meeting-status active">
                      <span className="meeting-status-dot" />
                      Live
                    </span>
                  )}
                </div>
              </div>

              <div className="meeting-card-actions">
                <button
                  className="meeting-start-btn"
                  onClick={(e) => {
                    e.stopPropagation()
                    goToMeeting(m.meeting_id)
                  }}
                >
                  Start
                </button>
                <button
                  className="meeting-copy-btn"
                  onClick={(e) => {
                    e.stopPropagation()
                    copyInvite(m.meeting_id)
                  }}
                  title="Copy invite link"
                >
                  {copiedId === m.meeting_id ? <Check /> : <Copy />}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Recent Meetings */}
      {meetings.recent.length > 0 && (
        <div className="meetings-section">
          <div className="section-header">
            <h2>Recent Meetings</h2>
          </div>

          {meetings.recent.map((m) => (
            <div key={m.meeting_id} className="meeting-card">
              <div className="meeting-time-badge">
                <div className="time">{formatTime(m.start_time)}</div>
                <div className="date">{formatDate(m.start_time)}</div>
              </div>

              <div className="meeting-divider" />

              <div className="meeting-info">
                <div className="title">{m.title}</div>
                <div className="meta">
                  <span className="meeting-id-text">{m.meeting_id}</span>
                  <span>·</span>
                  <span>{m.duration} min</span>
                  <span className="meeting-status ended">Ended</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function getTimeGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'morning'
  if (hour < 17) return 'afternoon'
  return 'evening'
}
