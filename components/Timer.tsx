
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { WorkoutConfig, TimerPhase } from '../types';
import AdBanner from './AdBanner';

interface TimerProps {
  config: WorkoutConfig;
  onFinish: () => void;
}

const Timer: React.FC<TimerProps> = ({ config, onFinish }) => {
  const [phase, setPhase] = useState<TimerPhase>('PREPARE');
  const [timeLeft, setTimeLeft] = useState(5); 
  const [currentRound, setCurrentRound] = useState(1);
  // Alterado para false para iniciar pausado
  const [isActive, setIsActive] = useState(false);

  const audioContextRef = useRef<AudioContext | null>(null);

  const playWhistle = useCallback((type: 'start' | 'end' | 'warn') => {
    if (!config.useSound) return;
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
        gain.gain.linearRampToValueAtTime(0.3, time + 0.05);
        gain.gain.setValueAtTime(0.3, time + duration - 0.05);
        gain.gain.linearRampToValueAtTime(0, time + duration);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(time);
        mod.start(time);
        osc.stop(time + duration);
        mod.stop(time + duration);
      };
      if (type === 'start') createWhistleBlast(ctx.currentTime, 1.0);
      else if (type === 'end') {
        createWhistleBlast(ctx.currentTime, 0.4);
        createWhistleBlast(ctx.currentTime + 0.5, 0.4);
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
    } catch (e) { console.warn("Audio failed", e); }
  }, [config.useSound]);

  const vibrate = useCallback((pattern: number | number[]) => {
    if (!config.useVibration) return;
    if ('vibrate' in navigator) navigator.vibrate(pattern);
  }, [config.useVibration]);

  useEffect(() => {
    let interval: any;
    if (isActive) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            if (phase === 'PREPARE') {
              playWhistle('start');
              vibrate(300);
              setPhase('WORK');
              return config.workTime;
            } else if (phase === 'WORK') {
              if (currentRound >= config.rounds) {
                playWhistle('end');
                vibrate([300, 100, 300]);
                setPhase('FINISHED');
                setIsActive(false);
                return 0;
              } else {
                playWhistle('end');
                vibrate(200);
                setPhase('REST');
                return config.restTime;
              }
            } else if (phase === 'REST') {
              playWhistle('start');
              vibrate(300);
              setCurrentRound((r) => r + 1);
              setPhase('WORK');
              return config.workTime;
            }
          }
          if (prev <= 4 && prev > 1) playWhistle('warn');
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive, phase, currentRound, config, playWhistle, vibrate]);

  const getPhaseText = () => {
    if (phase === 'PREPARE') return !isActive ? 'PRONTO PARA INICIAR?' : 'Prepare-se';
    if (phase === 'WORK') return timeLeft <= 10 ? 'FINALIZA!' : 'LUTE';
    if (phase === 'REST') return 'DESCANSO';
    return 'FINALIZADO';
  };

  const isHighIntensity = phase === 'WORK' && timeLeft <= 10;

  // Phase config
  const phaseConfig = {
    PREPARE: {
      bg: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      accent: '#f59e0b',
      accentBg: 'rgba(245,158,11,0.1)',
      accentBorder: 'rgba(245,158,11,0.3)',
    },
    WORK: {
      bg: isHighIntensity
        ? 'linear-gradient(135deg, #1a0505 0%, #2d0a0a 100%)'
        : 'linear-gradient(135deg, #020617 0%, #0f172a 100%)',
      accent: '#ef4444',
      accentBg: 'rgba(239,68,68,0.1)',
      accentBorder: 'rgba(239,68,68,0.3)',
    },
    REST: {
      bg: 'linear-gradient(135deg, #020617 0%, #0a1628 100%)',
      accent: '#22c55e',
      accentBg: 'rgba(34,197,94,0.1)',
      accentBorder: 'rgba(34,197,94,0.3)',
    },
    FINISHED: {
      bg: 'linear-gradient(135deg, #020617 0%, #0f172a 100%)',
      accent: '#ef4444',
      accentBg: 'rgba(239,68,68,0.1)',
      accentBorder: 'rgba(239,68,68,0.3)',
    },
  };

  const currentConfig = phaseConfig[phase] || phaseConfig.PREPARE;

  if (phase === 'FINISHED') {
    return (
      <div
        className="flex-1 flex flex-col items-center justify-center p-6 text-center"
        style={{ background: 'linear-gradient(135deg, #020617 0%, #0f172a 100%)', minHeight: '100vh' }}
      >
        {/* HUD Grid */}
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundImage: `
            linear-gradient(rgba(239,68,68,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(239,68,68,0.03) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
          pointerEvents: 'none',
        }}/>

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            background: 'rgba(239,68,68,0.1)',
            border: '2px solid rgba(239,68,68,0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px',
            fontSize: 36,
            boxShadow: '0 0 30px rgba(239,68,68,0.3)',
          }}>
            🏆
          </div>

          <div style={{
            fontFamily: 'Orbitron, sans-serif',
            fontWeight: 900,
            fontSize: 'clamp(28px, 6vw, 40px)',
            color: '#e5e7eb',
            letterSpacing: '-0.02em',
            marginBottom: 12,
          }}>
            Treino Concluído
          </div>

          <div style={{
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: '0.3em',
            color: '#f59e0b',
            textTransform: 'uppercase',
            marginBottom: 40,
          }}>
            TatameX Performance · OSS!
          </div>

          <button
            onClick={onFinish}
            style={{
              padding: '16px 48px',
              background: 'linear-gradient(135deg, #ef4444, #dc2626)',
              border: 'none',
              borderRadius: 14,
              color: 'white',
              fontSize: 14,
              fontWeight: 700,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              boxShadow: '0 4px 20px rgba(239,68,68,0.4)',
              transition: 'all 0.2s ease',
            }}
          >
            Voltar para Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex-1 flex flex-col overflow-hidden relative"
      style={{
        background: currentConfig.bg,
        minHeight: '100vh',
        transition: 'background 0.5s ease',
      }}
    >
      {/* HUD Grid overlay */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: `
          linear-gradient(rgba(239,68,68,0.025) 1px, transparent 1px),
          linear-gradient(90deg, rgba(239,68,68,0.025) 1px, transparent 1px)
        `,
        backgroundSize: '40px 40px',
        pointerEvents: 'none',
        zIndex: 0,
      }}/>

      {/* Radial glow */}
      <div style={{
        position: 'absolute',
        top: '40%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '70vw',
        height: '70vw',
        maxWidth: 500,
        maxHeight: 500,
        borderRadius: '50%',
        background: `radial-gradient(circle, ${currentConfig.accent}12 0%, transparent 70%)`,
        pointerEvents: 'none',
        zIndex: 0,
        transition: 'background 0.5s ease',
      }}/>

      {/* TOP BAR */}
      <div className="flex items-center justify-between p-4 lg:p-6 relative z-10">
        <button
          onClick={onFinish}
          style={{
            width: 40,
            height: 40,
            borderRadius: 10,
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

        {/* Round indicator */}
        <div style={{
          padding: '8px 20px',
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 12,
          textAlign: 'center',
        }}>
          <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.2em', color: '#64748b', textTransform: 'uppercase', marginBottom: 2 }}>
            Round
          </div>
          <div style={{
            fontFamily: 'Orbitron, sans-serif',
            fontWeight: 800,
            fontSize: 22,
            color: currentConfig.accent,
            lineHeight: 1,
            textShadow: `0 0 15px ${currentConfig.accent}60`,
          }}>
            {currentRound}/{config.rounds}
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 text-center relative z-10">
        
        {/* Phase label */}
        <div style={{
          padding: '5px 18px',
          background: currentConfig.accentBg,
          border: `1px solid ${currentConfig.accentBorder}`,
          borderRadius: 20,
          marginBottom: 16,
          transition: 'all 0.3s ease',
        }}>
          <span style={{
            fontFamily: 'Orbitron, sans-serif',
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: '0.25em',
            color: currentConfig.accent,
            textTransform: 'uppercase',
          }}>
            {getPhaseText()}
          </span>
        </div>

        {/* Big timer */}
        <div
          style={{
            fontFamily: 'Orbitron, sans-serif',
            fontWeight: 900,
            fontSize: 'min(120px, 28vw)',
            color: '#e5e7eb',
            letterSpacing: '-0.03em',
            lineHeight: 0.9,
            marginBottom: 12,
            textShadow: isHighIntensity
              ? '0 0 60px rgba(239,68,68,0.8), 0 0 120px rgba(239,68,68,0.3)'
              : '0 0 30px rgba(255,255,255,0.1)',
            transform: isHighIntensity ? 'scale(1.05)' : 'scale(1)',
            transition: 'all 0.3s ease',
            userSelect: 'none',
          }}
        >
          {timeLeft}
        </div>

        {/* Round name */}
        {config.roundNames[currentRound - 1] && (
          <div style={{
            fontSize: 'clamp(20px, 5vw, 36px)',
            fontWeight: 900,
            color: isHighIntensity ? '#ef4444' : currentConfig.accent,
            textTransform: 'uppercase',
            letterSpacing: '-0.01em',
            marginBottom: 8,
            textShadow: `0 0 20px ${currentConfig.accent}40`,
            transition: 'all 0.3s ease',
          }}>
            {config.roundNames[currentRound - 1]}
          </div>
        )}

        {/* Ad Banner */}
        <div className="w-full mt-4 max-w-sm">
          <AdBanner phase={phase} timeLeft={timeLeft} currentRound={currentRound} />
        </div>
      </div>

      {/* PLAY/PAUSE */}
      <div className="flex justify-center pb-8 pt-4 relative z-10">
        <button
          onClick={() => setIsActive(!isActive)}
          style={{
            width: 68,
            height: 68,
            borderRadius: '50%',
            background: isActive
              ? 'rgba(239,68,68,0.12)'
              : `linear-gradient(135deg, ${currentConfig.accent}, ${currentConfig.accent}cc)`,
            border: `2px solid ${isActive ? 'rgba(239,68,68,0.4)' : currentConfig.accent}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: isActive
              ? '0 0 15px rgba(239,68,68,0.2)'
              : `0 0 25px ${currentConfig.accent}50, 0 4px 20px rgba(0,0,0,0.4)`,
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

export default Timer;
