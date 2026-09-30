import { useState, useEffect } from 'react';
import {
  BookOpen,
  ChevronDown,
  History,
  CheckCircle2,
  XCircle,
  Lock,
} from 'lucide-react';
import { Card, Badge, Skeleton, EmptyState } from '@/components/ui';
import { logBookEntries } from '@/data/mockData';
import type { LogBookEntry } from '@/types';

export function LogBookPage() {
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [historyExpanded, setHistoryExpanded] = useState<Set<string>>(new Set());

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(t);
  }, []);

  const toggleHistory = (id: string) => {
    setHistoryExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-40 rounded-md" />
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-48 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink-900">Log Book</h1>
          <p className="mt-1 text-sm text-ink-500">
            Session entries logged by your mentor. View only — students cannot edit.
          </p>
        </div>
        <Badge color="neutral">
          <Lock className="h-3.5 w-3.5" />
          Read only
        </Badge>
      </div>

      {logBookEntries.length === 0 ? (
        <Card>
          <EmptyState
            icon={<BookOpen className="h-7 w-7" />}
            title="No log entries yet"
            message="Your mentor hasn't logged any sessions. Entries will appear here as your project progresses."
          />
        </Card>
      ) : (
        <div className="space-y-4">
          {logBookEntries.map((entry) => (
            <LogEntryCard
              key={entry.id}
              entry={entry}
              isExpanded={expandedId === entry.id}
              historyExpanded={historyExpanded.has(entry.id)}
              onToggleExpand={() =>
                setExpandedId((prev) => (prev === entry.id ? null : entry.id))
              }
              onToggleHistory={() => toggleHistory(entry.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function LogEntryCard({
  entry,
  isExpanded,
  historyExpanded,
  onToggleExpand,
  onToggleHistory,
}: {
  entry: LogBookEntry;
  isExpanded: boolean;
  historyExpanded: boolean;
  onToggleExpand: () => void;
  onToggleHistory: () => void;
}) {
  const presentCount = entry.attendance.filter((a) => a.present).length;
  const hasEdits = entry.editHistory && entry.editHistory.length > 0;

  return (
    <Card>
      <button
        onClick={onToggleExpand}
        className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left transition-colors hover:bg-ink-50"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-100 text-sm font-bold text-brand-700">
            #{entry.entryNumber}
          </div>
          <div className="min-w-0">
            <p className="font-display font-semibold text-ink-900">Session {entry.entryNumber}</p>
            <p className="text-xs text-ink-400">
              {entry.date} · Last edited {entry.lastEditedAt}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <Badge color="info">
            <CheckCircle2 className="h-3.5 w-3.5" />
            {presentCount}/{entry.attendance.length} present
          </Badge>
          {hasEdits && (
            <Badge color="warning">
              <History className="h-3.5 w-3.5" />
              Edited
            </Badge>
          )}
          <ChevronDown
            className={`h-5 w-5 text-ink-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          />
        </div>
      </button>

      {isExpanded && (
        <div className="border-t border-ink-100 px-5 py-4 space-y-4 animate-fade-in">
          {/* Attendance */}
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-400">
              Attendance
            </p>
            <div className="flex flex-wrap gap-2">
              {entry.attendance.map((a) => (
                <div
                  key={a.name}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium ${
                    a.present
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-rose-50 text-rose-700'
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
          </div>

          {/* Text fields */}
          <div className="space-y-3">
            <LogField label="Points Discussed" content={entry.pointsDiscussed} />
            <LogField label="Mentor Suggestions" content={entry.mentorSuggestions} />
            <LogField label="Remarks" content={entry.remarks} />
          </div>

          {/* Edit history */}
          {hasEdits && (
            <div className="border-t border-ink-100 pt-3">
              <button
                onClick={onToggleHistory}
                className="flex items-center gap-2 text-sm font-medium text-brand-600 hover:text-brand-700"
              >
                <History className="h-4 w-4" />
                {historyExpanded ? 'Hide edit history' : `Show edit history (${entry.editHistory!.length})`}
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${historyExpanded ? 'rotate-180' : ''}`}
                />
              </button>

              {historyExpanded && (
                <div className="mt-3 space-y-3 animate-fade-in">
                  {entry.editHistory!.map((edit, i) => (
                    <div key={i} className="rounded-xl border border-dashed border-ink-200 bg-ink-50/50 p-4">
                      <p className="mb-3 text-xs font-medium text-ink-400">
                        Previous version · edited {edit.editedAt}
                      </p>
                      <div className="space-y-2.5">
                        <LogField label="Points Discussed" content={edit.pointsDiscussed} compact />
                        <LogField label="Mentor Suggestions" content={edit.mentorSuggestions} compact />
                        <LogField label="Remarks" content={edit.remarks} compact />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </Card>
  );
}

function LogField({
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
      <p className={`font-semibold text-ink-700 ${compact ? 'text-xs' : 'text-sm'}`}>{label}</p>
      <p className={`mt-1 text-ink-600 leading-relaxed ${compact ? 'text-xs' : 'text-sm'}`}>
        {content}
      </p>
    </div>
  );
}
