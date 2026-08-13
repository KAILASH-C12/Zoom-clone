'use client'

import { useState, useRef, useEffect } from 'react'
import { useUser, UserButton, SignInButton, SignUpButton, useClerk } from '@clerk/nextjs'
import Link from 'next/link'
import { User, LogOut, Settings, ShieldCheck, ChevronDown } from 'lucide-react'
import { UserProfileModal } from './modals/user-profile-modal'

export function AuthHeaderButton() {
  const clerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
  const isClerkConfigured =
    clerkKey &&
    clerkKey.trim() !== '' &&
    !clerkKey.includes('YOUR_CLERK_PUBLISHABLE_KEY')

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

  // Close dropdown on outside click
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
    window.location.href = '/'
  }

  if (isClerkConfigured) {
    if (userState.isSignedIn) {
      return <UserButton afterSignOutUrl="/" />
    }

    return (
      <div className="flex items-center gap-2">
        <Link
          href="/sign-in"
          className="text-xs font-semibold px-3 py-1.5 rounded-full border border-slate-700 hover:bg-slate-800 transition-colors text-white"
        >
          Sign In
        </Link>
        <Link
          href="/sign-up"
          className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-1.5 rounded-full transition-colors"
        >
          Sign Up Free
        </Link>
      </div>
    )
  }

  // Interactive Demo User Profile Menu
  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center gap-2.5 p-1 pr-2 rounded-full hover:bg-slate-800/60 transition-colors border border-transparent hover:border-slate-700"
      >
        <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shadow-md">
          AR
        </div>
        <div className="text-left hidden sm:block">
          <div className="text-xs font-bold text-slate-100 leading-tight">Alex Rivera</div>
          <div className="text-[10px] text-emerald-400 font-medium">Online · Pro</div>
        </div>
        <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
      </button>

      {/* Profile Dropdown Menu */}
      {showDropdown && (
        <div className="absolute right-0 top-11 w-56 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl z-50 p-2 text-xs animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="p-3 border-b border-slate-800 mb-1">
            <div className="font-bold text-white text-sm">Alex Rivera</div>
            <div className="text-slate-400 text-[11px]">alex.rivera@example.com</div>
          </div>

          <button
            onClick={() => {
              setShowDropdown(false)
              setShowProfileModal(true)
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-200 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <User className="w-4 h-4 text-blue-400" /> Account Profile
          </button>

          <Link
            href="/sign-in"
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-200 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" /> Switch Account
          </Link>

          <div className="my-1 border-t border-slate-800" />

          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-rose-400 hover:bg-rose-950/50 transition-colors font-medium"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      )}

      {showProfileModal && (
        <UserProfileModal
          onClose={() => setShowProfileModal(false)}
          onSignOut={handleSignOut}
        />
      )}
    </div>
  )
}
