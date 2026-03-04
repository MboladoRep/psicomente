// Database types for Supabase
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          name: string;
          email: string;
          ispremium: boolean;
          premiumsince: string | null;
          points: number;
          level: number;
          streak: number;
          createdat: string;
          role: string;
        };
        Insert: {
          id?: string;
          name: string;
          email: string;
          ispremium?: boolean;
          premiumsince?: string | null;
          points?: number;
          level?: number;
          streak?: number;
          createdat?: string;
          role?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          ispremium?: boolean;
          premiumsince?: string | null;
          points?: number;
          level?: number;
          streak?: number;
          createdat?: string;
          role?: string;
        };
      };
    };
  };
}

// User Roles
export type UserRole = 'user' | 'premium' | 'admin';

// User Types
export interface User {
  id: string;
  name: string;
  email: string;
  isPremium: boolean;
  avatar?: string;
  createdAt: Date;
  role: UserRole;
}

// Gamification Types
export interface UserProgress {
  points: number;
  level: number;
  streak: number;
  lastActiveDate: string;
  totalActivities: number;
  achievements: string[];
  dailyChallengesCompleted: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt?: Date;
  requirement: number;
  type: 'points' | 'streak' | 'activities' | 'tests' | 'diary';
}

export interface DailyChallenge {
  id: string;
  title: string;
  description: string;
  points: number;
  type: 'meditation' | 'diary' | 'test' | 'chat' | 'reading';
  completed: boolean;
}

// Chat Types
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export type ChatCategory = 
  | 'ansiedad'
  | 'depresion'
  | 'relaciones'
  | 'autoestima'
  | 'estres'
  | 'duelo'
  | 'general';

// Article Types
export interface Article {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  isPremium: boolean;
  readTime: number;
  author: string;
}

// Emotional Diary Types
export interface DiaryEntry {
  id: string;
  date: Date;
  emotion: string;
  intensity: number;
  notes: string;
}

export type EmotionType = 
  | 'feliz'
  | 'tranquilo'
  | 'neutral'
  | 'triste'
  | 'ansioso'
  | 'enojado'
  | 'estresado'
  | 'agradecido';

// Test Types
export interface TestQuestion {
  id: string;
  text: string;
  options: { value: number; label: string }[];
}

export interface PsychologicalTest {
  id: string;
  title: string;
  description: string;
  questions: TestQuestion[];
  isPremium: boolean;
}

// Constants
export const LEVEL_THRESHOLDS = [
  { level: 1, name: 'Novato', minPoints: 0 },
  { level: 2, name: 'Aprendiz', minPoints: 100 },
  { level: 3, name: 'Intermedio', minPoints: 300 },
  { level: 4, name: 'Avanzado', minPoints: 600 },
  { level: 5, name: 'Experto', minPoints: 1000 },
  { level: 6, name: 'Maestro', minPoints: 1500 },
];

export const FREE_CHAT_LIMIT = 5;
