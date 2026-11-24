import { useState, useEffect, useRef, type FormEvent } from 'react';
import {
  Eye, EyeOff, Mail, Lock, User as UserIcon,
  ArrowRight, CheckCircle2, AlertCircle, Loader2,
} from 'lucide-react';
import { register } from '@/lib/api/auth';
import type { AuthSession } from '@/types';

// â”€â”€ Validation helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

/** Only @kkwagh.edu.in emails are accepted for student registration */
function isKkwaghEmail(email: string): boolean {
  return /^[^\s@]+@kkwagh\.edu\.in$/i.test(email.trim());
}

/**
 * Password rules:
 *   â€¢ At least 8 characters
 *   â€¢ At least one uppercase letter
 *   â€¢ At least one lowercase letter
 *   â€¢ At least one digit
 *   â€¢ At least one special character
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

// â”€â”€ Component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€


export function SignUpForm({ onSwitchToSignIn }: { onSwitchToSignIn: () => void }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    nameRef.current?.focus();
  }, []);

  const validate = (): boolean => {
    const e: Record<string, string> = {};

    if (!name.trim()) e.name = 'Full name is required';
    else if (name.trim().length < 2) e.name = 'Name is too short';

    if (!email.trim()) e.email = 'Email is required';
    else if (!isValidEmail(email.trim())) e.email = 'Enter a valid email address';

    if (!password) e.password = 'Password is required';
    else if (password.length < 8) e.password = 'Password must be at least 8 characters';

    if (!confirmPassword) e.confirmPassword = 'Please confirm your password';
    else if (password !== confirmPassword) e.confirmPassword = 'Passwords do not match';

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="flex animate-fade-in flex-col items-center py-4 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400">
          <Info className="h-7 w-7" />
        </div>
        <h3 className="font-display text-lg font-semibold text-ink-900 dark:text-ink-100">
          Self-registration isn't available yet
        </h3>
        <p className="mt-2 max-w-xs text-sm leading-relaxed text-ink-500 dark:text-ink-400">
          This demo doesn't support creating new accounts. Please use one of the demo accounts to
          explore the workspace.
        </p>
        <button
          onClick={() => {
            setSubmitted(false);
            onSwitchToSignIn();
          }}
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-brand-700 hover:shadow-lg hover:shadow-brand-600/20"
        >
          Back to Sign In
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {/* Full name */}
      <div>
        <label
          htmlFor="signup-name"
          className="mb-1.5 block text-sm font-medium text-ink-700 dark:text-ink-200"
        >
          Full Name
        </label>
        <div className="relative">
          <UserIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400 dark:text-ink-500" />
          <input
            ref={nameRef}
            id="signup-name"
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (errors.name) setErrors((p) => ({ ...p, name: '' }));
            }}
            placeholder="Jane Doe"
            className={`input-field pl-9 ${errors.name ? 'input-field-error' : ''}`}
            autoComplete="name"
          />
        </div>
        {errors.name && (
          <p className="mt-1.5 text-xs text-rose-600 dark:text-rose-400">{errors.name}</p>
        )}
      </div>

      {/* Email */}
      <div>
        <label
          htmlFor="signup-email"
          className="mb-1.5 block text-sm font-medium text-ink-700 dark:text-ink-200"
        >
          Email
        </label>
        <div className="relative">
          <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400 dark:text-ink-500" />
          <input
            id="signup-email"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (errors.email) setErrors((p) => ({ ...p, email: '' }));
            }}
            placeholder="you@university.edu"
            className={`input-field pl-9 ${errors.email ? 'input-field-error' : ''}`}
            autoComplete="email"
          />
        </div>
        {errors.email && (
          <p className="mt-1.5 text-xs text-rose-600 dark:text-rose-400">{errors.email}</p>
        )}
      </div>

      {/* Password */}
      <div>
        <label
          htmlFor="signup-password"
          className="mb-1.5 block text-sm font-medium text-ink-700 dark:text-ink-200"
        >
          Password
        </label>
        <div className="relative">
          <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400 dark:text-ink-500" />
          <input
            id="signup-password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (errors.password) setErrors((p) => ({ ...p, password: '' }));
            }}
            placeholder="At least 8 characters"
            className={`input-field pl-9 pr-10 ${errors.password ? 'input-field-error' : ''}`}
            autoComplete="new-password"
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
        {errors.password && (
          <p className="mt-1.5 text-xs text-rose-600 dark:text-rose-400">{errors.password}</p>
        )}
      </div>

      {/* Confirm password */}
      <div>
        <label
          htmlFor="signup-confirm"
          className="mb-1.5 block text-sm font-medium text-ink-700 dark:text-ink-200"
        >
          Confirm Password
        </label>
        <div className="relative">
          <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400 dark:text-ink-500" />
          <input
            id="signup-confirm"
            type={showPassword ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              if (errors.confirmPassword) setErrors((p) => ({ ...p, confirmPassword: '' }));
            }}
            placeholder="Re-enter your password"
            className={`input-field pl-9 ${errors.confirmPassword ? 'input-field-error' : ''}`}
            autoComplete="new-password"
          />
        </div>
        {errors.confirmPassword && (
          <p className="mt-1.5 text-xs text-rose-600 dark:text-rose-400">
            {errors.confirmPassword}
          </p>
        )}
      </div>

      {/* Submit */}
      <button
        type="submit"
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-brand-700 hover:shadow-lg hover:shadow-brand-600/20"
      >
        Create Account
        <ArrowRight className="h-4 w-4" />
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
