
import React, { useState, useCallback, useEffect } from 'react';
import { Screen, WorkoutConfig, INITIAL_CONFIG, DEFAULT_SPARRING, LessonPlan } from './types';
import Home from './components/Home';
import Config from './components/Config';
import Presets from './components/Presets';
import Timer from './components/Timer';
import SparringTimer from './components/SparringTimer';
import TrainingPlan from './components/TrainingPlan';
import PresenceManager from './components/PresenceManager';
import Store from './components/Store';
import LessonBuilder from './components/LessonBuilder';
import GuidedClass from './components/GuidedClass';
import Techniques from './components/Techniques';
import ClassHistory from './components/ClassHistory';
import Notes from './components/Notes';
import Dashboard from './components/Dashboard';
import MyClasses from './components/MyClasses';
import StudentApp from './components/StudentApp';

const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>('HOME');
  const [workoutConfig, setWorkoutConfig] = useState<WorkoutConfig>(INITIAL_CONFIG);
  const [customPresets, setCustomPresets] = useState<WorkoutConfig[]>([]);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [selectedLessonPlan, setSelectedLessonPlan] = useState<LessonPlan | null>(null);
  const [selectedPresenceClassId, setSelectedPresenceClassId] = useState<string | null>(null);

  // Load theme and custom presets on mount
  useEffect(() => {
    // Force dark mode always for premium experience
    document.documentElement.classList.add('dark');
    setTheme('dark');
    localStorage.setItem('tatamex_theme', 'dark');

    const saved = localStorage.getItem('hjp_custom_presets');
    if (saved) {
      try {
        setCustomPresets(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse custom presets", e);
      }
    }
  }, []);

  const toggleTheme = useCallback(() => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('tatamex_theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  }, [theme]);

  const navigateTo = useCallback((screen: Screen) => {
    setCurrentScreen(screen);
  }, []);

  const handleStartWorkout = useCallback((config: WorkoutConfig) => {
    setWorkoutConfig(config);
    setCurrentScreen('TIMER');
  }, []);

  const handleEditPreset = useCallback((config: WorkoutConfig) => {
    setWorkoutConfig(config);
    setCurrentScreen('CONFIG');
  }, []);

  const handleStartSparring = useCallback(() => {
    setWorkoutConfig(DEFAULT_SPARRING);
    setCurrentScreen('SPARRING_TIMER');
  }, []);

  const handleSavePreset = useCallback((config: WorkoutConfig, presetName: string) => {
    const isExistingCustom = config.id && config.id.startsWith('custom_');
    
    if (isExistingCustom) {
      const updated = customPresets.map(p => 
        p.id === config.id ? { ...config, name: presetName } : p
      );
      setCustomPresets(updated);
      localStorage.setItem('hjp_custom_presets', JSON.stringify(updated));
    } else {
      const newPreset: WorkoutConfig = {
        ...config,
        id: `custom_${Date.now()}`,
        name: presetName
      };
      const updated = [...customPresets, newPreset];
      setCustomPresets(updated);
      localStorage.setItem('hjp_custom_presets', JSON.stringify(updated));
    }
  }, [customPresets]);

  const handleDeletePreset = useCallback((id: string) => {
    const updated = customPresets.filter(p => p.id !== id);
    setCustomPresets(updated);
    localStorage.setItem('hjp_custom_presets', JSON.stringify(updated));
  }, [customPresets]);

  const handleStartLesson = useCallback((plan: LessonPlan) => {
    setSelectedLessonPlan(plan);
    setCurrentScreen('GUIDED_CLASS');
  }, []);

  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      if (currentScreen !== 'HOME') {
        window.history.pushState(null, '', window.location.href);
        setCurrentScreen('HOME');
      }
    };
    window.history.pushState(null, '', window.location.href);
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [currentScreen]);

  return (
    <div className="min-h-screen overflow-hidden flex flex-col" style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      {currentScreen === 'HOME' && <Home onNavigate={navigateTo} onSparring={handleStartSparring} onToggleTheme={toggleTheme} theme={theme} />}
      {currentScreen === 'CONFIG' && (
        <Config 
          onBack={() => navigateTo('HOME')} 
          onStart={handleStartWorkout}
          onSavePreset={handleSavePreset}
          initialValues={workoutConfig}
          customPresets={customPresets}
        />
      )}
      {currentScreen === 'PRESETS' && (
        <Presets 
          onBack={() => navigateTo('HOME')} 
          onSelect={handleStartWorkout}
          onEdit={handleEditPreset}
          customPresets={customPresets}
          onDeletePreset={handleDeletePreset}
          onNavigate={navigateTo}
        />
      )}
      {currentScreen === 'TIMER' && (
        <Timer 
          config={workoutConfig} 
          onFinish={() => navigateTo('HOME')} 
        />
      )}
      {currentScreen === 'SPARRING_TIMER' && (
        <SparringTimer 
          onFinish={() => navigateTo('HOME')} 
        />
      )}
      {currentScreen === 'TRAINING_PLAN' && (
        <TrainingPlan onBack={() => navigateTo('HOME')} />
      )}
      {currentScreen === 'PRESENCE' && (
        <PresenceManager
          onBack={() => { setSelectedPresenceClassId(null); navigateTo('HOME'); }}
          initialClassId={selectedPresenceClassId}
        />
      )}
      {currentScreen === 'STORE' && (
        <Store onBack={() => navigateTo('HOME')} />
      )}
      {currentScreen === 'LESSON_BUILDER' && (
        <LessonBuilder 
          onBack={() => navigateTo('HOME')} 
          onStartLesson={handleStartLesson}
        />
      )}
      {currentScreen === 'GUIDED_CLASS' && (
        <GuidedClass 
          onBack={() => navigateTo('HOME')} 
          lessonPlan={selectedLessonPlan || undefined}
        />
      )}
      {currentScreen === 'TECHNIQUES' && (
        <Techniques onBack={() => navigateTo('HOME')} />
      )}
      {currentScreen === 'CLASS_HISTORY' && (
        <ClassHistory onBack={() => navigateTo('HOME')} />
      )}
      {currentScreen === 'NOTES' && (
        <Notes onBack={() => navigateTo('HOME')} />
      )}
      {currentScreen === 'DASHBOARD' && (
        <Dashboard onBack={() => navigateTo('HOME')} />
      )}
      {currentScreen === 'MY_CLASSES' && (
        <MyClasses
          onBack={() => navigateTo('HOME')}
          onManagePresence={(classId) => {
            setSelectedPresenceClassId(classId || null);
            navigateTo('PRESENCE');
          }}
        />
      )}
      {currentScreen === 'STUDENT_APP' && (
        <StudentApp onBack={() => navigateTo('HOME')} />
      )}
    </div>
  );
};

export default App;
