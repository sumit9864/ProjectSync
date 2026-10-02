import { useEffect, useState } from 'react';
import {
  Play,
  CheckCircle2,
  XCircle,
  History,
  UserPlus,
  Lock,
} from 'lucide-react';
import { Card, CardHeader, CardBody, Button, Badge, Skeleton, EmptyState } from '@/components/ui';
import { useToast } from '@/components/Toast';
import {
  adminGroups,
  adminMentors,
  allocationHistory,
  type AllocationResult,
  type AllocationHistoryEntry,
  type AdminGroup,
  type AdminMentor,
} from '@/data/adminData';

export function AdminAllocationPage() {
  const [loading, setLoading] = useState(true);
  const [round, setRound] = useState<1 | 2>(1);
  const [results, setResults] = useState<AllocationResult[] | null>(null);
  const [history, setHistory] = useState<AllocationHistoryEntry[]>(allocationHistory);
  const [groups, setGroups] = useState<AdminGroup[]>(adminGroups);
  const [mentors, setMentors] = useState<AdminMentor[]>(adminMentors);

  // Manual assignment state
  const [selectedGroupId, setSelectedGroupId] = useState<string>('');
  const [selectedMentorId, setSelectedMentorId] = useState<string>('');

  const { showToast } = useToast();

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(t);
  }, []);

  const unassignedGroups = groups.filter((g) => g.mentorId === null);

  const runRound = () => {
    const mentorLoad: Record<string, number> = {};
    mentors.forEach((m) => {
      mentorLoad[m.id] = m.currentLoad;
    });

    const resultsList: AllocationResult[] = [];
    const updatedGroups = [...groups];
    const updatedMentors = [...mentors];

    unassignedGroups.forEach((g) => {
      let matched = false;
      for (const pref of g.preferences) {
        const mentor = mentors.find((m) => m.id === pref.mentorId);
        if (!mentor) continue;
        if (mentorLoad[mentor.id] < mentor.capacity) {
          mentorLoad[mentor.id]++;
          resultsList.push({
            groupId: g.id,
            groupName: g.name,
            projectId: g.projectId,
            matchedRank: pref.rank,
            matchedMentorId: mentor.id,
            matchedMentorName: mentor.name,
            status: 'assigned',
            reason: `Matched at preference rank ${pref.rank}`,
          });
          const gIdx = updatedGroups.findIndex((ug) => ug.id === g.id);
          if (gIdx >= 0) {
            updatedGroups[gIdx] = {
              ...updatedGroups[gIdx],
              mentorId: mentor.id,
              mentorName: mentor.name,
              stage: 'mentor_assigned',
            };
          }
          const mIdx = updatedMentors.findIndex((um) => um.id === mentor.id);
          if (mIdx >= 0) {
            updatedMentors[mIdx] = { ...updatedMentors[mIdx], currentLoad: mentorLoad[mentor.id] };
          }
          matched = true;
          break;
        }
      }
      if (!matched) {
        resultsList.push({
          groupId: g.id,
          groupName: g.name,
          projectId: g.projectId,
          matchedRank: null,
          matchedMentorId: null,
          matchedMentorName: null,
          status: 'unassigned',
          reason: 'No capacity found across all preferences',
        });
      }
    });

    setResults(resultsList);
    setGroups(updatedGroups);
    setMentors(updatedMentors);

    const assigned = resultsList.filter((r) => r.status === 'assigned').length;
    const unassigned = resultsList.filter((r) => r.status === 'unassigned').length;

    setHistory((prev) => [
      {
        id: `ah-${Date.now()}`,
        round,
        runAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) +
          ' · ' + new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
        assigned,
        unassigned,
        runBy: 'Dr. Priya Krishnan',
      },
      ...prev,
    ]);

    showToast(`Round ${round} complete: ${assigned} assigned, ${unassigned} unassigned.`, 'success');
  };

  const forceAssign = () => {
    if (!selectedGroupId || !selectedMentorId) {
      showToast('Select both a group and a mentor.', 'error');
      return;
    }
    const mentor = mentors.find((m) => m.id === selectedMentorId);
    const group = groups.find((g) => g.id === selectedGroupId);
    if (!mentor || !group) return;

    setGroups((prev) =>
      prev.map((g) =>
        g.id === selectedGroupId
          ? { ...g, mentorId: mentor.id, mentorName: mentor.name, stage: 'mentor_assigned' }
          : g
      )
    );
    setMentors((prev) =>
      prev.map((m) =>
        m.id === selectedMentorId ? { ...m, currentLoad: m.currentLoad + 1 } : m
      )
    );

    showToast(`${mentor.name} assigned to ${group.name}.`, 'success');
    setSelectedGroupId('');
    setSelectedMentorId('');
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-40 rounded-md" />
        <Skeleton className="h-48 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink-900 dark:text-ink-100">Mentor Allocation</h1>
        <p className="mt-1 text-sm text-ink-500 dark:text-ink-400">
          Run FCFS allocation rounds or manually assign mentors as exceptions.
        </p>
      </div>

      {/* Round selector + run */}
      <Card>
        <CardHeader title="Allocation Rounds" subtitle="Simulate first-come-first-served mentor matching" />
        <CardBody className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              {([1, 2] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setRound(r)}
                  className={`rounded-lg px-4 py-2 text-sm font-semibold transition-all ${
                    round === r
                      ? 'bg-brand-600 text-white shadow-sm'
                      : 'bg-ink-100 text-ink-600 hover:bg-ink-200 dark:bg-ink-800 dark:text-ink-300 dark:hover:bg-ink-700'
                  }`}
                >
                  Round {r}
                </button>
              ))}
            </div>
            <Button onClick={runRound} disabled={unassignedGroups.length === 0}>
              <Play className="h-4 w-4" />
              Run Round {round}
            </Button>
          </div>
          {unassignedGroups.length === 0 && (
            <p className="text-sm text-ink-400 dark:text-ink-500">
              All groups already have mentors assigned.
            </p>
          )}

          {/* Results */}
          {results && (
            <div className="rounded-xl border border-ink-100 dark:border-ink-800 bg-ink-50/50 dark:bg-ink-900/50 p-4 space-y-3">
              <p className="text-sm font-semibold text-ink-700 dark:text-ink-200">Round {round} Results</p>
              {results.length === 0 ? (
                <p className="text-sm text-ink-400 dark:text-ink-500">No unassigned groups to process.</p>
              ) : (
                <div className="divide-y divide-ink-100 dark:divide-ink-800">
                  {results.map((r) => (
                    <div key={r.groupId} className="flex items-center justify-between gap-3 py-2.5">
                      <div className="flex items-center gap-3 min-w-0">
                        {r.status === 'assigned' ? (
                          <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500 dark:text-emerald-400" />
                        ) : (
                          <XCircle className="h-5 w-5 shrink-0 text-rose-400" />
                        )}
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-ink-800 truncate dark:text-ink-100">
                            {r.groupName}
                          </p>
                          <p className="text-xs text-ink-400 truncate dark:text-ink-500">
                            {r.projectId} · {r.reason}
                            {r.matchedMentorName && ` · ${r.matchedMentorName}`}
                          </p>
                        </div>
                      </div>
                      <Badge color={r.status === 'assigned' ? 'success' : 'error'}>
                        {r.status === 'assigned' ? 'Assigned' : 'Unassigned'}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </CardBody>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Manual assignment */}
        <Card className="border-amber-200 dark:border-amber-800/60">
          <CardHeader
            title="Manual Assignment"
            subtitle="Exception path — override allocation results"
          />
          <CardBody className="space-y-4">
            <div className="flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700 dark:bg-amber-950/60 dark:text-amber-400">
              <Lock className="h-3.5 w-3.5" />
              Use only when FCFS rounds cannot place a group.
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink-700 dark:text-ink-200">
                Unassigned Group
              </label>
              <select
                value={selectedGroupId}
                onChange={(e) => setSelectedGroupId(e.target.value)}
                className="input-field"
              >
                <option value="">Select a group...</option>
                {unassignedGroups.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name} ({g.projectId})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink-700 dark:text-ink-200">Mentor</label>
              <select
                value={selectedMentorId}
                onChange={(e) => setSelectedMentorId(e.target.value)}
                className="input-field"
              >
                <option value="">Select a mentor...</option>
                {mentors.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} — {m.currentLoad}/{m.capacity} ({m.domain})
                  </option>
                ))}
              </select>
            </div>

            <Button
              variant="secondary"
              onClick={forceAssign}
              disabled={!selectedGroupId || !selectedMentorId}
            >
              <UserPlus className="h-4 w-4" />
              Force Assign
            </Button>
          </CardBody>
        </Card>

        {/* Allocation history */}
        <Card>
          <CardHeader title="Allocation History" subtitle="Past round executions" />
          <CardBody className="p-0">
            {history.length === 0 ? (
              <EmptyState
                icon={<History className="h-7 w-7" />}
                title="No rounds run yet"
                message="Run your first allocation round to see results here."
              />
            ) : (
              <div className="divide-y divide-ink-50 dark:divide-ink-800">
                {history.map((h) => (
                  <div key={h.id} className="flex items-center justify-between gap-3 px-5 py-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-950/50 dark:text-brand-400">
                        <History className="h-4.5 w-4.5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-ink-800 dark:text-ink-100">
                          Round {h.round}
                        </p>
                        <p className="text-xs text-ink-400 truncate dark:text-ink-500">
                          {h.runAt} · by {h.runBy}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge color="success">{h.assigned} assigned</Badge>
                      {h.unassigned > 0 && (
                        <Badge color="warning">{h.unassigned} unassigned</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
