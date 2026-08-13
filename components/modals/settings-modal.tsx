'use client'

import { useState } from 'react'
import { X, Settings, Mic, Camera, Monitor, Bell, Palette, Check } from 'lucide-react'

interface SettingsModalProps {
  onClose: () => void
}

export function SettingsModal({ onClose }: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState<'audio' | 'video' | 'general'>('audio')
  const [micDevice, setMicDevice] = useState('Default Microphone (Internal)')
  const [camDevice, setCamDevice] = useState('Integrated HD Webcam')
  const [savedToast, setSavedToast] = useState(false)

  const handleSave = () => {
    setSavedToast(true)
    setTimeout(() => {
      setSavedToast(false)
      onClose()
    }, 1200)
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container max-w-xl w-full" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-blue-500" />
            <h3>Settings & Preferences</h3>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="modal-body grid grid-cols-4 gap-4 p-4 min-h-[320px]">
          {/* Settings Subnav */}
          <div className="col-span-1 border-r border-slate-800 pr-3 space-y-1">
            <button
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-left transition-colors ${
                activeTab === 'audio' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800'
              }`}
              onClick={() => setActiveTab('audio')}
            >
              <Mic className="w-3.5 h-3.5" /> Audio
            </button>
            <button
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-left transition-colors ${
                activeTab === 'video' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800'
              }`}
              onClick={() => setActiveTab('video')}
            >
              <Camera className="w-3.5 h-3.5" /> Video
            </button>
            <button
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-left transition-colors ${
                activeTab === 'general' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800'
              }`}
              onClick={() => setActiveTab('general')}
            >
              <Palette className="w-3.5 h-3.5" /> General
            </button>
          </div>

          {/* Settings Content */}
          <div className="col-span-3 space-y-4">
            {activeTab === 'audio' && (
              <div className="space-y-4">
                <div className="form-group">
                  <label className="text-xs font-semibold text-slate-300">Microphone Input</label>
                  <select
                    value={micDevice}
                    onChange={(e) => setMicDevice(e.target.value)}
                    className="auth-input mt-1 text-xs"
                  >
                    <option>Default Microphone (Internal)</option>
                    <option>External USB Microphone</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="text-xs font-semibold text-slate-300">Speaker Output</label>
                  <select className="auth-input mt-1 text-xs">
                    <option>Default Speaker (Realtek High Definition)</option>
                    <option>Headphones (Bluetooth Audio)</option>
                  </select>
                </div>
              </div>
            )}

            {activeTab === 'video' && (
              <div className="space-y-4">
                <div className="form-group">
                  <label className="text-xs font-semibold text-slate-300">Camera Source</label>
                  <select
                    value={camDevice}
                    onChange={(e) => setCamDevice(e.target.value)}
                    className="auth-input mt-1 text-xs"
                  >
                    <option>Integrated HD Webcam (1280x720)</option>
                    <option>Virtual Camera Driver</option>
                  </select>
                </div>
                <div className="p-4 bg-slate-900 rounded-lg border border-slate-800 flex items-center justify-center text-xs text-slate-500 h-32">
                  Camera Preview Ready
                </div>
              </div>
            )}

            {activeTab === 'general' && (
              <div className="space-y-4 text-xs text-slate-300">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" defaultChecked className="rounded border-slate-700" />
                  <span>Automatically join audio when entering meetings</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" defaultChecked className="rounded border-slate-700" />
                  <span>Show reaction emojis in meeting grid</span>
                </label>
              </div>
            )}

            {savedToast && (
              <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-950/60 p-2.5 rounded-lg border border-emerald-800">
                <Check className="w-4 h-4" /> Preferences saved!
              </div>
            )}
          </div>
        </div>

        <div className="modal-footer flex justify-end gap-2 pt-4 border-t border-slate-800">
          <button className="landing-btn-outline text-xs px-4 py-2" onClick={onClose}>
            Cancel
          </button>
          <button className="landing-btn-primary text-xs px-4 py-2" onClick={handleSave}>
            Save Changes
          </button>
        </div>
      </div>
    </div>
  )
}
