import { useState } from 'react';
import { Skeleton } from '@/components/ui/ui';
import { useToast } from '@/components/ui/Toast';
import { mentorGroups } from '@/data/mentorData';
import type { LogBookEntry } from '@/types';
import { LogBookGroupSelector } from './logbook/LogBookGroupSelector';
import { LogBookEntryList, LogBookEntryEditor } from './logbook/LogBookEntryEditor';
import { LogBookVersionHistory } from './logbook/LogBookVersionHistory';

type LogBookState = Record<string, { entries: LogBookEntry[]; nextEntryNumber: number }>;

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

export function MentorLogBookPage({ preselectedGroupId }: { preselectedGroupId?: string | null }) {
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
  const [sessionDate, setSessionDate] = useState(new Date().toISOString().split('T')[0]);
  const [sessionTime, setSessionTime] = useState('14:00');
  const [attendance, setAttendance] = useState<Record<string, boolean>>({});
  const [pointsDiscussed, setPointsDiscussed] = useState('');
  const [mentorSuggestions, setMentorSuggestions] = useState('');
  const [remarks, setRemarks] = useState('');
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  // Loading is simulated; swap for real API fetch later
  if (loading) {
    setTimeout(() => setLoading(false), 500);
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-40 rounded-md" />
        <Skeleton className="h-12 w-full rounded-xl" />
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    );
  }

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
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
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
          return { ...prev, [selectedGroup.id]: { ...groupData, entries: updatedEntries } };
        });
        showToast('Session entry updated.', 'success');
      } else {
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

  const handleClose = () => {
    setNewSessionOpen(false);
    setEditingEntry(null);
    resetForm();
  };

  const toggleHistory = (id: string) => {
    setHistoryExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="animate-fade-in space-y-6">
      <LogBookGroupSelector
        selectedGroupId={selectedGroupId}
        onSelectGroup={setSelectedGroupId}
        onNewSession={openNewSession}
      />

      {mentorGroups.length > 0 && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {/* Entry list — main column */}
          <div className="space-y-4 lg:col-span-2">
            <LogBookEntryList
              entries={currentEntries}
              expandedId={expandedId}
              historyExpanded={historyExpanded}
              onToggleExpand={(id) => setExpandedId(expandedId === id ? null : id)}
              onToggleHistory={toggleHistory}
              onEditEntry={openEditEntry}
              onNewSession={openNewSession}
            />
          </div>

          {/* Milestone progress — side panel */}
          <div className="lg:col-span-1">
            <LogBookVersionHistory group={selectedGroup} />
          </div>
        </div>
      )}

      {/* New / Edit session modal */}
      {selectedGroup && (
        <LogBookEntryEditor
          open={newSessionOpen}
          editingEntry={editingEntry}
          group={selectedGroup}
          sessionDate={sessionDate}
          sessionTime={sessionTime}
          attendance={attendance}
          pointsDiscussed={pointsDiscussed}
          mentorSuggestions={mentorSuggestions}
          remarks={remarks}
          saving={saving}
          onClose={handleClose}
          onSave={handleSave}
          onSessionDateChange={setSessionDate}
          onSessionTimeChange={setSessionTime}
          onAttendanceChange={(id, present) =>
            setAttendance((prev) => ({ ...prev, [id]: present }))
          }
          onPointsDiscussedChange={setPointsDiscussed}
          onMentorSuggestionsChange={setMentorSuggestions}
          onRemarksChange={setRemarks}
        />
      )}
    </div>
  );
}
