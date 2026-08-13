'use client'

import { SignedIn, SignedOut, UserButton, SignInButton, SignUpButton } from '@clerk/nextjs'
import { User, LogIn } from 'lucide-react'

export function AuthHeaderButton() {
  const clerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
  const isClerkConfigured =
    clerkKey &&
    clerkKey.trim() !== '' &&
    !clerkKey.includes('YOUR_CLERK_PUBLISHABLE_KEY')

  if (isClerkConfigured) {
    return (
      <div className="flex items-center gap-3">
        <SignedOut>
          <SignInButton mode="modal">
            <button className="topbar-icon-btn text-xs font-semibold px-3 py-1.5 rounded-full border border-gray-300 hover:bg-gray-100 transition-colors">
              Sign In
            </button>
          </SignInButton>
          <SignUpButton mode="modal">
            <button className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-1.5 rounded-full transition-colors">
              Sign Up Free
            </button>
          </SignUpButton>
        </SignedOut>

        <SignedIn>
          <UserButton afterSignOutUrl="/" />
        </SignedIn>
      </div>
    )
  }

  // Demo mode profile button
  return (
    <div className="flex items-center gap-2">
      <div className="sidebar-avatar" title="Alex Rivera (Default User)">
        AR
      </div>
      <span className="text-xs font-semibold text-gray-700 hidden sm:inline">
        Alex Rivera
      </span>
    </div>
  )
}
