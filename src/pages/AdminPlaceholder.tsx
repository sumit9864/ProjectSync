import { ShieldCheck, ArrowLeft, Lock } from 'lucide-react';
import { Button } from '@/components/ui';

type AdminPlaceholderProps = {
  onExit: () => void;
};

export function AdminPlaceholder({ onExit }: AdminPlaceholderProps) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-ink-950 px-4">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-violet-600/20 blur-3xl" />
        <div className="absolute -right-40 bottom-1/4 h-96 w-96 rounded-full bg-brand-600/10 blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
            backgroundSize: '32px 32px',
          }}
        />
      </div>

      <div className="relative z-10 w-full max-w-md text-center">
        <div className="mb-6 flex h-20 w-20 mx-auto items-center justify-center rounded-2xl bg-violet-600 shadow-lg shadow-violet-600/30">
          <ShieldCheck className="h-10 w-10 text-white" />
        </div>

        <h1 className="font-display text-3xl font-bold text-white">Admin Workspace</h1>
        <p className="mt-3 text-sm text-ink-400">Coming soon</p>

        <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
          <div className="mb-4 flex h-12 w-12 mx-auto items-center justify-center rounded-xl bg-white/5 text-ink-400">
            <Lock className="h-6 w-6" />
          </div>
          <p className="text-sm text-ink-300 leading-relaxed">
            The admin workspace is under development. When ready, it will include program-wide
            oversight, group management, mentor assignments, and reporting tools.
          </p>
        </div>

        <Button
          variant="secondary"
          onClick={onExit}
          className="mt-6 !bg-white/10 !border-white/10 !text-white hover:!bg-white/20"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to role selection
        </Button>
      </div>
    </div>
  );
}
