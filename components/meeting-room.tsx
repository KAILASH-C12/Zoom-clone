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
  SmilePlus,
  PhoneOff,
  Copy,
  Lock,
  ShieldCheck,
  MoreHorizontal,
  ChevronUp,
  X,
  UserX,
  VolumeX,
  Send,
} from 'lucide-react'
import {
  Participant,
  ChatMessage,
  getChatMessages,
  getWebSocketUrl,
} from '@/lib/api'
import { CRDTStateStore, CRDTParticipant, CRDTChatMessage } from '@/lib/crdt-sync'

const AVATAR_COLORS = ['av-blue', 'av-purple', 'av-teal', 'av-amber', 'av-rose']

const RTC_CONFIG: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
}

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

export function MeetingRoom({ meetingId, displayName = 'Guest' }: MeetingRoomProps) {
  const router = useRouter()
  const [muted, setMuted] = useState(false)
  const [videoOn, setVideoOn] = useState(true)
  const [isSharing, setIsSharing] = useState(false)
  const [remoteSharingPeerId, setRemoteSharingPeerId] = useState<string | null>(null)
  const [showParticipants, setShowParticipants] = useState(false)
  const [showChat, setShowChat] = useState(false)
  const [showReactions, setShowReactions] = useState(false)
  const [participants, setParticipants] = useState<CRDTParticipant[]>([])
  const [elapsed, setElapsed] = useState(0)
  const [meetingTitle, setMeetingTitle] = useState('Meeting')
  const [myParticipantId] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      let sessionPeerId = sessionStorage.getItem(`peer_id_${meetingId}`)
      if (!sessionPeerId) {
        sessionPeerId = `peer_${Date.now()}_${Math.floor(Math.random() * 100000)}`
        sessionStorage.setItem(`peer_id_${meetingId}`, sessionPeerId)
      }
      return sessionPeerId
    }
    return `peer_${Date.now()}_${Math.floor(Math.random() * 100000)}`
  })
  const [copiedInvite, setCopiedInvite] = useState(false)

  // Chat state
  const [messages, setMessages] = useState<CRDTChatMessage[]>([])
  const [chatInput, setChatInput] = useState('')
  const [unreadCount, setUnreadCount] = useState(0)

  // Reactions state
  const [reactions, setReactions] = useState<FloatingReaction[]>([])

  // Remote streams state — triggers re-render when remote video arrives
  const [remoteStreamMap, setRemoteStreamMap] = useState<Map<string, MediaStream>>(new Map())

  // CRDT Engine Ref
  const crdtStoreRef = useRef<CRDTStateStore>(new CRDTStateStore())

  // Media Refs
  const localVideoRef = useRef<HTMLVideoElement>(null)
  const mediaStreamRef = useRef<MediaStream | null>(null)
  const screenStreamRef = useRef<MediaStream | null>(null)
  const wsRef = useRef<WebSocket | null>(null)

  // WebRTC Peer Connections: remotePeerId -> RTCPeerConnection
  const peerConnectionsRef = useRef<Map<string, RTCPeerConnection>>(new Map())
  // Remote MediaStreams: remotePeerId -> MediaStream
  const remoteStreamsRef = useRef<Map<string, MediaStream>>(new Map())

  // Track whether we've already created an offer to avoid duplicates
  const pendingOffersRef = useRef<Set<string>>(new Set())

  // Refs for current muted/videoOn/showChat state (avoids stale closures in WS handler)
  const mutedRef = useRef(muted)
  const videoOnRef = useRef(videoOn)
  const showChatRef = useRef(showChat)
  const isSharingRef = useRef(isSharing)

  useEffect(() => { mutedRef.current = muted }, [muted])
  useEffect(() => { videoOnRef.current = videoOn }, [videoOn])
  useEffect(() => { showChatRef.current = showChat }, [showChat])
  useEffect(() => { isSharingRef.current = isSharing }, [isSharing])

  const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

  const formattedId =
    meetingId.length >= 10
      ? `${meetingId.slice(0, 3)} ${meetingId.slice(3, 6)} ${meetingId.slice(6)}`
      : meetingId

  // ── Helper: Create a WebRTC PeerConnection for a remote peer ──────────────
  const createPeerConnection = useCallback(
    (remotePeerId: string): RTCPeerConnection => {
      // If we already have one, return it
      const existing = peerConnectionsRef.current.get(remotePeerId)
      if (existing && existing.connectionState !== 'closed' && existing.connectionState !== 'failed') {
        return existing
      }

      const pc = new RTCPeerConnection(RTC_CONFIG)

      // Add local tracks to the connection
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => {
          pc.addTrack(track, mediaStreamRef.current!)
        })
      }

      // Handle incoming remote tracks
      pc.ontrack = (event) => {
        let remoteStream = remoteStreamsRef.current.get(remotePeerId)
        if (!remoteStream) {
          remoteStream = new MediaStream()
          remoteStreamsRef.current.set(remotePeerId, remoteStream)
        }
        event.streams[0]?.getTracks().forEach((track) => {
          if (!remoteStream!.getTracks().find((t) => t.id === track.id)) {
            remoteStream!.addTrack(track)
          }
        })
        // Trigger React re-render with new stream map
        setRemoteStreamMap(new Map(remoteStreamsRef.current))
      }

      // Handle ICE candidates — send them to the remote peer via WebSocket
      pc.onicecandidate = (event) => {
        if (event.candidate && wsRef.current?.readyState === WebSocket.OPEN) {
          wsRef.current.send(
            JSON.stringify({
              type: 'webrtc_ice',
              candidate: event.candidate.toJSON(),
              sender: myParticipantId,
              target: remotePeerId,
            })
          )
        }
      }

      pc.onconnectionstatechange = () => {
        if (pc.connectionState === 'failed' || pc.connectionState === 'closed') {
          peerConnectionsRef.current.delete(remotePeerId)
          remoteStreamsRef.current.delete(remotePeerId)
          setRemoteStreamMap(new Map(remoteStreamsRef.current))
        }
      }

      peerConnectionsRef.current.set(remotePeerId, pc)
      return pc
    },
    [myParticipantId]
  )

  // ── Helper: Initiate offer to a remote peer ───────────────────────────────
  const initiateOffer = useCallback(
    async (remotePeerId: string) => {
      if (pendingOffersRef.current.has(remotePeerId)) return
      pendingOffersRef.current.add(remotePeerId)

      try {
        const pc = createPeerConnection(remotePeerId)
        const offer = await pc.createOffer()
        await pc.setLocalDescription(offer)

        if (wsRef.current?.readyState === WebSocket.OPEN) {
          wsRef.current.send(
            JSON.stringify({
              type: 'webrtc_offer',
              sdp: offer.sdp,
              sender: myParticipantId,
              target: remotePeerId,
            })
          )
        }
      } catch {
        // Offer failed
      } finally {
        pendingOffersRef.current.delete(remotePeerId)
      }
    },
    [createPeerConnection, myParticipantId]
  )

  // ── Setup Webcam Media Stream ─────────────────────────────────────────────
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
          // Camera fallback — try audio only
          try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
            mediaStreamRef.current = stream
          } catch {
            // No media available
          }
        }
      } else {
        // Stop video tracks but keep audio
        if (mediaStreamRef.current) {
          mediaStreamRef.current.getVideoTracks().forEach((track) => track.stop())
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

  // ── Initialize WebSockets with CRDT State Synchronization ─────────────────
  useEffect(() => {
    const wsUrl = getWebSocketUrl(meetingId)
    const ws = new WebSocket(wsUrl)
    wsRef.current = ws

    ws.onopen = () => {
      // Announce self presence via CRDT
      const myPresence: CRDTParticipant = {
        id: myParticipantId,
        displayName,
        role: 'participant',
        isMuted: mutedRef.current,
        hasVideo: videoOnRef.current,
        isSpeaking: false,
        joinedAt: new Date().toISOString(),
        lamportClock: crdtStoreRef.current.incrementClock(),
      }

      crdtStoreRef.current.mergeParticipant(myPresence)
      setParticipants(crdtStoreRef.current.getSortedParticipants())

      ws.send(
        JSON.stringify({
          type: 'join_presence',
          participant: myPresence,
        })
      )
    }

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data)

        if (message.type === 'room_sync') {
          // Merge full room snapshot
          const incomingParts: CRDTParticipant[] = message.data?.participants || []
          const incomingMsgs: CRDTChatMessage[] = message.data?.messages || []

          crdtStoreRef.current.mergeParticipants(incomingParts)
          crdtStoreRef.current.mergeChatMessages(incomingMsgs)

          setParticipants(crdtStoreRef.current.getSortedParticipants())
          setMessages(crdtStoreRef.current.getOrderedChatMessages())

          // Initiate WebRTC offers to all existing participants
          incomingParts.forEach((p) => {
            const pid = String(p.id)
            if (pid !== myParticipantId) {
              // Use deterministic ordering: lower ID creates the offer
              if (myParticipantId < pid) {
                initiateOffer(pid)
              }
            }
          })
        } else if (message.type === 'presence_sync') {
          // Merge participant presence updates from other peers
          if (Array.isArray(message.all_participants)) {
            crdtStoreRef.current.mergeParticipants(message.all_participants)
          } else if (message.participant) {
            crdtStoreRef.current.mergeParticipant(message.participant)
          }
          setParticipants(crdtStoreRef.current.getSortedParticipants())

          // If a new peer joined, initiate WebRTC connection
          if (message.participant) {
            const remotePeerId = String(message.participant.id)
            if (remotePeerId !== myParticipantId) {
              // Deterministic: lower ID creates the offer
              if (myParticipantId < remotePeerId) {
                initiateOffer(remotePeerId)
              }
            }
          }
        } else if (message.type === 'peer_left') {
          const leftId = message.participant_id
          if (leftId) {
            crdtStoreRef.current.removeParticipant(leftId)
            setParticipants(crdtStoreRef.current.getSortedParticipants())

            // Clean up WebRTC connection
            const pc = peerConnectionsRef.current.get(leftId)
            if (pc) {
              pc.close()
              peerConnectionsRef.current.delete(leftId)
            }
            remoteStreamsRef.current.delete(leftId)
            setRemoteStreamMap(new Map(remoteStreamsRef.current))

            // If this peer was sharing screen, clear it
            setRemoteSharingPeerId((prev) => (prev === leftId ? null : prev))
          }
        } else if (message.type === 'chat_message') {
          const incomingMsg = message.data
          if (incomingMsg) {
            crdtStoreRef.current.mergeChatMessage({
              id: incomingMsg.id || Date.now(),
              meetingId: incomingMsg.meetingId || meetingId,
              senderName: incomingMsg.senderName || incomingMsg.sender_name || 'User',
              content: incomingMsg.content || '',
              timestamp: incomingMsg.timestamp || new Date().toISOString(),
              lamportClock: incomingMsg.lamportClock || crdtStoreRef.current.incrementClock(),
            })
            setMessages(crdtStoreRef.current.getOrderedChatMessages())
            if (!showChatRef.current) {
              setUnreadCount((prev) => prev + 1)
            }
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

        // ── WebRTC Signaling Handlers ────────────────────────────────────────
        } else if (message.type === 'webrtc_offer') {
          const senderPeerId = message.sender
          if (senderPeerId && senderPeerId !== myParticipantId) {
            handleWebRTCOffer(senderPeerId, message.sdp)
          }
        } else if (message.type === 'webrtc_answer') {
          const senderPeerId = message.sender
          if (senderPeerId && senderPeerId !== myParticipantId) {
            handleWebRTCAnswer(senderPeerId, message.sdp)
          }
        } else if (message.type === 'webrtc_ice') {
          const senderPeerId = message.sender
          if (senderPeerId && senderPeerId !== myParticipantId) {
            handleWebRTCIce(senderPeerId, message.candidate)
          }

        // ── Screen Share Events ──────────────────────────────────────────────
        } else if (message.type === 'screen_share_started') {
          setRemoteSharingPeerId(message.participantId || null)
        } else if (message.type === 'screen_share_stopped') {
          setRemoteSharingPeerId((prev) =>
            prev === message.participantId ? null : prev
          )
        }
      } catch {
        // ignore parse error
      }
    }

    // ── WebRTC signal handlers (closures over ws and refs) ──────────────────

    async function handleWebRTCOffer(senderPeerId: string, sdp: string) {
      const pc = createPeerConnection(senderPeerId)
      await pc.setRemoteDescription(new RTCSessionDescription({ type: 'offer', sdp }))
      const answer = await pc.createAnswer()
      await pc.setLocalDescription(answer)

      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({
            type: 'webrtc_answer',
            sdp: answer.sdp,
            sender: myParticipantId,
            target: senderPeerId,
          })
        )
      }
    }

    async function handleWebRTCAnswer(senderPeerId: string, sdp: string) {
      const pc = peerConnectionsRef.current.get(senderPeerId)
      if (pc && pc.signalingState === 'have-local-offer') {
        await pc.setRemoteDescription(new RTCSessionDescription({ type: 'answer', sdp }))
      }
    }

    async function handleWebRTCIce(senderPeerId: string, candidate: RTCIceCandidateInit) {
      const pc = peerConnectionsRef.current.get(senderPeerId)
      if (pc && candidate) {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(candidate))
        } catch {
          // ICE candidate error
        }
      }
    }

    return () => {
      ws.close()
      // Clean up all peer connections on unmount
      peerConnectionsRef.current.forEach((pc) => pc.close())
      peerConnectionsRef.current.clear()
      remoteStreamsRef.current.clear()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [meetingId, displayName, myParticipantId])

  // Fetch meeting & initial chat state
  useEffect(() => {
    const init = async () => {
      try {
        const meetingRes = await fetch(`${apiBase}/api/meetings/${meetingId}`)
        if (meetingRes.ok) {
          const meeting = await meetingRes.json()
          setMeetingTitle(meeting.title)
        }

        const chatData = await getChatMessages(meetingId)
        if (Array.isArray(chatData)) {
          const formattedMsgs: CRDTChatMessage[] = chatData.map((m: any, idx: number) => ({
            id: m.id || idx,
            meetingId,
            senderName: m.sender_name || 'User',
            content: m.content || '',
            timestamp: m.timestamp || new Date().toISOString(),
            lamportClock: idx + 1,
          }))
          crdtStoreRef.current.mergeChatMessages(formattedMsgs)
          setMessages(crdtStoreRef.current.getOrderedChatMessages())
        }
      } catch {
        // use default state
      }

      // Ensure local user is always present in CRDT store
      const selfParticipant: CRDTParticipant = {
        id: myParticipantId,
        displayName,
        role: 'host',
        isMuted: false,
        hasVideo: true,
        isSpeaking: false,
        joinedAt: new Date().toISOString(),
        lamportClock: 1,
      }
      crdtStoreRef.current.mergeParticipant(selfParticipant)

      setParticipants(crdtStoreRef.current.getSortedParticipants())
    }

    init()
  }, [meetingId, displayName, myParticipantId, apiBase])

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

  const broadcastPresenceUpdate = (updatedMuted: boolean, updatedVideo: boolean) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      const updatedP: CRDTParticipant = {
        id: myParticipantId,
        displayName,
        role: 'host',
        isMuted: updatedMuted,
        hasVideo: updatedVideo,
        isSpeaking: false,
        joinedAt: new Date().toISOString(),
        lamportClock: crdtStoreRef.current.incrementClock(),
      }
      crdtStoreRef.current.mergeParticipant(updatedP)
      setParticipants(crdtStoreRef.current.getSortedParticipants())

      wsRef.current.send(
        JSON.stringify({
          type: 'presence_update',
          participant: updatedP,
        })
      )
    }
  }

  const handleLeave = () => {
    // Close all peer connections
    peerConnectionsRef.current.forEach((pc) => pc.close())
    peerConnectionsRef.current.clear()
    remoteStreamsRef.current.clear()
    router.push('/')
  }

  const handleMuteToggle = () => {
    const nextMuted = !muted
    setMuted(nextMuted)
    // Mute/unmute audio tracks
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = !nextMuted
      })
    }
    broadcastPresenceUpdate(nextMuted, videoOn)
  }

  const handleVideoToggle = () => {
    const nextVideo = !videoOn
    setVideoOn(nextVideo)
    broadcastPresenceUpdate(muted, nextVideo)
  }

  const handleScreenShare = async () => {
    if (!isSharing) {
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({ video: true })
        screenStreamRef.current = stream
        setIsSharing(true)

        const screenTrack = stream.getVideoTracks()[0]

        // Replace the video track on all peer connections with the screen track
        peerConnectionsRef.current.forEach((pc) => {
          const videoSender = pc.getSenders().find((s) => s.track?.kind === 'video')
          if (videoSender) {
            videoSender.replaceTrack(screenTrack)
          }
        })

        // Notify other participants
        if (wsRef.current?.readyState === WebSocket.OPEN) {
          wsRef.current.send(
            JSON.stringify({
              type: 'screen_share_started',
              participantId: myParticipantId,
            })
          )
        }

        // Show screen locally
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream
        }

        screenTrack.onended = () => {
          stopScreenShare()
        }
      } catch {
        // user cancelled
      }
    } else {
      stopScreenShare()
    }
  }

  const stopScreenShare = () => {
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach((track) => track.stop())
      screenStreamRef.current = null
    }
    setIsSharing(false)

    // Revert video track on all peer connections back to camera
    if (mediaStreamRef.current) {
      const cameraTrack = mediaStreamRef.current.getVideoTracks()[0]
      if (cameraTrack) {
        peerConnectionsRef.current.forEach((pc) => {
          const videoSender = pc.getSenders().find((s) => s.track?.kind === 'video')
          if (videoSender) {
            videoSender.replaceTrack(cameraTrack)
          }
        })
      }
      // Restore local preview
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = mediaStreamRef.current
      }
    }

    // Notify other participants
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: 'screen_share_stopped',
          participantId: myParticipantId,
        })
      )
    }
  }

  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!chatInput.trim()) return

    const text = chatInput
    setChatInput('')

    const newMsg: CRDTChatMessage = {
      id: `${myParticipantId}_${Date.now()}`,
      meetingId,
      senderName: displayName,
      content: text,
      timestamp: new Date().toISOString(),
      lamportClock: crdtStoreRef.current.incrementClock(),
    }

    crdtStoreRef.current.mergeChatMessage(newMsg)
    setMessages(crdtStoreRef.current.getOrderedChatMessages())

    // Send via WebSocket only (no HTTP POST to avoid double broadcast)
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: 'chat_message',
          data: newMsg,
        })
      )
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
    }
    const newReaction: FloatingReaction = {
      id: Date.now().toString() + Math.random(),
      emoji,
      sender: displayName,
    }
    setReactions((prev) => [...prev, newReaction])
    setTimeout(() => {
      setReactions((prev) => prev.filter((r) => r.id !== newReaction.id))
    }, 2500)
  }

  const handleMuteAll = () => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'mute_all' }))
    }
    const currentList = crdtStoreRef.current.getSortedParticipants()
    currentList.forEach((p) => {
      if (p.id !== myParticipantId) {
        p.isMuted = true
      }
    })
    setParticipants([...currentList])
  }

  const handleRemoveParticipant = (participantId: string | number) => {
    crdtStoreRef.current.removeParticipant(participantId)
    setParticipants(crdtStoreRef.current.getSortedParticipants())
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
        {/* If someone else is sharing screen, show their stream prominently */}
        {remoteSharingPeerId && !isSharing ? (
          <div className="screen-share-view">
            <RemoteVideo
              peerId={remoteSharingPeerId}
              stream={remoteStreamMap.get(remoteSharingPeerId) || null}
              label="Screen Share"
              isScreenShare
            />
            {/* Small self-view in corner */}
            <div className="self-pip">
              {videoOn ? (
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="tile-video-stream"
                />
              ) : (
                <div className={`participant-avatar ${getAvatarColor(displayName)}`}>
                  {getInitials(displayName)}
                </div>
              )}
              <div className="tile-name">
                <span className="live-indicator" />
                You
              </div>
            </div>
          </div>
        ) : isSharing ? (
          <div className="screen-share-view">
            <div className="screen-share-main">
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="tile-video-stream"
              />
              <div className="tile-name">
                <span className="live-indicator" />
                You (Screen Share)
              </div>
            </div>
          </div>
        ) : (
          <div className={`video-grid ${gridClass}`}>
            {participants.map((p) => {
              const isSelf = String(p.id) === myParticipantId
              const pMuted = isSelf ? muted : p.isMuted
              const pHasVideo = isSelf ? videoOn : p.hasVideo
              const remoteStream = !isSelf
                ? remoteStreamMap.get(String(p.id)) || null
                : null

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
                  ) : !isSelf && remoteStream ? (
                    <RemoteVideo
                      peerId={String(p.id)}
                      stream={remoteStream}
                      label={p.displayName}
                    />
                  ) : (
                    <div className={`participant-avatar ${getAvatarColor(p.displayName)}`}>
                      {getInitials(p.displayName)}
                    </div>
                  )}

                  <div className="tile-name">
                    {isSelf && <span className="live-indicator" />}
                    {isSelf ? 'You' : p.displayName}
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
                const isSelf = String(p.id) === myParticipantId
                return (
                  <div key={p.id} className="participant-item">
                    <div
                      className={`participant-item-avatar ${getAvatarColor(p.displayName)}`}
                    >
                      {getInitials(p.displayName)}
                    </div>
                    <div className="participant-item-info">
                      <div className="participant-item-name">
                        {p.displayName}
                        {isSelf ? ' (You)' : ''}
                      </div>
                      <div className="participant-item-role">
                        {p.role === 'host' ? 'Host' : 'Participant'}
                      </div>
                    </div>
                    {!isSelf && (
                      <div className="participant-item-actions">
                        <button
                          className={`participant-action-btn ${p.isMuted ? 'muted' : ''}`}
                          title={p.isMuted ? 'Muted' : 'Unmuted'}
                        >
                          {p.isMuted ? <MicOff /> : <Mic />}
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
                const isSelf = m.senderName === displayName
                return (
                  <div
                    key={m.id || idx}
                    className={`chat-msg-item ${isSelf ? 'self' : ''}`}
                  >
                    <div className="chat-msg-header">
                      <span>{isSelf ? 'You' : m.senderName}</span>
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

// ── Remote Video Component ──────────────────────────────────────────────────
// Renders a <video> element that auto-attaches a remote MediaStream

function RemoteVideo({
  peerId,
  stream,
  label,
  isScreenShare = false,
}: {
  peerId: string
  stream: MediaStream | null
  label: string
  isScreenShare?: boolean
}) {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream
    }
  }, [stream])

  if (!stream) {
    return (
      <div className={`participant-avatar ${getAvatarColor(label)}`}>
        {getInitials(label)}
      </div>
    )
  }

  return (
    <video
      ref={videoRef}
      autoPlay
      playsInline
      className={isScreenShare ? 'screen-share-video' : 'tile-video-stream'}
    />
  )
}
