import { useState, useEffect, useCallback } from 'react';
import { demoUsers, type AuthRole } from '@/data/demoUsers';

export type AuthSession = {
  email: string;
  name: string;
  role: AuthRole;
};

const STORAGE_KEY = 'fypm-auth-session';

function loadSession(): AuthSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed.email === 'string' && typeof parsed.role === 'string') {
      return parsed as AuthSession;
    }
    return null;
  } catch {
    return null;
  }
}

function saveSession(session: AuthSession | null) {
  if (session) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  } else {
    localStorage.removeItem(STORAGE_KEY);
  }
}

export function useAuth() {
  const [session, setSession] = useState<AuthSession | null>(() => loadSession());

  useEffect(() => {
    saveSession(session);
  }, [session]);

  const signIn = useCallback(
    (email: string, password: string): { success: boolean; session?: AuthSession } => {
      const normalizedEmail = email.trim().toLowerCase();
      const user = demoUsers.find(
        (u) => u.email.toLowerCase() === normalizedEmail && u.password === password
      );
      if (!user) {
        return { success: false };
      }
      const newSession: AuthSession = {
        email: user.email,
        name: user.name,
        role: user.role,
      };
      setSession(newSession);
      return { success: true, session: newSession };
    },
    []
  );

  const signOut = useCallback(() => {
    setSession(null);
  }, []);

  return { session, signIn, signOut };
}
