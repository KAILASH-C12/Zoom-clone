'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Check } from 'lucide-react'
import { LenisProvider } from '@/components/lenis-provider'
import { LandingPage } from '@/components/landing-page'
import { Sidebar } from '@/components/sidebar'
import { Topbar } from '@/components/topbar'
import { HomeDashboard } from '@/components/home-dashboard'
import { MeetingsList } from '@/components/meetings-list'
import { ChatTab } from '@/components/chat-tab'
import { WhiteboardTab } from '@/components/whiteboard-tab'
import { NewMeetingModal } from '@/components/modals/new-meeting-modal'
import { JoinMeetingModal } from '@/components/modals/join-meeting-modal'
import { ScheduleMeetingModal } from '@/components/modals/schedule-meeting-modal'

type Modal = 'new' | 'join' | 'schedule' | null
type ActiveTab = 'home' | 'meetings' | 'chat' | 'whiteboard'
type ViewMode = 'landing' | 'workspace'

export default function HomePage() {
  const router = useRouter()
  const [viewMode, setViewMode] = useState<ViewMode>('landing')
  const [activeTab, setActiveTab] = useState<ActiveTab>('home')
  const [modal, setModal] = useState<Modal>(null)
  const [toast, setToast] = useState('')

  const showToast = useCallback((msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(''), 2500)
  }, [])

  if (viewMode === 'landing') {
    return (
      <LenisProvider>
        <LandingPage
          onNewMeeting={() => setModal('new')}
          onJoinMeeting={() => setModal('join')}
          onScheduleMeeting={() => setModal('schedule')}
          onGoToApp={() => setViewMode('workspace')}
        />

        {/* Modals */}
        {modal === 'new' && (
          <NewMeetingModal
            onClose={() => setModal(null)}
            onStart={(meetingId) => {
              setModal(null)
              router.push(`/meeting/${meetingId}`)
            }}
          />
        )}

        {modal === 'join' && (
          <JoinMeetingModal
            onClose={() => setModal(null)}
            onJoin={(meetingId, name) => {
              setModal(null)
              router.push(`/meeting/${meetingId}?name=${encodeURIComponent(name)}`)
            }}
          />
        )}

        {modal === 'schedule' && (
          <ScheduleMeetingModal
            onClose={() => setModal(null)}
            onScheduled={() => {
              setModal(null)
              showToast('Meeting scheduled successfully')
            }}
          />
        )}

        {/* Toast */}
        {toast && (
          <div className="toast">
            <Check /> {toast}
          </div>
        )}
      </LenisProvider>
    )
  }

  return (
    <div className="app-shell">
      <Sidebar activeTab={activeTab} onSelectTab={(tab) => setActiveTab(tab as ActiveTab)} />
      <div className="app-main-area">
        <header className="workspace-mode-banner">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Workspace Active Mode</span>
          </div>

          <button
            onClick={() => setViewMode('landing')}
            className="mode-switcher-btn"
          >
            ← View Official Marketing Site
          </button>
        </header>

        <Topbar
          onNewMeeting={() => setModal('new')}
          onJoinMeeting={() => setModal('join')}
          onScheduleMeeting={() => setModal('schedule')}
        />
        <main className="app-content">
          {activeTab === 'home' && (
            <HomeDashboard
              onNewMeeting={() => setModal('new')}
              onJoinMeeting={() => setModal('join')}
              onScheduleMeeting={() => setModal('schedule')}
            />
          )}

          {activeTab === 'meetings' && (
            <MeetingsList
              onNewMeeting={() => setModal('new')}
              onScheduleMeeting={() => setModal('schedule')}
            />
          )}

          {activeTab === 'chat' && <ChatTab />}

          {activeTab === 'whiteboard' && <WhiteboardTab />}
        </main>
      </div>

      {/* Modals */}
      {modal === 'new' && (
        <NewMeetingModal
          onClose={() => setModal(null)}
          onStart={(meetingId) => {
            setModal(null)
            router.push(`/meeting/${meetingId}`)
          }}
        />
      )}

      {modal === 'join' && (
        <JoinMeetingModal
          onClose={() => setModal(null)}
          onJoin={(meetingId, name) => {
            setModal(null)
            router.push(`/meeting/${meetingId}?name=${encodeURIComponent(name)}`)
          }}
        />
      )}

      {modal === 'schedule' && (
        <ScheduleMeetingModal
          onClose={() => setModal(null)}
          onScheduled={() => {
            setModal(null)
            showToast('Meeting scheduled successfully')
          }}
        />
      )}

      {/* Toast */}
      {toast && (
        <div className="toast">
          <Check /> {toast}
        </div>
      )}
    </div>
  )
}


