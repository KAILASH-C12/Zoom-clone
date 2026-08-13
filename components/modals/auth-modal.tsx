'use client'

import { useState } from 'react'
import { X, Video, User, Mail, Lock, ArrowRight, CheckCircle2 } from 'lucide-react'

interface AuthModalProps {
  initialMode?: 'signin' | 'signup'
  onClose: () => void
  onSuccess: (userData: { name: string; email: string }) => void
}

export function AuthModal({ initialMode = 'signin', onClose, onSuccess }: AuthModalProps) {
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode)
  const [name, setName] = useState('Alex Rivera')
  const [email, setEmail] = useState('alex.rivera@example.com')
  const [password, setPassword] = useState('password123')
  const [toast, setToast] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setToast(mode === 'signin' ? 'Signed in successfully!' : 'Account created successfully!')
    setTimeout(() => {
      onSuccess({ name: name || 'Demo User', email: email || 'user@zoom-clone.local' })
    }, 1000)
  }

  const handleQuickLogin = (quickName: string, quickEmail: string) => {
    setName(quickName)
    setEmail(quickEmail)
    setToast(`Signed in as ${quickName}`)
    setTimeout(() => {
      onSuccess({ name: quickName, email: quickEmail })
    }, 800)
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
                backgroundColor: '#0b5cff',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
              }}
            >
              <Video style={{ width: '20px', height: '20px' }} />
            </div>
            <span style={{ fontSize: '20px', fontWeight: 800, color: '#ffffff' }}>zoom</span>
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

        {/* Tab Switcher */}
        <div
          style={{
            display: 'flex',
            backgroundColor: '#1e293b',
            padding: '4px',
            borderRadius: '12px',
            marginBottom: '20px',
          }}
        >
          <button
            onClick={() => setMode('signin')}
            style={{
              flex: 1,
              padding: '8px',
              borderRadius: '8px',
              border: 'none',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              backgroundColor: mode === 'signin' ? '#0b5cff' : 'transparent',
              color: mode === 'signin' ? '#ffffff' : '#94a3b8',
              transition: 'all 0.15s ease',
            }}
          >
            Sign In
          </button>
          <button
            onClick={() => setMode('signup')}
            style={{
              flex: 1,
              padding: '8px',
              borderRadius: '8px',
              border: 'none',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              backgroundColor: mode === 'signup' ? '#0b5cff' : 'transparent',
              color: mode === 'signup' ? '#ffffff' : '#94a3b8',
              transition: 'all 0.15s ease',
            }}
          >
            Sign Up Free
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px', textAlign: 'left' }}>
          {mode === 'signup' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#cbd5e1' }}>Full Name</label>
              <div style={{ position: 'relative' }}>
                <User style={{ position: 'absolute', left: '12px', top: '12px', width: '16px', height: '16px', color: '#64748b' }} />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Alex Rivera"
                  style={{
                    width: '100%',
                    backgroundColor: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '10px',
                    padding: '10px 12px 10px 36px',
                    color: '#ffffff',
                    fontSize: '13px',
                    outline: 'none',
                  }}
                  required
                />
              </div>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '12px', fontWeight: 600, color: '#cbd5e1' }}>Work Email</label>
            <div style={{ position: 'relative' }}>
              <Mail style={{ position: 'absolute', left: '12px', top: '12px', width: '16px', height: '16px', color: '#64748b' }} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                style={{
                  width: '100%',
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '10px',
                  padding: '10px 12px 10px 36px',
                  color: '#ffffff',
                  fontSize: '13px',
                  outline: 'none',
                }}
                required
              />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '12px', fontWeight: 600, color: '#cbd5e1' }}>Password</label>
            <div style={{ position: 'relative' }}>
              <Lock style={{ position: 'absolute', left: '12px', top: '12px', width: '16px', height: '16px', color: '#64748b' }} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                style={{
                  width: '100%',
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '10px',
                  padding: '10px 12px 10px 36px',
                  color: '#ffffff',
                  fontSize: '13px',
                  outline: 'none',
                }}
                required
              />
            </div>
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
            {mode === 'signin' ? 'Sign In to Workspace' : 'Create Free Account'} <ArrowRight style={{ width: '16px', height: '16px' }} />
          </button>
        </form>

        {/* Quick Account Preset Section */}
        <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #1e293b', textAlign: 'left' }}>
          <div style={{ fontSize: '11px', fontWeight: 600, color: '#94a3b8', marginBottom: '8px' }}>
            OR 1-CLICK DEMO LOGIN AS:
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => handleQuickLogin('Alex Rivera', 'alex.rivera@example.com')}
              style={{
                flex: 1,
                padding: '8px 10px',
                borderRadius: '8px',
                backgroundColor: 'rgba(59, 130, 246, 0.15)',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                color: '#60a5fa',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Alex Rivera (Pro)
            </button>
            <button
              onClick={() => handleQuickLogin('Kailash C.', 'kailash@example.com')}
              style={{
                flex: 1,
                padding: '8px 10px',
                borderRadius: '8px',
                backgroundColor: 'rgba(16, 185, 129, 0.15)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                color: '#34d399',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Kailash C. (Host)
            </button>
          </div>
        </div>

        {toast && (
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
              marginTop: '16px',
            }}
          >
            <CheckCircle2 style={{ width: '16px', height: '16px' }} /> {toast}
          </div>
        )}
      </div>
    </div>
  )
}
