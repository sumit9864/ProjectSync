import { Button, Badge, Card, EmptyState } from '@/components/ui/ui';
import { Modal } from '@/components/ui/Modal';
import {
  BookOpen,
  CheckCircle2,
  XCircle,
  History,
  ChevronDown,
  Edit3,
  Save,
  X,
  Plus,
} from 'lucide-react';
import { LogField } from './LogBookComponents';
import type { LogBookEntry } from '@/types';
type SimpleGroup = { id: string; projectId: string; name: string; members: { id: string; name: string; rollNumber?: string }[] };

type EntryListProps = {
  entries: LogBookEntry[];
  expandedId: string | null;
  historyExpanded: Set<string>;
  onToggleExpand: (id: string) => void;
  onToggleHistory: (id: string) => void;
  onEditEntry: (entry: LogBookEntry) => void;
  onNewSession: () => void;
};

/** The main entry list column — shows log book cards with expand / edit / history. */
export function LogBookEntryList({
  entries,
  expandedId,
  historyExpanded,
  onToggleExpand,
  onToggleHistory,
  onEditEntry,
  onNewSession,
}: EntryListProps) {
  if (entries.length === 0) {
    return (
      <Card>
        <EmptyState
          icon={<BookOpen className="h-7 w-7" />}
          title="No sessions logged yet"
          message="Click 'New session' to log your first mentoring session for this group."
          action={
            <Button onClick={onNewSession}>
              <Plus className="h-4 w-4" />
              Log first session
            </Button>
          }
        />
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {entries.map((entry) => {
        const presentCount = entry.attendance.filter((a) => a.present).length;
        const hasEdits = entry.editHistory && entry.editHistory.length > 0;
        const isExpanded = expandedId === entry.id;

        return (
          <Card key={entry.id}>
            <button
              onClick={() => onToggleExpand(entry.id)}
              className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left transition-colors hover:bg-ink-50 dark:hover:bg-ink-800/50"
            >
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-100 text-sm font-bold text-brand-700 dark:bg-brand-950/50 dark:text-brand-300">
                  #{entry.entryNumber}
                </div>
                <div className="min-w-0">
                  <p className="font-display font-semibold text-ink-900 dark:text-ink-100">
                    Session {entry.entryNumber}
                  </p>
                  <p className="text-xs text-ink-400 dark:text-ink-500">
                    {entry.date} · Last edited {entry.lastEditedAt}
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-3">
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
                  className={`h-5 w-5 text-ink-400 transition-transform dark:text-ink-500 ${isExpanded ? 'rotate-180' : ''}`}
                />
              </div>
            </button>

            {isExpanded && (
              <div className="animate-fade-in space-y-4 border-t border-ink-100 px-5 py-4 dark:border-ink-800">
                {/* Attendance pills */}
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-400 dark:text-ink-500">
                    Attendance
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {entry.attendance.map((a) => (
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
                </div>

                {/* Text fields */}
                <div className="space-y-3">
                  <LogField label="Points Discussed" content={entry.pointsDiscussed} />
                  <LogField label="Mentor Suggestions" content={entry.mentorSuggestions} />
                  <LogField label="Remarks" content={entry.remarks} />
                </div>

                {/* Footer: edit + history toggle */}
                <div className="flex items-center justify-between border-t border-ink-100 pt-3 dark:border-ink-800">
                  <Button variant="secondary" size="sm" onClick={() => onEditEntry(entry)}>
                    <Edit3 className="h-3.5 w-3.5" />
                    Edit entry
                  </Button>
                  {hasEdits && (
                    <button
                      onClick={() => onToggleHistory(entry.id)}
                      className="flex items-center gap-2 text-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
                    >
                      <History className="h-4 w-4" />
                      {historyExpanded.has(entry.id)
                        ? 'Hide edit history'
                        : `Show edit history (${entry.editHistory!.length})`}
                      <ChevronDown
                        className={`h-4 w-4 transition-transform dark:text-ink-500 ${historyExpanded.has(entry.id) ? 'rotate-180' : ''}`}
                      />
                    </button>
                  )}
                </div>

                {/* Edit history items */}
                {hasEdits && historyExpanded.has(entry.id) && (
                  <div className="animate-fade-in space-y-3">
                    {entry.editHistory!.map((edit, i) => (
                      <div
                        key={i}
                        className="rounded-xl border border-dashed border-ink-200 bg-ink-50/50 p-4 dark:border-ink-700 dark:bg-ink-800/30"
                      >
                        <p className="mb-3 text-xs font-medium text-ink-400 dark:text-ink-500">
                          Previous version · edited {edit.editedAt}
                        </p>
                        <div className="space-y-2.5">
                          <LogField
                            label="Points Discussed"
                            content={edit.pointsDiscussed}
                            compact
                          />
                          <LogField
                            label="Mentor Suggestions"
                            content={edit.mentorSuggestions}
                            compact
                          />
                          <LogField label="Remarks" content={edit.remarks} compact />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}

type EditorProps = {
  open: boolean;
  editingEntry: LogBookEntry | null;
  group: SimpleGroup | null;
  sessionDate: string;
  sessionTime: string;
  attendance: Record<string, boolean>;
  pointsDiscussed: string;
  mentorSuggestions: string;
  remarks: string;
  saving: boolean;
  onClose: () => void;
  onSave: () => void;
  onSessionDateChange: (v: string) => void;
  onSessionTimeChange: (v: string) => void;
  onAttendanceChange: (memberId: string, present: boolean) => void;
  onPointsDiscussedChange: (v: string) => void;
  onMentorSuggestionsChange: (v: string) => void;
  onRemarksChange: (v: string) => void;
};

/** The New/Edit session modal — date, time, attendance grid, and text areas. */
export function LogBookEntryEditor({
  open,
  editingEntry,
  group,
  sessionDate,
  sessionTime,
  attendance,
  pointsDiscussed,
  mentorSuggestions,
  remarks,
  saving,
  onClose,
  onSave,
  onSessionDateChange,
  onSessionTimeChange,
  onAttendanceChange,
  onPointsDiscussedChange,
  onMentorSuggestionsChange,
  onRemarksChange,
}: EditorProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editingEntry ? `Edit Session ${editingEntry.entryNumber}` : 'New Mentoring Session'}
      maxWidth="max-w-2xl"
    >
      <div className="space-y-5">
        {/* Date / Time row */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink-700 dark:text-ink-200">
              Date
            </label>
            <input
              type="date"
              value={sessionDate}
              onChange={(e) => onSessionDateChange(e.target.value)}
              className="input-field"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink-700 dark:text-ink-200">
              Time
            </label>
            <input
              type="time"
              value={sessionTime}
              onChange={(e) => onSessionTimeChange(e.target.value)}
              className="input-field"
            />
          </div>
        </div>

        {/* Attendance grid */}
        <div>
          <label className="mb-2 block text-sm font-medium text-ink-700 dark:text-ink-200">
            Attendance
          </label>
          <div className="space-y-2">
            {group?.members.map((m) => {
              const isPresent = attendance[m.id] ?? true;
              return (
                <div
                  key={m.id}
                  className="flex items-center justify-between rounded-lg border border-ink-200 px-3 py-2.5 dark:border-ink-700"
                >
                  <div>
                    <p className="text-sm font-medium text-ink-800 dark:text-ink-100">{m.name}</p>
                    <p className="text-xs text-ink-400 dark:text-ink-500">{m.rollNumber}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onAttendanceChange(m.id, true)}
                      className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                        isPresent
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                          : 'text-ink-400 hover:bg-ink-50 dark:text-ink-500 dark:hover:bg-ink-800'
                      }`}
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Present
                    </button>
                    <button
                      onClick={() => onAttendanceChange(m.id, false)}
                      className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                        !isPresent
                          ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400'
                          : 'text-ink-400 hover:bg-ink-50 dark:text-ink-500 dark:hover:bg-ink-800'
                      }`}
                    >
                      <XCircle className="h-3.5 w-3.5" />
                      Absent
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Text areas */}
        {(
          [
            {
              label: 'Points Discussed',
              value: pointsDiscussed,
              onChange: onPointsDiscussedChange,
              rows: 3,
              placeholder: 'What was discussed in this session?',
            },
            {
              label: 'Mentor Suggestions',
              value: mentorSuggestions,
              onChange: onMentorSuggestionsChange,
              rows: 3,
              placeholder: 'What guidance did you provide?',
            },
            {
              label: 'Remarks',
              value: remarks,
              onChange: onRemarksChange,
              rows: 2,
              placeholder: 'Overall remarks about the session...',
            },
          ] as const
        ).map((field) => (
          <div key={field.label}>
            <label className="mb-1.5 block text-sm font-medium text-ink-700 dark:text-ink-200">
              {field.label}
            </label>
            <textarea
              value={field.value}
              onChange={(e) => field.onChange(e.target.value)}
              rows={field.rows}
              placeholder={field.placeholder}
              className="input-field resize-none text-sm"
            />
          </div>
        ))}

        {/* Actions */}
        <div className="flex justify-end gap-3 border-t border-ink-100 pt-4 dark:border-ink-800">
          <Button variant="secondary" onClick={onClose}>
            <X className="h-4 w-4" />
            Cancel
          </Button>
          <Button onClick={onSave} disabled={saving}>
            {saving ? (
              <>
                <Save className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                {editingEntry ? 'Save changes' : 'Save entry'}
              </>
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
