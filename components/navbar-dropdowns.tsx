'use client'

import { useState } from 'react'
import {
  Video,
  MessageSquare,
  PenTool,
  Sparkles,
  PhoneCall,
  Users,
  Globe,
  Search,
  X,
  Calendar,
  Building,
  GraduationCap,
  HeartPulse,
  Briefcase,
  Check,
} from 'lucide-react'

/* Products Megamenu */
export function ProductsDropdown({ onClose, onSelect }: { onClose: () => void; onSelect: (id: string) => void }) {
  const items = [
    { id: 'meetings', icon: Video, name: 'Zoom Meetings', desc: 'HD video conferencing & screen share', color: '#0b5cff' },
    { id: 'chat', icon: MessageSquare, name: 'Team Chat', desc: 'Channels, messaging & file sharing', color: '#8b5cf6' },
    { id: 'whiteboard', icon: PenTool, name: 'Whiteboard', desc: 'Visual collaboration canvas', color: '#ec4899' },
    { id: 'ai', icon: Sparkles, name: 'AI Companion', desc: 'Smart meeting summaries & note taking', color: '#38bdf8' },
    { id: 'contact', icon: PhoneCall, name: 'Contact Center', desc: 'Omnichannel cloud contact center', color: '#10b981' },
    { id: 'workvivo', icon: Users, name: 'Workvivo', desc: 'Employee communication platform', color: '#f59e0b' },
  ]

  return (
    <div
      style={{
        position: 'absolute',
        top: '48px',
        left: 0,
        width: '480px',
        backgroundColor: '#0f172a',
        border: '1px solid #1e293b',
        borderRadius: '16px',
        boxShadow: '0 25px 50px rgba(0, 0, 0, 0.9)',
        zIndex: 99999,
        padding: '16px',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '12px',
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {items.map((item) => {
        const IconComp = item.icon
        return (
          <button
            key={item.id}
            onClick={() => {
              onSelect(item.id)
              onClose()
            }}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px',
              padding: '10px',
              borderRadius: '10px',
              backgroundColor: 'rgba(30, 41, 59, 0.5)',
              border: '1px solid transparent',
              color: '#ffffff',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(51, 65, 85, 0.8)'
              e.currentTarget.style.borderColor = item.color
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(30, 41, 59, 0.5)'
              e.currentTarget.style.borderColor = 'transparent'
            }}
          >
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                backgroundColor: 'rgba(15, 23, 42, 0.8)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: item.color,
                flexShrink: 0,
              }}
            >
              <IconComp style={{ width: '18px', height: '18px' }} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '13px', color: '#ffffff' }}>{item.name}</div>
              <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px', lineHeight: 1.3 }}>{item.desc}</div>
            </div>
          </button>
        )
      })}
    </div>
  )
}

/* AI Megamenu */
export function AIDropdown({ onClose }: { onClose: () => void }) {
  return (
    <div
      style={{
        position: 'absolute',
        top: '48px',
        left: '80px',
        width: '320px',
        backgroundColor: '#0f172a',
        border: '1px solid #1e293b',
        borderRadius: '16px',
        boxShadow: '0 25px 50px rgba(0, 0, 0, 0.9)',
        zIndex: 99999,
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <div style={{ fontWeight: 700, fontSize: '13px', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '6px' }}>
        <Sparkles style={{ width: '16px', height: '16px', color: '#38bdf8' }} /> AI Companion Capabilities
      </div>
      <div style={{ fontSize: '11px', color: '#94a3b8' }}>
        Included at no extra cost with paid Zoom accounts.
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '6px' }}>
        <div style={{ padding: '8px', backgroundColor: '#1e293b', borderRadius: '8px', fontSize: '12px', color: '#cbd5e1' }}>
          ✨ Auto-generate executive summaries & next steps
        </div>
        <div style={{ padding: '8px', backgroundColor: '#1e293b', borderRadius: '8px', fontSize: '12px', color: '#cbd5e1' }}>
          💬 Real-time meeting chat assistance
        </div>
        <div style={{ padding: '8px', backgroundColor: '#1e293b', borderRadius: '8px', fontSize: '12px', color: '#cbd5e1' }}>
          🌐 Multi-language live translation & captioning
        </div>
      </div>
    </div>
  )
}

