'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Video,
  Calendar,
  Clock,
  Users,
  Copy,
  Check,
  Link as LinkIcon,
  Trash2,
} from 'lucide-react'
import type { Meeting } from '@/lib/api'

export function MeetingsList() {
  const router = useRouter()
  const [meetings, setMeetings] = useState<{ upcoming: Meeting[]; recent: Meeting[] }>({
    upcoming: [],
    recent: [],
  })
  const [selected, setSelected] = useState<Meeting | null>(null)
  const [activeTab, setActiveTab] = useState<'upcoming' | 'previous'>('upcoming')
  const [copiedLink, setCopiedLink] = useState(false)
  const [loading, setLoading] = useState(true)

  const fetchMeetings = async () => {
    let apiUpcoming: Meeting[] = []
    let apiRecent: Meeting[] = []
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/meetings`
      )
      if (res.ok) {
        const data = await res.json()
        apiUpcoming = data.upcoming || []
        apiRecent = data.recent || []
      }
    } catch {
      // API unreachable
    }

    if (typeof window !== 'undefined') {
      try {
        const localStr = localStorage.getItem('scheduled_meetings')
        if (localStr) {
          const localList: Meeting[] = JSON.parse(localStr)
          const newLocal = localList.filter(
            (lm) => !apiUpcoming.some((m) => m.meeting_id === lm.meeting_id)
          )
          apiUpcoming = [...newLocal, ...apiUpcoming]
        }
      } catch {
        // ignore
      }
    }

    const fullUpcoming = apiUpcoming
    const fullRecent = apiRecent
    setMeetings({ upcoming: fullUpcoming, recent: fullRecent })
    const list = fullUpcoming.length > 0 ? fullUpcoming : fullRecent
    if (list.length > 0 && !selected) {
      setSelected(list[0])
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchMeetings()
  }, [])

  const formatTime = (dateStr: string | null) => {
    if (!dateStr) return ''
    return new Date(dateStr).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
  }

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return ''
    const d = new Date(dateStr)
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    if (d.toDateString() === today.toDateString()) return 'Today'
    if (d.toDateString() === tomorrow.toDateString()) return 'Tomorrow'
    return d.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    })
  }

  const formatFullDate = (dateStr: string | null) => {
    if (!dateStr) return ''
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const copyInvite = () => {
    if (!selected) return
    const link = `${window.location.origin}/meeting/${selected.meeting_id.replace(/ /g, '')}`
    navigator.clipboard?.writeText(link)
    setCopiedLink(true)
    setTimeout(() => setCopiedLink(false), 2000)
  }

  const deleteMeeting = async (m: Meeting) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/meetings/${m.meeting_id.replace(/ /g, '')}`,
        { method: 'DELETE' }
      )
      if (res.ok) {
        setSelected(null)
        fetchMeetings()
      }
    } catch {
      // handle error silently
    }
  }

  const displayList =
    activeTab === 'upcoming' ? meetings.upcoming : meetings.recent

  return (
    <div className="meetings-page">
      {/* Left Panel — List */}
      <div className="meetings-panel-left">
        <div className="meetings-panel-left-header">
          <h2>Meetings</h2>
        </div>

        <div className="meetings-tabs">
          <button
            className={`meetings-tab ${activeTab === 'upcoming' ? 'active' : ''}`}
            onClick={() => setActiveTab('upcoming')}
          >
            Upcoming
          </button>
          <button
            className={`meetings-tab ${activeTab === 'previous' ? 'active' : ''}`}
            onClick={() => setActiveTab('previous')}
          >
            Previous
          </button>
        </div>

        <div className="meetings-list-scroll">
          {loading ? (
            <div className="empty-state">
              <p>Loading...</p>
            </div>
          ) : displayList.length === 0 ? (
            <div className="empty-state">
              <Calendar />
              <p>
                {activeTab === 'upcoming'
                  ? 'No upcoming meetings'
                  : 'No previous meetings'}
              </p>
            </div>
          ) : (
            <>
              {displayList.map((m) => (
                <div
                  key={m.meeting_id}
                  className={`meeting-list-item ${
                    selected?.meeting_id === m.meeting_id ? 'selected' : ''
                  }`}
                  onClick={() => setSelected(m)}
                >
                  <div className="meeting-list-icon">
                    <Video />
                  </div>
                  <div className="meeting-list-info">
                    <div className="title">{m.title}</div>
                    <div className="subtitle">
                      {formatDate(m.start_time)} · {formatTime(m.start_time)}
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </div>

      {/* Right Panel — Detail */}
      <div className="meetings-panel-right">
        {!selected ? (
          <div className="meeting-detail-empty">
            <Video />
            <p>Select a meeting to view details</p>
          </div>
        ) : (
          <div className="meeting-detail">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <span
                className={`meeting-status ${selected.status}`}
              >
                <span className="meeting-status-dot" />
                {selected.status === 'active'
                  ? 'Live'
                  : selected.status === 'upcoming'
                  ? 'Upcoming'
                  : 'Ended'}
              </span>
            </div>

            <h2>{selected.title}</h2>

            {selected.description && (
              <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 4 }}>
                {selected.description}
              </p>
            )}

            <div className="meeting-detail-meta">
              <div className="detail-row">
                <Calendar className="detail-row-icon" />
                <div className="detail-row-content">
                  <div className="detail-row-label">Date</div>
                  <div className="detail-row-value">
                    {formatFullDate(selected.start_time)}
                  </div>
                </div>
              </div>

              <div className="detail-row">
                <Clock className="detail-row-icon" />
                <div className="detail-row-content">
                  <div className="detail-row-label">Time</div>
                  <div className="detail-row-value">
                    {formatTime(selected.start_time)} · {selected.duration} min
                  </div>
                </div>
              </div>

              <div className="detail-row">
                <Video className="detail-row-icon" />
                <div className="detail-row-content">
                  <div className="detail-row-label">Meeting ID</div>
                  <div className="detail-row-value">{selected.meeting_id}</div>
                </div>
              </div>

              {selected.passcode && (
                <div className="detail-row">
                  <LinkIcon className="detail-row-icon" />
                  <div className="detail-row-content">
                    <div className="detail-row-label">Passcode</div>
                    <div className="detail-row-value">{selected.passcode}</div>
                  </div>
                </div>
              )}
            </div>

            {/* Invite Link */}
            <div className="detail-invite-link">
              <input
                readOnly
                value={`${typeof window !== 'undefined' ? window.location.origin : ''}/meeting/${selected.meeting_id.replace(/ /g, '')}`}
              />
              <button className="detail-invite-copy" onClick={copyInvite}>
                {copiedLink ? (
                  <>
                    <Check /> Copied
                  </>
                ) : (
                  <>
                    <Copy /> Copy
                  </>
                )}
              </button>
            </div>

            {/* Actions */}
            <div className="detail-actions">
              {selected.status !== 'ended' && (
                <button
                  className="detail-action-btn primary"
                  onClick={() =>
                    router.push(
                      `/meeting/${selected.meeting_id.replace(/ /g, '')}`
                    )
                  }
                >
                  {selected.status === 'active' ? 'Join' : 'Start'}
                </button>
              )}

              <button className="detail-action-btn secondary" onClick={copyInvite}>
                Copy Invitation
              </button>

              {selected.status !== 'active' && (
                <button
                  className="detail-action-btn danger"
                  onClick={() => deleteMeeting(selected)}
                >
                  <Trash2 style={{ width: 14, height: 14 }} /> Delete
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
