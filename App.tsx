
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
import Auth from './components/Auth';

// Configuração Supabase
const SUPABASE_URL = 'https://voqvpxtyoawlopmeaqiy.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZvcXZweHR5b2F3bG9wbWVhcWl5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE3MTY2NzcsImV4cCI6MjA4NzI5MjY3N30.VY2wb4dC2wNcCbUDWK1e6-UYQnIuEfJeJJhq5yblPKE';

class TatamexSupabase {
  url: string;
  key: string;
  currentUser: any = null;

  constructor() {
    this.url = SUPABASE_URL;
    this.key = SUPABASE_ANON_KEY;
  }

  getHeaders() {
    return {
      'apikey': this.key,
      'Authorization': `Bearer ${this.key}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    };
  }

  async login(email: string, password: string) {
    const response = await fetch(`${this.url}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ email, password })
    });
    const data = await response.json();
    if (response.ok) {
      return { data, error: null };
    } else {
      return { data: null, error: { message: data.error_description || data.msg } };
    }
  }

  async register(email: string, password: string, nome: string) {
    const response = await fetch(`${this.url}/auth/v1/signup`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ email, password })
    });
    const data = await response.json();
    if (response.ok) {
      return { data, error: null };
    } else {
      return { data: null, error: { message: data.error_description || data.msg } };
    }
  }

  async signOut() {
    const savedSession = localStorage.getItem('tatamex_session');
    if (savedSession) {
      const session = JSON.parse(savedSession);
      await fetch(`${this.url}/auth/v1/logout`, {
        method: 'POST',
        headers: {
          ...this.getHeaders(),
          'Authorization': `Bearer ${session.access_token}`
        }
      });
    }
    localStorage.removeItem('tatamex_session');
    this.currentUser = null;
  }
}

const supabase = new TatamexSupabase();

const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>('HOME');
  const [workoutConfig, setWorkoutConfig] = useState<WorkoutConfig>(INITIAL_CONFIG);
  const [customPresets, setCustomPresets] = useState<WorkoutConfig[]>([]);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [selectedLessonPlan, setSelectedLessonPlan] = useState<LessonPlan | null>(null);
  const [selectedPresenceClassId, setSelectedPresenceClassId] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);

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

    // Check for existing session
    const savedSession = localStorage.getItem('tatamex_session');
    if (savedSession) {
      try {
        const session = JSON.parse(savedSession);
        // Fetch user data
        fetch(`${SUPABASE_URL}/rest/v1/usuarios?auth_id=eq.${session.user.id}&select=*`, {
          headers: supabase.getHeaders()
        })
        .then(res => res.json())
        .then(userData => {
          if (userData && userData.length > 0) {
            setUser({ ...session.user, nome: userData[0].nome, tipo: userData[0].tipo });
            setIsAdmin(userData[0].tipo === 'admin');
          }
        });
      } catch (e) {
        console.error("Failed to restore session", e);
      }
    }
  }, []);

  const handleLogin = useCallback((userData: any) => {
    setUser(userData);
    setIsAdmin(userData.tipo === 'admin');
  }, []);

  const handleLogout = useCallback(async () => {
    await supabase.signOut();
    setUser(null);
    setIsAdmin(false);
    setCurrentScreen('HOME');
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
      {!user ? (
        <Auth onLogin={handleLogin} supabase={supabase} />
      ) : (
        <>
          {/* Header com informações do usuário e logout */}
          <div className="bg-slate-800 border-b border-slate-700 px-4 py-2 flex justify-between items-center">
            <div className="flex items-center gap-3">
              {user.foto ? (
                <img src={user.foto} alt={user.nome} className="w-8 h-8 rounded-full" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center text-white font-bold">
                  {user.nome?.charAt(0).toUpperCase() || 'U'}
                </div>
              )}
              <div>
                <span className="text-white font-medium">{user.nome}</span>
                {isAdmin && <span className="ml-2 text-xs bg-red-600 text-white px-2 py-0.5 rounded">ADMIN</span>}
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="text-slate-400 hover:text-red-400 text-sm flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Sair
            </button>
          </div>
          
          {currentScreen === 'HOME' && <Home onNavigate={navigateTo} onSparring={handleStartSparring} onToggleTheme={toggleTheme} theme={theme} isAdmin={isAdmin} />}
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
        </>
      )}
    </div>
  );
};

export default App;
