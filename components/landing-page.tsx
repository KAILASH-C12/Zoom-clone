'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Video,
  Search,
  Globe,
  ChevronDown,
  ArrowRight,
  Sparkles,
  ChevronLeft,
  Calendar,
  Users,
  Plus,
  Copy,
  Check,
  Star,
  ExternalLink,
  MessageSquare,
  ShieldCheck,
  Zap,
} from 'lucide-react'
import { AuthHeaderButton } from './auth-header-button'
import type { Meeting } from '@/lib/api'

interface LandingPageProps {
  onNewMeeting: () => void
  onJoinMeeting: () => void
  onScheduleMeeting: () => void
  onGoToApp: () => void
}

export function LandingPage({
  onNewMeeting,
  onJoinMeeting,
  onScheduleMeeting,
  onGoToApp,
}: LandingPageProps) {
  const router = useRouter()
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [carouselIndex, setCarouselIndex] = useState(0)
  const [bannerVisible, setBannerVisible] = useState(true)

  const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

  useEffect(() => {
    const fetchMeetings = async () => {
      try {
        const res = await fetch(`${apiBase}/api/meetings`)
        if (res.ok) {
          const data = await res.json()
          setMeetings(data.upcoming || [])
        }
      } catch {
        // use default state
      }
    }
    fetchMeetings()
  }, [apiBase])

  const copyInvite = (meetingId: string) => {
    const link = `${window.location.origin}/meeting/${meetingId.replace(/ /g, '')}`
    navigator.clipboard?.writeText(link)
    setCopiedId(meetingId)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const products = [
    {
      id: 'contact-center',
      tag: 'Contact Center',
      title: 'Connect and collaborate',
      description: 'Explore the connected work platform built for modern enterprise teams.',
      bgGradient: 'linear-gradient(135deg, #0b5cff 0%, #1e40af 100%)',
    },
    {
      id: 'workvivo',
      tag: 'Workvivo',
      title: 'Employee experience platform',
      description: 'Engage your workforce with internal communications and community spaces.',
      bgGradient: 'linear-gradient(135deg, #7c3aed 0%, #4c1d95 100%)',
    },
    {
      id: 'meetings',
      tag: 'Meetings & AI Companion',
      title: 'HD Video & Real-time AI Summaries',
      description: 'Empower hybrid teams with smart recordings, live chat, and instant translation.',
      bgGradient: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
    },
  ]

  const nextSlide = () => {
    setCarouselIndex((prev) => (prev + 1) % products.length)
  }

  const prevSlide = () => {
    setCarouselIndex((prev) => (prev - 1 + products.length) % products.length)
  }

  return (
    <div className="landing-page-wrapper">
      {/* ── Top Announcement Banner ────────────────────────────────────────── */}
      {bannerVisible && (
        <div className="landing-banner">
          <div className="landing-banner-content">
            <Sparkles className="w-4 h-4 text-pink-400 animate-pulse" />
            <span>
              AI note taking across platforms that&apos;s secure, personalized, and under your control.
            </span>
            <button className="landing-banner-cta">
              Explore My Notes <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <button className="landing-banner-close" onClick={() => setBannerVisible(false)}>
            ✕
          </button>
        </div>
      )}

      {/* ── Landing Header Navbar ─────────────────────────────────────────── */}
      <header className="landing-header">
        <div className="landing-header-left">
          <div className="landing-logo" onClick={onGoToApp}>
            <div className="landing-logo-icon">
              <Video />
            </div>
            <span className="landing-logo-text">zoom</span>
          </div>

          <nav className="landing-nav-links">
            <button className="nav-link">
              Products <ChevronDown className="w-3.5 h-3.5 opacity-70" />
            </button>
            <button className="nav-link">
              AI <ChevronDown className="w-3.5 h-3.5 opacity-70" />
            </button>
            <button className="nav-link">
              Solutions <ChevronDown className="w-3.5 h-3.5 opacity-70" />
            </button>
            <button className="nav-link">Pricing</button>
          </nav>
        </div>

        <div className="landing-header-right">
          <button className="icon-link-btn" title="Search">
            <Search className="w-4 h-4" />
          </button>
          <button className="icon-link-btn" title="Language">
            <Globe className="w-4 h-4" />
          </button>
          <button className="nav-link">
            Meet <ChevronDown className="w-3.5 h-3.5 opacity-70" />
          </button>

          <AuthHeaderButton />

          <button className="landing-btn-secondary" onClick={onGoToApp}>
            Open Workspace App
          </button>
        </div>
      </header>

      {/* ── Hero Section ─────────────────────────────────────────────────── */}
      <section className="landing-hero">
        <div className="landing-hero-badge">
          <Sparkles className="w-3.5 h-3.5 text-blue-400" />
          <span>THE AI-FIRST WORK PLATFORM</span>
        </div>

        <h1 className="landing-hero-title">
          Find out what&apos;s possible <br />
          when work connects
        </h1>

        <p className="landing-hero-subtitle">
          Bridge the gap between talking and doing with the AI-first work platform built for you.
        </p>

        <div className="landing-hero-actions">
          <button className="landing-btn-primary" onClick={onNewMeeting}>
            Explore products <ArrowRight className="w-4 h-4" />
          </button>
          <button className="landing-btn-outline" onClick={onScheduleMeeting}>
            Find your plan
          </button>
        </div>
      </section>

      {/* ── Product Cards Carousel ────────────────────────────────────────── */}
      <section className="landing-carousel-section">
        <div className="carousel-grid">
          {products.map((prod, idx) => (
            <div
              key={prod.id}
              className={`product-card ${idx === carouselIndex ? 'active-card' : ''}`}
              style={{ background: prod.bgGradient }}
            >
              <div className="product-card-tag">
                <MessageSquare className="w-3.5 h-3.5" />
                <span>{prod.tag}</span>
              </div>
              <h3 className="product-card-title">{prod.title}</h3>
              <p className="product-card-desc">{prod.description}</p>
              <button className="product-card-btn" onClick={onGoToApp}>
                Launch Feature <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>

        <div className="carousel-controls">
          <button className="carousel-nav-btn" onClick={prevSlide}>
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="carousel-dots">
            {products.map((_, i) => (
              <span
                key={i}
                className={`carousel-dot ${i === carouselIndex ? 'active' : ''}`}
                onClick={() => setCarouselIndex(i)}
              />
            ))}
          </div>
          <button className="carousel-nav-btn" onClick={nextSlide}>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* ── AI Note Taker Feature Section ─────────────────────────────────── */}
      <section className="landing-feature-section">
        <div className="feature-content-left">
          <span className="feature-label">MY NOTES</span>
          <h2 className="feature-heading">Your new AI note taker</h2>
          <p className="feature-subtext">
            Automatically captures, summarizes, and extracts action items from every conversation in real time.
          </p>
          <button className="landing-btn-primary" onClick={onGoToApp}>
            Explore My Notes <ExternalLink className="w-4 h-4 ml-1" />
          </button>
        </div>

        <div className="feature-preview-card">
          <div className="feature-card-header">
            <Sparkles className="w-5 h-5 text-blue-500" />
            <div>
              <div className="font-bold text-gray-900">[My Note] Q3 Marketing Kickoff</div>
              <div className="text-xs text-gray-500">25 minutes · 4 attendees</div>
            </div>
          </div>
          <div className="feature-card-body">
            <div className="text-xs font-semibold text-blue-600 mb-1">Executive Summary:</div>
            <p className="text-xs text-gray-600 leading-relaxed mb-3">
              The team agreed on the Q3 marketing slide layout to align on print line and next step choices. Discussions focused on revising event theme scopes introduced in previous meetings...
            </p>
            <div className="text-xs font-semibold text-blue-600 mb-1">Action Items:</div>
            <ul className="text-xs text-gray-600 list-disc pl-4 space-y-1">
              <li>Finalize design deck by Friday afternoon</li>
              <li>Schedule 1:1 with Product Leads</li>
            </ul>
          </div>
        </div>
      </section>

      {/* ── YOUR WORKSPACE — Ready When You Are ─────────────────────────────── */}
      <section className="landing-workspace-section">
        <div className="workspace-header">
          <div>
            <span className="workspace-label">YOUR WORKSPACE</span>
            <h2 className="workspace-title">Ready when you are.</h2>
          </div>

          <div className="workspace-action-btns">
            <button className="ws-action-btn primary" onClick={onNewMeeting}>
              <Plus className="w-4 h-4" /> New meeting
            </button>
            <button className="ws-action-btn" onClick={onJoinMeeting}>
              <Users className="w-4 h-4" /> Join meeting
            </button>
            <button className="ws-action-btn" onClick={onScheduleMeeting}>
              <Calendar className="w-4 h-4" /> Schedule
            </button>
          </div>
        </div>

        {/* Live Upcoming Meetings Cards */}
        <div className="workspace-meetings-grid">
          {meetings.length === 0 ? (
            <div className="ws-empty-card">
              <Calendar className="w-6 h-6 text-blue-500 mb-2" />
              <div className="font-semibold text-gray-800">No scheduled meetings</div>
              <div className="text-xs text-gray-500">Click &quot;New meeting&quot; or &quot;Schedule&quot; above to create one.</div>
            </div>
          ) : (
            meetings.slice(0, 3).map((m) => (
              <div key={m.meeting_id} className="ws-meeting-card">
                <div className="ws-card-time">{m.start_time ? new Date(m.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '10:00 AM'}</div>
                <div className="ws-card-title">{m.title}</div>
                <div className="ws-card-id">{m.meeting_id}</div>

                <div className="ws-card-actions">
                  <button
                    className="ws-card-start-btn"
                    onClick={() => router.push(`/meeting/${m.meeting_id.replace(/ /g, '')}`)}
                  >
                    Start
                  </button>
                  <button className="ws-card-icon-btn" onClick={() => copyInvite(m.meeting_id)}>
                    {copiedId === m.meeting_id ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* ── Ratings & Trust Badges Section ─────────────────────────────────── */}
      <section className="landing-trust-section">
        <div className="trust-label">TRUSTED BY MILLIONS. BUILT FOR YOU.</div>

        <div className="trust-logos">
          <span>Gartner</span>
          <span>ExxonMobil</span>
          <span>Capital One</span>
          <span>MOFFITT</span>
        </div>

        <div className="trust-ratings-grid">
          <div className="rating-card">
            <div className="rating-score">4.5/5</div>
            <div className="rating-stars">★★★★★</div>
            <div className="rating-source">Gartner Peer Insights</div>
          </div>

          <div className="rating-card">
            <div className="rating-score">4.6/5</div>
            <div className="rating-stars">★★★★★</div>
            <div className="rating-source">G2 Reviews</div>
          </div>

          <div className="rating-card">
            <div className="rating-score">8.5/10</div>
            <div className="rating-stars">★★★★★</div>
            <div className="rating-source">TrustRadius</div>
          </div>
        </div>
      </section>

      {/* ── Customer Stories Grid ───────────────────────────────────────────── */}
      <section className="landing-stories-section">
        <div className="stories-header">
          <span className="stories-label">CUSTOMER STORIES</span>
          <h2 className="stories-title">Businesses achieve more with Zoom</h2>
        </div>

        <div className="stories-grid">
          <div className="story-card blue-gradient">
            <span className="story-tag">Customer story</span>
            <h3 className="story-heading">Zoom helps teams work better, together.</h3>
            <button className="story-arrow-btn" onClick={onGoToApp}>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="story-card purple-gradient">
            <span className="story-tag">Customer story</span>
            <h3 className="story-heading">Connecting people across every industry.</h3>
            <button className="story-arrow-btn" onClick={onGoToApp}>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* ── Landing Footer ─────────────────────────────────────────────────── */}
      <footer className="landing-footer">
        <div className="footer-left">
          <div className="landing-logo">
            <div className="landing-logo-icon">
              <Video />
            </div>
            <span className="landing-logo-text">zoom</span>
          </div>
          <p className="text-xs text-gray-400 mt-2">
            © 2026 Zoom Workplace Clone Inc. All rights reserved.
          </p>
        </div>

        <div className="footer-links-grid">
          <div>
            <div className="footer-title">About</div>
            <a href="#">Zoom Blog</a>
            <a href="#">Customers</a>
            <a href="#">Careers</a>
          </div>
          <div>
            <div className="footer-title">Download</div>
            <a href="#">Meetings Client</a>
            <a href="#">Zoom Rooms</a>
            <a href="#">Browser Extension</a>
          </div>
          <div>
            <div className="footer-title">Sales</div>
            <a href="#">Contact Sales</a>
            <a href="#">Plans & Pricing</a>
            <a href="#">Request Demo</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
