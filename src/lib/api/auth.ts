/**
 * lib/api/auth.ts
 * ─────────────────
 * Frontend API helpers for authentication.
 * register() → POST /api/auth/register
 * login()    → POST /api/auth/login
 * logout()   → POST /api/auth/logout
 * me()       → GET  /api/auth/me
 */

import { apiGet, apiPost } from '@/lib/apiClient';

export interface AuthUser {
  id:    string;
  name:  string;
  email: string;
  role:  'student' | 'mentor' | 'admin';
}

export async function register(
  name: string,
  email: string,
  password: string,
): Promise<AuthUser> {
  const { user } = await apiPost<{ user: AuthUser }>('/api/auth/register', {
    name,
    email,
    password,
  });
  return user;
}

export async function login(email: string, password: string): Promise<AuthUser> {
  const { user } = await apiPost<{ user: AuthUser }>('/api/auth/login', {
    email,
    password,
  });
  return user;
}

export async function logout(): Promise<void> {
  await apiPost('/api/auth/logout', {});
}

export async function me(): Promise<AuthUser | null> {
  try {
    const { user } = await apiGet<{ user: AuthUser }>('/api/auth/me');
    return user;
  } catch {
    return null;
  }
}
