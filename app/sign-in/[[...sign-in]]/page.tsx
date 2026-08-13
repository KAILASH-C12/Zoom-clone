'use client'

import { SignIn } from '@clerk/nextjs'
import Link from 'next/link'
import { Video, ArrowLeft } from 'lucide-react'

export default function SignInPage() {
  const clerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
  const isClerkConfigured =
    clerkKey &&
    clerkKey.trim() !== '' &&
    !clerkKey.includes('YOUR_CLERK_PUBLISHABLE_KEY')

  return (
    <div className="auth-page-container">
      <header className="auth-header">
        <Link href="/" className="auth-logo">
          <div className="landing-logo-icon">
            <Video />
          </div>
          <span className="landing-logo-text">zoom</span>
        </Link>

        <Link href="/" className="auth-back-link">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>
      </header>

      <main className="auth-card-wrapper">
        {isClerkConfigured ? (
          <SignIn
            routing="path"
            path="/sign-in"
            signUpUrl="/sign-up"
            appearance={{
              elements: {
                phoneNumberField: 'hidden',
                phoneInput: 'hidden',
              },
            }}
          />
        ) : (
          <div className="demo-auth-card">
            <div className="demo-auth-icon">
              <Video className="w-8 h-8 text-blue-500" />
            </div>
            <h2 className="demo-auth-title">Sign In to Zoom Workplace</h2>
            <p className="demo-auth-subtitle">
              Demo Authentication Mode active. Click below to sign in as default user.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault()
                window.location.href = '/'
              }}
              className="demo-auth-form"
            >
              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  defaultValue="alex.rivera@example.com"
                  className="auth-input"
                  required
                />
              </div>

              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  defaultValue="••••••••••••"
                  className="auth-input"
                  required
                />
              </div>

              <button type="submit" className="landing-btn-primary w-full justify-center">
                Sign In (Alex Rivera)
              </button>

              <div className="text-center text-xs text-slate-400 mt-4">
                Don&apos;t have an account?{' '}
                <Link href="/sign-up" className="text-blue-400 font-semibold hover:underline">
                  Sign up free
                </Link>
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  )
}
