import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, CircleDashed, History, LockKeyhole, Play, ShieldCheck, UserPlus, Users, XCircle } from 'lucide-react';
import { Badge, Button, Card, CardBody, CardHeader, EmptyState, Skeleton } from '@/components/ui';
import { useToast } from '@/components/Toast';
import { adminGroups, adminMentors, type AdminGroup, type AdminMentor, type AllocationResult } from '@/data/adminData';

type Props = { onRoundRun?: () => void };
type Round = 1 | 2;
type RoundResults = Record<Round, AllocationResult[] | null>;

export function AdminAllocationPage({ onRoundRun }: Props) {
  const [loading, setLoading] = useState(true);
  const [groups, setGroups] = useState<AdminGroup[]>(adminGroups);
  const [mentors, setMentors] = useState<AdminMentor[]>(adminMentors);
  const [roundResults, setRoundResults] = useState<RoundResults>({ 1: null, 2: null });
  const [manualGroupId, setManualGroupId] = useState('');
  const [manualMentorId, setManualMentorId] = useState('');
  const [manualAssignments, setManualAssignments] = useState<AllocationResult[]>([]);
  const { showToast } = useToast();

  useEffect(() => { const timer = setTimeout(() => setLoading(false), 400); return () => clearTimeout(timer); }, []);

  const unassignedGroups = groups.filter((group) => !group.mentorId);
  const availableMentors = mentors.filter((mentor) => mentor.currentLoad < mentor.capacity);
  const selectedGroup = groups.find((group) => group.id === manualGroupId);
  const selectedMentor = mentors.find((mentor) => mentor.id === manualMentorId);
  const totalResults = Object.values(roundResults).reduce((sum, results) => sum + (results?.length ?? 0), 0) + manualAssignments.length;
  const manualGroupOptions = useMemo(() => unassignedGroups.filter((group) => !manualAssignments.some((assignment) => assignment.groupId === group.id)), [unassignedGroups, manualAssignments]);

  const runRound = (round: Round) => {
    const mentorLoad: Record<string, number> = Object.fromEntries(mentors.map((mentor) => [mentor.id, mentor.currentLoad]));
    const results: AllocationResult[] = [];
    const updatedGroups = [...groups];
    const updatedMentors = [...mentors];
    groups.filter((group) => !group.mentorId).forEach((group) => {
      const preference = group.preferences.find((item) => { const mentor = mentors.find((candidate) => candidate.id === item.mentorId); return mentor && mentorLoad[mentor.id] < mentor.capacity; });
      const mentor = preference ? mentors.find((candidate) => candidate.id === preference.mentorId) : null;
      if (mentor && preference) {
        mentorLoad[mentor.id] += 1;
        results.push({ groupId: group.id, groupName: group.name, projectId: group.projectId, matchedRank: preference.rank, matchedMentorId: mentor.id, matchedMentorName: mentor.name, status: 'assigned', reason: `Matched at preference rank ${preference.rank}` });
        const groupIndex = updatedGroups.findIndex((item) => item.id === group.id);
        if (groupIndex >= 0) updatedGroups[groupIndex] = { ...updatedGroups[groupIndex], mentorId: mentor.id, mentorName: mentor.name, stage: 'mentor_assigned' };
        const mentorIndex = updatedMentors.findIndex((item) => item.id === mentor.id);
        if (mentorIndex >= 0) updatedMentors[mentorIndex] = { ...updatedMentors[mentorIndex], currentLoad: mentorLoad[mentor.id] };
      } else results.push({ groupId: group.id, groupName: group.name, projectId: group.projectId, matchedRank: null, matchedMentorId: null, matchedMentorName: null, status: 'unassigned', reason: 'No capacity found across all preferences' });
    });
    setRoundResults((current) => ({ ...current, [round]: results }));
    setGroups(updatedGroups); setMentors(updatedMentors); onRoundRun?.();
    showToast(`Round ${round} complete: ${results.filter((item) => item.status === 'assigned').length} assigned.`, 'success');
  };

  const forceAssign = () => {
    if (!selectedGroup || !selectedMentor) return;
    const assignment: AllocationResult = { groupId: selectedGroup.id, groupName: selectedGroup.name, projectId: selectedGroup.projectId, matchedRank: null, matchedMentorId: selectedMentor.id, matchedMentorName: selectedMentor.name, status: 'assigned', reason: 'Manual override after allocation round' };
    setManualAssignments((current) => [...current, assignment]);
    setGroups((current) => current.map((group) => group.id === selectedGroup.id ? { ...group, mentorId: selectedMentor.id, mentorName: selectedMentor.name, stage: 'mentor_assigned' } : group));
    setMentors((current) => current.map((mentor) => mentor.id === selectedMentor.id ? { ...mentor, currentLoad: mentor.currentLoad + 1 } : mentor));
    setManualGroupId(''); setManualMentorId('');
    showToast(`${selectedGroup.name} assigned to ${selectedMentor.name}.`, 'success');
  };

  const resultSection = (round: Round) => {
    const results = roundResults[round];
    return <section className="overflow-hidden rounded-2xl border border-ink-100 dark:border-ink-800"><div className="flex flex-col justify-between gap-2 border-b border-ink-100 bg-ink-50/60 px-4 py-3 dark:border-ink-800 dark:bg-ink-950/40 sm:flex-row sm:items-center"><div><h2 className="font-semibold text-ink-900 dark:text-ink-100">Round {round} results</h2><p className="text-xs text-ink-500 dark:text-ink-400">{results ? `${results.length} groups evaluated` : 'No results declared yet'}</p></div>{results && <Badge color="info">Declared</Badge>}</div>{!results ? <div className="flex items-center gap-3 px-4 py-7"><CircleDashed className="h-5 w-5 text-ink-400" /><p className="text-sm text-ink-500 dark:text-ink-400">Round {round} has not been run yet. Run the round above to generate results.</p></div> : results.length === 0 ? <EmptyState icon={<Users className="h-6 w-6" />} title="No groups evaluated" message="There are no unassigned groups in this round." /> : <div className="divide-y divide-ink-100 dark:divide-ink-800">{results.map((result) => <div key={result.groupId} className="flex flex-col gap-3 px-4 py-4 lg:flex-row lg:items-center lg:justify-between"><div className="flex min-w-0 items-start gap-3"><div className={`mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full ${result.status === 'assigned' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400' : 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400'}`}>{result.status === 'assigned' ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}</div><div className="min-w-0"><p className="truncate text-sm font-semibold text-ink-900 dark:text-ink-100">{result.projectId} · {result.groupName}</p><div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-ink-500 dark:text-ink-400"><span>{result.matchedRank ? `Matched preference ${result.matchedRank}` : 'No capacity found'}</span><span className="text-ink-300">·</span><span>{result.matchedMentorName || 'No mentor matched'}</span></div></div></div><Badge color={result.status === 'assigned' ? 'success' : 'error'}>{result.status === 'assigned' ? 'Assigned' : 'Unassigned'}</Badge></div>)}</div>}</section>;
  };

  if (loading) return <div className="flex flex-col gap-4"><Skeleton className="h-10 w-48 rounded-xl" /><Skeleton className="h-36 w-full rounded-2xl" /><Skeleton className="h-80 w-full rounded-2xl" /></div>;

  return <main className="flex flex-col gap-6 animate-fade-in"><header className="flex flex-col justify-between gap-5 rounded-3xl border border-brand-100 bg-white p-6 shadow-sm shadow-brand-900/5 dark:border-brand-900/50 dark:bg-ink-900 sm:flex-row sm:items-end"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-700 dark:text-brand-300">Allocation workspace</p><h1 className="mt-2 font-display text-3xl font-bold text-ink-900 dark:text-ink-100">Allocation results</h1><p className="mt-2 max-w-xl text-sm leading-6 text-ink-500 dark:text-ink-400">Run allocation rounds, then resolve remaining groups with a controlled manual override.</p></div><div className="flex items-center gap-2 rounded-2xl bg-brand-50 p-2 dark:bg-brand-950/30"><div className="px-3"><p className="text-[11px] font-bold uppercase tracking-wider text-brand-700 dark:text-brand-300">Declared results</p><p className="mt-0.5 text-xl font-bold text-brand-950 dark:text-brand-100">{totalResults}</p></div><Users className="mr-2 h-5 w-5 text-brand-600" /></div></header>

    <section className="grid gap-4 md:grid-cols-2" aria-label="Run allocation rounds">{([1, 2] as const).map((round) => <Card key={round} className={round === 1 ? 'border-brand-200 dark:border-brand-800/70' : 'border-ink-200 dark:border-ink-700'}><CardBody className="flex items-center justify-between gap-4 p-5"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-700 dark:text-brand-300">Round {round}</p><h2 className="mt-1 font-display text-lg font-bold text-ink-900 dark:text-ink-100">Run round {round}</h2><p className="mt-1 text-sm text-ink-500 dark:text-ink-400">Preview matches using current mentor capacity.</p></div><Button onClick={() => runRound(round)}><Play className="h-4 w-4" />Run round {round}</Button></CardBody></Card>)}</section>

    <Card className="overflow-hidden border-brand-100 dark:border-brand-900/50"><CardHeader title="Allocation results" subtitle="Each round stays separate, with manual overrides recorded below." /><CardBody className="flex flex-col gap-6 p-5">{resultSection(1)}{resultSection(2)}{manualAssignments.length > 0 && <section className="overflow-hidden rounded-2xl border border-brand-100 dark:border-brand-900/50"><div className="border-b border-brand-100 bg-brand-50/50 px-4 py-3 dark:border-brand-900/50 dark:bg-brand-950/20"><h2 className="font-semibold text-ink-900 dark:text-ink-100">Manual overrides</h2><p className="text-xs text-ink-500">Assignments made after a round completed</p></div><div className="divide-y divide-ink-100 dark:divide-ink-800">{manualAssignments.map((result) => <div key={result.groupId} className="flex items-center justify-between gap-3 px-4 py-4"><div><p className="text-sm font-semibold text-ink-900 dark:text-ink-100">{result.projectId} · {result.groupName}</p><p className="mt-1 text-xs text-ink-500">Manual override · {result.matchedMentorName}</p></div><Badge color="success">Assigned</Badge></div>)}</div></section>}</CardBody></Card>

    <Card className="border-amber-200/80 dark:border-amber-900/50"><CardHeader title="Manual assignment" subtitle="Exception path — override allocation results" /><CardBody className="flex flex-col gap-5"><div className="flex items-start gap-3 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:bg-amber-950/30 dark:text-amber-200"><LockKeyhole className="mt-0.5 size-4 shrink-0" /><p>Use only after a round cannot place a group. This creates a visible manual override in the results.</p></div><div className="grid gap-4 md:grid-cols-2"><label className="flex flex-col gap-2 text-sm font-semibold text-ink-700 dark:text-ink-200">Unassigned group<select value={manualGroupId} onChange={(event) => { setManualGroupId(event.target.value); setManualMentorId(''); }} className="input-field font-normal"><option value="">Select a group...</option>{manualGroupOptions.map((group) => <option key={group.id} value={group.id}>{group.name} ({group.projectId})</option>)}</select></label><label className="flex flex-col gap-2 text-sm font-semibold text-ink-700 dark:text-ink-200">Mentor<select value={manualMentorId} onChange={(event) => setManualMentorId(event.target.value)} className="input-field font-normal"><option value="">Select a mentor...</option>{availableMentors.map((mentor) => <option key={mentor.id} value={mentor.id}>{mentor.name} — {mentor.currentLoad}/{mentor.capacity} ({mentor.domain})</option>)}</select></label></div><div className="flex flex-col justify-between gap-3 rounded-xl border border-ink-100 bg-ink-50/60 p-4 dark:border-ink-800 dark:bg-ink-950/30 sm:flex-row sm:items-center"><div className="flex items-center gap-2 text-sm text-ink-600 dark:text-ink-300"><ShieldCheck className="size-4 text-brand-600" />{selectedMentor ? `${selectedMentor.capacity - selectedMentor.currentLoad} capacity slot available` : 'Only mentors with open capacity are shown'}</div><Button onClick={forceAssign} disabled={!selectedGroup || !selectedMentor}><UserPlus className="size-4" />Force assign</Button></div></CardBody></Card>

    <Card><CardHeader title="Allocation history" subtitle="Round runs and manual decisions remain auditable." /><CardBody><div className="flex items-center gap-3 text-sm text-ink-500 dark:text-ink-400"><History className="size-4 text-brand-600" />Use the audit log to review the full assignment trail.</div></CardBody></Card>
  </main>;
}

export default AdminAllocationPage;
