'use client'

import { X, Bell, Video, Calendar, MessageSquare, CheckCircle2 } from 'lucide-react'

interface NotificationsDrawerProps {
  onClose: () => void
}

export function NotificationsDrawer({ onClose }: NotificationsDrawerProps) {
  const notifications = [
    {
      id: 1,
      title: 'Product Design Sync starting soon',
      time: 'In 15 minutes',
      icon: Calendar,
      color: 'text-blue-400',
    },
    {
      id: 2,
      title: 'Jordan Kim left a message in #general',
      time: '12 minutes ago',
      icon: MessageSquare,
      color: 'text-purple-400',
    },
    {
      id: 3,
      title: 'Q3 Planning Session recording available',
      time: '2 hours ago',
      icon: Video,
      color: 'text-emerald-400',
    },
  ]

  return (
    <div className="notifications-drawer-container" onClick={onClose}>
      <div className="notifications-drawer-panel" onClick={(e) => e.stopPropagation()}>
        <div className="drawer-header">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-blue-500" />
            <h3 className="font-bold text-white text-base">Notifications</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="drawer-body p-4 space-y-3">
          {notifications.map((n) => {
            const IconComp = n.icon
            return (
              <div
                key={n.id}
                className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/50 hover:bg-slate-800 transition-colors flex items-start gap-3"
              >
                <div className={`p-2 bg-slate-900 rounded-lg ${n.color}`}>
                  <IconComp className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <div className="text-xs font-semibold text-slate-100">{n.title}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">{n.time}</div>
                </div>
              </div>
            )
          })}
        </div>

        <div className="drawer-footer p-4 border-t border-slate-800 flex justify-between items-center text-xs text-slate-400">
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> All caught up
          </span>
          <button className="text-blue-400 hover:underline" onClick={onClose}>
            Mark all read
          </button>
        </div>
      </div>
    </div>
  )
}
