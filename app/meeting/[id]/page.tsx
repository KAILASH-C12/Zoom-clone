'use client'

import { useState, useEffect } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { MeetingRoom } from '@/components/meeting-room'

export default function MeetingRoomPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const { user, isLoaded } = useUser()

  const meetingId = params?.id as string

  // Resolve display name: URL param > Clerk user > localStorage guest > 'Guest'
  const [displayName, setDisplayName] = useState<string>('')

  useEffect(() => {
    const urlName = searchParams?.get('name')
    if (urlName) {
      setDisplayName(urlName)
      return
    }
    if (isLoaded && user) {
      setDisplayName(user.fullName || user.firstName || user.emailAddresses?.[0]?.emailAddress || 'User')
      return
    }
    if (isLoaded && !user) {
      // Guest user
      const guestName = typeof window !== 'undefined'
        ? localStorage.getItem('guest_display_name') || 'Guest'
        : 'Guest'
      setDisplayName(guestName)
    }
  }, [searchParams, user, isLoaded])

  if (!displayName) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#0a0a0f', color: '#fff' }}>
        <p>Joining meeting...</p>
      </div>
    )
  }

  return <MeetingRoom meetingId={meetingId} displayName={displayName} />
}
