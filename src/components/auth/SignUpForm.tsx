import { useState, useEffect, useRef, type FormEvent } from 'react';
import {
  Eye, EyeOff, Mail, Lock, User as UserIcon,
  ArrowRight, CheckCircle2, AlertCircle, Loader2,
} from 'lucide-react';
import { register } from '@/lib/api/auth';
import type { AuthSession } from '@/types';

// ── Validation helpers ─────────────────────────────────────────────────────────

/** Only @kkwagh.edu.in emails are accepted for student registration */
function isKkwaghEmail(email: string): boolean {
  return /^[^\s@]+@kkwagh\.edu\.in$/i.test(email.trim());
}

/**
 * Password rules:
 *   • At least 8 characters
 *   • At least one uppercase letter
 *   • At least one lowercase letter
 *   • At least one digit
 *   • At least one special character
 */
function getPasswordStrength(pw: string): {
  score: 0 | 1 | 2 | 3;
  label: '' | 'Weak' | 'Fair' | 'Strong';
  color: string;
} {
  let score = 0;
  if (pw.length >= 8)            score++;
  if (/[A-Z]/.test(pw))          score++;
  if (/[0-9]/.test(pw))          score++;
  if (/[^A-Za-z0-9]/.test(pw))  score++;

  if (pw.length === 0) return { score: 0, label: '',       color: 'bg-ink-200 dark:bg-ink-700' };
  if (score <= 2)      return { score: 1, label: 'Weak',   color: 'bg-rose-500' };
  if (score === 3)     return { score: 2, label: 'Fair',   color: 'bg-amber-500' };
  return               { score: 3, label: 'Strong', color: 'bg-emerald-500' };
}

function validateForm(
  name: string,
  email: string,
  password: string,
  confirmPassword: string,
): Record<string, string> {
  const e: Record<string, string> = {};

  if (!name.trim())             e.name = 'Full name is required.';
  else if (name.trim().length < 2) e.name = 'Name must be at least 2 characters.';

  if (!email.trim())              e.email = 'Email is required.';
  else if (!isKkwaghEmail(email)) e.email = 'Must be a valid @kkwagh.edu.in email address.';

  if (!password)                          e.password = 'Password is required.';
  else if (password.length < 8)           e.password = 'Password must be at least 8 characters.';
  else if (!/[A-Z]/.test(password))       e.password = 'Must include at least one uppercase letter.';
  else if (!/[a-z]/.test(password))       e.password = 'Must include at least one lowercase letter.';
  else if (!/[0-9]/.test(password))       e.password = 'Must include at least one number.';
  else if (!/[^A-Za-z0-9]/.test(password)) e.password = 'Must include at least one special character (e.g. @, #, !).';

  if (!confirmPassword)                      e.confirmPassword = 'Please confirm your password.';
  else if (password !== confirmPassword)     e.confirmPassword = 'Passwords do not match.';

  return e;
}

// ── Component ──────────────────────────────────────────────────────────────────

type Props = {
  onSwitchToSignIn: () => void;
  /** Called after a successful registration so App can set the session */
  onRegistered?: (session: AuthSession) => void;
};

