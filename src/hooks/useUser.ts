'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { User, UserProgress, UserRole } from '@/types';
import { onAuthStateChange, signOutUser } from '@/lib/firebase-auth';

const STORAGE_KEY = 'psicomente_user';
const PROGRESS_KEY = 'psicomente_progress';
const CHAT_COUNT_KEY = 'psicomente_chat_count';
const DIARY_KEY = 'psicomente_diary_entries';

// Evento personalizado para sincronizar cambios
const USER_CHANGE_EVENT = 'psicomente_user_change';
const PROGRESS_CHANGE_EVENT = 'psicomente_progress_change';

const defaultProgress: UserProgress = {
  points: 0,
  level: 1,
  streak: 0,
  lastActiveDate: new Date().toDateString(),
  totalActivities: 0,
  achievements: [],
  dailyChallengesCompleted: 0,
};

function calculateLevel(points: number): number {
  if (points >= 1500) return 6;
  if (points >= 1000) return 5;
  if (points >= 600) return 4;
  if (points >= 300) return 3;
  if (points >= 100) return 2;
  return 1;
}

function getStoredUser(): User | null {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

function getStoredProgress(): UserProgress {
  if (typeof window === 'undefined') return defaultProgress;
  try {
    const stored = localStorage.getItem(PROGRESS_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {
    // ignore
  }
  return defaultProgress;
}

function getStoredChatCount(): number {
  if (typeof window === 'undefined') return 0;
  try {
    const stored = localStorage.getItem(CHAT_COUNT_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.date !== new Date().toDateString()) {
        return 0;
      }
      return parsed.count;
    }
  } catch {
    // ignore
  }
  return 0;
}

// Función helper para obtener y validar isPremium desde la API
async function fetchUserPremiumStatus(email: string): Promise<{ 
  isPremium: boolean; 
  role: string;
  user: Record<string, unknown> | null;
}> {
  try {
    console.log('[fetchUserPremiumStatus] Fetching user data for:', email);
    
    const response = await fetch(`/api/user?email=${encodeURIComponent(email)}`);
    
    if (!response.ok) {
      console.error('[fetchUserPremiumStatus] API error:', response.status);
      return { isPremium: false, role: 'user', user: null };
    }
    
    const data = await response.json();
    console.log('[fetchUserPremiumStatus] Raw API response:', data);
    
    // Validar que data.user existe
    if (!data.user) {
      console.error('[fetchUserPremiumStatus] No user in response');
      return { isPremium: false, role: 'user', user: null };
    }
    
    // Obtener isPremium - validar que sea booleano true
    const rawIsPremium = data.user.isPremium;
    const isPremium = rawIsPremium === true;
    
    console.log('[fetchUserPremiumStatus] isPremium raw:', rawIsPremium, 'type:', typeof rawIsPremium, 'parsed:', isPremium);
    
    return { 
      isPremium, 
      role: data.user.role || 'user',
      user: data.user 
    };
  } catch (error) {
    console.error('[fetchUserPremiumStatus] Error:', error);
    return { isPremium: false, role: 'user', user: null };
  }
}

export function useUser() {
  const [user, setUser] = useState<User | null>(getStoredUser);
  const [progress, setProgress] = useState<UserProgress>(getStoredProgress);
  const [chatCount, setChatCount] = useState<number>(getStoredChatCount);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionChecked, setSessionChecked] = useState(false);

  // Listen to Firebase auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChange(async (firebaseUser) => {
      if (firebaseUser && !sessionChecked) {
        const email = firebaseUser.email || '';
        const name = firebaseUser.displayName || email.split('@')[0] || 'Usuario';
        const avatar = firebaseUser.photoURL || undefined;

        console.log('[useUser-OAuth] Firebase user detected:', email);

        // Obtener estado Premium desde la base de datos
        const { isPremium, role, user: dbUser } = await fetchUserPremiumStatus(email);

        const oauthUser: User = {
          id: dbUser?.id as string || firebaseUser.uid,
          name: (dbUser?.name as string) || name,
          email,
          isPremium,
          avatar,
          createdAt: dbUser?.createdAt ? new Date(dbUser.createdAt as string) : new Date(),
          role: role as UserRole,
        };

        console.log('[useUser-OAuth] Setting user with isPremium:', isPremium);

        localStorage.setItem(STORAGE_KEY, JSON.stringify(oauthUser));
        setUser(oauthUser);

        if (dbUser) {
          const initialProgress: UserProgress = {
            points: (dbUser.points as number) || 0,
            level: (dbUser.level as number) || 1,
            streak: (dbUser.streak as number) || 0,
            lastActiveDate: new Date().toDateString(),
            totalActivities: 0,
            achievements: [],
            dailyChallengesCompleted: 0,
          };
          localStorage.setItem(PROGRESS_KEY, JSON.stringify(initialProgress));
          setProgress(initialProgress);
        }

        window.dispatchEvent(new Event(USER_CHANGE_EVENT));
      }
      setSessionChecked(true);
    });

    return () => unsubscribe();
  }, [sessionChecked]);

  // Escuchar cambios de otros componentes
  useEffect(() => {
    const handleUserChange = () => {
      setUser(getStoredUser());
    };
    const handleProgressChange = () => {
      setProgress(getStoredProgress());
    };

    window.addEventListener(USER_CHANGE_EVENT, handleUserChange);
    window.addEventListener(PROGRESS_CHANGE_EVENT, handleProgressChange);
    window.addEventListener('storage', handleUserChange);

    return () => {
      window.removeEventListener(USER_CHANGE_EVENT, handleUserChange);
      window.removeEventListener(PROGRESS_CHANGE_EVENT, handleProgressChange);
      window.removeEventListener('storage', handleUserChange);
    };
  }, []);

  const saveUser = useCallback((userData: User) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
    setUser(userData);
    window.dispatchEvent(new Event(USER_CHANGE_EVENT));
  }, []);

  const saveProgress = useCallback((progressData: UserProgress) => {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(progressData));
    setProgress(progressData);
    window.dispatchEvent(new Event(PROGRESS_CHANGE_EVENT));
  }, []);

  const addPoints = useCallback((points: number) => {
    setProgress(prev => {
      const newProgress = {
        ...prev,
        points: prev.points + points,
        totalActivities: prev.totalActivities + 1,
        level: calculateLevel(prev.points + points),
      };
      localStorage.setItem(PROGRESS_KEY, JSON.stringify(newProgress));
      queueMicrotask(() => {
        window.dispatchEvent(new Event(PROGRESS_CHANGE_EVENT));
      });
      return newProgress;
    });
  }, []);

  const login = useCallback(async (name: string, email: string, avatar?: string): Promise<{ isPremium: boolean }> => {
    setIsLoading(true);
    console.log('[useUser-login] Login attempt for:', email);

    const storedProgress = localStorage.getItem(PROGRESS_KEY);
    const localProgress = storedProgress ? JSON.parse(storedProgress) : defaultProgress;

    // Obtener estado Premium desde la base de datos
    const { isPremium, role, user: dbUser } = await fetchUserPremiumStatus(email);

    const newUser: User = {
      id: dbUser?.id as string || crypto.randomUUID(),
      name: name || (dbUser?.name as string) || 'Usuario',
      email,
      isPremium,
      avatar: avatar || undefined,
      createdAt: dbUser?.createdAt ? new Date(dbUser.createdAt as string) : new Date(),
      role: role as UserRole,
    };

    console.log('[useUser-login] Setting user with isPremium:', isPremium);

    localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
    setUser(newUser);

    const dbPoints = (dbUser?.points as number) || 0;
    const dbLevel = (dbUser?.level as number) || 1;
    const bestPoints = Math.max(localProgress.points, dbPoints);
    const bestLevel = Math.max(localProgress.level, dbLevel);

    const initialProgress: UserProgress = {
      points: bestPoints,
      level: bestLevel,
      streak: (dbUser?.streak as number) || localProgress.streak || 0,
      lastActiveDate: new Date().toDateString(),
      totalActivities: localProgress.totalActivities || 0,
      achievements: localProgress.achievements || [],
      dailyChallengesCompleted: localProgress.dailyChallengesCompleted || 0,
    };

    localStorage.setItem(PROGRESS_KEY, JSON.stringify(initialProgress));
    setProgress(initialProgress);

    window.dispatchEvent(new Event(USER_CHANGE_EVENT));
    window.dispatchEvent(new Event(PROGRESS_CHANGE_EVENT));

    setIsLoading(false);
    return { isPremium };
  }, []);

  const logout = useCallback(async () => {
    try {
      await signOutUser();
    } catch {
      // Continue with local logout even if Firebase logout fails
    }

    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(DIARY_KEY);
    setUser(null);
    setSessionChecked(false);
    window.dispatchEvent(new Event(USER_CHANGE_EVENT));
  }, []);

  const incrementChatCount = useCallback(() => {
    setChatCount(prev => {
      const newCount = prev + 1;
      localStorage.setItem(CHAT_COUNT_KEY, JSON.stringify({
        count: newCount,
        date: new Date().toDateString()
      }));
      return newCount;
    });
  }, []);

  const canUseChat = useMemo(() => {
    if (user?.isPremium) return true;
    return chatCount < 5;
  }, [user?.isPremium, chatCount]);

  const remainingChats = useMemo(() => {
    if (user?.isPremium) return Infinity;
    return Math.max(0, 5 - chatCount);
  }, [user?.isPremium, chatCount]);

  // Check if user is admin
  const isAdmin = useMemo(() => {
    const adminEmails = ['m.bolado79@gmail.com'];
    return user?.role === 'admin' || (user?.email && adminEmails.includes(user.email));
  }, [user?.role, user?.email]);

  return {
    user,
    progress,
    isLoading,
    login,
    logout,
    saveUser,
    saveProgress,
    addPoints,
    chatCount,
    incrementChatCount,
    canUseChat,
    remainingChats,
    isAdmin,
  };
}
