import { useEffect, useState } from 'react';
import {
  BookOpen,
  Plus,
  Edit3,
  Save,
  X,
  CheckCircle2,
  XCircle,
  History,
  ChevronDown,
  Target,
  CalendarClock,
} from 'lucide-react';
import { Card, CardHeader, CardBody, Button, Badge, Skeleton, EmptyState } from '@/components/ui';
import { Modal } from '@/components/Modal';
import { useToast } from '@/components/Toast';
import { mentorGroups } from '@/data/mentorData';

import type { LogBookEntry } from '@/types';

type LogBookState = Record<
  string,
  { entries: LogBookEntry[]; nextEntryNumber: number }
>;

function buildInitialState(): LogBookState {
  const state: LogBookState = {};
  mentorGroups.forEach((g) => {
    const sorted = [...g.logBook].sort((a, b) => b.entryNumber - a.entryNumber);
    state[g.id] = {
      entries: sorted,
      nextEntryNumber: (sorted[0]?.entryNumber ?? 0) + 1,
    };
  });
  return state;
}

export function MentorLogBookPage({
  preselectedGroupId,
}: {
  preselectedGroupId?: string | null;
}) {
  const [loading, setLoading] = useState(true);
  const [groupLogBooks, setGroupLogBooks] = useState<LogBookState>(buildInitialState);
  const [selectedGroupId, setSelectedGroupId] = useState<string>(
    preselectedGroupId ?? mentorGroups[0]?.id ?? ''
  );
  const [newSessionOpen, setNewSessionOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<LogBookEntry | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [historyExpanded, setHistoryExpanded] = useState<Set<string>>(new Set());

  // New session form state
  const [sessionDate, setSessionDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [sessionTime, setSessionTime] = useState('14:00');
  const [attendance, setAttendance] = useState<Record<string, boolean>>({});
  const [pointsDiscussed, setPointsDiscussed] = useState('');
  const [mentorSuggestions, setMentorSuggestions] = useState('');
  const [remarks, setRemarks] = useState('');
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(t);
  }, []);

  const selectedGroup = mentorGroups.find((g) => g.id === selectedGroupId) ?? null;
  const currentEntries = groupLogBooks[selectedGroupId]?.entries ?? [];

  const formatTimestamp = (dateStr: string, timeStr: string) => {
    const d = new Date(`${dateStr}T${timeStr}`);
    return (
      d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) +
      ' · ' +
      d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    );
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr + 'T00:00');
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const resetForm = () => {
    setSessionDate(new Date().toISOString().split('T')[0]);
    setSessionTime('14:00');
    setPointsDiscussed('');
    setMentorSuggestions('');
    setRemarks('');
    setAttendance({});
  };

  const openNewSession = () => {
    if (!selectedGroup) return;
    const initial: Record<string, boolean> = {};
    selectedGroup.members.forEach((m) => {
      initial[m.id] = true;
    });
    setAttendance(initial);
    resetForm();
    setEditingEntry(null);
    setNewSessionOpen(true);
  };

  const openEditEntry = (entry: LogBookEntry) => {
    if (!selectedGroup) return;
    const initial: Record<string, boolean> = {};
    selectedGroup.members.forEach((m) => {
      const record = entry.attendance.find((a) => a.name === m.name);
      initial[m.id] = record?.present ?? true;
    });
    setAttendance(initial);
    setPointsDiscussed(entry.pointsDiscussed);
    setMentorSuggestions(entry.mentorSuggestions);
    setRemarks(entry.remarks);
    setSessionDate(new Date(entry.date).toISOString().split('T')[0]);
    setSessionTime('14:00');
    setEditingEntry(entry);
    setNewSessionOpen(true);
  };

  const handleSave = () => {
    if (!selectedGroup) return;
    if (!pointsDiscussed.trim() || !mentorSuggestions.trim()) {
      showToast('Points discussed and mentor suggestions are required.', 'error');
      return;
    }

    setSaving(true);
    setTimeout(() => {
      const timestamp = formatTimestamp(sessionDate, sessionTime);
      const attendanceList = selectedGroup.members.map((m) => ({
        name: m.name,
        present: attendance[m.id] ?? true,
      }));

      if (editingEntry) {
        // Edit existing — push old version to edit history
        setGroupLogBooks((prev) => {
          const groupData = prev[selectedGroup.id];
          const updatedEntries = groupData.entries.map((e) =>
            e.id === editingEntry.id
              ? {
                  ...e,
                  date: formatDate(sessionDate),
                  lastEditedAt: timestamp,
                  attendance: attendanceList,
                  pointsDiscussed: pointsDiscussed.trim(),
                  mentorSuggestions: mentorSuggestions.trim(),
                  remarks: remarks.trim(),
                  editHistory: [
                    ...(e.editHistory ?? []),
                    {
                      editedAt: e.lastEditedAt,
                      pointsDiscussed: e.pointsDiscussed,
                      mentorSuggestions: e.mentorSuggestions,
                      remarks: e.remarks,
                    },
                  ],
                }
              : e
          );
          return {
            ...prev,
            [selectedGroup.id]: { ...groupData, entries: updatedEntries },
          };
        });
        showToast('Session entry updated.', 'success');
      } else {
        // New entry
        const newEntry: LogBookEntry = {
          id: `lb-${Date.now()}`,
          entryNumber: groupLogBooks[selectedGroup.id].nextEntryNumber,
          date: formatDate(sessionDate),
          lastEditedAt: timestamp,
          attendance: attendanceList,
          pointsDiscussed: pointsDiscussed.trim(),
          mentorSuggestions: mentorSuggestions.trim(),
          remarks: remarks.trim(),
        };
        setGroupLogBooks((prev) => ({
          ...prev,
          [selectedGroup.id]: {
            entries: [newEntry, ...prev[selectedGroup.id].entries],
            nextEntryNumber: prev[selectedGroup.id].nextEntryNumber + 1,
          },
        }));
        showToast('Session entry saved.', 'success');
      }

      setSaving(false);
      setNewSessionOpen(false);
      setEditingEntry(null);
      resetForm();
    }, 500);
  };

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
        <Skeleton className="h-12 w-full rounded-xl" />
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink-900 dark:text-ink-100">Log Book</h1>
          <p className="mt-1 text-sm text-ink-500 dark:text-ink-400">
            Log mentoring sessions, track attendance, and review past entries.
          </p>
        </div>
        {selectedGroup && (
          <Button onClick={openNewSession}>
            <Plus className="h-4 w-4" />
            New session
          </Button>
        )}
      </div>

      {/* Group selector */}
      <div className="flex flex-wrap gap-2">
        {mentorGroups.map((g) => (
          <button
            key={g.id}
            onClick={() => setSelectedGroupId(g.id)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
              selectedGroupId === g.id
                ? 'bg-brand-600 text-white shadow-sm dark:bg-brand-500'
                : 'bg-white text-ink-600 border border-ink-200 hover:bg-ink-50 dark:bg-ink-900 dark:text-ink-300 dark:border-ink-700 dark:hover:bg-ink-800'
            }`}
          >
            {g.name}
          </button>
        ))}
      </div>

      {mentorGroups.length === 0 ? (
        <Card>
          <EmptyState
            icon={<BookOpen className="h-7 w-7" />}
            title="No groups assigned"
            message="You need assigned groups before you can log mentoring sessions."
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {/* Log entries */}
          <div className="lg:col-span-2 space-y-4">
            {currentEntries.length === 0 ? (
              <Card>
                <EmptyState
                  icon={<BookOpen className="h-7 w-7" />}
                  title="No sessions logged yet"
                  message="Click 'New session' to log your first mentoring session for this group."
                  action={
                    <Button onClick={openNewSession}>
                      <Plus className="h-4 w-4" />
                      Log first session
                    </Button>
                  }
                />
              </Card>
            ) : (
              currentEntries.map((entry) => {
                const presentCount = entry.attendance.filter((a) => a.present).length;
                const hasEdits = entry.editHistory && entry.editHistory.length > 0;
                const isExpanded = expandedId === entry.id;
                return (
                  <Card key={entry.id}>
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : entry.id)}
                      className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left transition-colors hover:bg-ink-50 dark:hover:bg-ink-800/50"
                    >
                      <div className="flex items-center gap-3 min-w-0">
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
                          className={`h-5 w-5 text-ink-400 transition-transform dark:text-ink-500 ${
                            isExpanded ? 'rotate-180' : ''
                          }`}
                        />
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="border-t border-ink-100 px-5 py-4 space-y-4 animate-fade-in dark:border-ink-800">
                        {/* Attendance */}
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

                        {/* Edit action */}
                        <div className="flex items-center justify-between border-t border-ink-100 pt-3 dark:border-ink-800">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => openEditEntry(entry)}
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                            Edit entry
                          </Button>

                          {/* Edit history */}
                          {hasEdits && (
                            <button
                              onClick={() => toggleHistory(entry.id)}
                              className="flex items-center gap-2 text-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
                            >
                              <History className="h-4 w-4" />
                              {historyExpanded.has(entry.id)
                                ? 'Hide edit history'
                                : `Show edit history (${entry.editHistory!.length})`}
                              <ChevronDown
                                className={`h-4 w-4 transition-transform dark:text-ink-500 ${
                                  historyExpanded.has(entry.id) ? 'rotate-180' : ''
                                }`}
                              />
                            </button>
                          )}
                        </div>

                        {hasEdits && historyExpanded.has(entry.id) && (
                          <div className="space-y-3 animate-fade-in">
                            {entry.editHistory!.map((edit, i) => (
                              <div
                                key={i}
                                className="rounded-xl border border-dashed border-ink-200 bg-ink-50/50 p-4 dark:border-ink-700 dark:bg-ink-800/30"
                              >
                                <p className="mb-3 text-xs font-medium text-ink-400 dark:text-ink-500">
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
                  </Card>
                );
              })
            )}
          </div>

          {/* Side panel: milestone progress */}
          <div className="lg:col-span-1">
            <Card className="lg:sticky lg:top-0">
              <CardHeader title="Milestone Progress" subtitle={selectedGroup?.name ?? ''} />
              <CardBody className="p-0">
                {selectedGroup ? (
                  <div className="divide-y divide-ink-50 dark:divide-ink-800">
                    {selectedGroup.milestones.map((m) => {
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
                          <div className="flex-1 min-w-0">
                            <p
                              className={`text-sm font-medium ${
                                isComplete ? 'text-ink-500 line-through dark:text-ink-600' : 'text-ink-800 dark:text-ink-100'
                              }`}
                            >
                              {m.title}
                            </p>
                            <p className="mt-0.5 flex items-center gap-1 text-xs text-ink-400 dark:text-ink-500">
                              <CalendarClock className="h-3 w-3" />
                              Due {m.dueDate}
                            </p>
                          </div>
                          <Badge color={isComplete ? 'success' : 'warning'}>
                            {isComplete ? 'Done' : 'Pending'}
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <EmptyState
                    icon={<Target className="h-7 w-7" />}
                    title="Select a group"
                    message="Choose a group to see its milestone progress."
                  />
                )}
              </CardBody>
            </Card>
          </div>
        </div>
      )}

      {/* New/Edit Session Modal */}
      <Modal
        open={newSessionOpen}
        onClose={() => {
          setNewSessionOpen(false);
          setEditingEntry(null);
          resetForm();
        }}
        title={editingEntry ? `Edit Session ${editingEntry.entryNumber}` : 'New Mentoring Session'}
        maxWidth="max-w-2xl"
      >
        {selectedGroup && (
          <div className="space-y-5">
            {/* Date/Time */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-ink-700 dark:text-ink-200">Date</label>
                <input
                  type="date"
                  value={sessionDate}
                  onChange={(e) => setSessionDate(e.target.value)}
                  className="input-field"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-ink-700 dark:text-ink-200">Time</label>
                <input
                  type="time"
                  value={sessionTime}
                  onChange={(e) => setSessionTime(e.target.value)}
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
                {selectedGroup.members.map((m) => {
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
                          onClick={() =>
                            setAttendance((prev) => ({ ...prev, [m.id]: true }))
                          }
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
                          onClick={() =>
                            setAttendance((prev) => ({ ...prev, [m.id]: false }))
                          }
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
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink-700 dark:text-ink-200">
                Points Discussed
              </label>
              <textarea
                value={pointsDiscussed}
                onChange={(e) => setPointsDiscussed(e.target.value)}
                rows={3}
                placeholder="What was discussed in this session?"
                className="input-field resize-none text-sm"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink-700 dark:text-ink-200">
                Mentor Suggestions
              </label>
              <textarea
                value={mentorSuggestions}
                onChange={(e) => setMentorSuggestions(e.target.value)}
                rows={3}
                placeholder="What guidance did you provide?"
                className="input-field resize-none text-sm"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink-700 dark:text-ink-200">
                Remarks
              </label>
              <textarea
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                rows={2}
                placeholder="Overall remarks about the session..."
                className="input-field resize-none text-sm"
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 border-t border-ink-100 pt-4 dark:border-ink-800">
              <Button
                variant="secondary"
                onClick={() => {
                  setNewSessionOpen(false);
                  setEditingEntry(null);
                  resetForm();
                }}
              >
                <X className="h-4 w-4" />
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={saving}>
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
        )}
      </Modal>
    </div>
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
      <p className={`font-semibold text-ink-700 dark:text-ink-200 ${compact ? 'text-xs' : 'text-sm'}`}>{label}</p>
      <p className={`mt-1 text-ink-600 leading-relaxed dark:text-ink-300 ${compact ? 'text-xs' : 'text-sm'}`}>
        {content}
      </p>
    </div>
  );
}
