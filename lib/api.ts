/**
 * API client — all backend communication goes through this module.
 * Uses fetch with the FastAPI backend at localhost:8000.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function request<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...options?.headers },
    ...options,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(error.detail || `Request failed: ${res.status}`);
  }

  return res.json();
}

// ── Types ────────────────────────────────────────────────────────────────────

export interface User {
  id: number;
  display_name: string;
  email: string;
  avatar_url: string | null;
  is_default: boolean;
  created_at: string;
}

export interface Meeting {
  id: number;
  meeting_id: string;
  title: string;
  description: string | null;
  host_id: number;
  meeting_type: "instant" | "scheduled";
  status: "upcoming" | "active" | "ended";
  start_time: string | null;
  end_time: string | null;
  duration: number | null;
  invite_link: string | null;
  passcode: string | null;
  created_at: string;
  updated_at: string;
  host?: User;
  participant_count?: number;
}

export interface MeetingList {
  upcoming: Meeting[];
  recent: Meeting[];
}

export interface Participant {
  id: number;
  meeting_id: number;
  user_id: number | null;
  display_name: string;
  role: "host" | "participant";
  is_muted: boolean;
  has_video: boolean;
  joined_at: string;
  left_at: string | null;
}

export interface MeetingCreateData {
  title?: string;
  description?: string;
  meeting_type?: "instant" | "scheduled";
  start_time?: string;
  duration?: number;
  passcode?: string;
}

// ── User API ─────────────────────────────────────────────────────────────────

export async function getCurrentUser(): Promise<User> {
  return request<User>("/api/users/me");
}

// ── Meeting API ──────────────────────────────────────────────────────────────

export async function createMeeting(data: MeetingCreateData = {}): Promise<Meeting> {
  return request<Meeting>("/api/meetings", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getMeetings(): Promise<MeetingList> {
  return request<MeetingList>("/api/meetings");
}

export async function getMeeting(meetingId: string): Promise<Meeting> {
  return request<Meeting>(`/api/meetings/${meetingId}`);
}

export async function deleteMeeting(meetingId: string): Promise<void> {
  return request(`/api/meetings/${meetingId}`, { method: "DELETE" });
}

export async function endMeeting(meetingId: string): Promise<void> {
  return request(`/api/meetings/${meetingId}/end`, { method: "POST" });
}

// ── Participant API ──────────────────────────────────────────────────────────

export async function joinMeeting(
  meetingId: string,
  displayName: string
): Promise<Participant> {
  return request<Participant>(`/api/meetings/${meetingId}/join`, {
    method: "POST",
    body: JSON.stringify({ meeting_id: meetingId, display_name: displayName }),
  });
}

export async function leaveMeeting(
  meetingId: string,
  participantId: number
): Promise<void> {
  return request(`/api/meetings/${meetingId}/leave?participant_id=${participantId}`, {
    method: "POST",
  });
}

export async function getParticipants(meetingId: string): Promise<Participant[]> {
  return request<Participant[]>(`/api/meetings/${meetingId}/participants`);
}

export async function updateParticipant(
  meetingId: string,
  participantId: number,
  data: { is_muted?: boolean; has_video?: boolean }
): Promise<Participant> {
  return request<Participant>(
    `/api/meetings/${meetingId}/participants/${participantId}`,
    { method: "PUT", body: JSON.stringify(data) }
  );
}

export async function muteAll(meetingId: string): Promise<void> {
  return request(`/api/meetings/${meetingId}/mute-all`, { method: "POST" });
}

export async function removeParticipant(
  meetingId: string,
  participantId: number
): Promise<void> {
  return request(
    `/api/meetings/${meetingId}/remove-participant?participant_id=${participantId}`,
    { method: "POST" }
  );
}

// ── Chat & WebSocket API ──────────────────────────────────────────────────────

export interface ChatMessage {
  id: number;
  meeting_id: number;
  sender_name: string;
  sender_id?: number | null;
  content: string;
  timestamp: string;
}

export async function getChatMessages(meetingId: string): Promise<ChatMessage[]> {
  return request<ChatMessage[]>(`/api/meetings/${meetingId}/messages`);
}

export async function sendChatMessage(
  meetingId: string,
  senderName: string,
  content: string
): Promise<ChatMessage> {
  return request<ChatMessage>(`/api/meetings/${meetingId}/messages`, {
    method: "POST",
    body: JSON.stringify({ sender_name: senderName, content }),
  });
}

export function getWebSocketUrl(meetingId: string): string {
  const cleanId = meetingId.replace(/\s+/g, "");
  const base = API_BASE.replace(/^http/, "ws");
  return `${base}/ws/meeting/${cleanId}`;
}

