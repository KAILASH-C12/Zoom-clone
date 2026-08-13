'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Users, Check } from 'lucide-react'
import { Sidebar } from '@/components/sidebar'
import { Topbar } from '@/components/topbar'
import { NewMeetingModal } from '@/components/modals/new-meeting-modal'
import { JoinMeetingModal } from '@/components/modals/join-meeting-modal'
import { ScheduleMeetingModal } from '@/components/modals/schedule-meeting-modal'

type Modal = 'new' | 'join' | 'schedule' | null

export default function JoinPage() {
  const router = useRouter()
  const [meetingId, setMeetingId] = useState('')
  const [displayName, setDisplayName] = useState('Alex Rivera')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [modal, setModal] = useState<Modal>(null)
  const [toast, setToast] = useState('')

  const handleJoin = async () => {
    if (!meetingId.trim()) {
      setError('Please enter a Meeting ID')
      return
    }
    if (!displayName.trim()) {
      setError('Please enter your name')
      return
    }

    setError('')
    setLoading(true)

    let cleanId = meetingId.trim().replace(/\s/g, '')
    const linkMatch = cleanId.match(/meeting\/(\d+)/)
    if (linkMatch) cleanId = linkMatch[1]

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/meetings/${cleanId}`
      )
      if (!res.ok) {
        setError('Meeting not found. Check the Meeting ID and try again.')
        setLoading(false)
        return
      }
      router.push(`/meeting/${cleanId}?name=${encodeURIComponent(displayName)}`)
    } catch {
      router.push(`/meeting/${cleanId}?name=${encodeURIComponent(displayName)}`)
    }
  }

  return (
    <div className="app-shell">
      <Sidebar />
      <div className="app-main-area">
        <Topbar
          onNewMeeting={() => setModal('new')}
          onJoinMeeting={() => setModal('join')}
          onScheduleMeeting={() => setModal('schedule')}
        />
        <main className="app-content">
          <div className="join-page">
            <div className="join-card">
              <div className="join-icon">
                <Users />
              </div>
              <h1>Join a Meeting</h1>
              <p>Enter the meeting ID or invite link to join.</p>

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
                style={{ marginTop: 12 }}
              >
                <Users />
                {loading ? 'Joining...' : 'Join Meeting'}
              </button>
            </div>
          </div>
        </main>
      </div>

      {modal === 'new' && (
        <NewMeetingModal
          onClose={() => setModal(null)}
          onStart={(id) => {
            setModal(null)
            router.push(`/meeting/${id}`)
          }}
        />
      )}

      {modal === 'join' && (
        <JoinMeetingModal
          onClose={() => setModal(null)}
          onJoin={(id, name) => {
            setModal(null)
            router.push(`/meeting/${id}?name=${encodeURIComponent(name)}`)
          }}
        />
      )}

      {modal === 'schedule' && (
        <ScheduleMeetingModal
          onClose={() => setModal(null)}
          onScheduled={() => {
            setModal(null)
            setToast('Meeting scheduled')
            setTimeout(() => setToast(''), 2500)
          }}
        />
      )}

      {toast && (
        <div className="toast">
          <Check /> {toast}
        </div>
      )}
    </div>
  )
}
