'use client'

import { useUser, UserButton, SignInButton, SignUpButton } from '@clerk/nextjs'

export function AuthHeaderButton() {
  const clerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
  const isClerkConfigured =
    clerkKey &&
    clerkKey.trim() !== '' &&
    !clerkKey.includes('YOUR_CLERK_PUBLISHABLE_KEY')

  // Hook must be inside client component safely
  let userState: { isSignedIn?: boolean } = { isSignedIn: false }
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const { isSignedIn } = useUser()
    userState = { isSignedIn: Boolean(isSignedIn) }
  } catch {
    // ClerkProvider not mounted or publishable key missing
  }

  if (isClerkConfigured) {
    if (userState.isSignedIn) {
      return <UserButton afterSignOutUrl="/" />
    }

    return (
      <div className="flex items-center gap-2">
        <SignInButton mode="modal">
          <button className="text-xs font-semibold px-3 py-1.5 rounded-full border border-gray-300 hover:bg-gray-100 transition-colors text-white">
            Sign In
          </button>
        </SignInButton>
        <SignUpButton mode="modal">
          <button className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-1.5 rounded-full transition-colors">
            Sign Up Free
          </button>
        </SignUpButton>
      </div>
    )
  }

  // Demo mode profile button
  return (
    <div className="flex items-center gap-2">
      <div className="sidebar-avatar" title="Alex Rivera (Default User)">
        AR
      </div>
      <span className="text-xs font-semibold text-gray-300 hidden sm:inline">
        Alex Rivera
      </span>
    </div>
  )
}
