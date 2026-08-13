'use client'

import { usePathname } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import {
  Video,
  Home,
  MessageSquare,
  Calendar,
  LayoutGrid,
  Settings,
} from 'lucide-react'

interface SidebarProps {
  activeTab?: string
  onSelectTab?: (tab: string) => void
}

const navItems = [
  { icon: Home, label: 'Home', id: 'home', href: '/' },
  { icon: MessageSquare, label: 'Chat', id: 'chat', href: '/#chat' },
  { icon: Calendar, label: 'Meetings', id: 'meetings', href: '/meetings' },
  { icon: LayoutGrid, label: 'Whiteboard', id: 'whiteboard', href: '/#whiteboard' },
]

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function Sidebar({ activeTab = 'home', onSelectTab }: SidebarProps) {
  const pathname = usePathname()
  const { user, isLoaded } = useUser()

  // Don't show sidebar in meeting rooms
  if (pathname?.startsWith('/meeting/')) return null

  // Resolve display name & avatar
  const displayName = user?.fullName
    || user?.firstName
    || (typeof window !== 'undefined' ? localStorage.getItem('guest_display_name') : null)
    || 'Guest'
  const initials = getInitials(displayName)
  const avatarUrl = user?.imageUrl || null

  return (
    <aside className="sidebar" role="navigation" aria-label="Main navigation">
      {/* Zoom Logo */}
      <div className="sidebar-logo">
        <Video />
      </div>

      {/* Nav Items */}
      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const isActive = activeTab === item.id || (item.id === 'meetings' && pathname === '/meetings')

          return (
            <button
              key={item.label}
              onClick={() => onSelectTab && onSelectTab(item.id)}
              className={`sidebar-item ${isActive ? 'active' : ''}`}
              title={item.label}
            >
              <item.icon />
              <span>{item.label}</span>
            </button>
          )
        })}
      </nav>

      {/* Bottom section */}
      <div className="sidebar-bottom">
        <button className="sidebar-item" title="Settings">
          <Settings />
        </button>
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={displayName}
            className="sidebar-avatar-img"
            title={displayName}
          />
        ) : (
          <div className="sidebar-avatar" title={displayName}>
            {initials}
          </div>
        )}
      </div>
    </aside>
  )
}
