import { type ReactNode } from 'react';
import { Card, CardBody, AnimatedNumber } from './ui';

export type StatCardProps = {
  icon: ReactNode;
  label: string;
  value: string | number;
  sublabel: string;
  accent: 'brand' | 'amber' | 'sky' | 'emerald' | 'rose' | 'violet';
};

export function StatCard({ icon, label, value, sublabel, accent }: StatCardProps) {
  const accents: Record<string, string> = {
    brand: 'bg-brand-50 text-brand-600 dark:bg-brand-950/50 dark:text-brand-400',
    amber: 'bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400',
    sky: 'bg-sky-50 text-sky-600 dark:bg-sky-950/60 dark:text-sky-400',
    emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400',
    rose: 'bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400',
    violet: 'bg-violet-50 text-violet-600 dark:bg-violet-950/60 dark:text-violet-400',
  };

  return (
    <Card className="motion-lift">
      <CardBody>
        <div className="flex items-center gap-3">
          <div
            className={`stat-icon flex h-10 w-10 items-center justify-center rounded-lg ${accents[accent]}`}
          >
            {icon}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-ink-400 dark:text-ink-500">{label}</p>
            <p className="mt-0.5 truncate font-display text-lg font-bold text-ink-900 dark:text-ink-100">
              {typeof value === 'string' && /^\d+$/.test(value) ? (
                <AnimatedNumber value={Number(value)} />
              ) : (
                value
              )}
            </p>
          </div>
        </div>
        <p className="mt-3 text-xs text-ink-400 dark:text-ink-500">{sublabel}</p>
      </CardBody>
    </Card>
  );
}
