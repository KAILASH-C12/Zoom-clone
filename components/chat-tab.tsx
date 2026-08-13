'use client'

import { useState } from 'react'
import { Hash, Plus, Send, Search, UserCheck } from 'lucide-react'

interface Message {
  id: string
  author: string
  time: string
  text: string
  avatarColor: string
}

export function ChatTab() {
  const [activeChannel, setActiveChannel] = useState('# general')
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      author: 'Alex Rivera',
      time: '10:14 AM',
      text: 'Good morning team! The new Zoom Clone UI sprint is now active.',
      avatarColor: '#0b5cff',
    },
    {
      id: '2',
      author: 'Jordan Kim',
      time: '10:16 AM',
      text: 'Awesome! All backend APIs for WebSockets and SQLite chat are connected.',
      avatarColor: '#10b981',
    },
    {
      id: '3',
      author: 'Priya Shah',
      time: '10:20 AM',
      text: 'Meeting room video grid, camera controls, and floating reactions look fantastic! 🚀',
      avatarColor: '#8b5cf6',
    },
  ])
  const [inputText, setInputText] = useState('')

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputText.trim()) return

    const newMsg: Message = {
      id: Date.now().toString(),
      author: 'Alex Rivera (You)',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: inputText,
      avatarColor: '#0b5cff',
    }

    setMessages((prev) => [...prev, newMsg])
    setInputText('')
  }

  return (
    <div className="team-chat-container">
      {/* Channel Sidebar */}
      <aside className="chat-channels-sidebar">
        <div className="chat-channels-header">
          <span>Team Chat</span>
          <button className="icon-btn-sm" title="New Channel">
            <Plus style={{ width: 16, height: 16 }} />
          </button>
        </div>

        <div className="channel-list">
          <div style={{ fontSize: '11px', color: '#94a3b8', padding: '6px 8px', fontWeight: 600, textTransform: 'uppercase' }}>
            Channels
          </div>
          {['# general', '# product-design', '# engineering', '# announcements'].map((ch) => (
            <div
              key={ch}
              className={`channel-item ${activeChannel === ch ? 'active' : ''}`}
              onClick={() => setActiveChannel(ch)}
            >
              <Hash style={{ width: 16, height: 16 }} />
              <span>{ch.replace('# ', '')}</span>
            </div>
          ))}

          <div style={{ fontSize: '11px', color: '#94a3b8', padding: '16px 8px 6px', fontWeight: 600, textTransform: 'uppercase' }}>
            Direct Messages
          </div>
          {['Jordan Kim', 'Priya Shah', 'Sam Wilson', 'Maya Chen'].map((name) => (
            <div
              key={name}
              className={`channel-item ${activeChannel === name ? 'active' : ''}`}
              onClick={() => setActiveChannel(name)}
            >
              <UserCheck style={{ width: 16, height: 16 }} />
              <span>{name}</span>
            </div>
          ))}
        </div>
      </aside>

      {/* Main Chat Area */}
      <div className="chat-main-area">
        <header className="chat-main-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Hash style={{ width: 18, height: 18, color: 'var(--zoom-blue)' }} />
            <span>{activeChannel}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Search style={{ width: 16, height: 16, color: '#94a3b8' }} />
          </div>
        </header>

        <div className="chat-main-messages">
          {messages.map((msg) => (
            <div key={msg.id} className="team-msg-card">
              <div
                className="team-msg-avatar"
                style={{ backgroundColor: msg.avatarColor }}
              >
                {msg.author[0]}
              </div>
              <div className="team-msg-content">
                <div>
                  <span className="team-msg-author">{msg.author}</span>
                  <span className="team-msg-time">{msg.time}</span>
                </div>
                <div className="team-msg-text">{msg.text}</div>
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={handleSend} className="team-chat-input-bar">
          <input
            type="text"
            placeholder={`Message ${activeChannel}...`}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />
          <button type="submit" className="chat-send-btn">
            <Send style={{ width: 16, height: 16 }} />
          </button>
        </form>
      </div>
    </div>
  )
}