export function SignUpForm({ onSwitchToSignIn, onRegistered }: Props) {
  const [name,            setName]            = useState('');
  const [email,           setEmail]           = useState('');
  const [password,        setPassword]        = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword,    setShowPassword]    = useState(false);
  const [errors,          setErrors]          = useState<Record<string, string>>({});
  const [apiError,        setApiError]        = useState('');
  const [loading,         setLoading]         = useState(false);
  const [success,         setSuccess]         = useState(false);

  const nameRef = useRef<HTMLInputElement>(null);
  const strength = getPasswordStrength(password);

  useEffect(() => { nameRef.current?.focus(); }, []);

  const clearFieldError = (field: string) =>
    setErrors(prev => ({ ...prev, [field]: '' }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setApiError('');

    const fieldErrors = validateForm(name, email, password, confirmPassword);
    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);
    try {
      const user = await register(name.trim(), email.trim().toLowerCase(), password);
      setSuccess(true);
      // Auto sign-in: notify parent with the newly created session
      onRegistered?.({
        name:  user.name,
        email: user.email,
        role:  user.role,
      });
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : 'Registration failed. Please try again.';
      // Surface duplicate-email error inline on the email field
      if (msg.toLowerCase().includes('already exists') || msg.toLowerCase().includes('conflict')) {
        setErrors(prev => ({ ...prev, email: 'This email is already registered. Try signing in.' }));
      } else {
        setApiError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  // ── Success state ────────────────────────────────────────────────────────────
  if (success) {
    return (
      <div className="flex animate-fade-in flex-col items-center py-4 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
          <CheckCircle2 className="h-7 w-7" />
        </div>
        <h3 className="font-display text-lg font-semibold text-ink-900 dark:text-ink-100">
          Account Created!
        </h3>
        <p className="mt-2 max-w-xs text-sm leading-relaxed text-ink-500 dark:text-ink-400">
          Welcome to ProjectSync, <span className="font-medium text-ink-700 dark:text-ink-200">{name.trim()}</span>. Signing you in…
        </p>
      </div>
    );
  }

  // ── Form ─────────────────────────────────────────────────────────────────────
  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>

      {/* API-level error banner */}
      {apiError && (
        <div className="flex items-start gap-2.5 rounded-lg border border-rose-200 bg-rose-50 px-3.5 py-3 text-sm text-rose-700 dark:border-rose-800 dark:bg-rose-950/50 dark:text-rose-300">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{apiError}</span>
        </div>
      )}

      {/* Full name */}
      <div>
        <label htmlFor="signup-name" className="mb-1.5 block text-sm font-medium text-ink-700 dark:text-ink-200">
          Full Name
        </label>
        <div className="relative">
          <UserIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400 dark:text-ink-500" />
          <input
            ref={nameRef}
            id="signup-name"
            type="text"
            value={name}
            onChange={e => { setName(e.target.value); clearFieldError('name'); }}
            placeholder="Jane Doe"
            className={`input-field pl-9 ${errors.name ? 'input-field-error' : ''}`}
            autoComplete="name"
            disabled={loading}
          />
        </div>
        {errors.name && <p className="mt-1.5 text-xs text-rose-600 dark:text-rose-400">{errors.name}</p>}
      </div>

      {/* Email */}
      <div>
        <label htmlFor="signup-email" className="mb-1.5 block text-sm font-medium text-ink-700 dark:text-ink-200">
          Institutional Email
        </label>
        <div className="relative">
          <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400 dark:text-ink-500" />
          <input
            id="signup-email"
            type="email"
            value={email}
            onChange={e => { setEmail(e.target.value); clearFieldError('email'); }}
            placeholder="yourname@kkwagh.edu.in"
            className={`input-field pl-9 ${errors.email ? 'input-field-error' : ''}`}
            autoComplete="email"
            disabled={loading}
          />
        </div>
        {errors.email
          ? <p className="mt-1.5 text-xs text-rose-600 dark:text-rose-400">{errors.email}</p>
          : <p className="mt-1.5 text-xs text-ink-400 dark:text-ink-500">Must be a @kkwagh.edu.in address.</p>
        }
      </div>

      {/* Password */}
      <div>
        <label htmlFor="signup-password" className="mb-1.5 block text-sm font-medium text-ink-700 dark:text-ink-200">
          Password
        </label>
        <div className="relative">
          <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400 dark:text-ink-500" />
          <input
            id="signup-password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={e => { setPassword(e.target.value); clearFieldError('password'); }}
            placeholder="Min 8 chars, mixed case, number & symbol"
            className={`input-field pl-9 pr-10 ${errors.password ? 'input-field-error' : ''}`}
            autoComplete="new-password"
            disabled={loading}
          />
          <button
            type="button"
            onClick={() => setShowPassword(v => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 transition-colors hover:text-ink-600 dark:text-ink-500 dark:hover:text-ink-300"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            tabIndex={-1}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {/* Strength meter */}
        {password.length > 0 && (
          <div className="mt-2 space-y-1">
            <div className="flex gap-1">
              {[1, 2, 3].map(seg => (
                <div
                  key={seg}
                  className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
                    strength.score >= seg ? strength.color : 'bg-ink-200 dark:bg-ink-700'
                  }`}
                />
              ))}
            </div>
            <p className={`text-xs font-medium ${
              strength.score === 1 ? 'text-rose-500' :
              strength.score === 2 ? 'text-amber-500' : 'text-emerald-500'
            }`}>
              {strength.label} password
            </p>
          </div>
        )}
        {errors.password && <p className="mt-1.5 text-xs text-rose-600 dark:text-rose-400">{errors.password}</p>}
      </div>

      {/* Confirm password */}
      <div>
        <label htmlFor="signup-confirm" className="mb-1.5 block text-sm font-medium text-ink-700 dark:text-ink-200">
          Confirm Password
        </label>
        <div className="relative">
          <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400 dark:text-ink-500" />
          <input
            id="signup-confirm"
            type={showPassword ? 'text' : 'password'}
            value={confirmPassword}
            onChange={e => { setConfirmPassword(e.target.value); clearFieldError('confirmPassword'); }}
            placeholder="Re-enter your password"
            className={`input-field pl-9 ${errors.confirmPassword ? 'input-field-error' : ''}`}
            autoComplete="new-password"
            disabled={loading}
          />
        </div>
        {errors.confirmPassword && (
          <p className="mt-1.5 text-xs text-rose-600 dark:text-rose-400">{errors.confirmPassword}</p>
        )}
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-brand-700 hover:shadow-lg hover:shadow-brand-600/20 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Creating Account…
          </>
        ) : (
          <>
            Create Account
            <ArrowRight className="h-4 w-4" />
          </>
        )}
      </button>

      <p className="text-center text-sm text-ink-500 dark:text-ink-400">
        Already have an account?{' '}
        <button
          type="button"
          onClick={onSwitchToSignIn}
          className="font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
        >
          Sign in
        </button>
      </p>
    </form>
  );
}
