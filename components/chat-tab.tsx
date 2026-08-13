'use client'

import { useState, useEffect, useRef } from 'react'
import { useUser } from '@clerk/nextjs'
import { Hash, Plus, Send, Search, UserCheck, Video, X, Link2, ExternalLink } from 'lucide-react'

interface ChatMessage {
  id: string
  author: string
  time: string
  text: string
  avatarColor: string
  type?: 'text' | 'meeting-link'
  meetingId?: string
}

interface Channel {
  id: string
  name: string
  type: 'channel' | 'dm'
  unread?: number
}

const DEFAULT_CHANNELS: Channel[] = [
  { id: 'general', name: 'general', type: 'channel' },
  { id: 'product-design', name: 'product-design', type: 'channel' },
  { id: 'engineering', name: 'engineering', type: 'channel' },
  { id: 'announcements', name: 'announcements', type: 'channel' },
]

const AVATAR_COLORS = ['#0b5cff', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4']

function getAvatarColor(name: string): string {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

function getInitials(name: string): string {
  return name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)
}

// Parse meeting links from text
function parseMeetingLink(text: string): string | null {
  const patterns = [
    /\/meeting\/(\d+)/,
    /meeting\s+id[:\s]*(\d+)/i,
    /^(\d{9,12})$/,
  ]
  for (const p of patterns) {
    const match = text.match(p)
    if (match) return match[1]
  }
  return null
}

export function ChatTab() {
  const { user } = useUser()
  const displayName = user?.fullName
    || user?.firstName
    || (typeof window !== 'undefined' ? localStorage.getItem('guest_display_name') : null)
    || 'Guest'

  const [channels, setChannels] = useState<Channel[]>(DEFAULT_CHANNELS)
  const [activeChannel, setActiveChannel] = useState('general')
  const [channelMessages, setChannelMessages] = useState<Record<string, ChatMessage[]>>({
    general: [
      {
        id: '1',
        author: displayName,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: 'Welcome to the General channel! Share meeting links here to collaborate.',
        avatarColor: getAvatarColor(displayName),
      },
    ],
  })
  const [inputText, setInputText] = useState('')
  const [showNewChannel, setShowNewChannel] = useState(false)
  const [newChannelName, setNewChannelName] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Load persisted messages from localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const saved = localStorage.getItem('chat_messages')
      if (saved) {
        setChannelMessages(JSON.parse(saved))
      }
    } catch { /* ignore */ }
  }, [])

  // Save messages to localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      localStorage.setItem('chat_messages', JSON.stringify(channelMessages))
    } catch { /* ignore */ }
  }, [channelMessages])

  // Auto scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [channelMessages, activeChannel])

  const currentMessages = channelMessages[activeChannel] || []

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputText.trim()) return

    const text = inputText.trim()
    const meetingId = parseMeetingLink(text)

    const newMsg: ChatMessage = {
      id: `${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      author: displayName,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text,
      avatarColor: getAvatarColor(displayName),
      type: meetingId ? 'meeting-link' : 'text',
      meetingId: meetingId || undefined,
    }

    setChannelMessages((prev) => ({
      ...prev,
      [activeChannel]: [...(prev[activeChannel] || []), newMsg],
    }))
    setInputText('')
  }

  const handleShareMeetingLink = () => {
    const meetingId = Math.floor(1000000000 + Math.random() * 9000000000).toString()
    const link = `${window.location.origin}/meeting/${meetingId}`

    const newMsg: ChatMessage = {
      id: `${Date.now()}_link`,
      author: displayName,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: `📹 Join my meeting: ${link}`,
      avatarColor: getAvatarColor(displayName),
      type: 'meeting-link',
      meetingId,
    }

    setChannelMessages((prev) => ({
      ...prev,
      [activeChannel]: [...(prev[activeChannel] || []), newMsg],
    }))
  }

  const handleCreateChannel = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newChannelName.trim()) return
    const id = newChannelName.trim().toLowerCase().replace(/\s+/g, '-')
    if (channels.find((c) => c.id === id)) return

    setChannels((prev) => [...prev, { id, name: id, type: 'channel' }])
    setActiveChannel(id)
    setNewChannelName('')
    setShowNewChannel(false)
  }

  const activeChannelObj = channels.find((c) => c.id === activeChannel)
  const channelDisplayName = activeChannelObj
    ? (activeChannelObj.type === 'channel' ? `# ${activeChannelObj.name}` : activeChannelObj.name)
    : `# ${activeChannel}`

  return (
    <div className="team-chat-container">
      {/* Channel Sidebar */}
      <aside className="chat-channels-sidebar">
        <div className="chat-channels-header">
          <span>Team Chat</span>
          <button
            className="icon-btn-sm"
            title="New Channel"
            onClick={() => setShowNewChannel(!showNewChannel)}
          >
            <Plus style={{ width: 16, height: 16 }} />
          </button>
        </div>

        {/* New Channel Input */}
        {showNewChannel && (
          <form onSubmit={handleCreateChannel} className="new-channel-form">
            <input
              type="text"
              placeholder="channel-name"
              value={newChannelName}
              onChange={(e) => setNewChannelName(e.target.value)}
              autoFocus
              className="new-channel-input"
            />
            <button type="button" onClick={() => setShowNewChannel(false)} className="new-channel-cancel">
              <X style={{ width: 14, height: 14 }} />
            </button>
          </form>
        )}

        <div className="channel-list">
          <div style={{ fontSize: '11px', color: '#94a3b8', padding: '6px 8px', fontWeight: 600, textTransform: 'uppercase' }}>
            Channels
          </div>
          {channels.filter((c) => c.type === 'channel').map((ch) => (
            <div
              key={ch.id}
              className={`channel-item ${activeChannel === ch.id ? 'active' : ''}`}
              onClick={() => setActiveChannel(ch.id)}
            >
              <Hash style={{ width: 16, height: 16 }} />
              <span>{ch.name}</span>
              {ch.unread && ch.unread > 0 && (
                <span className="channel-unread">{ch.unread}</span>
              )}
            </div>
          ))}

          <div style={{ fontSize: '11px', color: '#94a3b8', padding: '16px 8px 6px', fontWeight: 600, textTransform: 'uppercase' }}>
            Direct Messages
          </div>
          {channels.filter((c) => c.type === 'dm').map((ch) => (
            <div
              key={ch.id}
              className={`channel-item ${activeChannel === ch.id ? 'active' : ''}`}
              onClick={() => setActiveChannel(ch.id)}
            >
              <UserCheck style={{ width: 16, height: 16 }} />
              <span>{ch.name}</span>
            </div>
          ))}
        </div>
      </aside>

      {/* Main Chat Area */}
      <div className="chat-main-area">
        <header className="chat-main-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Hash style={{ width: 18, height: 18, color: 'var(--zoom-blue)' }} />
            <span>{channelDisplayName}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              className="chat-share-link-btn"
              title="Share Meeting Link"
              onClick={handleShareMeetingLink}
            >
              <Link2 style={{ width: 16, height: 16 }} />
              <span>Share Link</span>
            </button>
          </div>
        </header>

        <div className="chat-main-messages">
          {currentMessages.length === 0 && (
            <div className="chat-empty-state">
              <MessageSquareIcon />
              <p>No messages yet in {channelDisplayName}</p>
              <p className="chat-empty-hint">Send a message or share a meeting link to get started!</p>
            </div>
          )}
          {currentMessages.map((msg) => (
            <div key={msg.id} className="team-msg-card">
              <div
                className="team-msg-avatar"
                style={{ backgroundColor: msg.avatarColor }}
              >
                {getInitials(msg.author)}
              </div>
              <div className="team-msg-content">
                <div>
                  <span className="team-msg-author">{msg.author}</span>
                  <span className="team-msg-time">{msg.time}</span>
                </div>
                {msg.type === 'meeting-link' && msg.meetingId ? (
                  <div className="meeting-link-card">
                    <div className="meeting-link-card-icon">
                      <Video style={{ width: 20, height: 20, color: '#10b981' }} />
                    </div>
                    <div className="meeting-link-card-info">
                      <span className="meeting-link-card-title">Zoom Meeting</span>
                      <span className="meeting-link-card-id">ID: {msg.meetingId}</span>
                    </div>
                    <a
                      href={`/meeting/${msg.meetingId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="meeting-link-join-btn"
                    >
                      <ExternalLink style={{ width: 14, height: 14 }} />
                      Join
                    </a>
                  </div>
                ) : (
                  <div className="team-msg-text">{renderTextWithLinks(msg.text)}</div>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSend} className="team-chat-input-bar">
          <input
            type="text"
            placeholder={`Message ${channelDisplayName}...`}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />
          <button type="submit" className="chat-send-btn">
            <Send style={{ width: 16, height: 16 }} />
          </button>
        </form>
      </div>
    </div>
  )
}

// Render text with clickable meeting links
function renderTextWithLinks(text: string) {
  // Match URLs
  const urlRegex = /(https?:\/\/[^\s]+|localhost:\d+\/meeting\/\d+)/g
  const parts = text.split(urlRegex)

  return parts.map((part, i) => {
    if (urlRegex.test(part) || /localhost:\d+\/meeting\/\d+/.test(part)) {
      const href = part.startsWith('http') ? part : `http://${part}`
      return (
        <a key={i} href={href} target="_blank" rel="noopener noreferrer" className="chat-link">
          {part}
        </a>
      )
    }
    return part
  })
}

function MessageSquareIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#4a5568" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z" />
    </svg>
  )
}