/* Solutions Megamenu */
export function SolutionsDropdown({ onClose }: { onClose: () => void }) {
  const solutions = [
    { icon: Building, title: 'Enterprise', desc: 'Scale globally with enterprise security' },
    { icon: GraduationCap, title: 'Education', desc: 'Interactive hybrid learning classrooms' },
    { icon: HeartPulse, title: 'Healthcare', desc: 'HIPAA-compliant virtual telehealth' },
    { icon: Briefcase, title: 'Small Business', desc: 'Flexible video & phone for growing teams' },
  ]

  return (
    <div
      style={{
        position: 'absolute',
        top: '48px',
        left: '160px',
        width: '340px',
        backgroundColor: '#0f172a',
        border: '1px solid #1e293b',
        borderRadius: '16px',
        boxShadow: '0 25px 50px rgba(0, 0, 0, 0.9)',
        zIndex: 99999,
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {solutions.map((s, idx) => {
        const IconComp = s.icon
        return (
          <div
            key={idx}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '8px 10px',
              borderRadius: '8px',
              backgroundColor: 'rgba(30, 41, 59, 0.4)',
              cursor: 'pointer',
            }}
          >
            <IconComp style={{ width: '18px', height: '18px', color: '#60a5fa' }} />
            <div>
              <div style={{ fontWeight: 600, fontSize: '12px', color: '#ffffff' }}>{s.title}</div>
              <div style={{ fontSize: '10px', color: '#94a3b8' }}>{s.desc}</div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

/* Meet Megamenu */
export function MeetDropdown({
  onClose,
  onNewMeeting,
  onJoinMeeting,
  onScheduleMeeting,
}: {
  onClose: () => void
  onNewMeeting: () => void
  onJoinMeeting: () => void
  onScheduleMeeting: () => void
}) {
  return (
    <div
      style={{
        position: 'absolute',
        top: '44px',
        right: '280px',
        width: '220px',
        backgroundColor: '#0f172a',
        border: '1px solid #1e293b',
        borderRadius: '12px',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.9)',
        zIndex: 99999,
        padding: '8px',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <button
        onClick={() => {
          onNewMeeting()
          onClose()
        }}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '8px 12px',
          borderRadius: '8px',
          color: '#ffffff',
          backgroundColor: 'transparent',
          border: 'none',
          cursor: 'pointer',
          fontSize: '12px',
          fontWeight: 600,
          textAlign: 'left',
        }}
      >
        <Video style={{ width: '16px', height: '16px', color: '#3b82f6' }} /> Start New Meeting
      </button>

      <button
        onClick={() => {
          onJoinMeeting()
          onClose()
        }}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '8px 12px',
          borderRadius: '8px',
          color: '#ffffff',
          backgroundColor: 'transparent',
          border: 'none',
          cursor: 'pointer',
          fontSize: '12px',
          fontWeight: 600,
          textAlign: 'left',
        }}
      >
        <Users style={{ width: '16px', height: '16px', color: '#10b981' }} /> Join with ID
      </button>

      <button
        onClick={() => {
          onScheduleMeeting()
          onClose()
        }}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '8px 12px',
          borderRadius: '8px',
          color: '#ffffff',
          backgroundColor: 'transparent',
          border: 'none',
          cursor: 'pointer',
          fontSize: '12px',
          fontWeight: 600,
          textAlign: 'left',
        }}
      >
        <Calendar style={{ width: '16px', height: '16px', color: '#a855f7' }} /> Schedule Meeting
      </button>
    </div>
  )
}

/* Language Dropdown */
export function LanguageDropdown({ onClose }: { onClose: () => void }) {
  const [selected, setSelected] = useState('English')
  const languages = ['English', 'Español', 'Français', 'Deutsch', '日本語', '中文 (简体)']

  return (
    <div
      style={{
        position: 'absolute',
        top: '44px',
        right: '340px',
        width: '160px',
        backgroundColor: '#0f172a',
        border: '1px solid #1e293b',
        borderRadius: '12px',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.9)',
        zIndex: 99999,
        padding: '6px',
        display: 'flex',
        flexDirection: 'column',
        gap: '2px',
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {languages.map((lang) => (
        <button
          key={lang}
          onClick={() => {
            setSelected(lang)
            onClose()
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '6px 10px',
            borderRadius: '6px',
            color: selected === lang ? '#60a5fa' : '#cbd5e1',
            backgroundColor: selected === lang ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
            border: 'none',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: selected === lang ? 600 : 400,
          }}
        >
          <span>{lang}</span>
          {selected === lang && <Check style={{ width: '14px', height: '14px' }} />}
        </button>
      ))}
    </div>
  )
}

/* Search Modal Overlay */
export function SearchModal({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState('')

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-container"
        style={{
          width: '100%',
          maxWidth: '540px',
          backgroundColor: '#0f172a',
          border: '1px solid #1e293b',
          borderRadius: '20px',
          padding: '20px',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.9)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid #1e293b', paddingBottom: '14px' }}>
          <Search style={{ width: '20px', height: '20px', color: '#60a5fa' }} />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search meetings, features, team chat, or docs..."
            style={{
              flex: 1,
              backgroundColor: 'transparent',
              border: 'none',
              color: '#ffffff',
              fontSize: '15px',
              outline: 'none',
            }}
            autoFocus
          />
          <button onClick={onClose} style={{ backgroundColor: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
            <X style={{ width: '18px', height: '18px' }} />
          </button>
        </div>

        <div style={{ paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px', textAlign: 'left' }}>
          <div style={{ fontSize: '11px', fontWeight: 600, color: '#64748b' }}>QUICK SUGGESTIONS</div>
          <div style={{ padding: '8px 12px', backgroundColor: '#1e293b', borderRadius: '8px', fontSize: '13px', color: '#ffffff', cursor: 'pointer' }}>
            📹 Start New Instant HD Video Meeting
          </div>
          <div style={{ padding: '8px 12px', backgroundColor: '#1e293b', borderRadius: '8px', fontSize: '13px', color: '#ffffff', cursor: 'pointer' }}>
            ✨ AI Companion Executive Summary Generator
          </div>
          <div style={{ padding: '8px 12px', backgroundColor: '#1e293b', borderRadius: '8px', fontSize: '13px', color: '#ffffff', cursor: 'pointer' }}>
            💬 Open Team Chat Channels (#general)
          </div>
        </div>
      </div>
    </div>
  )
}
