import { Badge, Card, CardBody } from '@/components/ui/ui';
import { CheckCircle2, XCircle } from 'lucide-react';
import type { LogBookEntry } from '@/types';

/** A labelled text block in a log book entry. */
export function LogField({
  label,
  content,
  compact = false,
}: {
  label: string;
  content: string;
  compact?: boolean;
}) {
  return (
    <div>
      <p
        className={`font-semibold text-ink-700 dark:text-ink-200 ${compact ? 'text-xs' : 'text-sm'}`}
      >
        {label}
      </p>
      <p
        className={`mt-1 leading-relaxed text-ink-600 dark:text-ink-300 ${compact ? 'text-xs' : 'text-sm'}`}
      >
        {content}
      </p>
    </div>
  );
}

/** Attendance pills shown inside an expanded log book entry. */
export function AttendancePills({ attendance }: { attendance: LogBookEntry['attendance'] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {attendance.map((a) => (
        <div
          key={a.name}
          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium ${
            a.present
              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
              : 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400'
          }`}
        >
          {a.present ? (
            <CheckCircle2 className="h-3.5 w-3.5" />
          ) : (
            <XCircle className="h-3.5 w-3.5" />
          )}
          {a.name}
        </div>
      ))}
    </div>
  );
}

/** A single historical version of a log book entry (shown in the edit history drawer). */
export function LogEntryHistoryItem({
  edit,
}: {
  edit: NonNullable<LogBookEntry['editHistory']>[number];
}) {
  return (
    <div className="rounded-xl border border-dashed border-ink-200 bg-ink-50/50 p-4 dark:border-ink-700 dark:bg-ink-800/30">
      <p className="mb-3 text-xs font-medium text-ink-400 dark:text-ink-500">
        Previous version · edited {edit.editedAt}
      </p>
      <div className="space-y-2.5">
        <LogField label="Points Discussed" content={edit.pointsDiscussed} compact />
        <LogField label="Mentor Suggestions" content={edit.mentorSuggestions} compact />
        <LogField label="Remarks" content={edit.remarks} compact />
      </div>
    </div>
  );
}

/** Milestone progress side panel shown alongside the log entries. */
export function MilestoneProgressPanel({
  milestones,
}: {
  milestones: { id: string; number: number; title: string; dueDate: string; status: string }[];
}) {
  return (
    <div className="divide-y divide-ink-50 dark:divide-ink-800">
      {milestones.map((m) => {
        const isComplete = m.status === 'complete';
        return (
          <div key={m.id} className="flex items-start gap-3 px-5 py-3.5">
            <div
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                isComplete
                  ? 'bg-brand-600 text-white dark:bg-brand-500'
                  : 'bg-ink-100 text-ink-500 dark:bg-ink-800 dark:text-ink-400'
              }`}
            >
              {isComplete ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : (
                <span className="text-xs font-bold">{m.number}</span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p
                className={`text-sm font-medium ${
                  isComplete
                    ? 'text-ink-500 line-through dark:text-ink-600'
                    : 'text-ink-800 dark:text-ink-100'
                }`}
              >
                {m.title}
              </p>
              <p className="mt-0.5 text-xs text-ink-400 dark:text-ink-500">Due {m.dueDate}</p>
            </div>
            <Badge color={isComplete ? 'success' : 'warning'}>
              {isComplete ? 'Done' : 'Pending'}
            </Badge>
          </div>
        );
      })}
    </div>
  );
}
