
import React, { useMemo } from 'react';
import { TimerPhase } from '../types';
import { AD_DATABASE, Announcement } from '../constants';

interface AdBannerProps {
  phase: TimerPhase;
  timeLeft: number;
  currentRound: number;
}

const AdBanner: React.FC<AdBannerProps> = ({ phase, timeLeft, currentRound }) => {
  const ad: Announcement | null = useMemo(() => {
    // Regra: Slogan nos últimos 10 segundos de round ativo
    if (phase === 'WORK' && timeLeft <= 10) {
      return AD_DATABASE.SLOGANS[currentRound % AD_DATABASE.SLOGANS.length];
    }
    
    // Regra: Anúncio de Round
    if (phase === 'WORK') {
      return AD_DATABASE.ROUND[currentRound % AD_DATABASE.ROUND.length];
    }
    
    // Regra: Anúncio de Descanso
    if (phase === 'REST') {
      return AD_DATABASE.REST[currentRound % AD_DATABASE.REST.length];
    }
    
    return null;
  }, [phase, timeLeft, currentRound]);

  if (!ad) return <div className="h-24" />;

  const getAccentClass = (color: string | undefined) => {
    switch(color) {
      case 'red': return 'border-red-600 bg-red-600/10 text-red-500';
      case 'green': return 'border-green-600 bg-green-600/10 text-green-500';
      case 'blue': return 'border-blue-600 bg-blue-600/10 text-blue-500';
      default: return 'border-zinc-800 bg-zinc-900 text-zinc-400';
    }
  };

  return (
    <div className={`w-full max-w-lg mx-auto h-24 p-4 rounded-3xl border-2 flex items-center justify-between transition-all duration-500 animate-in fade-in slide-in-from-bottom-2 ${getAccentClass(ad.accentColor)}`}>
      <div className="flex-1">
        <span className="block text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mb-1">
          {phase === 'WORK' && timeLeft <= 10 ? '🔥 MOTIVAÇÃO' : phase === 'WORK' ? '🥋 PERFORMANCE' : '☕ RECUPERAÇÃO'}
        </span>
        <h4 className="text-xl font-black uppercase tracking-tighter leading-none mb-1 text-white">{ad.title}</h4>
        <p className="text-xs font-bold leading-none opacity-80">{ad.subtitle}</p>
      </div>
      <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center border border-white/10">
         <span className="text-2xl">📢</span>
      </div>
    </div>
  );
};

export default AdBanner;
