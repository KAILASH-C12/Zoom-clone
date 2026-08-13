'use client'

import React from 'react'
import { ClerkProvider } from '@clerk/nextjs'

interface ClerkWrapperProps {
  children: React.ReactNode
}

export function ClerkProviderWrapper({ children }: ClerkWrapperProps) {
  const clerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY

  const isClerkConfigured =
    clerkKey &&
    clerkKey.trim() !== '' &&
    !clerkKey.includes('YOUR_CLERK_PUBLISHABLE_KEY')

  if (isClerkConfigured) {
    return <ClerkProvider publishableKey={clerkKey}>{children}</ClerkProvider>
  }

  // Graceful fallback for demo mode before Clerk keys are added
  return <>{children}</>
}
