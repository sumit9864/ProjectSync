import { type ReactNode } from 'react';
import { GraduationCap, Users, ShieldCheck } from 'lucide-react';
import type { AuthRole } from '@/types';
import { demoUsers } from '@/data/demoUsers';

const roleIcons: Record<AuthRole, typeof GraduationCap> = {
  student: GraduationCap,
  mentor: Users,
  admin: ShieldCheck,
};

const roleLabels: Record<AuthRole, string> = {
  student: 'Team Leader',
  mentor: 'Project Guide',
  admin: 'Project Coordinator',
};

const roleAccents: Record<AuthRole, string> = {
  student:
    'bg-brand-50 text-brand-600 border-brand-200 dark:bg-brand-950/60 dark:text-brand-400 dark:border-brand-800/60',
  mentor:
    'bg-sky-50 text-sky-600 border-sky-200 dark:bg-sky-950/60 dark:text-sky-400 dark:border-sky-800/60',
  admin:
    'bg-violet-50 text-violet-600 border-violet-200 dark:bg-violet-950/60 dark:text-violet-400 dark:border-violet-800/60',
};

export function DemoAccountsHelper({
  onFill,
}: {
  onFill: (email: string, password: string) => void;
}) {
  return (
    <div className="border-t border-ink-100 pt-4 dark:border-ink-800">
      <p className="mb-2.5 text-xs font-medium text-ink-400 dark:text-ink-500">
        Demo accounts — click to pre-fill
      </p>
      <div className="space-y-1.5">
        {demoUsers.map((user) => {
          const Icon = roleIcons[user.role];
          return (
            <button
              key={user.email}
              type="button"
              onClick={() => onFill(user.email, user.password)}
              className="flex w-full items-center gap-2.5 rounded-lg border border-ink-100 px-3 py-2 text-left transition-all hover:border-ink-200 hover:bg-ink-50 dark:border-ink-800 dark:hover:border-ink-700 dark:hover:bg-ink-800/50"
            >
              <div
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md border ${roleAccents[user.role]}`}
              >
                <Icon className="h-3.5 w-3.5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-ink-700 dark:text-ink-200">
                  {roleLabels[user.role]}
                </p>
                <p className="truncate text-xs text-ink-400 dark:text-ink-500">{user.email}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
