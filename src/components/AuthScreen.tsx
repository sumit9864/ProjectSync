import { useState } from 'react';
import { useToast } from '@/components/ui/Toast';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { SignInForm } from '@/components/auth/SignInForm';
import { SignUpForm } from '@/components/auth/SignUpForm';
import type { AuthSession } from '@/types';
import type { ThemeMode } from '@/hooks/useTheme';

type AuthScreenProps = {
  onSignIn: (email: string, password: string) => { success: boolean; session?: AuthSession };
  theme: ThemeMode;
  onToggleTheme: () => void;
};

type Mode = 'signin' | 'signup';

export function AuthScreen({ onSignIn, theme, onToggleTheme }: AuthScreenProps) {
  const [mode, setMode] = useState<Mode>('signin');
  const { showToast } = useToast();

  return (
    <div className="auth-shell relative flex min-h-screen items-center justify-center overflow-hidden bg-ink-50 px-4 py-8 text-ink-800 dark:bg-ink-950 dark:text-ink-100">
      {/* Background decoration */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-40 -top-40 h-96 w-96 animate-pulse rounded-full bg-brand-300/30 blur-3xl dark:bg-brand-600/15" />
        <div className="absolute -right-40 top-1/3 h-96 w-96 rounded-full bg-sky-300/25 blur-3xl dark:bg-sky-600/10" />
        <div className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-emerald-300/20 blur-3xl dark:bg-emerald-600/10" />
        <div className="auth-grid absolute inset-0 opacity-70 dark:opacity-45" />
      </div>

      {/* Theme toggle — top right */}
      <div className="absolute right-4 top-4 z-20">
        <ThemeToggle
          theme={theme}
          onToggle={onToggleTheme}
          className="text-ink-500 hover:bg-white/70 dark:text-ink-400 dark:hover:bg-ink-800/70"
        />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo + branding */}
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="motion-press mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-600 shadow-lg shadow-brand-600/30 transition-transform duration-300 hover:rotate-3 hover:scale-105">
            <svg viewBox="0 0 64 64" className="h-7 w-7 text-white" aria-hidden="true">
              <path
                d="M20 18v28M20 46c0-11 8-16 17-16 7 0 9-5 9-12"
                fill="none"
                stroke="currentColor"
                strokeWidth="5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="20" cy="18" r="7" fill="currentColor" />
              <circle cx="46" cy="18" r="7" fill="currentColor" />
              <circle cx="20" cy="46" r="7" fill="currentColor" />
            </svg>
          </div>
          <h1 className="font-display text-2xl font-bold text-ink-900 dark:text-white sm:text-3xl">
            ProjectSync
          </h1>
          <p className="mt-1.5 text-sm text-ink-500 dark:text-ink-400">
            Final-year project workspace
          </p>
        </div>

        {/* Card with mode tabs */}
        <div className="animate-scale-in rounded-2xl border border-white/10 bg-white shadow-2xl dark:border-ink-700 dark:bg-ink-900">
          {/* Tab switcher */}
          <div className="flex border-b border-ink-100 dark:border-ink-800">
            <button
              onClick={() => setMode('signin')}
              className={`flex-1 py-3.5 text-sm font-semibold transition-colors ${
                mode === 'signin'
                  ? 'border-b-2 border-brand-600 text-brand-600 dark:border-brand-400 dark:text-brand-400'
                  : 'text-ink-400 hover:text-ink-600 dark:text-ink-500 dark:hover:text-ink-300'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setMode('signup')}
              className={`flex-1 py-3.5 text-sm font-semibold transition-colors ${
                mode === 'signup'
                  ? 'border-b-2 border-brand-600 text-brand-600 dark:border-brand-400 dark:text-brand-400'
                  : 'text-ink-400 hover:text-ink-600 dark:text-ink-500 dark:hover:text-ink-300'
              }`}
            >
              Sign Up
            </button>
          </div>

          <div className="p-6 sm:p-7">
            {mode === 'signin' ? (
              <SignInForm
                onSignIn={onSignIn}
                showToast={showToast}
                onSwitchToSignUp={() => setMode('signup')}
              />
            ) : (
              <SignUpForm onSwitchToSignIn={() => setMode('signin')} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
