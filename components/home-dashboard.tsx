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
  Play,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react'
import type { Meeting } from '@/lib/api'
import { useUser } from '@clerk/nextjs'

interface HomeDashboardProps {
  onNewMeeting: () => void
  onJoinMeeting: () => void
  onScheduleMeeting: () => void
  userDisplayName?: string
}

export function HomeDashboard({
  onNewMeeting,
  onJoinMeeting,
  onScheduleMeeting,
  userDisplayName,
}: HomeDashboardProps) {
  const router = useRouter()
  const [meetings, setMeetings] = useState<{ upcoming: Meeting[]; recent: Meeting[] }>({
    upcoming: [],
    recent: [],
  })
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  // Clerk User Resolution
  let clerkUserName = ''
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const { user } = useUser()
    if (user) {
      clerkUserName = user.firstName || user.fullName || user.username || ''
    }
  } catch {
    // fallback
  }

  const greetingName = userDisplayName || clerkUserName || 'Guest'

  // Live Digital Clock
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

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
      // fallback
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

  const clockString = currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  const dateString = currentTime.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })

  return (
    <div className="dashboard-glass-container">
      {/* Hero Banner with Digital Clock */}
      <div className="dashboard-hero-card">
        <div className="hero-content">
          <div className="hero-badge">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" /> Zoom AI Companion Ready
          </div>
          <h1 className="hero-greeting">Good {getTimeGreeting()}, {greetingName}</h1>
          <p className="hero-subtitle">
            Welcome to your AI-powered Zoom Workplace. Collaborate in HD video calls, real-time whiteboards, and CRDT-synchronized team chat.
          </p>
        </div>

        <div className="hero-clock-widget">
          <div className="clock-time">{clockString}</div>
          <div className="clock-date">{dateString}</div>
        </div>
      </div>

      {/* Quick Launcher Tiles */}
      <div className="action-grid">
        <button className="action-tile launcher-orange" onClick={onNewMeeting}>
          <div className="tile-icon-box">
            <Video />
          </div>
          <div className="tile-details">
            <span className="tile-title">New Meeting</span>
            <span className="tile-desc">Start instant video call</span>
          </div>
        </button>

        <button className="action-tile launcher-blue" onClick={onJoinMeeting}>
          <div className="tile-icon-box">
            <Users />
          </div>
          <div className="tile-details">
            <span className="tile-title">Join Meeting</span>
            <span className="tile-desc">Enter ID or invite code</span>
          </div>
        </button>

        <button className="action-tile launcher-teal" onClick={onScheduleMeeting}>
          <div className="tile-icon-box">
            <Calendar />
          </div>
          <div className="tile-details">
            <span className="tile-title">Schedule</span>
            <span className="tile-desc">Plan upcoming session</span>
          </div>
        </button>

        <button className="action-tile launcher-purple" onClick={onNewMeeting}>
          <div className="tile-icon-box">
            <Monitor />
          </div>
          <div className="tile-details">
            <span className="tile-title">Share Screen</span>
            <span className="tile-desc">Present to room</span>
          </div>
        </button>
      </div>

      {/* Upcoming Meetings Section */}
      <div className="meetings-glass-card">
        <div className="glass-card-header">
          <div className="header-title">
            <Calendar className="w-5 h-5 text-blue-400" />
            <h2>Upcoming Schedule</h2>
          </div>
          <button className="view-all-link" onClick={() => router.push('/meetings')}>
            View All <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {loading ? (
          <div className="glass-empty-state">
            <Clock className="w-8 h-8 text-slate-500 animate-spin" />
            <p>Fetching scheduled meetings...</p>
          </div>
        ) : meetings.upcoming.length === 0 ? (
          <div className="glass-empty-state">
            <Calendar className="w-10 h-10 text-slate-600 mb-2" />
            <p className="text-slate-300 font-medium">No upcoming meetings scheduled</p>
            <p className="text-slate-500 text-xs mt-1">Click Schedule or New Meeting to start a session.</p>
          </div>
        ) : (
          <div className="meetings-glass-list">
            {meetings.upcoming.map((m) => (
              <div
                key={m.meeting_id}
                className="meeting-glass-row"
                onClick={() => goToMeeting(m.meeting_id)}
              >
                <div className="row-time-badge">
                  <span className="row-time">{formatTime(m.start_time)}</span>
                  <span className="row-date">{formatDate(m.start_time)}</span>
                </div>

                <div className="row-info">
                  <div className="row-title-bar">
                    <span className="row-title">{m.title}</span>
                    {m.status === 'active' && (
                      <span className="live-status-pill">
                        <span className="live-dot" /> Live Now
                      </span>
                    )}
                  </div>
                  <div className="row-meta">
                    <span>ID: {m.meeting_id}</span>
                    <span>•</span>
                    <span>{m.duration} Minutes</span>
                    <span>•</span>
                    <span>Encrypted</span>
                  </div>
                </div>

                <div className="row-actions">
                  <button
                    className="row-start-btn"
                    onClick={(e) => {
                      e.stopPropagation()
                      goToMeeting(m.meeting_id)
                    }}
                  >
                    <Play className="w-3.5 h-3.5 fill-current" /> Join
                  </button>

                  <button
                    className="row-copy-btn"
                    onClick={(e) => {
                      e.stopPropagation()
                      copyInvite(m.meeting_id)
                    }}
                    title="Copy invite link"
                  >
                    {copiedId === m.meeting_id ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Meetings */}
      {meetings.recent.length > 0 && (
        <div className="meetings-glass-card mt-6">
          <div className="glass-card-header">
            <div className="header-title">
              <Clock className="w-5 h-5 text-slate-400" />
              <h2>Recent Meetings History</h2>
            </div>
          </div>

          <div className="meetings-glass-list">
            {meetings.recent.map((m) => (
              <div key={m.meeting_id} className="meeting-glass-row ended-row">
                <div className="row-time-badge">
                  <span className="row-time">{formatTime(m.start_time)}</span>
                  <span className="row-date">{formatDate(m.start_time)}</span>
                </div>

                <div className="row-info">
                  <div className="row-title">{m.title}</div>
                  <div className="row-meta">
                    <span>ID: {m.meeting_id}</span>
                    <span>•</span>
                    <span>{m.duration} Minutes</span>
                    <span className="text-slate-500 font-semibold">• Ended</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
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
