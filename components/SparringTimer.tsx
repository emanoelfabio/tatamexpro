
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { TimerPhase } from '../types';
import AdBanner from './AdBanner';

interface SparringTimerProps {
  onFinish: () => void;
}

const SPARRING_PRESETS = [
  { label: '2 min', value: 120 },
  { label: '3 min', value: 180 },
  { label: '4 min', value: 240 },
  { label: '5 min', value: 300 },
  { label: '6 min', value: 360 },
  { label: '7 min', value: 420 },
  { label: '8 min', value: 480 },
  { label: '10 min', value: 600 },
];

const SparringTimer: React.FC<SparringTimerProps> = ({ onFinish }) => {
  const [workTime, setWorkTime] = useState(360);
  const [restTime, setRestTime] = useState(60);
  const [phase, setPhase] = useState<TimerPhase>('PREPARE');
  const [timeLeft, setTimeLeft] = useState(5); 
  const [currentRound, setCurrentRound] = useState(1);
  const [isActive, setIsActive] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  const audioContextRef = useRef<AudioContext | null>(null);

  const playWhistle = useCallback((type: 'start' | 'end' | 'rest' | 'warn') => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioContextRef.current;
      const createWhistleBlast = (time: number, duration: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const mod = ctx.createOscillator();
        const modGain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(2200, time);
        mod.frequency.setValueAtTime(35, time);
        modGain.gain.setValueAtTime(150, time);
        mod.connect(modGain);
        modGain.connect(osc.frequency);
        gain.gain.setValueAtTime(0, time);
        gain.gain.linearRampToValueAtTime(0.4, time + 0.05);
        gain.gain.setValueAtTime(0.4, time + duration - 0.05);
        gain.gain.linearRampToValueAtTime(0, time + duration);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(time);
        mod.start(time);
        osc.stop(time + duration);
        mod.stop(time + duration);
      };
      if (type === 'start') createWhistleBlast(ctx.currentTime, 1.2);
      else if (type === 'rest') {
        createWhistleBlast(ctx.currentTime, 0.4);
        createWhistleBlast(ctx.currentTime + 0.5, 0.4);
      } else if (type === 'end') {
        createWhistleBlast(ctx.currentTime, 0.4);
        createWhistleBlast(ctx.currentTime + 0.5, 0.4);
        createWhistleBlast(ctx.currentTime + 1.0, 0.4);
      } else {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.frequency.setValueAtTime(600, ctx.currentTime);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.1);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.1);
      }
    } catch (e) { console.warn("Audio Context failed", e); }
  }, []);

  useEffect(() => {
    let interval: any;
    if (isActive) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            if (phase === 'PREPARE') {
              playWhistle('start');
              setPhase('WORK');
              return workTime;
            } else if (phase === 'WORK') {
              playWhistle('rest');
              setPhase('REST');
              return restTime;
            } else if (phase === 'REST') {
              playWhistle('start');
              setCurrentRound(r => r + 1);
              setPhase('WORK');
              return workTime;
            }
          }
          if (prev <= 4 && prev > 1) playWhistle('warn');
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive, phase, workTime, restTime, playWhistle]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const progress = useMemo(() => {
    const total = phase === 'PREPARE' ? 5 : phase === 'WORK' ? workTime : restTime;
    return (timeLeft / total) * 100;
  }, [timeLeft, phase, workTime, restTime]);

  const updateWorkTime = (delta: number) => {
    setWorkTime(prev => Math.max(30, prev + delta));
    if (!isActive && phase === 'PREPARE') setTimeLeft(5);
  };

  const updateRestTime = (delta: number) => {
    setRestTime(prev => Math.max(10, prev + delta));
  };

  // Phase colors
  const phaseConfig = {
    PREPARE: {
      bg: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      accent: '#f59e0b',
      label: 'Prepare-se',
      labelBg: 'rgba(245,158,11,0.15)',
      labelBorder: 'rgba(245,158,11,0.4)',
      strokeColor: '#f59e0b',
    },
    WORK: {
      bg: timeLeft <= 10
        ? 'linear-gradient(135deg, #1a0505 0%, #2d0a0a 100%)'
        : 'linear-gradient(135deg, #020617 0%, #0f172a 100%)',
      accent: '#ef4444',
      label: timeLeft <= 10 ? 'FINALIZA!' : 'LUTE',
      labelBg: 'rgba(239,68,68,0.15)',
      labelBorder: 'rgba(239,68,68,0.4)',
      strokeColor: '#ef4444',
    },
    REST: {
      bg: 'linear-gradient(135deg, #020617 0%, #0a1628 100%)',
      accent: '#22c55e',
      label: 'DESCANSO',
      labelBg: 'rgba(34,197,94,0.15)',
      labelBorder: 'rgba(34,197,94,0.4)',
      strokeColor: '#22c55e',
    },
    FINISHED: {
      bg: 'linear-gradient(135deg, #020617 0%, #0f172a 100%)',
      accent: '#ef4444',
      label: 'FINALIZADO',
      labelBg: 'rgba(239,68,68,0.15)',
      labelBorder: 'rgba(239,68,68,0.4)',
      strokeColor: '#ef4444',
    },
  };

  const currentPhaseConfig = phaseConfig[phase] || phaseConfig.PREPARE;
  const isWarning = phase === 'WORK' && timeLeft <= 10;

  return (
    <div
      className="flex-1 flex flex-col overflow-hidden relative"
      style={{
        background: currentPhaseConfig.bg,
        minHeight: '100vh',
        transition: 'background 0.7s ease',
      }}
    >
      {/* HUD Grid overlay */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: `
          linear-gradient(rgba(239,68,68,0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(239,68,68,0.03) 1px, transparent 1px)
        `,
        backgroundSize: '40px 40px',
        pointerEvents: 'none',
        zIndex: 0,
      }}/>

      {/* Radial glow */}
      <div style={{
        position: 'absolute',
        top: '30%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '60vw',
        height: '60vw',
        maxWidth: 500,
        maxHeight: 500,
        borderRadius: '50%',
        background: `radial-gradient(circle, ${currentPhaseConfig.accent}15 0%, transparent 70%)`,
        pointerEvents: 'none',
        zIndex: 0,
        transition: 'background 0.7s ease',
      }}/>

      {/* TOP BAR */}
      <div className="flex justify-between items-center p-4 lg:p-6 relative z-10">
        <button
          onClick={onFinish}
          style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#94a3b8',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.15)';
            (e.currentTarget as HTMLButtonElement).style.color = '#ef4444';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.06)';
            (e.currentTarget as HTMLButtonElement).style.color = '#94a3b8';
          }}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowSettings(!showSettings)}
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: showSettings ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.06)',
              border: `1px solid ${showSettings ? 'rgba(239,68,68,0.4)' : 'rgba(255,255,255,0.1)'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: showSettings ? '#ef4444' : '#94a3b8',
              transition: 'all 0.2s ease',
            }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>

          {/* Round counter */}
          <div style={{
            padding: '8px 16px',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 12,
            textAlign: 'right',
          }}>
            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.2em', color: '#64748b', textTransform: 'uppercase' }}>
              Luta Nº
            </div>
            <div style={{
              fontFamily: 'Orbitron, sans-serif',
              fontWeight: 800,
              fontSize: 28,
              color: currentPhaseConfig.accent,
              lineHeight: 1,
              textShadow: `0 0 20px ${currentPhaseConfig.accent}60`,
            }}>
              {currentRound}
            </div>
          </div>
        </div>
      </div>

      {/* MAIN TIMER AREA */}
      <div className="flex-1 flex flex-col items-center justify-center relative z-10 px-4">
        
        {/* Phase badge */}
        <div style={{
          padding: '6px 20px',
          background: currentPhaseConfig.labelBg,
          border: `1px solid ${currentPhaseConfig.labelBorder}`,
          borderRadius: 20,
          marginBottom: 24,
          transition: 'all 0.3s ease',
        }}>
          <span style={{
            fontFamily: 'Orbitron, sans-serif',
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.25em',
            color: currentPhaseConfig.accent,
            textTransform: 'uppercase',
          }}>
            {currentPhaseConfig.label}
          </span>
        </div>

        {/* Circular progress + Timer */}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {/* SVG Ring */}
          <svg
            style={{
              position: 'absolute',
              width: 'min(320px, 80vw)',
              height: 'min(320px, 80vw)',
              transform: 'rotate(-90deg)',
            }}
            viewBox="0 0 200 200"
          >
            {/* Track */}
            <circle
              cx="100" cy="100" r="90"
              fill="transparent"
              stroke="rgba(255,255,255,0.05)"
              strokeWidth="3"
            />
            {/* Progress */}
            <circle
              cx="100" cy="100" r="90"
              fill="transparent"
              stroke={currentPhaseConfig.strokeColor}
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 90}`}
              strokeDashoffset={`${2 * Math.PI * 90 * (1 - progress / 100)}`}
              style={{
                transition: 'stroke-dashoffset 1s linear, stroke 0.7s ease',
                filter: `drop-shadow(0 0 6px ${currentPhaseConfig.strokeColor}80)`,
              }}
            />
          </svg>

          {/* Timer display */}
          <div
            style={{
              fontFamily: 'Orbitron, sans-serif',
              fontWeight: 900,
              fontSize: 'min(80px, 18vw)',
              color: '#e5e7eb',
              letterSpacing: '-0.02em',
              lineHeight: 1,
              textShadow: isWarning ? `0 0 40px rgba(239,68,68,0.8)` : `0 0 30px rgba(255,255,255,0.1)`,
              transform: isWarning ? 'scale(1.05)' : 'scale(1)',
              transition: 'all 0.3s ease',
              userSelect: 'none',
              zIndex: 1,
              padding: 'min(60px, 15vw)',
            }}
          >
            {formatTime(timeLeft)}
          </div>
        </div>

        {/* Ad Banner */}
        <div className="w-full mt-6 max-w-sm">
          <AdBanner phase={phase} timeLeft={timeLeft} currentRound={currentRound} />
        </div>

        {/* Preset buttons (when not active) */}
        {!isActive && !showSettings && (
          <div className="mt-6 w-full max-w-sm">
            <div style={{
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: '0.2em',
              color: '#475569',
              textTransform: 'uppercase',
              textAlign: 'center',
              marginBottom: 10,
            }}>
              Duração da Luta
            </div>
            <div className="grid grid-cols-4 gap-2">
              {SPARRING_PRESETS.map(p => (
                <button
                  key={p.value}
                  onClick={() => {
                    setIsActive(false);
                    setWorkTime(p.value);
                    setPhase('PREPARE');
                    setTimeLeft(5);
                    setCurrentRound(1);
                  }}
                  style={{
                    padding: '8px 4px',
                    borderRadius: 8,
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    background: workTime === p.value ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${workTime === p.value ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.08)'}`,
                    color: workTime === p.value ? '#ef4444' : '#64748b',
                    boxShadow: workTime === p.value ? '0 0 10px rgba(239,68,68,0.2)' : 'none',
                  }}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* SETTINGS OVERLAY */}
      {showSettings && (
        <div style={{
          position: 'absolute',
          inset: 0,
          zIndex: 30,
          background: 'rgba(2, 6, 23, 0.92)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
        }}>
          <div style={{ width: '100%', maxWidth: 380 }}>
            <div style={{
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: '0.2em',
              color: '#ef4444',
              textTransform: 'uppercase',
              marginBottom: 24,
              textAlign: 'center',
            }}>
              Configuração de Luta
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 24 }}>
              {/* Tempo de Luta */}
              <div>
                <label style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.15em', color: '#64748b', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>
                  Tempo de Luta (Sparring)
                </label>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 12,
                  padding: '12px 16px',
                }}>
                  <button
                    onClick={() => updateWorkTime(-30)}
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 10,
                      background: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      color: '#e5e7eb',
                      fontSize: 20,
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >−</button>
                  <span style={{
                    fontFamily: 'Orbitron, sans-serif',
                    fontWeight: 800,
                    fontSize: 32,
                    color: '#e5e7eb',
                    letterSpacing: '-0.02em',
                  }}>
                    {formatTime(workTime)}
                  </span>
                  <button
                    onClick={() => updateWorkTime(30)}
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 10,
                      background: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      color: '#e5e7eb',
                      fontSize: 20,
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >+</button>
                </div>
              </div>

              {/* Tempo de Descanso */}
              <div>
                <label style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.15em', color: '#64748b', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>
                  Tempo de Descanso (Rest)
                </label>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 12,
                  padding: '12px 16px',
                }}>
                  <button
                    onClick={() => updateRestTime(-10)}
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 10,
                      background: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      color: '#e5e7eb',
                      fontSize: 20,
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >−</button>
                  <span style={{
                    fontFamily: 'Orbitron, sans-serif',
                    fontWeight: 800,
                    fontSize: 32,
                    color: '#22c55e',
                    letterSpacing: '-0.02em',
                  }}>
                    {formatTime(restTime)}
                  </span>
                  <button
                    onClick={() => updateRestTime(10)}
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 10,
                      background: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      color: '#e5e7eb',
                      fontSize: 20,
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >+</button>
                </div>
              </div>
            </div>

            {/* Presets */}
            <div className="grid grid-cols-4 gap-2 mb-6">
              {SPARRING_PRESETS.map(p => (
                <button
                  key={p.value}
                  onClick={() => {
                    setWorkTime(p.value);
                    setShowSettings(false);
                    setPhase('PREPARE');
                    setTimeLeft(5);
                    setCurrentRound(1);
                    setIsActive(false);
                  }}
                  style={{
                    padding: '10px 4px',
                    borderRadius: 8,
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    background: workTime === p.value ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${workTime === p.value ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.08)'}`,
                    color: workTime === p.value ? '#ef4444' : '#64748b',
                  }}
                >
                  {p.label}
                </button>
              ))}
            </div>

            <button
              onClick={() => setShowSettings(false)}
              style={{
                width: '100%',
                padding: '14px',
                background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                border: 'none',
                borderRadius: 12,
                color: 'white',
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                boxShadow: '0 4px 20px rgba(239,68,68,0.4)',
                transition: 'all 0.2s ease',
              }}
            >
              Confirmar Ajustes
            </button>
          </div>
        </div>
      )}

      {/* PLAY/PAUSE BUTTON */}
      <div className="flex flex-col items-center pb-8 pt-4 relative z-10">
        <button
          onClick={() => setIsActive(!isActive)}
          style={{
            width: 72,
            height: 72,
            borderRadius: '50%',
            background: isActive
              ? 'rgba(239,68,68,0.15)'
              : `linear-gradient(135deg, ${currentPhaseConfig.accent}, ${currentPhaseConfig.accent}cc)`,
            border: `2px solid ${isActive ? 'rgba(239,68,68,0.5)' : currentPhaseConfig.accent}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: isActive
              ? `0 0 20px rgba(239,68,68,0.3)`
              : `0 0 30px ${currentPhaseConfig.accent}50, 0 4px 20px rgba(0,0,0,0.4)`,
            color: isActive ? '#ef4444' : '#020617',
          }}
        >
          {isActive ? (
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg className="w-8 h-8 ml-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
};

export default SparringTimer;
