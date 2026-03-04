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
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : null;
}

function getStoredProgress(): UserProgress {
  if (typeof window === 'undefined') return defaultProgress;
  const stored = localStorage.getItem(PROGRESS_KEY);
  if (stored) {
    const parsed = JSON.parse(stored);
    return parsed;
  }
  return defaultProgress;
}

function getStoredChatCount(): number {
  if (typeof window === 'undefined') return 0;
  const stored = localStorage.getItem(CHAT_COUNT_KEY);
  if (stored) {
    const parsed = JSON.parse(stored);
    if (parsed.date !== new Date().toDateString()) {
      return 0;
    }
    return parsed.count;
  }
  return 0;
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
        // User is signed in with Firebase (Google OAuth)
        const email = firebaseUser.email || '';
        const name = firebaseUser.displayName || email.split('@')[0] || 'Usuario';
        const avatar = firebaseUser.photoURL || undefined;

        // Sync with database
        try {
          const dbResponse = await fetch(`/api/user?email=${encodeURIComponent(email)}`);
          const dbData = await dbResponse.json();

          const oauthUser: User = {
            id: dbData.user?.id || firebaseUser.uid,
            name: dbData.user?.name || name,
            email,
            isPremium: dbData.user?.isPremium || false,
            avatar,
            createdAt: dbData.user?.createdAt ? new Date(dbData.user.createdAt) : new Date(),
            role: (dbData.user?.role as UserRole) || 'user',
          };

          localStorage.setItem(STORAGE_KEY, JSON.stringify(oauthUser));
          setUser(oauthUser);

          if (dbData.user) {
            const initialProgress: UserProgress = {
              points: dbData.user.points || 0,
              level: dbData.user.level || 1,
              streak: dbData.user.streak || 0,
              lastActiveDate: new Date().toDateString(),
              totalActivities: 0,
              achievements: [],
              dailyChallengesCompleted: 0,
            };
            localStorage.setItem(PROGRESS_KEY, JSON.stringify(initialProgress));
            setProgress(initialProgress);
          }

          window.dispatchEvent(new Event(USER_CHANGE_EVENT));
        } catch {
          // Continue with local user if DB fails
          const oauthUser: User = {
            id: firebaseUser.uid,
            name,
            email,
            isPremium: false,
            avatar,
            createdAt: new Date(),
            role: 'user',
          };
          localStorage.setItem(STORAGE_KEY, JSON.stringify(oauthUser));
          setUser(oauthUser);
        }
      } else if (!firebaseUser && sessionChecked) {
        // User signed out from Firebase, clear local data
        const storedUser = getStoredUser();
        if (storedUser) {
          // Keep the user logged in locally even if Firebase session ended
          // This provides a better UX
        }
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
      // Disparar evento para que otros componentes se actualicen
      queueMicrotask(() => {
        window.dispatchEvent(new Event(PROGRESS_CHANGE_EVENT));
      });
      return newProgress;
    });
  }, []);

  const login = useCallback(async (name: string, email: string, avatar?: string) => {
    setIsLoading(true);
    
    const storedProgress = localStorage.getItem(PROGRESS_KEY);
    const localProgress = storedProgress ? JSON.parse(storedProgress) : defaultProgress;
    
    try {
      const response = await fetch(`/api/user?email=${encodeURIComponent(email)}`);
      const data = await response.json();
      
      const newUser: User = {
        id: data.user?.id || crypto.randomUUID(),
        name: name || data.user?.name || 'Usuario',
        email,
        isPremium: data.user?.isPremium || false,
        avatar: avatar || undefined,
        createdAt: data.user?.createdAt ? new Date(data.user.createdAt) : new Date(),
        role: (data.user?.role as UserRole) || 'user',
      };
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
      setUser(newUser);
      
      const dbPoints = data.user?.points || 0;
      const dbLevel = data.user?.level || 1;
      const bestPoints = Math.max(localProgress.points, dbPoints);
      const bestLevel = Math.max(localProgress.level, dbLevel);
      
      const initialProgress: UserProgress = {
        points: bestPoints,
        level: bestLevel,
        streak: data.user?.streak || localProgress.streak || 0,
        lastActiveDate: new Date().toDateString(),
        totalActivities: localProgress.totalActivities || 0,
        achievements: localProgress.achievements || [],
        dailyChallengesCompleted: localProgress.dailyChallengesCompleted || 0,
      };
      
      localStorage.setItem(PROGRESS_KEY, JSON.stringify(initialProgress));
      setProgress(initialProgress);
      
      // Disparar eventos para actualizar UI
      window.dispatchEvent(new Event(USER_CHANGE_EVENT));
      window.dispatchEvent(new Event(PROGRESS_CHANGE_EVENT));
      
      if (localProgress.points > dbPoints) {
        fetch('/api/user', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            points: localProgress.points,
            level: localProgress.level,
          }),
        }).catch(() => {});
      }
    } catch {
      const newUser: User = {
        id: crypto.randomUUID(),
        name,
        email,
        isPremium: false,
        avatar: avatar || undefined,
        createdAt: new Date(),
        role: 'user',
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
      setUser(newUser);
      
      const initialProgress: UserProgress = {
        ...localProgress,
        lastActiveDate: new Date().toDateString(),
      };
      localStorage.setItem(PROGRESS_KEY, JSON.stringify(initialProgress));
      setProgress(initialProgress);
      
      window.dispatchEvent(new Event(USER_CHANGE_EVENT));
      window.dispatchEvent(new Event(PROGRESS_CHANGE_EVENT));
    }
    
    setIsLoading(false);
  }, []);

  const logout = useCallback(async () => {
    // Sign out from Firebase
    try {
      await signOutUser();
    } catch {
      // Continue with local logout even if Firebase logout fails
    }
    
    // Clear local storage
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(DIARY_KEY);
    setUser(null);
    setSessionChecked(false);
    window.dispatchEvent(new Event(USER_CHANGE_EVENT));
  }, []);

  const upgradeToPremium = useCallback(() => {
    if (user) {
      const updated = { ...user, isPremium: true };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      setUser(updated);
      window.dispatchEvent(new Event(USER_CHANGE_EVENT));
      
      fetch('/api/user', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          isPremium: true,
          premiumSince: new Date().toISOString(),
        }),
      }).catch(() => {});
    }
  }, [user]);

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

  // Check if user is admin (by role OR by email as fallback)
  const isAdmin = useMemo(() => {
    // Fallback: el email del admin principal siempre tiene acceso
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
    upgradeToPremium,
    chatCount,
    incrementChatCount,
    canUseChat,
    remainingChats,
    isAdmin,
  };
}
