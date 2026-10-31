import { useState, useEffect, useCallback } from 'react';
import { apiGet, apiPost } from '@/lib/apiClient';
import type { AuthSession } from '@/types';

type LoginResponse = { user: { id: string; name: string; email: string; role: string } };
type MeResponse   = { user: { id: string; name: string; email: string; role: string } };

export function useAuth() {
  const [session, setSession]   = useState<AuthSession | null>(null);
  const [hydrated, setHydrated] = useState(false);

  // On mount: restore session from the httpOnly cookie via GET /api/auth/me
  useEffect(() => {
    apiGet<MeResponse>('/api/auth/me')
      .then(({ user }) => {
        setSession({ email: user.email, name: user.name, role: user.role as AuthSession['role'] });
      })
      .catch(() => {
        // 401 means no active session — that's fine
        setSession(null);
      })
      .finally(() => {
        setHydrated(true);
      });
  }, []);

  const signIn = useCallback(
    async (email: string, password: string): Promise<{ success: boolean; session?: AuthSession }> => {
      try {
        const { user } = await apiPost<LoginResponse>('/api/auth/login', { email, password });
        const newSession: AuthSession = {
          email: user.email,
          name:  user.name,
          role:  user.role as AuthSession['role'],
        };
        setSession(newSession);
        return { success: true, session: newSession };
      } catch {
        return { success: false };
      }
    },
    []
  );

  const signOut = useCallback(async () => {
    try {
      await apiPost('/api/auth/logout', {});
    } catch {
      // Ignore logout errors — clear local state regardless
    }
    setSession(null);
  }, []);

  return { session, signIn, signOut, hydrated };
}
