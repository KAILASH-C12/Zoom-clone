'use client'

import { SignUp } from '@clerk/nextjs'
import Link from 'next/link'
import { Video, ArrowLeft } from 'lucide-react'

export default function SignUpPage() {
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
          <SignUp
            routing="path"
            path="/sign-up"
            signInUrl="/sign-in"
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
            <h2 className="demo-auth-title">Create your Zoom Account</h2>
            <p className="demo-auth-subtitle">
              Get started with free HD video meetings, team chat, and AI summaries.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault()
                window.location.href = '/'
              }}
              className="demo-auth-form"
            >
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Alex Rivera"
                  className="auth-input"
                  required
                />
              </div>

              <div className="form-group">
                <label>Work Email</label>
                <input
                  type="email"
                  placeholder="name@company.com"
                  className="auth-input"
                  required
                />
              </div>

              <div className="form-group">
                <label>Create Password</label>
                <input
                  type="password"
                  placeholder="Minimum 8 characters"
                  className="auth-input"
                  required
                />
              </div>

              <button type="submit" className="landing-btn-primary w-full justify-center">
                Create Free Account
              </button>

              <div className="text-center text-xs text-slate-400 mt-4">
                Already have an account?{' '}
                <Link href="/sign-in" className="text-blue-400 font-semibold hover:underline">
                  Sign in
                </Link>
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  )
}
