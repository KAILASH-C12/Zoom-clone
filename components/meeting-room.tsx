'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  Video,
  Mic,
  MicOff,
  Camera,
  CameraOff,
  MonitorUp,
  Users,
  MessageSquare,
  Hand,
  SmilePlus,
  PhoneOff,
  Copy,
  Lock,
  ShieldCheck,
  MoreHorizontal,
  ChevronUp,
  X,
  UserX,
  Volume2,
  Send,
  VolumeX,
} from 'lucide-react'
import {
  Participant,
  ChatMessage,
  getChatMessages,
  sendChatMessage,
  getWebSocketUrl,
} from '@/lib/api'

const AVATAR_COLORS = ['av-blue', 'av-purple', 'av-teal', 'av-amber', 'av-rose']

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function getAvatarColor(name: string): string {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

interface FloatingReaction {
  id: string
  emoji: string
  sender: string
}

interface MeetingRoomProps {
  meetingId: string
  displayName?: string
}

export function MeetingRoom({ meetingId, displayName = 'Alex Rivera' }: MeetingRoomProps) {
  const router = useRouter()
  const [muted, setMuted] = useState(false)
  const [videoOn, setVideoOn] = useState(true)
  const [isSharing, setIsSharing] = useState(false)
  const [showParticipants, setShowParticipants] = useState(false)
  const [showChat, setShowChat] = useState(false)
  const [showReactions, setShowReactions] = useState(false)
  const [participants, setParticipants] = useState<Participant[]>([])
  const [elapsed, setElapsed] = useState(0)
  const [meetingTitle, setMeetingTitle] = useState('Meeting')
  const [myParticipantId, setMyParticipantId] = useState<number | null>(null)
  const [copiedInvite, setCopiedInvite] = useState(false)

  // Chat state
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [chatInput, setChatInput] = useState('')
  const [unreadCount, setUnreadCount] = useState(0)

  // Reactions state
  const [reactions, setReactions] = useState<FloatingReaction[]>([])

  // Media Refs
  const localVideoRef = useRef<HTMLVideoElement>(null)
  const screenVideoRef = useRef<HTMLVideoElement>(null)
  const mediaStreamRef = useRef<MediaStream | null>(null)
  const screenStreamRef = useRef<MediaStream | null>(null)
  const wsRef = useRef<WebSocket | null>(null)

  const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

  const formattedId =
    meetingId.length >= 10
      ? `${meetingId.slice(0, 3)} ${meetingId.slice(3, 6)} ${meetingId.slice(6)}`
      : meetingId

  // Initialize WebSockets
  useEffect(() => {
    const wsUrl = getWebSocketUrl(meetingId)
    const ws = new WebSocket(wsUrl)
    wsRef.current = ws

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data)

        if (message.type === 'chat_message') {
          setMessages((prev) => [...prev, message.data])
          if (!showChat) {
            setUnreadCount((prev) => prev + 1)
          }
        } else if (message.type === 'reaction') {
          const newReaction: FloatingReaction = {
            id: Date.now().toString() + Math.random(),
            emoji: message.emoji,
            sender: message.sender,
          }
          setReactions((prev) => [...prev, newReaction])
          setTimeout(() => {
            setReactions((prev) => prev.filter((r) => r.id !== newReaction.id))
          }, 2500)
        } else if (message.type === 'mute_all') {
          setMuted(true)
        } else if (message.type === 'participant_update') {
          setParticipants((prev) =>
            prev.map((p) => (p.id === message.participant.id ? message.participant : p))
          )
        }
      } catch {
        // ignore parse error
      }
    }

    return () => {
      ws.close()
    }
  }, [meetingId, showChat])

  // Setup Webcam Media Stream
  useEffect(() => {
    const startCamera = async () => {
      if (videoOn) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { width: 1280, height: 720 },
            audio: true,
          })
          mediaStreamRef.current = stream
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream
          }
        } catch {
          // Camera permission denied or device not found — fallback to tile
        }
      } else {
        if (mediaStreamRef.current) {
          mediaStreamRef.current.getTracks().forEach((track) => track.stop())
          mediaStreamRef.current = null
        }
      }
    }

    startCamera()

    return () => {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop())
      }
    }
  }, [videoOn])

  // Fetch meeting, participants, and chat history
  useEffect(() => {
    const init = async () => {
      try {
        const meetingRes = await fetch(`${apiBase}/api/meetings/${meetingId}`)
        if (meetingRes.ok) {
          const meeting = await meetingRes.json()
          setMeetingTitle(meeting.title)
        }

        const joinRes = await fetch(`${apiBase}/api/meetings/${meetingId}/join`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            meeting_id: meetingId,
            display_name: displayName,
          }),
        })
        if (joinRes.ok) {
          const participant = await joinRes.json()
          setMyParticipantId(participant.id)
        }

        const partRes = await fetch(`${apiBase}/api/meetings/${meetingId}/participants`)
        if (partRes.ok) {
          setParticipants(await partRes.json())
        }

        const chatData = await getChatMessages(meetingId)
        setMessages(chatData)
      } catch {
        // Fallback mock participants
        setParticipants([
          {
            id: 1,
            meeting_id: 0,
            user_id: 1,
            display_name: displayName,
            role: 'host',
            is_muted: false,
            has_video: true,
            joined_at: new Date().toISOString(),
            left_at: null,
          },
          {
            id: 2,
            meeting_id: 0,
            user_id: 2,
            display_name: 'Jordan Kim',
            role: 'participant',
            is_muted: false,
            has_video: true,
            joined_at: new Date().toISOString(),
            left_at: null,
          },
          {
            id: 3,
            meeting_id: 0,
            user_id: 3,
            display_name: 'Priya Shah',
            role: 'participant',
            is_muted: true,
            has_video: false,
            joined_at: new Date().toISOString(),
            left_at: null,
          },
          {
            id: 4,
            meeting_id: 0,
            user_id: 4,
            display_name: 'Sam Wilson',
            role: 'participant',
            is_muted: false,
            has_video: true,
            joined_at: new Date().toISOString(),
            left_at: null,
          },
        ])
        setMyParticipantId(1)
      }
    }

    init()
  }, [meetingId, displayName, apiBase])

  // Timer
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed((prev) => prev + 1)
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const formatElapsed = (seconds: number) => {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }

  const handleLeave = async () => {
    try {
      if (myParticipantId) {
        await fetch(
          `${apiBase}/api/meetings/${meetingId}/leave?participant_id=${myParticipantId}`,
          { method: 'POST' }
        )
      }
    } catch {
      // nav fallback
    }
    router.push('/')
  }

  const handleMuteToggle = async () => {
    const nextMuted = !muted
    setMuted(nextMuted)
    if (myParticipantId) {
      try {
        await fetch(`${apiBase}/api/meetings/${meetingId}/participants/${myParticipantId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ is_muted: nextMuted }),
        })
      } catch {
        // state updated locally
      }
    }
  }

  const handleVideoToggle = async () => {
    const nextVideo = !videoOn
    setVideoOn(nextVideo)
    if (myParticipantId) {
      try {
        await fetch(`${apiBase}/api/meetings/${meetingId}/participants/${myParticipantId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ has_video: nextVideo }),
        })
      } catch {
        // state updated locally
      }
    }
  }

  const handleScreenShare = async () => {
    if (!isSharing) {
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({ video: true })
        screenStreamRef.current = stream
        setIsSharing(true)
        if (screenVideoRef.current) {
          screenVideoRef.current.srcObject = stream
        }
        stream.getVideoTracks()[0].onended = () => {
          setIsSharing(false)
        }
      } catch {
        // user cancelled screen share
      }
    } else {
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach((track) => track.stop())
      }
      setIsSharing(false)
    }
  }

  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!chatInput.trim()) return

    const text = chatInput
    setChatInput('')

    try {
      await sendChatMessage(meetingId, displayName, text)
    } catch {
      // Local fallback
      const localMsg: ChatMessage = {
        id: Date.now(),
        meeting_id: 0,
        sender_name: displayName,
        content: text,
        timestamp: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, localMsg])
    }
  }

  const sendReaction = (emoji: string) => {
    setShowReactions(false)
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: 'reaction',
          emoji,
          sender: displayName,
        })
      )
    } else {
      // Local fallback
      const newReaction: FloatingReaction = {
        id: Date.now().toString(),
        emoji,
        sender: displayName,
      }
      setReactions((prev) => [...prev, newReaction])
      setTimeout(() => {
        setReactions((prev) => prev.filter((r) => r.id !== newReaction.id))
      }, 2500)
    }
  }

  const handleMuteAll = async () => {
    try {
      await fetch(`${apiBase}/api/meetings/${meetingId}/mute-all`, { method: 'POST' })
    } catch {
      // local sync
    }
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'mute_all' }))
    }
    setParticipants((prev) =>
      prev.map((p) => (p.id !== myParticipantId ? { ...p, is_muted: true } : p))
    )
  }

  const handleRemoveParticipant = async (participantId: number) => {
    try {
      await fetch(
        `${apiBase}/api/meetings/${meetingId}/remove-participant?participant_id=${participantId}`,
        { method: 'POST' }
      )
    } catch {
      // local sync
    }
    setParticipants((prev) => prev.filter((p) => p.id !== participantId))
  }

  const copyInvite = () => {
    const link = `${window.location.origin}/meeting/${meetingId}`
    navigator.clipboard?.writeText(link)
    setCopiedInvite(true)
    setTimeout(() => setCopiedInvite(false), 2000)
  }

  const toggleChat = () => {
    setShowChat(!showChat)
    if (!showChat) setUnreadCount(0)
  }

  const gridClass =
    participants.length <= 1
      ? 'grid-1'
      : participants.length === 2
      ? 'grid-2'
      : participants.length <= 4
      ? 'grid-4'
      : 'grid-many'

  return (
    <main className="meeting-room">
      {/* Floating Reaction Animation Overlay */}
      <div className="floating-reaction-container">
        {reactions.map((r) => (
          <div key={r.id} className="floating-emoji">
            {r.emoji}
          </div>
        ))}
      </div>

      {/* Top Bar */}
      <header className="room-topbar">
        <div className="room-brand">
          <div className="room-brand-icon">
            <Video />
          </div>
          <span>zoom</span>
        </div>

        <div className="room-meeting-info">
          <ShieldCheck />
          <span>{meetingTitle}</span>
          <span className="separator">|</span>
          <span>{formattedId}</span>
        </div>

        <div className="room-encryption">
          <Lock />
          <span>Encrypted</span>
        </div>

        <span className="room-timer">{formatElapsed(elapsed)}</span>

        <div className="room-topbar-actions">
          <button className="room-topbar-btn">
            <MoreHorizontal />
          </button>
        </div>
      </header>

      {/* Video Stage */}
      <section className="room-stage">
        {isSharing ? (
          <div className="flex-1 w-full h-full p-4 flex items-center justify-center bg-black">
            <video
              ref={screenVideoRef}
              autoPlay
              playsInline
              className="max-h-full max-w-full rounded-lg shadow-2xl"
            />
          </div>
        ) : (
          <div className={`video-grid ${gridClass}`}>
            {participants.map((p) => {
              const isSelf = p.id === myParticipantId
              const pMuted = isSelf ? muted : p.is_muted
              const pHasVideo = isSelf ? videoOn : p.has_video

              return (
                <div
                  key={p.id}
                  className={`video-tile ${isSelf ? 'self-tile' : ''} ${
                    !pMuted ? 'tile-speaking' : ''
                  }`}
                >
                  {isSelf && videoOn ? (
                    <video
                      ref={localVideoRef}
                      autoPlay
                      playsInline
                      muted
                      className="tile-video-stream"
                    />
                  ) : (
                    <div className={`participant-avatar ${getAvatarColor(p.display_name)}`}>
                      {getInitials(p.display_name)}
                    </div>
                  )}

                  <div className="tile-name">
                    {isSelf && <span className="live-indicator" />}
                    {isSelf ? 'You' : p.display_name}
                  </div>

                  <div className="tile-mic-status">
                    {pMuted ? (
                      <MicOff />
                    ) : (
                      <div className="sound-wave">
                        <span />
                        <span />
                        <span />
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Participants Panel */}
        {showParticipants && (
          <div className="participants-panel">
            <div className="participants-panel-header">
              <h3>Participants ({participants.length})</h3>
              <button
                className="participants-panel-close"
                onClick={() => setShowParticipants(false)}
              >
                <X />
              </button>
            </div>

            {/* Host Controls */}
            <div className="participants-host-controls">
              <button className="host-control-btn" onClick={handleMuteAll}>
                <VolumeX style={{ width: 14, height: 14, marginRight: 4 }} />
                Mute All
              </button>
            </div>

            <div className="participants-list">
              {participants.map((p) => {
                const isSelf = p.id === myParticipantId
                return (
                  <div key={p.id} className="participant-item">
                    <div
                      className={`participant-item-avatar ${getAvatarColor(p.display_name)}`}
                    >
                      {getInitials(p.display_name)}
                    </div>
                    <div className="participant-item-info">
                      <div className="participant-item-name">
                        {p.display_name}
                        {isSelf ? ' (You)' : ''}
                      </div>
                      <div className="participant-item-role">
                        {p.role === 'host' ? 'Host' : 'Participant'}
                      </div>
                    </div>
                    {!isSelf && (
                      <div className="participant-item-actions">
                        <button
                          className={`participant-action-btn ${p.is_muted ? 'muted' : ''}`}
                          title={p.is_muted ? 'Muted' : 'Unmuted'}
                        >
                          {p.is_muted ? <MicOff /> : <Mic />}
                        </button>
                        <button
                          className="participant-action-btn remove"
                          title="Remove participant"
                          onClick={() => handleRemoveParticipant(p.id)}
                        >
                          <UserX />
                        </button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* In-Meeting Chat Drawer */}
        {showChat && (
          <div className="chat-drawer">
            <div className="chat-drawer-header">
              <span>In-Meeting Chat</span>
              <button onClick={() => setShowChat(false)}>
                <X style={{ width: 18, height: 18, color: '#a1a1aa' }} />
              </button>
            </div>

            <div className="chat-drawer-messages">
              {messages.map((m, idx) => {
                const isSelf = m.sender_name === displayName
                return (
                  <div
                    key={m.id || idx}
                    className={`chat-msg-item ${isSelf ? 'self' : ''}`}
                  >
                    <div className="chat-msg-header">
                      <span>{isSelf ? 'You' : m.sender_name}</span>
                      <span>
                        {new Date(m.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <div className="chat-msg-bubble">{m.content}</div>
                  </div>
                )
              })}
            </div>

            <form onSubmit={handleSendChat} className="chat-drawer-footer">
              <input
                type="text"
                className="chat-input"
                placeholder="Type a message..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
              />
              <button type="submit" className="chat-send-btn">
                <Send style={{ width: 16, height: 16 }} />
              </button>
            </form>
          </div>
        )}
      </section>

      {/* Control Bar */}
      <footer className="room-controls">
        <div className="controls-left">
          <button
            className={`control-btn ${muted ? 'active' : ''}`}
            onClick={handleMuteToggle}
          >
            {muted ? <MicOff /> : <Mic />}
            <span>{muted ? 'Unmute' : 'Mute'}</span>
            <ChevronUp className="control-chevron" />
          </button>

          <button
            className={`control-btn ${!videoOn ? 'active' : ''}`}
            onClick={handleVideoToggle}
          >
            {videoOn ? <Camera /> : <CameraOff />}
            <span>{videoOn ? 'Stop Video' : 'Start Video'}</span>
            <ChevronUp className="control-chevron" />
          </button>
        </div>

        <div className="controls-center">
          <button
            className={`control-btn ${isSharing ? 'active' : ''}`}
            onClick={handleScreenShare}
          >
            <MonitorUp />
            <span>{isSharing ? 'Stop Share' : 'Share Screen'}</span>
          </button>

          <button
            className="control-btn"
            onClick={() => setShowParticipants(!showParticipants)}
          >
            <Users />
            <span>Participants</span>
            <span className="badge">{participants.length}</span>
          </button>

          <button className="control-btn" onClick={toggleChat}>
            <MessageSquare />
            <span>Chat</span>
            {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
          </button>

          <button
            className="control-btn"
            onClick={() => setShowReactions(!showReactions)}
          >
            <SmilePlus />
            <span>Reactions</span>
          </button>

          {/* Reactions Popover */}
          {showReactions && (
            <div className="reactions-popover">
              {['👏', '❤️', '👍', '😮', '🎉', '🔥'].map((emoji) => (
                <button
                  key={emoji}
                  className="reaction-btn"
                  onClick={() => sendReaction(emoji)}
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="controls-right">
          <button className="invite-btn" onClick={copyInvite}>
            <Copy />
            {copiedInvite ? 'Copied!' : 'Invite'}
          </button>

          <button className="leave-btn" onClick={handleLeave}>
            <PhoneOff />
            Leave
          </button>
        </div>
      </footer>
    </main>
  )
}
