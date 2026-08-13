'use client'

import { useState } from 'react'
import { X, User, Mail, Shield, LogOut, Check, Edit2 } from 'lucide-react'

interface UserProfileModalProps {
  onClose: () => void
  onSignOut: () => void
  isGuest?: boolean
}

export function UserProfileModal({ onClose, onSignOut, isGuest = false }: UserProfileModalProps) {
  const [displayName, setDisplayName] = useState(isGuest ? 'Guest User' : 'Alex Rivera')
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
      <div
        className="modal-container"
        style={{
          width: '100%',
          maxWidth: '440px',
          backgroundColor: '#0f172a',
          border: '1px solid #1e293b',
          borderRadius: '20px',
          padding: '24px',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.9)',
          color: '#ffffff',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingBottom: '16px',
            borderBottom: '1px solid #1e293b',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <User style={{ width: '20px', height: '20px', color: '#3b82f6' }} />
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#ffffff', margin: 0 }}>
              {isGuest ? 'Guest Account Profile' : 'Account Profile'}
            </h3>
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
            <X style={{ width: '18px', height: '18px' }} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '20px 0' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              padding: '16px',
              backgroundColor: 'rgba(30, 41, 59, 0.8)',
              borderRadius: '16px',
              border: '1px solid #334155',
            }}
          >
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                backgroundColor: isGuest ? '#64748b' : '#0b5cff',
                color: '#ffffff',
                fontWeight: 'bold',
                fontSize: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              {displayName.split(' ').map((n) => n[0]).join('').toUpperCase()}
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', textAlign: 'left' }}>
              <div style={{ fontWeight: 700, fontSize: '16px', color: '#ffffff' }}>{displayName}</div>
              <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>
                {isGuest ? 'guest@zoom-demo.local' : 'alex.rivera@example.com'}
              </div>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '11px',
                  fontWeight: 600,
                  color: isGuest ? '#cbd5e1' : '#34d399',
                  backgroundColor: isGuest ? 'rgba(100, 116, 139, 0.3)' : 'rgba(16, 185, 129, 0.15)',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  marginTop: '6px',
                  border: isGuest ? '1px solid #475569' : '1px solid rgba(16, 185, 129, 0.3)',
                }}
              >
                <Shield style={{ width: '12px', height: '12px' }} />
                {isGuest ? 'Guest Access' : 'Pro Account'}
              </div>
            </div>
          </div>

          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', textAlign: 'left' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#cbd5e1' }}>Display Name</label>
              {isEditing ? (
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    style={{
                      flex: 1,
                      backgroundColor: '#1e293b',
                      border: '1px solid #3b82f6',
                      borderRadius: '8px',
                      padding: '8px 12px',
                      color: '#ffffff',
                      fontSize: '13px',
                      outline: 'none',
                    }}
                    autoFocus
                  />
                  <button
                    type="submit"
                    style={{
                      backgroundColor: '#0b5cff',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '8px 16px',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Save
                  </button>
                </div>
              ) : (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    backgroundColor: '#1e293b',
                    borderRadius: '8px',
                    border: '1px solid #334155',
                    fontSize: '13px',
                    color: '#f8fafc',
                  }}
                >
                  <span>{displayName}</span>
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    style={{
                      fontSize: '12px',
                      color: '#60a5fa',
                      backgroundColor: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontWeight: 600,
                    }}
                  >
                    <Edit2 style={{ width: '14px', height: '14px' }} /> Edit
                  </button>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', textAlign: 'left' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#cbd5e1' }}>Email Address</label>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 14px',
                  backgroundColor: '#1e293b',
                  borderRadius: '8px',
                  border: '1px solid #334155',
                  fontSize: '13px',
                  color: '#94a3b8',
                }}
              >
                <Mail style={{ width: '16px', height: '16px', color: '#64748b' }} />
                <span>{isGuest ? 'guest@zoom-demo.local' : 'alex.rivera@example.com'}</span>
              </div>
            </div>
          </form>

          {savedToast && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '12px',
                color: '#34d399',
                backgroundColor: 'rgba(16, 185, 129, 0.15)',
                padding: '10px 14px',
                borderRadius: '8px',
                border: '1px solid rgba(16, 185, 129, 0.3)',
              }}
            >
              <Check style={{ width: '16px', height: '16px' }} /> Profile name updated successfully.
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingTop: '16px',
            borderTop: '1px solid #1e293b',
          }}
        >
          <button
            type="button"
            onClick={onSignOut}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '12px',
              fontWeight: 600,
              color: '#fb7185',
              backgroundColor: 'rgba(244, 63, 94, 0.12)',
              border: '1px solid rgba(244, 63, 94, 0.3)',
              padding: '8px 16px',
              borderRadius: '8px',
              cursor: 'pointer',
            }}
          >
            <LogOut style={{ width: '14px', height: '14px' }} /> Sign Out
          </button>

          <button
            type="button"
            onClick={onClose}
            style={{
              backgroundColor: '#334155',
              color: '#ffffff',
              border: 'none',
              fontSize: '12px',
              fontWeight: 600,
              padding: '8px 20px',
              borderRadius: '8px',
              cursor: 'pointer',
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
