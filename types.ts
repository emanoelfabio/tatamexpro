
export type Screen = 'HOME' | 'CONFIG' | 'PRESETS' | 'TIMER' | 'SPARRING_TIMER' | 'TRAINING_PLAN' | 'PRESENCE' | 'STORE' | 'LESSON_BUILDER' | 'GUIDED_CLASS' | 'TECHNIQUES' | 'CLASS_HISTORY' | 'NOTES' | 'DASHBOARD' | 'MY_CLASSES' | 'STUDENT_APP';

export interface WorkoutConfig {
  id?: string;
  name: string; 
  roundNames: string[]; 
  workTime: number; 
  restTime: number; 
  rounds: number;
  useSound: boolean;
  useVibration: boolean;
}

export type TimerPhase = 'PREPARE' | 'WORK' | 'REST' | 'FINISHED';

export const INITIAL_CONFIG: WorkoutConfig = {
  name: 'Treino Rápido',
  roundNames: ['Round 1', 'Round 2', 'Round 3', 'Round 4', 'Round 5'],
  workTime: 30,
  restTime: 15,
  rounds: 5,
  useSound: true,
  useVibration: true,
};

export const DEFAULT_SPARRING: WorkoutConfig = {
  name: 'Sparring (Rola)',
  roundNames: Array(20).fill('Luta / Sparring'),
  workTime: 360,
  restTime: 60,
  rounds: 10,
  useSound: true,
  useVibration: true,
};

export interface Activity {
  id: string;
  name: string;
  duration: number;
  objectives: string;
  isFavorite: boolean;
}

export interface LessonPlan {
  id: string;
  name: string;
  modality: string;
  activities: Activity[];
  createdAt: string;
  isFavorite: boolean;
}
