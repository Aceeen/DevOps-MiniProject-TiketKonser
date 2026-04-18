import React, { useState, useEffect, useCallback } from 'react'

/* ──────────────────────────────────────────────
   DATA KONSER
────────────────────────────────────────────── */
const CONCERTS = [
  {
    id: 1,
    artist: 'Coldplay',
    tour: 'Music of the Spheres World Tour',
    date: 'Sabtu, 14 Juni 2026',
    time: '19:00 WIB',
    venue: 'Gelora Bung Karno, Jakarta',
    category: 'International',
    tags: ['Rock', 'Pop', 'Alternative'],
    tiers: [
      { name: 'Festival', price: 'Rp 1.500.000', available: true },
      { name: 'Tribune A', price: 'Rp 2.500.000', available: true },
      { name: 'VIP', price: 'Rp 5.000.000', available: false },
    ],
    gradient: 'linear-gradient(135deg, #1a1a4e 0%, #0d47a1 50%, #1565c0 100%)',
    accent: '#60a5fa',
    emoji: '🌈',
    hot: true,
  },
  {
    id: 2,
    artist: 'Billie Eilish',
    tour: 'HIT ME HARD AND SOFT: THE TOUR',
    date: 'Jumat, 24 Juli 2026',
    time: '20:00 WIB',
    venue: 'Istora Senayan, Jakarta',
    category: 'International',
    tags: ['Pop', 'Alternative', 'Indie'],
    tiers: [
      { name: 'Festival', price: 'Rp 1.200.000', available: true },
      { name: 'Tribune A', price: 'Rp 2.000.000', available: true },
      { name: 'SVIP', price: 'Rp 7.500.000', available: true },
    ],
    gradient: 'linear-gradient(135deg, #1a2a1a 0%, #1b5e20 50%, #2e7d32 100%)',
    accent: '#4ade80',
    emoji: '🖤',
    hot: true,
  },
  {
    id: 3,
    artist: 'Bruno Mars',
    tour: '24K Magic World Tour — Return',
    date: 'Sabtu, 8 Agustus 2026',
    time: '19:30 WIB',
    venue: 'Gelora Bung Karno, Jakarta',
    category: 'International',
    tags: ['Pop', 'R&B', 'Funk'],
    tiers: [
      { name: 'Festival', price: 'Rp 2.000.000', available: false },
      { name: 'Tribune B', price: 'Rp 3.200.000', available: true },
      { name: 'Diamond', price: 'Rp 10.000.000', available: true },
    ],
    gradient: 'linear-gradient(135deg, #2d1b1b 0%, #7b1fa2 50%, #6a1b9a 100%)',
    accent: '#e879f9',
    emoji: '💜',
    hot: false,
  },
  {
    id: 4,
    artist: 'Raisa',
    tour: 'Raisa Live in Concert 2026',
    date: 'Sabtu, 19 September 2026',
    time: '18:00 WIB',
    venue: 'Tennis Indoor Senayan, Jakarta',
    category: 'Nasional',
    tags: ['Pop', 'R&B'],
    tiers: [
      { name: 'Regular', price: 'Rp 450.000', available: true },
      { name: 'Prestige', price: 'Rp 850.000', available: true },
      { name: 'VVIP', price: 'Rp 2.500.000', available: true },
    ],
    gradient: 'linear-gradient(135deg, #1a1a2e 0%, #c62828 50%, #b71c1c 100%)',
    accent: '#fca5a5',
    emoji: '🌹',
    hot: false,
  },
  {
    id: 5,
    artist: 'Dewa 19',
    tour: '35 Tahun Merajai — The Grand Reunion',
    date: 'Sabtu, 10 Oktober 2026',
    time: '17:00 WIB',
    venue: 'Gelora Bung Karno, Jakarta',
    category: 'Nasional',
    tags: ['Rock', 'Pop Rock'],
    tiers: [
      { name: 'Festival', price: 'Rp 350.000', available: true },
      { name: 'Tribune', price: 'Rp 650.000', available: true },
      { name: 'VVIP', price: 'Rp 1.500.000', available: false },
    ],
    gradient: 'linear-gradient(135deg, #1a1500 0%, #f57f17 50%, #e65100 100%)',
    accent: '#fbbf24',
    emoji: '🔥',
    hot: false,
  },
  {
    id: 6,
    artist: 'NewJeans',
    tour: 'How Sweet World Tour',
    date: 'Jumat, 20 November 2026',
    time: '18:30 WIB',
    venue: 'Indonesia Arena, Jakarta',
    category: 'International',
    tags: ['K-Pop', 'Pop'],
    tiers: [
      { name: 'Standing', price: 'Rp 1.800.000', available: true },
      { name: 'Seated A', price: 'Rp 2.800.000', available: true },
      { name: 'Pit VVIP', price: 'Rp 6.000.000', available: true },
    ],
    gradient: 'linear-gradient(135deg, #0d1b2a 0%, #1e3a5f 50%, #1565c0 100%)',
    accent: '#93c5fd',
    emoji: '🐰',
    hot: true,
  },
]

