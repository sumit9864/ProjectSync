import { useState, useEffect } from 'react';
import { Skeleton } from '@/components/ui/ui';
import { useToast } from '@/components/ui/Toast';
import { apiGet, apiPost, apiPut } from '@/lib/apiClient';
import type { LogBookEntry } from '@/types';
import { LogBookGroupSelector } from './logbook/LogBookGroupSelector';
import { LogBookEntryList, LogBookEntryEditor } from './logbook/LogBookEntryEditor';
import { LogBookVersionHistory } from './logbook/LogBookVersionHistory';

type SimpleGroup = { 
  id: string; projectId: string; name: string; 
  members: { id: string; name: string }[];
  milestones: { id: string; title: string; dueDate: string; status: string; number: number }[];
};
type LogBookState = Record<string, { entries: LogBookEntry[]; nextEntryNumber: number; loaded: boolean }>;

export function MentorLogBookPage({ preselectedGroupId }: { preselectedGroupId?: string | null }) {
  const [loading, setLoading] = useState(true);
  const [groups, setGroups] = useState<SimpleGroup[]>([]);
  const [groupLogBooks, setGroupLogBooks] = useState<LogBookState>({});
  const [selectedGroupId, setSelectedGroupId] = useState<string>(preselectedGroupId ?? '');
  const [newSessionOpen, setNewSessionOpen] = useState(false);
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);
  
  // Editor state
  const [sessionDate, setSessionDate] = useState('');
  const [sessionTime, setSessionTime] = useState('');
  const [attendance, setAttendance] = useState<Record<string, boolean>>({});
  const [pointsDiscussed, setPointsDiscussed] = useState('');
  const [mentorSuggestions, setMentorSuggestions] = useState('');
  const [remarks, setRemarks] = useState('');
  const [saving, setSaving] = useState(false);

  // List state
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [historyExpanded, setHistoryExpanded] = useState<Set<string>>(new Set());

  const { showToast } = useToast();

  const handleOpenNewSession = () => {
    setSessionDate(new Date().toISOString().split('T')[0]);
    setSessionTime('10:00');
    setAttendance({});
    setPointsDiscussed('');
    setMentorSuggestions('');
    setRemarks('');
    setNewSessionOpen(true);
  };

  const handleOpenEditSession = (entry: LogBookEntry) => {
    setSessionDate(entry.date.split('T')[0]);
    setSessionTime(entry.date.split('T')[1].substring(0, 5));
    const att: Record<string, boolean> = {};
    entry.attendance.forEach((a) => {
      const member = currentGroup?.members.find(m => m.name === a.name);
      if (member) att[member.id] = a.present;
    });
    setAttendance(att);
    setPointsDiscussed(entry.pointsDiscussed);
    setMentorSuggestions(entry.mentorSuggestions);
    setRemarks(entry.remarks);
    setEditingEntryId(entry.id);
  };

  const handleSave = async () => {
    setSaving(true);
    const date = `${sessionDate}T${sessionTime}:00.000Z`;
    const attendanceArray = currentGroup?.members.map(m => ({
      memberId: m.id,
      present: attendance[m.id] ?? true
    })) ?? [];

    if (editingEntryId) {
      await handleEditEntry(editingEntryId, { date, attendance: attendanceArray, pointsDiscussed, mentorSuggestions, remarks });
    } else {
      await handleCreateEntry({ date, attendance: attendanceArray, pointsDiscussed, mentorSuggestions, remarks });
    }
    setSaving(false);
    setNewSessionOpen(false);
  };

  // Load groups list
  useEffect(() => {
    apiGet<{ groups: SimpleGroup[] }>('/api/mentor/groups')
      .then(({ groups }) => {
        setGroups(groups);
        if (!preselectedGroupId && groups.length > 0) {
          setSelectedGroupId(groups[0].id);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Load logbook for selected group (lazy, per-group caching)
  useEffect(() => {
    if (!selectedGroupId) return;
    if (groupLogBooks[selectedGroupId]?.loaded) return;

    apiGet<{ entries: LogBookEntry[] }>(`/api/mentor/groups/${selectedGroupId}/logbook`)
      .then(({ entries }) => {
        const sorted = [...entries].sort((a, b) => b.entryNumber - a.entryNumber);
        setGroupLogBooks((prev) => ({
          ...prev,
          [selectedGroupId]: {
            entries: sorted,
            nextEntryNumber: (sorted[0]?.entryNumber ?? 0) + 1,
            loaded: true,
          },
        }));
      })
      .catch(() => {});
  }, [selectedGroupId]);

  const currentGroup = groups.find((g) => g.id === selectedGroupId) ?? null;
  const logBook = groupLogBooks[selectedGroupId] ?? { entries: [], nextEntryNumber: 1, loaded: false };

  const handleCreateEntry = async (entryData: {
    date: string;
    attendance: { memberId: string; present: boolean }[];
    pointsDiscussed: string;
    mentorSuggestions: string;
    remarks: string;
  }) => {
    if (!selectedGroupId) return;
    try {
      const { entry } = await apiPost<{ entry: LogBookEntry }>(
        `/api/mentor/groups/${selectedGroupId}/logbook`,
        entryData
      );
      setGroupLogBooks((prev) => {
        const current = prev[selectedGroupId] ?? { entries: [], nextEntryNumber: 1, loaded: true };
        const entries = [entry, ...current.entries];
        return {
          ...prev,
          [selectedGroupId]: {
            entries,
            nextEntryNumber: entry.entryNumber + 1,
            loaded: true,
          },
        };
      });
      setNewSessionOpen(false);
      showToast(`Session #${entry.entryNumber} logged.`, 'success');
    } catch (err: any) {
      showToast(err?.message ?? 'Failed to create log entry.', 'error');
    }
  };

  const handleEditEntry = async (entryId: string, entryData: {
    date: string;
    attendance: { memberId: string; present: boolean }[];
    pointsDiscussed: string;
    mentorSuggestions: string;
    remarks: string;
  }) => {
    if (!selectedGroupId) return;
    try {
      const { entry } = await apiPut<{ entry: LogBookEntry }>(
        `/api/mentor/groups/${selectedGroupId}/logbook/${entryId}`,
        entryData
      );
      setGroupLogBooks((prev) => {
        const current = prev[selectedGroupId] ?? { entries: [], nextEntryNumber: 1, loaded: true };
        return {
          ...prev,
          [selectedGroupId]: {
            ...current,
            entries: current.entries.map((e) => (e.id === entryId ? entry : e)),
          },
        };
      });
      setEditingEntryId(null);
      showToast('Log entry updated.', 'success');
    } catch (err: any) {
      showToast(err?.message ?? 'Failed to update log entry.', 'error');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-40 rounded-md" />
        <Skeleton className="h-16 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-6">
      <LogBookGroupSelector
        groups={groups}
        selectedGroupId={selectedGroupId}
        onSelectGroup={(id: string) => {
          setSelectedGroupId(id);
          setNewSessionOpen(false);
          setEditingEntryId(null);
        }}
        onNewSession={handleOpenNewSession}
      />

      <LogBookEntryList
        entries={logBook.entries}
        expandedId={expandedId}
        historyExpanded={historyExpanded}
        onToggleExpand={(id) => setExpandedId(expandedId === id ? null : id)}
        onToggleHistory={(id) => {
          const next = new Set(historyExpanded);
          if (next.has(id)) next.delete(id);
          else next.add(id);
          setHistoryExpanded(next);
        }}
        onEditEntry={handleOpenEditSession}
        onNewSession={handleOpenNewSession}
      />

      <LogBookEntryEditor
        open={newSessionOpen || !!editingEntryId}
        editingEntry={editingEntryId ? logBook.entries.find(e => e.id === editingEntryId) ?? null : null}
        group={currentGroup}
        sessionDate={sessionDate}
        sessionTime={sessionTime}
        attendance={attendance}
        pointsDiscussed={pointsDiscussed}
        mentorSuggestions={mentorSuggestions}
        remarks={remarks}
        saving={saving}
        onClose={() => { setNewSessionOpen(false); setEditingEntryId(null); }}
        onSave={handleSave}
        onSessionDateChange={setSessionDate}
        onSessionTimeChange={setSessionTime}
        onAttendanceChange={(id, p) => setAttendance(prev => ({ ...prev, [id]: p }))}
        onPointsDiscussedChange={setPointsDiscussed}
        onMentorSuggestionsChange={setMentorSuggestions}
        onRemarksChange={setRemarks}
      />

      <LogBookVersionHistory group={currentGroup} />
    </div>
  );
}
