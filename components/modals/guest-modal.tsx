'use client'

import { useState } from 'react'
import { X, UserCheck, ArrowRight, Video } from 'lucide-react'

interface GuestModalProps {
  onClose: () => void
  onConfirm: (guestName: string) => void
}

export function GuestModal({ onClose, onConfirm }: GuestModalProps) {
  const [guestName, setGuestName] = useState('Guest User')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onConfirm(guestName.trim() || 'Guest User')
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-container"
        style={{
          width: '100%',
          maxWidth: '420px',
          backgroundColor: '#0f172a',
          border: '1px solid #1e293b',
          borderRadius: '24px',
          padding: '28px',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.9)',
          color: '#ffffff',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                backgroundColor: 'rgba(100, 116, 139, 0.2)',
                border: '1px solid rgba(100, 116, 139, 0.4)',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#cbd5e1',
              }}
            >
              <UserCheck style={{ width: '20px', height: '20px' }} />
            </div>
            <span style={{ fontSize: '18px', fontWeight: 700, color: '#ffffff' }}>Guest Profile Setup</span>
          </div>

          <button
            onClick={onClose}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: '4px',
            }}
          >
            <X style={{ width: '20px', height: '20px' }} />
          </button>
        </div>

        <p style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '20px', textAlign: 'left', lineHeight: 1.4 }}>
          Enter a display name to enter Zoom Workplace as a Guest. You can participate in live video calls, team chat, and whiteboards.
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '12px', fontWeight: 600, color: '#cbd5e1' }}>Your Guest Name</label>
            <input
              type="text"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              placeholder="e.g. Guest User"
              style={{
                width: '100%',
                backgroundColor: '#1e293b',
                border: '1px solid #334155',
                borderRadius: '10px',
                padding: '10px 14px',
                color: '#ffffff',
                fontSize: '13px',
                outline: 'none',
              }}
              required
              autoFocus
            />
          </div>

          <button
            type="submit"
            style={{
              width: '100%',
              backgroundColor: '#0b5cff',
              color: '#ffffff',
              border: 'none',
              borderRadius: '10px',
              padding: '12px',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              marginTop: '6px',
            }}
          >
            Enter Workspace App <ArrowRight style={{ width: '16px', height: '16px' }} />
          </button>
        </form>
      </div>
    </div>
  )
}
