'use client'

import { useParams, useSearchParams } from 'next/navigation'
import { MeetingRoom } from '@/components/meeting-room'

export default function MeetingRoomPage() {
  const params = useParams()
  const searchParams = useSearchParams()

  const meetingId = params?.id as string
  const displayName = searchParams?.get('name') || 'Alex Rivera'

  return <MeetingRoom meetingId={meetingId} displayName={displayName} />
}
