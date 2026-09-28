import { useState } from 'react';
import { Target, ArrowRight, GraduationCap, Users, ShieldCheck } from 'lucide-react';

export type Role = 'student' | 'mentor' | 'admin';

type LandingProps = {
  onSelect: (role: Role) => void;
};

const roles: {
  id: Role;
  label: string;
  description: string;
  icon: typeof GraduationCap;
  accent: string;
  iconBg: string;
}[] = [
  {
    id: 'student',
    label: 'Student',
    description: 'Manage your group, topic, milestones, and log book.',
    icon: GraduationCap,
    accent: 'border-brand-500/50 hover:border-brand-500 hover:bg-brand-600/10',
    iconBg: 'bg-brand-600',
  },
  {
    id: 'mentor',
    label: 'Mentor',
    description: 'Review topics, guide groups, and log mentoring sessions.',
    icon: Users,
    accent: 'border-sky-500/50 hover:border-sky-500 hover:bg-sky-600/10',
    iconBg: 'bg-sky-600',
  },
  {
    id: 'admin',
    label: 'Admin',
    description: 'Oversee the entire final-year project program.',
    icon: ShieldCheck,
    accent: 'border-violet-500/50 hover:border-violet-500 hover:bg-violet-600/10',
    iconBg: 'bg-violet-600',
  },
];

export function Landing({ onSelect }: LandingProps) {
  const [selected, setSelected] = useState<Role | null>(null);
  const [hovering, setHovering] = useState(false);

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-ink-950 px-4 py-8">
      {/* Background decoration */}
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

      <div className="relative z-10 w-full max-w-xl">
        {/* Logo */}
        <div className="mb-10 flex flex-col items-center text-center">
          <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-600 shadow-lg shadow-brand-600/30">
            <Target className="h-8 w-8 text-white" />
          </div>
          <h1 className="font-display text-3xl font-bold text-white sm:text-4xl">FYPM Hub</h1>
          <p className="mt-2 text-sm text-ink-400">
            Final-Year Project Management · Choose your workspace
          </p>
        </div>

        {/* Role cards */}
        <div className="space-y-3">
          {roles.map((role) => {
            const Icon = role.icon;
            const isSelected = selected === role.id;
            return (
              <button
                key={role.id}
                onClick={() => setSelected(role.id)}
                className={`group flex w-full items-center gap-4 rounded-2xl border bg-white/5 p-5 text-left backdrop-blur-xl transition-all ${role.accent} ${
                  isSelected ? 'ring-2 ring-white/20' : ''
                }`}
              >
                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${role.iconBg} text-white shadow-lg`}
                >
                  <Icon className="h-6 w-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-display text-lg font-semibold text-white">{role.label}</p>
                  <p className="mt-0.5 text-sm text-ink-400">{role.description}</p>
                </div>
                <div
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-all ${
                    isSelected ? 'border-brand-400 bg-brand-500' : 'border-ink-600'
                  }`}
                >
                  {isSelected && <div className="h-2 w-2 rounded-full bg-white" />}
                </div>
              </button>
            );
          })}
        </div>

        {/* Continue button */}
        <button
          onClick={() => selected && onSelect(selected)}
          disabled={!selected}
          onMouseEnter={() => setHovering(true)}
          onMouseLeave={() => setHovering(false)}
          className="group mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-5 py-3.5 text-sm font-semibold text-white transition-all hover:bg-brand-500 hover:shadow-lg hover:shadow-brand-600/30 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-brand-600 disabled:hover:shadow-none"
        >
          Continue to workspace
          <ArrowRight
            className={`h-4 w-4 transition-transform ${hovering && selected ? 'translate-x-1' : ''}`}
          />
        </button>
      </div>
    </div>
  );
}
