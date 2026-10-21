import { useState, useEffect, useRef, type FormEvent } from 'react';
import { Eye, EyeOff, Mail, Lock, Loader2, ArrowRight, Info } from 'lucide-react';
import type { AuthSession } from '@/types';
import { DemoAccountsHelper } from './DemoAccountsHelper';

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function SignInForm({
  onSignIn,
  showToast,
  onSwitchToSignUp,
}: {
  onSignIn: (email: string, password: string) => { success: boolean; session?: AuthSession };
  showToast: (message: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
  onSwitchToSignUp: () => void;
}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [authError, setAuthError] = useState('');
  const [loading, setLoading] = useState(false);
  const emailRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    emailRef.current?.focus();
  }, []);

  const validate = (): boolean => {
    let valid = true;
    setAuthError('');

    if (!email.trim()) {
      setEmailError('Email is required');
      valid = false;
    } else if (!isValidEmail(email.trim())) {
      setEmailError('Enter a valid email address');
      valid = false;
    } else {
      setEmailError('');
    }

    if (!password) {
      setPasswordError('Password is required');
      valid = false;
    } else {
      setPasswordError('');
    }

    return valid;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    window.setTimeout(() => {
      const result = onSignIn(email, password);
      setLoading(false);

      if (result.success && result.session) {
        showToast(`Welcome back, ${result.session.name}`, 'success');
      } else {
        setAuthError('Incorrect email or password');
        setPassword('');
        setShowPassword(false);
      }
    }, 700);
  };

  const fillDemoAccount = (demoEmail: string, demoPassword: string) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setEmailError('');
    setPasswordError('');
    setAuthError('');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {/* Email */}
      <div>
        <label
          htmlFor="signin-email"
          className="mb-1.5 block text-sm font-medium text-ink-700 dark:text-ink-200"
        >
          Email
        </label>
        <div className="relative">
          <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400 dark:text-ink-500" />
          <input
            ref={emailRef}
            id="signin-email"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (emailError) setEmailError('');
              if (authError) setAuthError('');
            }}
            placeholder="you@university.edu"
            className={`input-field pl-9 ${emailError ? 'input-field-error' : ''}`}
            autoComplete="email"
          />
        </div>
        {emailError && (
          <p className="mt-1.5 text-xs text-rose-600 dark:text-rose-400">{emailError}</p>
        )}
      </div>

      {/* Password */}
      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <label
            htmlFor="signin-password"
            className="block text-sm font-medium text-ink-700 dark:text-ink-200"
          >
            Password
          </label>
          <button
            type="button"
            onClick={() => showToast('Password reset is not available in this demo.', 'info')}
            className="text-xs font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
          >
            Forgot password?
          </button>
        </div>
        <div className="relative">
          <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400 dark:text-ink-500" />
          <input
            id="signin-password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (passwordError) setPasswordError('');
              if (authError) setAuthError('');
            }}
            placeholder="Enter your password"
            className={`input-field pl-9 pr-10 ${passwordError ? 'input-field-error' : ''}`}
            autoComplete="current-password"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 transition-colors hover:text-ink-600 dark:text-ink-500 dark:hover:text-ink-300"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {passwordError && (
          <p className="mt-1.5 text-xs text-rose-600 dark:text-rose-400">{passwordError}</p>
        )}
      </div>

      {/* Auth error */}
      {authError && (
        <div className="flex animate-fade-in items-center gap-2 rounded-lg bg-rose-50 px-3.5 py-2.5 text-sm text-rose-700 dark:bg-rose-950/60 dark:text-rose-400">
          <Info className="h-4 w-4 shrink-0" />
          {authError}
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-brand-700 hover:shadow-lg hover:shadow-brand-600/20 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Signing in...
          </>
        ) : (
          <>
            Sign In
            <ArrowRight className="h-4 w-4" />
          </>
        )}
      </button>

      {/* Sign up link */}
      <p className="text-center text-sm text-ink-500 dark:text-ink-400">
        Don't have an account?{' '}
        <button
          type="button"
          onClick={onSwitchToSignUp}
          className="font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
        >
          Sign up
        </button>
      </p>

      {/* Demo accounts helper */}
      <DemoAccountsHelper onFill={fillDemoAccount} />
    </form>
  );
}
