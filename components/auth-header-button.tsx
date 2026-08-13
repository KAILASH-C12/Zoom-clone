'use client'

import { useState, useRef, useEffect } from 'react'
import { useUser, UserButton } from '@clerk/nextjs'
import Link from 'next/link'
import { User, LogOut, ShieldCheck, ChevronDown, UserCheck } from 'lucide-react'
import { UserProfileModal } from './modals/user-profile-modal'

interface AuthHeaderButtonProps {
  onGuestLogin?: () => void
}

export function AuthHeaderButton({ onGuestLogin }: AuthHeaderButtonProps) {
  const clerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
  const isClerkConfigured =
    clerkKey &&
    clerkKey.trim() !== '' &&
    !clerkKey.includes('YOUR_CLERK_PUBLISHABLE_KEY')

  const [isGuest, setIsGuest] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [showProfileModal, setShowProfileModal] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  let userState: { isSignedIn?: boolean; user?: any } = { isSignedIn: false }
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const { isSignedIn, user } = useUser()
    userState = { isSignedIn: Boolean(isSignedIn), user }
  } catch {
    // fallback
  }

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false)
      }
    }
    if (showDropdown) {
      document.addEventListener('mousedown', handleClick)
    }
    return () => document.removeEventListener('mousedown', handleClick)
  }, [showDropdown])

  const handleSignOut = () => {
    setShowDropdown(false)
    setIsGuest(false)
    window.location.href = '/'
  }

  const handleEnterGuestMode = () => {
    setIsGuest(true)
    if (onGuestLogin) onGuestLogin()
  }

  if (isClerkConfigured && userState.isSignedIn) {
    return <UserButton afterSignOutUrl="/" />
  }

  // If signed out and not guest mode, show Sign In, Sign Up, and Guest Login
  if (!userState.isSignedIn && !isGuest) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <button
          onClick={handleEnterGuestMode}
          style={{
            fontSize: '12px',
            fontWeight: 600,
            padding: '6px 14px',
            borderRadius: '20px',
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            color: '#cbd5e1',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          <UserCheck style={{ width: '13px', height: '13px' }} /> Continue as Guest
        </button>

        <Link
          href="/sign-in"
          style={{
            fontSize: '12px',
            fontWeight: 600,
            padding: '6px 14px',
            borderRadius: '20px',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            color: '#ffffff',
            textDecoration: 'none',
          }}
        >
          Sign In
        </Link>

        <Link
          href="/sign-up"
          style={{
            fontSize: '12px',
            fontWeight: 600,
            padding: '6px 16px',
            borderRadius: '20px',
            backgroundColor: '#0b5cff',
            color: '#ffffff',
            textDecoration: 'none',
          }}
        >
          Sign Up Free
        </Link>
      </div>
    )
  }

  // Active Profile Dropdown Menu (Guest or Demo User)
  const currentName = isGuest ? 'Guest User' : 'Alex Rivera'
  const currentEmail = isGuest ? 'guest@zoom-demo.local' : 'alex.rivera@example.com'
  const currentBadge = isGuest ? 'Guest Access' : 'Online · Pro'
  const currentInitials = isGuest ? 'GU' : 'AR'

  return (
    <div style={{ position: 'relative', display: 'inline-block' }} ref={dropdownRef}>
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '4px 10px 4px 4px',
          borderRadius: '24px',
          backgroundColor: 'rgba(255, 255, 255, 0.08)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          cursor: 'pointer',
        }}
      >
        <div
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            backgroundColor: isGuest ? '#64748b' : '#0b5cff',
            color: '#ffffff',
            fontWeight: 'bold',
            fontSize: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          {currentInitials}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', textAlign: 'left' }}>
          <span style={{ fontSize: '12px', fontWeight: 700, color: '#ffffff', lineHeight: 1.2, whiteSpace: 'nowrap' }}>
            {currentName}
          </span>
          <span style={{ fontSize: '10px', fontWeight: 600, color: isGuest ? '#cbd5e1' : '#34d399', lineHeight: 1.1, whiteSpace: 'nowrap' }}>
            {currentBadge}
          </span>
        </div>
        <ChevronDown style={{ width: '14px', height: '14px', color: '#94a3b8', flexShrink: 0 }} />
      </button>

      {/* Profile Dropdown Menu */}
      {showDropdown && (
        <div
          style={{
            position: 'absolute',
            right: 0,
            top: '44px',
            width: '230px',
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
        >
          <div style={{ padding: '8px 10px', borderBottom: '1px solid #1e293b', marginBottom: '4px' }}>
            <div style={{ fontWeight: 700, color: '#ffffff', fontSize: '13px' }}>{currentName}</div>
            <div style={{ color: '#94a3b8', fontSize: '11px' }}>{currentEmail}</div>
          </div>

          <button
            onClick={() => {
              setShowDropdown(false)
              setShowProfileModal(true)
            }}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '8px 10px',
              borderRadius: '8px',
              color: '#e2e8f0',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              fontSize: '12px',
              textAlign: 'left',
            }}
          >
            <User style={{ width: '16px', height: '16px', color: '#60a5fa' }} /> Account Profile
          </button>

          <Link
            href="/sign-in"
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '8px 10px',
              borderRadius: '8px',
              color: '#e2e8f0',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              fontSize: '12px',
              textDecoration: 'none',
            }}
          >
            <ShieldCheck style={{ width: '16px', height: '16px', color: '#34d399' }} /> Sign In / Switch User
          </Link>

          <div style={{ height: '1px', backgroundColor: '#1e293b', margin: '4px 0' }} />

          <button
            onClick={handleSignOut}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '8px 10px',
              borderRadius: '8px',
              color: '#fb7185',
              backgroundColor: 'rgba(244, 63, 94, 0.1)',
              border: 'none',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: 600,
              textAlign: 'left',
            }}
          >
            <LogOut style={{ width: '16px', height: '16px' }} /> Sign Out
          </button>
        </div>
      )}

      {showProfileModal && (
        <UserProfileModal
          onClose={() => setShowProfileModal(false)}
          onSignOut={handleSignOut}
          isGuest={isGuest}
        />
      )}
    </div>
  )
}
