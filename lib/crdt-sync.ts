/**
 * CRDT State Synchronization Engine (Lamport Clock & LWW-Element-Set)
 * Ensures deterministic ordering & conflict-free state merge across multi-user WebSockets
 */

export interface CRDTParticipant {
  id: string | number
  displayName: string
  role: 'host' | 'participant'
  isMuted: boolean
  hasVideo: boolean
  isSpeaking: boolean
  joinedAt: string
  lamportClock: number
}

export interface CRDTChatMessage {
  id: string | number
  meetingId: string
  senderName: string
  content: string
  timestamp: string
  lamportClock: number
}

export class CRDTStateStore {
  private clock: number = 0
  private participants: Map<string | number, CRDTParticipant> = new Map()
  private chatMessages: Map<string | number, CRDTChatMessage> = new Map()

  constructor() {
    this.clock = 0
  }

  public getClock(): number {
    return this.clock
  }

  public incrementClock(): number {
    this.clock += 1
    return this.clock
  }

  public updateClock(remoteClock: number): number {
    this.clock = Math.max(this.clock, remoteClock) + 1
    return this.clock
  }

  // Merge participant presence with Last-Write-Wins (LWW) timestamp rule
  public mergeParticipant(incoming: CRDTParticipant): boolean {
    this.updateClock(incoming.lamportClock || 0)
    const existing = this.participants.get(incoming.id)

    if (!existing || (incoming.lamportClock || 0) >= (existing.lamportClock || 0)) {
      this.participants.set(incoming.id, incoming)
      return true
    }
    return false
  }

  // Merge bulk participants map from room snapshot
  public mergeParticipants(incomingList: CRDTParticipant[]) {
    incomingList.forEach((p) => this.mergeParticipant(p))
  }

  public removeParticipant(id: string | number) {
    this.participants.delete(id)
  }

  public getSortedParticipants(): CRDTParticipant[] {
    return Array.from(this.participants.values()).sort((a, b) => {
      if (a.role === 'host' && b.role !== 'host') return -1
      if (a.role !== 'host' && b.role === 'host') return 1
      return String(a.id).localeCompare(String(b.id))
    })
  }

  // Merge incoming chat message deterministically by Lamport Clock & Timestamp
  public mergeChatMessage(incoming: CRDTChatMessage): boolean {
    this.updateClock(incoming.lamportClock || 0)
    const existing = this.chatMessages.get(incoming.id)

    if (!existing) {
      this.chatMessages.set(incoming.id, incoming)
      return true
    }
    return false
  }

  public mergeChatMessages(incomingList: CRDTChatMessage[]) {
    incomingList.forEach((m) => this.mergeChatMessage(m))
  }

  public getOrderedChatMessages(): CRDTChatMessage[] {
    return Array.from(this.chatMessages.values()).sort((a, b) => {
      if (a.lamportClock !== b.lamportClock) {
        return a.lamportClock - b.lamportClock
      }
      return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    })
  }
}
