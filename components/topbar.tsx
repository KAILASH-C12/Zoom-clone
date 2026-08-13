'use client'

import { useState, useRef, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { AuthHeaderButton } from '@/components/auth-header-button'

interface TopbarProps {
  onNewMeeting: () => void
  onJoinMeeting: () => void
  onScheduleMeeting: () => void
}

export function Topbar({ onNewMeeting, onJoinMeeting, onScheduleMeeting }: TopbarProps) {
  const pathname = usePathname()
  const [showQuickActions, setShowQuickActions] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Determine page title
  const getTitle = () => {
    if (pathname === '/') return 'Home'
    if (pathname?.startsWith('/meetings')) return 'Meetings'
    if (pathname?.startsWith('/join')) return 'Join Meeting'
    return 'Home'
  }

  // Don't show topbar in meeting rooms
  if (pathname?.startsWith('/meeting/')) return null

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowQuickActions(false)
      }
    }
    if (showQuickActions) {
      document.addEventListener('mousedown', handleClick)
    }
    return () => document.removeEventListener('mousedown', handleClick)
  }, [showQuickActions])

  return (
    <header className="topbar">
      <span className="topbar-title">{getTitle()}</span>

      {/* Search */}
      <div className="topbar-search">
        <Search className="topbar-search-icon" />
        <input
          className="topbar-search-input"
          type="text"
          placeholder="Search contacts, meetings, files..."
        />
      </div>

      {/* Actions */}
      <div className="topbar-actions">
        {/* Quick actions + button */}
        <div style={{ position: 'relative' }} ref={dropdownRef}>
          <button
            className="topbar-btn plus-btn"
            aria-label="New action"
            onClick={() => setShowQuickActions(!showQuickActions)}
          >
            {showQuickActions ? <X /> : <Plus />}
          </button>

          {showQuickActions && (
            <div className="quick-actions-dropdown">
              <button
                className="quick-action-item"
                onClick={() => {
                  setShowQuickActions(false)
                  onNewMeeting()
                }}
              >
                <Video /> New Meeting
              </button>
              <button
                className="quick-action-item"
                onClick={() => {
                  setShowQuickActions(false)
                  onJoinMeeting()
                }}
              >
                <Users /> Join Meeting
              </button>
              <button
                className="quick-action-item"
                onClick={() => {
                  setShowQuickActions(false)
                  onScheduleMeeting()
                }}
              >
                <Calendar /> Schedule Meeting
              </button>
            </div>
          )}
        </div>

        <button className="topbar-btn" aria-label="Notifications">
          <Bell />
        </button>
        <button className="topbar-btn" aria-label="Settings">
          <Settings />
        </button>
        <AuthHeaderButton />
      </div>
    </header>
  )
}

