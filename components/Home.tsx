
import React, { useState } from 'react';
import { Screen } from '../types';

interface HomeProps {
  onNavigate: (screen: Screen) => void;
  onSparring: () => void;
  onToggleTheme: () => void;
  theme: 'light' | 'dark';
}

const Home: React.FC<HomeProps> = ({ onNavigate, onSparring, onToggleTheme, theme }) => {
  const [activeNav, setActiveNav] = useState<string>('home');

  const menuItems = [
    {
      id: 'sparring',
      category: 'ACADEMIA & COMPETIÇÃO',
      title: 'Cronômetro de Luta',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
          <circle cx="12" cy="13" r="8"/>
          <path d="M12 9v4l2.5 2.5" strokeLinecap="round"/>
          <path d="M9 3h6M12 3v2" strokeLinecap="round"/>
        </svg>
      ),
      accent: '#ef4444',
      accentBg: 'rgba(239,68,68,0.1)',
      accentBorder: 'rgba(239,68,68,0.35)',
      isPrimary: true,
      action: onSparring,
    },
    {
      id: 'lesson',
      category: 'METODOLOGIA',
      title: 'Planos de Aquecimentos',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
          <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/>
          <rect x="9" y="3" width="6" height="4" rx="1"/>
          <path d="M9 12h6M9 16h4" strokeLinecap="round"/>
        </svg>
      ),
      accent: '#ef4444',
      accentBg: 'rgba(239,68,68,0.06)',
      accentBorder: 'rgba(239,68,68,0.2)',
      action: () => onNavigate('LESSON_BUILDER'),
    },
    {
      id: 'techniques',
      category: 'BIBLIOTECA',
      title: 'Técnicas',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
          <path d="M12 2L2 7l10 5 10-5-10-5z"/>
          <path d="M2 17l10 5 10-5M2 12l10 5 10-5"/>
        </svg>
      ),
      accent: '#f59e0b',
      accentBg: 'rgba(245,158,11,0.06)',
      accentBorder: 'rgba(245,158,11,0.2)',
      action: () => onNavigate('TECHNIQUES'),
    },
    {
      id: 'classes',
      category: 'GESTÃO',
      title: 'Minhas Turmas',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
          <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
        </svg>
      ),
      accent: '#ef4444',
      accentBg: 'rgba(239,68,68,0.06)',
      accentBorder: 'rgba(239,68,68,0.2)',
      action: () => onNavigate('MY_CLASSES'),
    },
    {
      id: 'presence',
      category: 'CHAMADA',
      title: 'Presença',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
          <path d="M9 11l3 3L22 4"/>
          <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
        </svg>
      ),
      accent: '#22c55e',
      accentBg: 'rgba(34,197,94,0.06)',
      accentBorder: 'rgba(34,197,94,0.2)',
      action: () => onNavigate('PRESENCE'),
    },
    {
      id: 'history',
      category: 'REGISTROS',
      title: 'Histórico',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
          <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
      ),
      accent: '#ef4444',
      accentBg: 'rgba(239,68,68,0.06)',
      accentBorder: 'rgba(239,68,68,0.2)',
      action: () => onNavigate('CLASS_HISTORY'),
    },
    {
      id: 'notes',
      category: 'PESSOAL',
      title: 'Anotações',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
          <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
          <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
        </svg>
      ),
      accent: '#f59e0b',
      accentBg: 'rgba(245,158,11,0.06)',
      accentBorder: 'rgba(245,158,11,0.2)',
      action: () => onNavigate('NOTES'),
    },
    {
      id: 'dashboard',
      category: 'ANÁLISE',
      title: 'Estatísticas',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
          <path d="M18 20V10M12 20V4M6 20v-6"/>
        </svg>
      ),
      accent: '#22c55e',
      accentBg: 'rgba(34,197,94,0.06)',
      accentBorder: 'rgba(34,197,94,0.2)',
      action: () => onNavigate('DASHBOARD'),
    },
    {
      id: 'curriculum',
      category: 'METODOLOGIA',
      title: 'Curriculum',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
          <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
          <path d="M6 12v5c3 3 9 3 12 0v-5"/>
        </svg>
      ),
      accent: '#ef4444',
      accentBg: 'rgba(239,68,68,0.06)',
      accentBorder: 'rgba(239,68,68,0.2)',
      action: () => onNavigate('TRAINING_PLAN'),
    },
    {
      id: 'studentApp',
      category: 'ALUNOS',
      title: 'App do Aluno',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
          <rect x="5" y="2" width="14" height="20" rx="2" ry="2"/>
          <path d="M12 18h.01"/>
          <path d="M9 6h6"/>
        </svg>
      ),
      accent: '#3b82f6',
      accentBg: 'rgba(59,130,246,0.06)',
      accentBorder: 'rgba(59,130,246,0.2)',
      action: () => onNavigate('STUDENT_APP'),
    },
  ];

  const sidebarItems = [
    { id: 'home', label: 'Dashboard', icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
        <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
        <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
      </svg>
    )},
    { id: 'sparring', label: 'Cronómetro', sub: 'TASTIM', icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
        <circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2.5" strokeLinecap="round"/>
        <path d="M9 3h6" strokeLinecap="round"/>
      </svg>
    ), action: onSparring },
    { id: 'classes', label: 'Turmas', icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
      </svg>
    ), action: () => onNavigate('MY_CLASSES') },
    { id: 'presence', label: 'Presença', icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
        <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
      </svg>
    ), action: () => onNavigate('PRESENCE') },
    { id: 'stats', label: 'Estatísticas', icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
        <path d="M18 20V10M12 20V4M6 20v-6"/>
      </svg>
    ), action: () => onNavigate('DASHBOARD') },
    { id: 'config', label: 'Configurações', icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
        <circle cx="12" cy="12" r="3"/>
        <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>
      </svg>
    ), action: () => onNavigate('CONFIG') },
  ];

  return (
    <div className="flex-1 flex flex-col min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      
      {/* HEADER PREMIUM */}
      <header style={{
        background: 'rgba(15, 23, 42, 0.95)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(239,68,68,0.15)',
        boxShadow: '0 4px 30px rgba(0,0,0,0.4)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}>
        <div className="flex items-center justify-between px-4 lg:px-6 py-3">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div style={{
              width: 36,
              height: 36,
              background: 'linear-gradient(135deg, #ef4444, #dc2626)',
              borderRadius: 10,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 15px rgba(239,68,68,0.4)',
              flexShrink: 0,
            }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" className="w-5 h-5">
                <circle cx="12" cy="13" r="7"/>
                <path d="M12 9v4l2.5 2.5" strokeLinecap="round"/>
                <path d="M9 3h6M12 3v2" strokeLinecap="round"/>
              </svg>
            </div>
            <div>
              <div className="flex items-baseline gap-1">
                <span style={{
                  fontFamily: 'Orbitron, sans-serif',
                  fontWeight: 800,
                  fontSize: 18,
                  color: '#e5e7eb',
                  letterSpacing: '-0.02em',
                  lineHeight: 1,
                }}>Tatame</span>
                <span style={{
                  fontFamily: 'Orbitron, sans-serif',
                  fontWeight: 900,
                  fontSize: 18,
                  color: '#ef4444',
                  letterSpacing: '-0.02em',
                  lineHeight: 1,
                  textShadow: '0 0 15px rgba(239,68,68,0.5)',
                }}>X</span>
              </div>
              <div style={{
                fontSize: 9,
                fontWeight: 700,
                letterSpacing: '0.25em',
                color: '#94a3b8',
                textTransform: 'uppercase',
                lineHeight: 1,
                marginTop: 2,
              }}>Performance System</div>
            </div>
          </div>

          {/* Center - Status bar (desktop) */}
          <div className="hidden lg:flex items-center gap-6">
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '4px 12px',
              background: 'rgba(34,197,94,0.1)',
              border: '1px solid rgba(34,197,94,0.2)',
              borderRadius: 20,
            }}>
              <div style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: '#22c55e',
                boxShadow: '0 0 8px rgba(34,197,94,0.8)',
                animation: 'pulse 2s infinite',
              }}/>
              <span style={{ fontSize: 10, fontWeight: 700, color: '#22c55e', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                Sistema Online
              </span>
            </div>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={onToggleTheme}
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                color: '#94a3b8',
                fontSize: 16,
              }}
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 12px',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 10,
              cursor: 'pointer',
            }}>
              <div style={{
                width: 28,
                height: 28,
                borderRadius: 8,
                background: 'linear-gradient(135deg, #ef4444, #7c3aed)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" className="w-4 h-4">
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
              </div>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#e5e7eb' }}>Sensei</span>
            </div>
          </div>
        </div>
      </header>

      {/* MAIN LAYOUT */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* SIDEBAR - Desktop only */}
        <aside className="hidden lg:flex flex-col" style={{
          width: 220,
          background: 'rgba(15, 23, 42, 0.8)',
          borderRight: '1px solid rgba(255,255,255,0.05)',
          padding: '20px 12px',
          gap: 4,
          flexShrink: 0,
        }}>
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveNav(item.id);
                if (item.action) item.action();
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px 12px',
                borderRadius: 10,
                background: activeNav === item.id ? 'rgba(239,68,68,0.12)' : 'transparent',
                border: `1px solid ${activeNav === item.id ? 'rgba(239,68,68,0.25)' : 'transparent'}`,
                color: activeNav === item.id ? '#ef4444' : '#94a3b8',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                textAlign: 'left',
                width: '100%',
              }}
              onMouseEnter={(e) => {
                if (activeNav !== item.id) {
                  (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.06)';
                  (e.currentTarget as HTMLButtonElement).style.color = '#e5e7eb';
                }
              }}
              onMouseLeave={(e) => {
                if (activeNav !== item.id) {
                  (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                  (e.currentTarget as HTMLButtonElement).style.color = '#94a3b8';
                }
              }}
            >
              <span style={{ flexShrink: 0 }}>{item.icon}</span>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.2 }}>{item.label}</div>
                {(item as any).sub && (
                  <div style={{ fontSize: 9, letterSpacing: '0.1em', opacity: 0.5, textTransform: 'uppercase', marginTop: 1 }}>
                    {(item as any).sub}
                  </div>
                )}
              </div>
              {activeNav === item.id && (
                <div style={{
                  marginLeft: 'auto',
                  width: 4,
                  height: 4,
                  borderRadius: '50%',
                  background: '#ef4444',
                  boxShadow: '0 0 8px rgba(239,68,68,0.8)',
                }}/>
              )}
            </button>
          ))}

          {/* Sidebar footer */}
          <div style={{ marginTop: 'auto', paddingTop: 20 }}>
            <div style={{
              padding: '12px',
              background: 'rgba(239,68,68,0.06)',
              border: '1px solid rgba(239,68,68,0.15)',
              borderRadius: 10,
            }}>
              <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.15em', color: '#ef4444', textTransform: 'uppercase', marginBottom: 4 }}>
                TatameX v2.0
              </div>
              <div style={{ fontSize: 10, color: '#94a3b8', lineHeight: 1.4 }}>
                Sistema Operacional do Tatame
              </div>
            </div>
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <main className="flex-1 overflow-y-auto no-scrollbar" style={{ padding: '20px 16px 80px' }}>
          
          {/* Page header */}
          <div className="mb-6" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: 16 }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', color: '#ef4444', textTransform: 'uppercase', marginBottom: 4 }}>
              Academia & Competição
            </div>
            <h1 style={{
              fontFamily: 'Orbitron, sans-serif',
              fontWeight: 800,
              fontSize: 'clamp(20px, 4vw, 28px)',
              color: '#e5e7eb',
              letterSpacing: '-0.02em',
              lineHeight: 1.1,
            }}>
              CRONÔMETRO DE LUTA
            </h1>
          </div>

          {/* PRIMARY CARD - Sparring Timer */}
          <button
            onClick={onSparring}
            className="w-full mb-4 text-left"
            style={{
              background: 'linear-gradient(135deg, rgba(239,68,68,0.15) 0%, rgba(220,38,38,0.08) 100%)',
              border: '1px solid rgba(239,68,68,0.35)',
              borderRadius: 16,
              padding: '20px 24px',
              cursor: 'pointer',
              transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
              position: 'relative',
              overflow: 'hidden',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 8px 40px rgba(239,68,68,0.25), 0 0 0 1px rgba(239,68,68,0.5)';
              (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.boxShadow = 'none';
              (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)';
            }}
          >
            {/* Background decoration */}
            <div style={{
              position: 'absolute',
              right: -20,
              top: -20,
              width: 120,
              height: 120,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(239,68,68,0.15) 0%, transparent 70%)',
              pointerEvents: 'none',
            }}/>
            <div className="flex items-center justify-between relative z-10">
              <div>
                <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.2em', color: '#ef4444', textTransform: 'uppercase', marginBottom: 6 }}>
                  Academia & Competição
                </div>
                <div style={{
                  fontFamily: 'Orbitron, sans-serif',
                  fontWeight: 800,
                  fontSize: 'clamp(18px, 3vw, 24px)',
                  color: '#e5e7eb',
                  letterSpacing: '-0.01em',
                }}>
                  Cronômetro de Luta
                </div>
                <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>
                  Sparring • Rounds • Descanso
                </div>
              </div>
              <div style={{
                width: 56,
                height: 56,
                borderRadius: 14,
                background: 'rgba(239,68,68,0.15)',
                border: '1px solid rgba(239,68,68,0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                boxShadow: '0 0 20px rgba(239,68,68,0.2)',
              }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="1.5" className="w-7 h-7">
                  <circle cx="12" cy="13" r="8"/>
                  <path d="M12 9v4l2.5 2.5" strokeLinecap="round"/>
                  <path d="M9 3h6M12 3v2" strokeLinecap="round"/>
                </svg>
              </div>
            </div>
          </button>

          {/* GRID DE MÓDULOS */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
            {menuItems.slice(1).map((item) => (
              <button
                key={item.id}
                onClick={item.action}
                className="text-left"
                style={{
                  background: 'var(--bg-card)',
                  border: `1px solid ${item.accentBorder}`,
                  borderRadius: 14,
                  padding: '16px',
                  cursor: 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
                  position: 'relative',
                  overflow: 'hidden',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-3px)';
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 8px 30px rgba(0,0,0,0.4), 0 0 15px ${item.accentBg}`;
                  (e.currentTarget as HTMLButtonElement).style.borderColor = item.accent;
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)';
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = 'none';
                  (e.currentTarget as HTMLButtonElement).style.borderColor = item.accentBorder;
                }}
              >
                {/* Top accent line */}
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 2,
                  background: `linear-gradient(90deg, transparent, ${item.accent}, transparent)`,
                  opacity: 0.6,
                }}/>
                
                <div className="flex items-start justify-between mb-3">
                  <div style={{
                    width: 40,
                    height: 40,
                    borderRadius: 10,
                    background: item.accentBg,
                    border: `1px solid ${item.accentBorder}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: item.accent,
                  }}>
                    {item.icon}
                  </div>
                  <div style={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    background: item.accent,
                    opacity: 0.6,
                    marginTop: 4,
                  }}/>
                </div>
                
                <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.15em', color: item.accent, textTransform: 'uppercase', marginBottom: 4 }}>
                  {item.category}
                </div>
                <div style={{
                  fontSize: 15,
                  fontWeight: 700,
                  color: '#e5e7eb',
                  lineHeight: 1.2,
                }}>
                  {item.title}
                </div>
              </button>
            ))}
          </div>

          {/* Footer */}
          <div className="mt-8 text-center" style={{
            fontSize: 9,
            fontWeight: 700,
            letterSpacing: '0.3em',
            color: '#334155',
            textTransform: 'uppercase',
          }}>
            TATAMEX PERFORMANCE · OSS · DADOS CRIPTOGRAFADOS 🔒
          </div>
        </main>
      </div>

      {/* MOBILE BOTTOM NAV */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50" style={{
        background: 'rgba(15, 23, 42, 0.97)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        padding: '8px 4px',
        display: 'flex',
        justifyContent: 'space-around',
      }}>
        {[
          { id: 'home', label: 'Home', icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
          ), action: () => setActiveNav('home') },
          { id: 'sparring', label: 'Timer', icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
              <circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2.5" strokeLinecap="round"/>
              <path d="M9 3h6" strokeLinecap="round"/>
            </svg>
          ), action: onSparring },
          { id: 'classes', label: 'Turmas', icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
            </svg>
          ), action: () => onNavigate('MY_CLASSES') },
          { id: 'presence', label: 'Presença', icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
              <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
            </svg>
          ), action: () => onNavigate('PRESENCE') },
          { id: 'stats', label: 'Stats', icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
              <path d="M18 20V10M12 20V4M6 20v-6"/>
            </svg>
          ), action: () => onNavigate('DASHBOARD') },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => { setActiveNav(item.id); item.action(); }}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 3,
              padding: '6px 12px',
              borderRadius: 10,
              background: activeNav === item.id ? 'rgba(239,68,68,0.12)' : 'transparent',
              border: 'none',
              color: activeNav === item.id ? '#ef4444' : '#64748b',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              minWidth: 52,
            }}
          >
            {item.icon}
            <span style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              {item.label}
            </span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default Home;
