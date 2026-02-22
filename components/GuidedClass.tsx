import React, { useState, useEffect, useRef, useCallback } from 'react';

interface Activity {
  id: string;
  name: string;
  duration: number; // em segundos
  objectives: string;
}

interface LessonPlan {
  id: string;
  name: string;
  modality: string;
  activities: Activity[];
}

interface GuidedClassProps {
  onBack: () => void;
  lessonPlan?: LessonPlan;
}

const GuidedClass: React.FC<GuidedClassProps> = ({ onBack, lessonPlan }) => {
  const [activities, setActivities] = useState<Activity[]>(lessonPlan?.activities || []);
  const [currentActivityIndex, setCurrentActivityIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(activities[0]?.duration || 0);
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [classStarted, setClassStarted] = useState(false);
  
  const audioContextRef = useRef<AudioContext | null>(null);

  const currentActivity = activities[currentActivityIndex];
  const totalActivities = activities.length;
  const completedActivities = currentActivityIndex;
  const progressPercent = totalActivities > 0 ? ((currentActivityIndex) / totalActivities) * 100 : 0;

  const playAlarm = useCallback((type: 'start' | 'end' | 'warning') => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioContextRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      if (type === 'end') {
        // Alarme potente para ambiente barulhento
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        osc.frequency.setValueAtTime(1100, ctx.currentTime + 0.2);
        osc.frequency.setValueAtTime(880, ctx.currentTime + 0.4);
        osc.frequency.setValueAtTime(1100, ctx.currentTime + 0.6);
        gain.gain.setValueAtTime(0.5, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.8);
      } else if (type === 'warning') {
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.15);
      } else {
        osc.frequency.setValueAtTime(660, ctx.currentTime);
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.3);
      }
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 1);
    } catch (e) {
      console.warn("Audio failed", e);
    }
  }, []);

  const vibrate = useCallback((pattern: number | number[]) => {
    if ('vibrate' in navigator) navigator.vibrate(pattern);
  }, []);

  useEffect(() => {
    let interval: any;
    if (isActive && !isPaused && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            // Atividade terminada
            playAlarm('end');
            vibrate([500, 200, 500, 200, 500]);
            return 0;
          }
          if (prev <= 5 && prev > 1) {
            playAlarm('warning');
            vibrate(100);
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive, isPaused, timeLeft, playAlarm, vibrate]);

  const startClass = () => {
    setClassStarted(true);
    setIsActive(true);
    playAlarm('start');
    vibrate(300);
  };

  const nextActivity = () => {
    if (currentActivityIndex < totalActivities - 1) {
      setCurrentActivityIndex(currentActivityIndex + 1);
      setTimeLeft(activities[currentActivityIndex + 1].duration);
      playAlarm('start');
      vibrate(300);
    } else {
      // Aula finalizada
      setIsActive(false);
    }
  };

  const previousActivity = () => {
    if (currentActivityIndex > 0) {
      setCurrentActivityIndex(currentActivityIndex - 1);
      setTimeLeft(activities[currentActivityIndex - 1].duration);
    }
  };

  const editActivityDuration = (newDuration: number) => {
    const newActivities = [...activities];
    newActivities[currentActivityIndex] = {
      ...currentActivity,
      duration: newDuration * 60 // converter minutos para segundos
    };
    setActivities(newActivities);
    setTimeLeft(newDuration * 60);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getTotalDuration = () => {
    return activities.reduce((acc, a) => acc + a.duration, 0);
  };

  const getElapsedTime = () => {
    let elapsed = 0;
    for (let i = 0; i < currentActivityIndex; i++) {
      elapsed += activities[i].duration;
    }
    if (isActive) {
      elapsed += activities[currentActivityIndex].duration - timeLeft;
    }
    return elapsed;
  };

  if (!lessonPlan && activities.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 bg-tatame-white dark:bg-tatame-black">
        <span className="text-4xl mb-4">📋</span>
        <p className="text-zinc-500 font-bold uppercase text-sm mb-4">Nenhum plano selecionado</p>
        <button onClick={onBack} className="bg-tatame-red text-white px-6 py-3 rounded-xl font-bold">
          Voltar
        </button>
      </div>
    );
  }

  // Tela de resumo antes de iniciar
  if (!classStarted) {
    const totalDuration = getTotalDuration();
    return (
      <div className="flex-1 flex flex-col p-4 lg:p-6 max-w-5xl mx-auto w-full animate-in slide-in-from-right duration-300 overflow-hidden bg-tatame-white dark:bg-tatame-black">
        <div className="flex items-center mb-6">
          <button onClick={onBack} className="p-2 -ml-2 text-zinc-400 hover:text-tatame-red transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h2 className="text-xl font-black uppercase tracking-tight ml-2 text-tatame-black dark:text-tatame-white">
            🎯 Execução Guiada
          </h2>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-800 mb-6">
          <h3 className="text-2xl font-black text-tatame-black dark:text-tatame-white mb-2">
            {lessonPlan?.name || 'Plano de Aula'}
          </h3>
          <p className="text-sm text-zinc-500 uppercase font-bold">{lessonPlan?.modality}</p>
          
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="text-center">
              <span className="block text-2xl font-black text-tatame-red">{totalActivities}</span>
              <span className="text-[10px] uppercase text-zinc-500">Atividades</span>
            </div>
            <div className="text-center">
              <span className="block text-2xl font-black text-tatame-black dark:text-white">{Math.floor(totalDuration / 60)}</span>
              <span className="text-[10px] uppercase text-zinc-500">Minutos</span>
            </div>
            <div className="text-center">
              <span className="block text-2xl font-black text-tatame-gold">{activities.length}</span>
              <span className="text-[10px] uppercase text-zinc-500">Favoritos</span>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar pb-24">
          <h3 className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-3">ATIVIDADES</h3>
          <div className="space-y-2">
            {activities.map((activity, index) => (
              <div key={activity.id} className="bg-white dark:bg-zinc-900 rounded-xl p-3 flex items-center justify-between border border-zinc-100 dark:border-zinc-800">
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center text-xs font-bold text-zinc-500">
                    {index + 1}
                  </div>
                  <span className="font-bold text-sm text-tatame-black dark:text-tatame-white">{activity.name}</span>
                </div>
                <span className="text-xs font-bold text-zinc-500">{Math.floor(activity.duration / 60)}min</span>
              </div>
            ))}
          </div>
        </div>

        <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-tatame-white dark:from-tatame-black via-tatame-white dark:via-tatame-black to-transparent z-10">
          <button 
            onClick={startClass}
            className="w-full py-5 bg-tatame-red hover:bg-[#b5181f] active:scale-95 transition-all rounded-2xl text-xl font-black uppercase tracking-widest text-white shadow-2xl"
          >
            ▶ Iniciar Aula
          </button>
        </div>
      </div>
    );
  }

  const isAlmostDone = timeLeft <= 10 && timeLeft > 0;
  const isFinished = currentActivityIndex >= totalActivities - 1 && timeLeft === 0;

  if (isFinished) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 bg-tatame-white dark:bg-tatame-black text-center">
        <span className="text-6xl mb-4">🏆</span>
        <h2 className="text-3xl font-black uppercase text-tatame-black dark:text-tatame-white mb-2">Aula Concluída!</h2>
        <p className="text-zinc-500 font-bold uppercase text-sm mb-6">
          {lessonPlan?.name}
        </p>
        <div className="bg-white dark:bg-zinc-900 rounded-xl p-4 mb-6 text-left w-full max-w-sm">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <span className="block text-xl font-black text-tatame-black dark:text-white">{totalActivities}</span>
              <span className="text-[10px] uppercase text-zinc-500">Atividades</span>
            </div>
            <div>
              <span className="block text-xl font-black text-tatame-black dark:text-white">{Math.floor(getTotalDuration() / 60)}</span>
              <span className="text-[10px] uppercase text-zinc-500">Minutos</span>
            </div>
          </div>
        </div>
        <button 
          onClick={onBack}
          className="px-8 py-4 bg-tatame-red text-white rounded-xl font-bold uppercase shadow-lg"
        >
          Finalizar
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-tatame-black dark:bg-tatame-black">
      {/* Header */}
      <div className="p-4 flex items-center justify-between">
        <button onClick={onBack} className="p-2 text-white/60 hover:text-white transition-colors">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <div className="text-center">
          <span className="text-[10px] uppercase text-white/50 font-bold tracking-widest">Atividade</span>
          <div className="text-white font-black">{currentActivityIndex + 1} / {totalActivities}</div>
        </div>
        <div className="w-10" />
      </div>

      {/* Barra de Progresso */}
      <div className="h-1 bg-zinc-800 mx-4 rounded-full overflow-hidden">
        <div 
          className="h-full bg-tatame-red transition-all duration-500"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Tempo Total */}
      <div className="px-4 py-2 flex justify-between text-[10px] text-white/40 font-bold uppercase">
        <span>Decorrido: {Math.floor(getElapsedTime() / 60)}min</span>
        <span>Total: {Math.floor(getTotalDuration() / 60)}min</span>
      </div>

      {/* Timer Principal */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <div 
          className={`
            font-bebas text-[12rem] md:text-[16rem] leading-none select-none transition-colors duration-300
            ${isAlmostDone ? 'text-tatame-red animate-pulse' : 'text-white'}
          `}
        >
          {formatTime(timeLeft)}
        </div>
        
        <div className="text-center px-4">
          <h2 className="text-3xl md:text-4xl font-black uppercase text-white mb-2">
            {currentActivity?.name}
          </h2>
          {currentActivity?.objectives && (
            <p className="text-white/50 text-sm font-bold uppercase tracking-widest">
              🎯 {currentActivity.objectives}
            </p>
          )}
        </div>
      </div>

      {/* Edit Duration */}
      <div className="px-4 py-2 bg-zinc-900/50 mx-4 rounded-xl mb-4">
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase text-white/50 font-bold">Duração (min:seg)</span>
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => editActivityDuration(Math.floor((currentActivity?.duration || 60) / 60) - 1)}
              className="w-8 h-8 rounded-lg bg-zinc-800 text-white font-bold flex items-center justify-center"
            >
              -
            </button>
            <span className="text-white font-black w-16 text-center">
              {Math.floor((currentActivity?.duration || 60) / 60)}:00
            </span>
            <button 
              onClick={() => editActivityDuration(Math.floor((currentActivity?.duration || 60) / 60) + 1)}
              className="w-8 h-8 rounded-lg bg-zinc-800 text-white font-bold flex items-center justify-center"
            >
              +
            </button>
          </div>
        </div>
      </div>

      {/* Controles */}
      <div className="p-6 pb-8 flex items-center justify-center space-x-6">
        <button 
          onClick={previousActivity}
          disabled={currentActivityIndex === 0}
          className="w-14 h-14 rounded-full bg-zinc-800 text-white flex items-center justify-center disabled:opacity-30"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <button 
          onClick={() => setIsActive(!isActive)}
          className="w-20 h-20 rounded-full bg-tatame-red text-white flex items-center justify-center shadow-2xl active:scale-95 transition-transform"
        >
          {isActive ? (
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
            </svg>
          ) : (
            <svg className="w-8 h-8 ml-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>

        <button 
          onClick={nextActivity}
          className="w-14 h-14 rounded-full bg-zinc-800 text-white flex items-center justify-center"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default GuidedClass;