/* ──────────────────────────────────────────────
   ANIMASI CSS (inject ke <head>)
────────────────────────────────────────────── */
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Space+Grotesk:wght@400;500;600;700&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    background: #07071a;
    color: #e2e8f0;
    font-family: 'Inter', system-ui, sans-serif;
    overflow-x: hidden;
  }

  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: #0d0d24; }
  ::-webkit-scrollbar-thumb { background: #4f46e5; border-radius: 3px; }

  @keyframes pulse-dot {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.5; transform: scale(1.3); }
  }

  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
  }

  @keyframes glow-pulse {
    0%, 100% { box-shadow: 0 0 20px rgba(124,58,237,0.4), 0 0 40px rgba(124,58,237,0.1); }
    50% { box-shadow: 0 0 40px rgba(124,58,237,0.7), 0 0 80px rgba(124,58,237,0.3); }
  }

  @keyframes gradient-shift {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }

  @keyframes slide-up {
    from { opacity: 0; transform: translateY(30px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @keyframes shimmer {
    0% { background-position: -1000px 0; }
    100% { background-position: 1000px 0; }
  }

  .card-hover {
    transition: transform 0.3s ease, box-shadow 0.3s ease;
  }
  .card-hover:hover {
    transform: translateY(-6px);
    box-shadow: 0 20px 60px rgba(0,0,0,0.5) !important;
  }

  .btn-hover {
    transition: all 0.2s ease;
    cursor: pointer;
  }
  .btn-hover:hover {
    filter: brightness(1.15);
    transform: translateY(-1px);
  }
  .btn-hover:active {
    transform: translateY(0px);
  }

  .tag {
    display: inline-block;
    padding: 2px 10px;
    border-radius: 20px;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.03em;
    background: rgba(255,255,255,0.08);
    color: rgba(255,255,255,0.6);
    margin: 2px;
  }

  .filter-btn {
    padding: 8px 20px;
    border-radius: 24px;
    border: 1px solid rgba(255,255,255,0.12);
    background: transparent;
    color: rgba(255,255,255,0.6);
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    font-family: 'Inter', sans-serif;
  }
  .filter-btn:hover {
    background: rgba(124,58,237,0.2);
    border-color: rgba(124,58,237,0.5);
    color: #fff;
  }
  .filter-btn.active {
    background: linear-gradient(135deg, #7c3aed, #4f46e5);
    border-color: transparent;
    color: #fff;
  }

  .slide-up { animation: slide-up 0.5s ease forwards; }
`

/* ──────────────────────────────────────────────
   KOMPONEN: SYSTEM STATUS BAR
────────────────────────────────────────────── */
function SystemStatusBar({ status }) {
  const isOnline = status.api === 'ok'
  return (
    <div style={{
      background: 'rgba(0,0,0,0.6)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid rgba(255,255,255,0.06)',
      padding: '8px 24px',
      display: 'flex',
      alignItems: 'center',
      gap: '24px',
      fontSize: '12px',
      color: 'rgba(255,255,255,0.5)',
      fontFamily: 'monospace',
      flexWrap: 'wrap',
    }}>
      {/* API Status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <span style={{
          display: 'inline-block', width: 8, height: 8, borderRadius: '50%',
          background: isOnline ? '#22c55e' : '#ef4444',
          animation: 'pulse-dot 2s infinite',
        }} />
        <span style={{ color: isOnline ? '#4ade80' : '#f87171' }}>
          API {isOnline ? 'ONLINE' : 'OFFLINE'}
        </span>
      </div>

      {/* Worker Node */}
      {status.node && (
        <div>
          <span style={{ color: '#a78bfa' }}>⚡ Node:</span>{' '}
          <span style={{ color: '#c4b5fd', fontWeight: 600 }}>{status.node}</span>
        </div>
      )}

      {/* Latency */}
      {status.latency && (
        <div>
          <span style={{ color: '#60a5fa' }}>⏱ Latency:</span>{' '}
          <span style={{ color: '#93c5fd' }}>{status.latency}ms</span>
        </div>
      )}

      <div style={{ marginLeft: 'auto', color: 'rgba(255,255,255,0.25)' }}>
        Infrastructure: Docker · Terraform · Ansible · Azure HA
      </div>
    </div>
  )
}

/* ──────────────────────────────────────────────
   KOMPONEN: NAVBAR
────────────────────────────────────────────── */
function Navbar({ onSearch }) {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 100,
      background: scrolled ? 'rgba(7,7,26,0.9)' : 'transparent',
      backdropFilter: scrolled ? 'blur(20px)' : 'none',
      borderBottom: scrolled ? '1px solid rgba(255,255,255,0.06)' : 'none',
      padding: '16px 48px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      transition: 'all 0.3s ease',
    }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{
          width: 38, height: 38, borderRadius: '10px',
          background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '18px', animation: 'glow-pulse 3s infinite',
        }}>🎵</div>
        <div>
          <div style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: '18px', letterSpacing: '-0.02em', color: '#fff' }}>
            TiketKonser
          </div>
          <div style={{ fontSize: '9px', color: '#7c3aed', letterSpacing: '0.12em', fontWeight: 600, marginTop: '-2px' }}>
            HIGH AVAILABILITY PLATFORM
          </div>
        </div>
      </div>

      {/* Search */}
      <div style={{ flex: 1, maxWidth: 380, margin: '0 40px' }}>
        <input
          type="text"
          placeholder="Cari artis, konser, atau venue..."
          onChange={e => onSearch(e.target.value)}
          style={{
            width: '100%', padding: '10px 16px',
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '12px', color: '#fff', fontSize: '14px',
            outline: 'none', fontFamily: 'Inter',
          }}
        />
      </div>

      {/* Nav Links */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '24px', fontSize: '14px', color: 'rgba(255,255,255,0.6)' }}>
        <span style={{ cursor: 'pointer', transition: 'color 0.2s' }}>Jadwal</span>
        <span style={{ cursor: 'pointer', transition: 'color 0.2s' }}>Artis</span>
        <span style={{ cursor: 'pointer', transition: 'color 0.2s' }}>Venue</span>
        <button className="btn-hover" style={{
          padding: '10px 24px',
          background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
          border: 'none', borderRadius: '10px',
          color: '#fff', fontWeight: 600, fontSize: '14px',
          fontFamily: 'Inter',
        }}>
          Masuk
        </button>
      </div>
    </nav>
  )
}

/* ──────────────────────────────────────────────
   KOMPONEN: HERO SECTION
────────────────────────────────────────────── */
function HeroSection() {
  const [count, setCount] = useState(0)
  useEffect(() => {
    const timer = setInterval(() => setCount(c => (c < 1000 ? c + 17 : 1000)), 30)
    return () => clearInterval(timer)
  }, [])

  return (
    <div style={{ position: 'relative', overflow: 'hidden', padding: '80px 48px 100px' }}>
      {/* Background glow effects */}
      <div style={{
        position: 'absolute', top: -100, left: '20%', width: 600, height: 600,
        background: 'radial-gradient(circle, rgba(124,58,237,0.25) 0%, transparent 70%)',
        borderRadius: '50%', pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', top: 0, right: '15%', width: 400, height: 400,
        background: 'radial-gradient(circle, rgba(79,70,229,0.2) 0%, transparent 70%)',
        borderRadius: '50%', pointerEvents: 'none',
      }} />

      {/* HOT badge */}
      <div className="slide-up" style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: '6px',
          padding: '6px 14px', borderRadius: '20px',
          background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)',
          color: '#f87171', fontSize: '12px', fontWeight: 700, letterSpacing: '0.05em',
        }}>
          🔴 LIVE — Penjualan Tiket Dibuka
        </span>
        <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '13px' }}>
          {count.toLocaleString('id')}+ pengguna aktif sekarang
        </span>
      </div>

      {/* Headline */}
      <h1 className="slide-up" style={{
        fontFamily: 'Space Grotesk', fontSize: 'clamp(2.5rem, 5vw, 4.5rem)',
        fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.03em',
        maxWidth: 700, marginBottom: '24px',
        animationDelay: '0.1s',
      }}>
        Rasakan Keajaiban{' '}
        <span style={{
          background: 'linear-gradient(135deg, #a78bfa, #60a5fa, #818cf8)',
          backgroundClip: 'text', WebkitBackgroundClip: 'text',
          color: 'transparent',
          backgroundSize: '200% auto',
          animation: 'gradient-shift 4s linear infinite',
        }}>
          Konser Langsung
        </span>
      </h1>

      <p className="slide-up" style={{
        fontSize: '18px', color: 'rgba(255,255,255,0.55)',
        maxWidth: 540, lineHeight: 1.7, marginBottom: '40px',
        animationDelay: '0.2s',
      }}>
        Platform tiket konser berinfrastruktur <strong style={{ color: '#a78bfa' }}>High-Availability</strong> yang mampu
        menangani lonjakan traffic hingga <strong style={{ color: '#60a5fa' }}>1.000 concurrent users</strong> tanpa downtime.
      </p>

      {/* CTA Buttons */}
      <div className="slide-up" style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', animationDelay: '0.3s' }}>
        <button className="btn-hover" style={{
          padding: '16px 36px',
          background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
          border: 'none', borderRadius: '14px',
          color: '#fff', fontWeight: 700, fontSize: '16px',
          fontFamily: 'Inter', letterSpacing: '-0.01em',
          animation: 'glow-pulse 3s infinite',
        }}>
          🎟️ Lihat Semua Konser
        </button>
        <button className="btn-hover" style={{
          padding: '16px 36px',
          background: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: '14px', color: '#fff',
          fontWeight: 600, fontSize: '16px', fontFamily: 'Inter',
        }}>
          Cek Jadwal Mendatang →
        </button>
      </div>

      {/* Stats row */}
      <div className="slide-up" style={{
        display: 'flex', gap: '48px', marginTop: '64px',
        animationDelay: '0.4s', flexWrap: 'wrap',
      }}>
        {[
          { value: '50+', label: 'Konser per Tahun' },
          { value: '2M+', label: 'Tiket Terjual' },
          { value: '99.9%', label: 'Uptime SLA' },
          { value: '<2s', label: 'Response Time' },
        ].map(s => (
          <div key={s.label}>
            <div style={{ fontFamily: 'Space Grotesk', fontSize: '2rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>
              {s.value}
            </div>
            <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', marginTop: '2px' }}>{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ──────────────────────────────────────────────
   KOMPONEN: CONCERT CARD
────────────────────────────────────────────── */
function ConcertCard({ concert }) {
  const [hovered, setHovered] = useState(false)
  const cheapest = concert.tiers.find(t => t.available)
  const allSoldOut = !cheapest

  return (
    <div
      className="card-hover"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        borderRadius: '20px',
        overflow: 'hidden',
        background: 'rgba(255,255,255,0.03)',
        border: `1px solid ${hovered ? concert.accent + '40' : 'rgba(255,255,255,0.07)'}`,
        transition: 'border-color 0.3s ease',
        position: 'relative',
      }}
    >
      {/* Card header with gradient */}
      <div style={{
        background: concert.gradient,
        padding: '32px 24px 28px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Background decorative emoji */}
        <div style={{
          position: 'absolute', right: 16, top: 16,
          fontSize: '80px', opacity: 0.12,
          animation: 'float 4s ease-in-out infinite',
          animationDelay: `${concert.id * 0.3}s`,
          userSelect: 'none',
        }}>
          {concert.emoji}
        </div>

        {/* HOT badge */}
        {concert.hot && (
          <div style={{
            position: 'absolute', top: 16, right: 16,
            padding: '4px 12px', borderRadius: '20px',
            background: 'rgba(239,68,68,0.8)',
            fontSize: '11px', fontWeight: 700, color: '#fff',
            letterSpacing: '0.05em',
          }}>
            🔥 HOT
          </div>
        )}

        <div style={{
          display: 'inline-block', padding: '4px 10px', borderRadius: '6px',
          background: 'rgba(255,255,255,0.12)', fontSize: '11px',
          fontWeight: 600, color: 'rgba(255,255,255,0.7)',
          letterSpacing: '0.05em', marginBottom: '12px',
        }}>
          {concert.category.toUpperCase()}
        </div>

        <h3 style={{
          fontFamily: 'Space Grotesk', fontSize: '1.6rem',
          fontWeight: 800, color: '#fff', lineHeight: 1.1,
          letterSpacing: '-0.02em', marginBottom: '6px',
        }}>
          {concert.artist}
        </h3>
        <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', fontStyle: 'italic' }}>
          {concert.tour}
        </p>

        <div style={{ marginTop: '12px' }}>
          {concert.tags.map(t => <span key={t} className="tag">{t}</span>)}
        </div>
      </div>

      {/* Card body */}
      <div style={{ padding: '20px 24px' }}>
        {/* Date & Venue */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'rgba(255,255,255,0.7)', fontSize: '13.5px' }}>
            <span style={{ color: concert.accent }}>📅</span>
            <span>{concert.date} · {concert.time}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'rgba(255,255,255,0.7)', fontSize: '13.5px' }}>
            <span style={{ color: concert.accent }}>📍</span>
            <span>{concert.venue}</span>
          </div>
        </div>

        {/* Tier pills */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' }}>
          {concert.tiers.map(tier => (
            <div key={tier.name} style={{
              padding: '6px 12px', borderRadius: '8px',
              background: tier.available ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.02)',
              border: `1px solid ${tier.available ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.04)'}`,
              fontSize: '12px', opacity: tier.available ? 1 : 0.4,
            }}>
              <div style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '1px' }}>{tier.name}</div>
              <div style={{
                fontWeight: 700, color: tier.available ? concert.accent : 'rgba(255,255,255,0.3)',
                fontSize: '11px',
              }}>
                {tier.available ? tier.price : 'HABIS'}
              </div>
            </div>
          ))}
        </div>

        {/* Price + CTA */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            {cheapest ? (
              <>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>Mulai dari</div>
                <div style={{ fontFamily: 'Space Grotesk', fontWeight: 800, fontSize: '1.25rem', color: '#fbbf24' }}>
                  {cheapest.price}
                </div>
              </>
            ) : (
              <div style={{ fontWeight: 700, color: '#ef4444', fontSize: '14px' }}>TIKET HABIS</div>
            )}
          </div>

          <button className="btn-hover" disabled={allSoldOut} style={{
            padding: '12px 24px', borderRadius: '12px',
            background: allSoldOut
              ? 'rgba(255,255,255,0.05)'
              : `linear-gradient(135deg, ${concert.accent}30, ${concert.accent}15)`,
            border: `1px solid ${allSoldOut ? 'rgba(255,255,255,0.06)' : concert.accent + '50'}`,
            color: allSoldOut ? 'rgba(255,255,255,0.25)' : concert.accent,
            fontWeight: 700, fontSize: '14px', fontFamily: 'Inter',
            cursor: allSoldOut ? 'not-allowed' : 'pointer',
          }}>
            {allSoldOut ? 'Sold Out' : 'Beli Tiket →'}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ──────────────────────────────────────────────
   KOMPONEN: INFRA STATUS PANEL
────────────────────────────────────────────── */
function InfraPanel({ status }) {
  const nodes = [
    { id: 'LB-01', role: 'Load Balancer', ip: '10.0.1.4', status: 'active', service: 'Nginx' },
    { id: 'WK-01', role: 'Frontend', ip: '10.0.1.10', status: status.api === 'ok' ? 'active' : 'unknown', service: 'Docker :3000' },
    { id: 'WK-02', role: 'Frontend', ip: '10.0.1.11', status: status.api === 'ok' ? 'active' : 'unknown', service: 'Docker :3000' },
    { id: 'WK-03', role: 'Backend', ip: '10.0.1.20', status: status.api === 'ok' ? 'active' : 'unknown', service: 'Docker :8080' },
    { id: 'WK-04', role: 'Backend', ip: '10.0.1.21', status: status.api === 'ok' ? 'active' : 'unknown', service: 'Docker :8080' },
  ]

  return (
    <div style={{
      background: 'rgba(255,255,255,0.02)',
      border: '1px solid rgba(255,255,255,0.06)',
      borderRadius: '20px', padding: '28px',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h3 style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: '1.1rem', color: '#fff' }}>
            ⚡ Status Infrastruktur
          </h3>
          <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)', marginTop: '2px' }}>
            Azure Cloud · 5 VM · HA Architecture
          </p>
        </div>
        <div style={{
          padding: '6px 14px', borderRadius: '20px',
          background: status.api === 'ok' ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
          border: `1px solid ${status.api === 'ok' ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
          fontSize: '12px', fontWeight: 700,
          color: status.api === 'ok' ? '#4ade80' : '#f87171',
        }}>
          {status.api === 'ok' ? '✓ All Systems Operational' : '⚠ Degraded'}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {nodes.map(node => (
          <div key={node.id} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '12px 16px', borderRadius: '12px',
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.05)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{
                width: 8, height: 8, borderRadius: '50%',
                background: node.status === 'active' ? '#22c55e' : '#94a3b8',
                display: 'inline-block',
                animation: node.status === 'active' ? 'pulse-dot 2s infinite' : 'none',
              }} />
              <div>
                <div style={{ fontWeight: 600, fontSize: '13px', color: '#e2e8f0', fontFamily: 'monospace' }}>
                  {node.id}
                </div>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)' }}>{node.role}</div>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '12px', color: '#a78bfa', fontFamily: 'monospace' }}>{node.ip}</div>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)' }}>{node.service}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ──────────────────────────────────────────────
   APP UTAMA
────────────────────────────────────────────── */
export default function App() {
  const [status, setStatus] = useState({ api: 'checking', node: null, latency: null })
  const [filter, setFilter] = useState('Semua')
  const [search, setSearch] = useState('')

  const checkStatus = useCallback(async () => {
    const t0 = performance.now()
    try {
      const res = await fetch('/api/health')
      const latency = Math.round(performance.now() - t0)
      const data = await res.json()
      setStatus({ api: data.status || 'ok', node: data.hostname || 'wk-01', latency })
    } catch {
      setStatus(s => ({ ...s, api: 'error', latency: null }))
    }
  }, [])

  useEffect(() => {
    checkStatus()
    const interval = setInterval(checkStatus, 10000)
    return () => clearInterval(interval)
  }, [checkStatus])

  const categories = ['Semua', 'International', 'Nasional']
  const filtered = CONCERTS.filter(c => {
    const matchCat = filter === 'Semua' || c.category === filter
    const matchSearch = !search ||
      c.artist.toLowerCase().includes(search.toLowerCase()) ||
      c.venue.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  return (
    <>
      {/* Inject global CSS */}
      <style>{GLOBAL_CSS}</style>

      <SystemStatusBar status={status} />
      <Navbar onSearch={setSearch} />
      <HeroSection />

      {/* Main content */}
      <main style={{ padding: '0 48px 80px' }}>

        {/* Section header + filters */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h2 style={{ fontFamily: 'Space Grotesk', fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#fff' }}>
              Konser Mendatang
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px', marginTop: '4px' }}>
              {filtered.length} konser ditemukan
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            {categories.map(cat => (
              <button key={cat} className={`filter-btn ${filter === cat ? 'active' : ''}`} onClick={() => setFilter(cat)}>
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Concert Grid + Sidebar */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '32px', alignItems: 'start' }}>
          {/* Concert cards grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
            {filtered.map((c, i) => (
              <div key={c.id} className="slide-up" style={{ animationDelay: `${i * 0.07}s` }}>
                <ConcertCard concert={c} />
              </div>
            ))}
            {filtered.length === 0 && (
              <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '80px', color: 'rgba(255,255,255,0.3)' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
                <p>Tidak ada konser yang ditemukan</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <InfraPanel status={status} />

            {/* Load test metrics */}
            <div style={{
              background: 'rgba(124,58,237,0.08)',
              border: '1px solid rgba(124,58,237,0.2)',
              borderRadius: '20px', padding: '24px',
            }}>
              <h3 style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: '1rem', color: '#a78bfa', marginBottom: '16px' }}>
                🧪 Load Test Targets
              </h3>
              {[
                { metric: 'Concurrent Users', target: '1.000 VU', color: '#fbbf24' },
                { metric: 'p95 Response Time', target: '< 2.000 ms', color: '#4ade80' },
                { metric: 'Error Rate', target: '< 1%', color: '#60a5fa' },
                { metric: 'Uptime SLA', target: '≥ 99.9%', color: '#e879f9' },
              ].map(m => (
                <div key={m.metric} style={{
                  display: 'flex', justifyContent: 'space-between',
                  padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.04)',
                  fontSize: '13px',
                }}>
                  <span style={{ color: 'rgba(255,255,255,0.5)' }}>{m.metric}</span>
                  <span style={{ fontWeight: 700, color: m.color, fontFamily: 'monospace' }}>{m.target}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid rgba(255,255,255,0.06)',
        padding: '32px 48px',
        background: 'rgba(0,0,0,0.3)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        flexWrap: 'wrap', gap: '16px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '20px' }}>🎵</span>
          <span style={{ fontFamily: 'Space Grotesk', fontWeight: 700, color: '#fff' }}>TiketKonser</span>
          <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '13px' }}>© 2026</span>
        </div>
        <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.25)', textAlign: 'center' }}>
          Ditenagai oleh infrastruktur High-Availability ·
          Docker · Terraform · Ansible · Azure Cloud · Nginx Load Balancer
        </div>
        <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)' }}>
          Mini Project DevOps Engineering 2026
        </div>
      </footer>
    </>
  )
}
