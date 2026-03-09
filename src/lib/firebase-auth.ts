'use client';

import { 
  signInWithPopup, 
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { auth, googleProvider } from './firebase';

interface GoogleSignInResult {
  user?: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  error?: string;
}

export async function signInWithGoogle(): Promise<GoogleSignInResult> {
  if (!auth || !googleProvider) {
    return { error: 'Firebase no está configurado. Por favor, contacta al administrador.' };
  }

  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    return {
      user: {
        id: user.uid,
        name: user.displayName || user.email?.split('@')[0] || 'Usuario',
        email: user.email || '',
        avatar: user.photoURL || undefined,
      },
    };
  } catch (error: unknown) {
    console.error('Google sign in error:', error);
    
    // Handle specific errors
    if (error && typeof error === 'object' && 'code' in error) {
      const firebaseError = error as { code: string };
      if (firebaseError.code === 'auth/popup-closed-by-user') {
        return { error: 'Inicio de sesión cancelado' };
      }
      if (firebaseError.code === 'auth/popup-blocked') {
        return { error: 'El navegador bloqueó la ventana emergente. Por favor, permite ventanas emergentes.' };
      }
    }
    
    return { error: 'Error al iniciar sesión con Google' };
  }
}

export async function signOutUser(): Promise<void> {
  if (auth) {
    await firebaseSignOut(auth);
  }
}

export function onAuthStateChange(callback: (user: FirebaseUser | null) => void): () => void {
  if (!auth) {
    callback(null);
    return () => {};
  }
  
  return onAuthStateChanged(auth, callback);
}

export function getCurrentUser(): FirebaseUser | null {
  return auth?.currentUser || null;
}
