import { useState } from 'react';
import { Target, ArrowRight, Users, Sparkles, ShieldCheck, BookOpen } from 'lucide-react';
import { currentUser, groupName } from '@/data/mockData';

type LandingProps = {
  onEnter: () => void;
};

export function Landing({ onEnter }: LandingProps) {
  const [hovering, setHovering] = useState(false);

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-ink-950 px-4">
      {/* Background decoration */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-brand-600/20 blur-3xl" />
        <div className="absolute -right-40 top-1/3 h-96 w-96 rounded-full bg-sky-600/10 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-emerald-600/10 blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
            backgroundSize: '32px 32px',
          }}
        />
      </div>

      <div className="relative z-10 w-full max-w-lg">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-600 shadow-lg shadow-brand-600/30">
            <Target className="h-8 w-8 text-white" />
          </div>
          <h1 className="font-display text-3xl font-bold text-white sm:text-4xl">FYPM Hub</h1>
          <p className="mt-2 text-sm text-ink-400">Final-Year Project Management · Student Workspace</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl sm:p-8">
          <div className="mb-6 flex items-center gap-4">
            <div className={`flex h-14 w-14 items-center justify-center rounded-full text-lg font-bold text-white ${currentUser.avatarColor}`}>
              {currentUser.name.split(' ').map((w) => w[0]).slice(0, 2).join('')}
            </div>
            <div>
              <p className="font-display text-lg font-semibold text-white">{currentUser.name}</p>
              <p className="text-sm text-ink-400">{currentUser.email}</p>
            </div>
          </div>

          <div className="space-y-3 rounded-xl bg-white/5 p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-ink-400">Roll Number</span>
              <span className="text-sm font-medium text-ink-200">{currentUser.rollNumber}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-ink-400">Elective</span>
              <span className="text-sm font-medium text-ink-200">{currentUser.elective}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-ink-400">Group</span>
              <span className="text-sm font-medium text-ink-200">{groupName}</span>
            </div>
          </div>

          <button
            onClick={onEnter}
            onMouseEnter={() => setHovering(true)}
            onMouseLeave={() => setHovering(false)}
            className="group mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-5 py-3.5 text-sm font-semibold text-white transition-all hover:bg-brand-500 hover:shadow-lg hover:shadow-brand-600/30"
          >
            Continue to workspace
            <ArrowRight className={`h-4 w-4 transition-transform ${hovering ? 'translate-x-1' : ''}`} />
          </button>
        </div>

        {/* Feature pills */}
        <div className="mt-6 grid grid-cols-3 gap-3">
          {[
            { icon: Users, label: 'Group Registration' },
            { icon: Sparkles, label: 'Topic Studio' },
            { icon: ShieldCheck, label: 'Mentor Matching' },
          ].map((f) => (
            <div
              key={f.label}
              className="flex flex-col items-center gap-2 rounded-xl border border-white/5 bg-white/5 px-2 py-4 text-center"
            >
              <f.icon className="h-5 w-5 text-brand-400" />
              <span className="text-xs text-ink-400">{f.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
