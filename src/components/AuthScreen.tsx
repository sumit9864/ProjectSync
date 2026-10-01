import { useState, useEffect, useRef, type FormEvent } from 'react';
import {
  Target,
  Eye,
  EyeOff,
  Mail,
  Lock,
  User as UserIcon,
  Loader2,
  ArrowRight,
  Info,
  GraduationCap,
  Users,
  ShieldCheck,
} from 'lucide-react';
import { useToast } from '@/components/Toast';
import { demoUsers, type AuthRole } from '@/data/demoUsers';
import type { AuthSession } from '@/hooks/useAuth';

type AuthScreenProps = {
  onSignIn: (email: string, password: string) => { success: boolean; session?: AuthSession };
};

type Mode = 'signin' | 'signup';

const roleIcons: Record<AuthRole, typeof GraduationCap> = {
  student: GraduationCap,
  mentor: Users,
  admin: ShieldCheck,
};

const roleLabels: Record<AuthRole, string> = {
  student: 'Student',
  mentor: 'Mentor',
  admin: 'Admin',
};

const roleAccents: Record<AuthRole, string> = {
  student: 'bg-brand-50 text-brand-600 border-brand-200',
  mentor: 'bg-sky-50 text-sky-600 border-sky-200',
  admin: 'bg-violet-50 text-violet-600 border-violet-200',
};

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function AuthScreen({ onSignIn }: AuthScreenProps) {
  const [mode, setMode] = useState<Mode>('signin');
  const { showToast } = useToast();

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-ink-950 px-4 py-8">
      {/* Background decoration — same visual language as the old landing */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-brand-600/20 blur-3xl" />
        <div className="absolute -right-40 top-1/3 h-96 w-96 rounded-full bg-sky-600/10 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-emerald-600/10 blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
            backgroundSize: '32px 32px',
          }}
        />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo + branding */}
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-600 shadow-lg shadow-brand-600/30">
            <Target className="h-7 w-7 text-white" />
          </div>
          <h1 className="font-display text-2xl font-bold text-white sm:text-3xl">FYPM Hub</h1>
          <p className="mt-1.5 text-sm text-ink-400">
            Final-Year Project Management
          </p>
        </div>

        {/* Card with mode tabs */}
        <div className="rounded-2xl border border-white/10 bg-white shadow-2xl animate-scale-in">
          {/* Tab switcher */}
          <div className="flex border-b border-ink-100">
            <button
              onClick={() => setMode('signin')}
              className={`flex-1 py-3.5 text-sm font-semibold transition-colors ${
                mode === 'signin'
                  ? 'border-b-2 border-brand-600 text-brand-600'
                  : 'text-ink-400 hover:text-ink-600'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setMode('signup')}
              className={`flex-1 py-3.5 text-sm font-semibold transition-colors ${
                mode === 'signup'
                  ? 'border-b-2 border-brand-600 text-brand-600'
                  : 'text-ink-400 hover:text-ink-600'
              }`}
            >
              Sign Up
            </button>
          </div>

          <div className="p-6 sm:p-7">
            {mode === 'signin' ? (
              <SignInForm onSignIn={onSignIn} showToast={showToast} onSwitchToSignUp={() => setMode('signup')} />
            ) : (
              <SignUpForm onSwitchToSignIn={() => setMode('signin')} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Sign In ─────────────────────────────────────────────────────────────

function SignInForm({
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
        <label htmlFor="signin-email" className="mb-1.5 block text-sm font-medium text-ink-700">
          Email
        </label>
        <div className="relative">
          <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
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
        {emailError && <p className="mt-1.5 text-xs text-rose-600">{emailError}</p>}
      </div>

      {/* Password */}
      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <label htmlFor="signin-password" className="block text-sm font-medium text-ink-700">
            Password
          </label>
          <button
            type="button"
            onClick={() => showToast('Password reset is not available in this demo.', 'info')}
            className="text-xs font-medium text-brand-600 hover:text-brand-700"
          >
            Forgot password?
          </button>
        </div>
        <div className="relative">
          <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
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
            className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-600 transition-colors"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {passwordError && <p className="mt-1.5 text-xs text-rose-600">{passwordError}</p>}
      </div>

      {/* Auth error */}
      {authError && (
        <div className="flex items-center gap-2 rounded-lg bg-rose-50 px-3.5 py-2.5 text-sm text-rose-700 animate-fade-in">
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
      <p className="text-center text-sm text-ink-500">
        Don't have an account?{' '}
        <button
          type="button"
          onClick={onSwitchToSignUp}
          className="font-semibold text-brand-600 hover:text-brand-700"
        >
          Sign up
        </button>
      </p>

      {/* Demo accounts helper */}
      <DemoAccountsHelper onFill={fillDemoAccount} />
    </form>
  );
}

// ─── Sign Up ─────────────────────────────────────────────────────────────

function SignUpForm({
  onSwitchToSignIn,
}: {
  onSwitchToSignIn: () => void;
}) {
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
      <div className="flex flex-col items-center text-center py-4 animate-fade-in">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
          <Info className="h-7 w-7" />
        </div>
        <h3 className="font-display text-lg font-semibold text-ink-900">
          Self-registration isn't available yet
        </h3>
        <p className="mt-2 max-w-xs text-sm text-ink-500 leading-relaxed">
          This demo doesn't support creating new accounts. Please use one of the
          demo accounts to explore the workspace.
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
        <label htmlFor="signup-name" className="mb-1.5 block text-sm font-medium text-ink-700">
          Full Name
        </label>
        <div className="relative">
          <UserIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
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
        {errors.name && <p className="mt-1.5 text-xs text-rose-600">{errors.name}</p>}
      </div>

      {/* Email */}
      <div>
        <label htmlFor="signup-email" className="mb-1.5 block text-sm font-medium text-ink-700">
          Email
        </label>
        <div className="relative">
          <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
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
        {errors.email && <p className="mt-1.5 text-xs text-rose-600">{errors.email}</p>}
      </div>

      {/* Password */}
      <div>
        <label htmlFor="signup-password" className="mb-1.5 block text-sm font-medium text-ink-700">
          Password
        </label>
        <div className="relative">
          <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
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
            className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-600 transition-colors"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {errors.password && <p className="mt-1.5 text-xs text-rose-600">{errors.password}</p>}
      </div>

      {/* Confirm password */}
      <div>
        <label htmlFor="signup-confirm" className="mb-1.5 block text-sm font-medium text-ink-700">
          Confirm Password
        </label>
        <div className="relative">
          <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
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
          <p className="mt-1.5 text-xs text-rose-600">{errors.confirmPassword}</p>
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

      <p className="text-center text-sm text-ink-500">
        Already have an account?{' '}
        <button
          type="button"
          onClick={onSwitchToSignIn}
          className="font-semibold text-brand-600 hover:text-brand-700"
        >
          Sign in
        </button>
      </p>
    </form>
  );
}

// ─── Demo Accounts Helper ─────────────────────────────────────────────────

function DemoAccountsHelper({
  onFill,
}: {
  onFill: (email: string, password: string) => void;
}) {
  return (
    <div className="border-t border-ink-100 pt-4">
      <p className="mb-2.5 text-xs font-medium text-ink-400">Demo accounts — click to pre-fill</p>
      <div className="space-y-1.5">
        {demoUsers.map((user) => {
          const Icon = roleIcons[user.role];
          return (
            <button
              key={user.email}
              type="button"
              onClick={() => onFill(user.email, user.password)}
              className="flex w-full items-center gap-2.5 rounded-lg border border-ink-100 px-3 py-2 text-left transition-all hover:border-ink-200 hover:bg-ink-50"
            >
              <div
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md border ${roleAccents[user.role]}`}
              >
                <Icon className="h-3.5 w-3.5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-ink-700">{roleLabels[user.role]}</p>
                <p className="truncate text-xs text-ink-400">{user.email}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
