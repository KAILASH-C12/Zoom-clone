'use client'

import { useState } from 'react'
import { X, User, Mail, Shield, LogOut, Check, Edit2 } from 'lucide-react'

interface UserProfileModalProps {
  onClose: () => void
  onSignOut: () => void
}

export function UserProfileModal({ onClose, onSignOut }: UserProfileModalProps) {
  const [displayName, setDisplayName] = useState('Alex Rivera')
  const [isEditing, setIsEditing] = useState(false)
  const [savedToast, setSavedToast] = useState(false)

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    setIsEditing(false)
    setSavedToast(true)
    setTimeout(() => setSavedToast(false), 2000)
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container max-w-md w-full" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-blue-500" />
            <h3>Account Profile</h3>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="modal-body space-y-6 py-4">
          <div className="flex items-center gap-4 p-4 bg-slate-800/60 rounded-xl border border-slate-700/50">
            <div className="w-16 h-16 rounded-full bg-blue-600 text-white font-bold text-xl flex items-center justify-center shadow-lg">
              {displayName.split(' ').map((n) => n[0]).join('').toUpperCase()}
            </div>
            <div className="flex-1">
              <div className="font-bold text-lg text-white">{displayName}</div>
              <div className="text-xs text-slate-400">alex.rivera@example.com</div>
              <div className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 mt-1 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-800/50">
                <Shield className="w-3 h-3" /> Pro Account
              </div>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <div className="form-group">
              <label className="text-xs font-semibold text-slate-300">Display Name</label>
              {isEditing ? (
                <div className="flex gap-2 mt-1">
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="auth-input flex-1"
                    autoFocus
                  />
                  <button type="submit" className="landing-btn-primary px-3 text-xs">
                    Save
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between p-2.5 bg-slate-900/60 rounded-lg border border-slate-800 text-sm text-slate-200 mt-1">
                  <span>{displayName}</span>
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 font-medium"
                  >
                    <Edit2 className="w-3.5 h-3.5" /> Edit
                  </button>
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="text-xs font-semibold text-slate-300">Email Address</label>
              <div className="flex items-center gap-2 p-2.5 bg-slate-900/60 rounded-lg border border-slate-800 text-sm text-slate-400 mt-1">
                <Mail className="w-4 h-4 text-slate-500" />
                <span>alex.rivera@example.com</span>
              </div>
            </div>
          </form>

          {savedToast && (
            <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-950/60 p-2.5 rounded-lg border border-emerald-800">
              <Check className="w-4 h-4" /> Profile name updated successfully.
            </div>
          )}
        </div>

        <div className="modal-footer flex justify-between items-center pt-4 border-t border-slate-800">
          <button
            type="button"
            onClick={onSignOut}
            className="flex items-center gap-2 text-xs font-semibold text-rose-400 hover:text-rose-300 px-3 py-2 rounded-lg bg-rose-950/40 hover:bg-rose-900/40 border border-rose-800/50 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" /> Sign Out
          </button>

          <button type="button" className="landing-btn-outline text-xs px-4 py-2" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
