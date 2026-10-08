import { useState, useEffect } from 'react';
import { Target, CheckCircle2, Clock, CalendarClock, AlertTriangle, LockKeyhole, UserRound, ChevronDown } from 'lucide-react';
import { Card, CardHeader, CardBody, Button, Badge, Skeleton, EmptyState } from '@/components/ui';
import { Modal } from '@/components/Modal';
import { useToast } from '@/components/Toast';
import { milestones as initialMilestones } from '@/data/mockData';
import type { Milestone } from '@/types';

export function MilestonesPage() {
  const [loading, setLoading] = useState(true);
  const [milestones, setMilestones] = useState<Milestone[]>(initialMilestones);
  const [checkInMilestone, setCheckInMilestone] = useState<Milestone | null>(null);
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(t);
  }, []);

  const completed = milestones.filter((m) => m.status === 'complete').length;
  const total = milestones.length;
  const progress = total ? Math.round((completed / total) * 100) : 0;
  const today = new Date('2026-10-01T00:00:00');
  const daysUntil = (dueDate: string) => Math.ceil((new Date(dueDate).getTime() - today.getTime()) / 86400000);
  const overdue = milestones.filter((m) => m.status !== 'complete' && daysUntil(m.dueDate) < 0);
  const upcoming = milestones.filter((m) => m.status !== 'complete' && daysUntil(m.dueDate) >= 0).sort((a, b) => daysUntil(a.dueDate) - daysUntil(b.dueDate))[0];
  const phases = [
    { label: 'Foundation', items: milestones.slice(0, 2) },
    { label: 'Build & review', items: milestones.slice(2, 3) },
    { label: 'Final delivery', items: milestones.slice(3) },
  ].filter((phase) => phase.items.length);

  const handleCheckIn = () => {
    if (!checkInMilestone || !note.trim()) {
      showToast('Please add a note for your check-in.', 'error');
      return;
    }
    setSaving(true);
    setTimeout(() => {
      const now = new Date();
      setMilestones((prev) =>
        prev.map((m) =>
          m.id === checkInMilestone.id
            ? {
                ...m,
                status: 'complete',
                checkInNote: note.trim(),
                checkedInAt:
                  now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) +
                  ' · ' +
                  now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
              }
            : m
        )
      );
      setSaving(false);
      setCheckInMilestone(null);
      setNote('');
      showToast(`Milestone "${checkInMilestone.title}" checked in.`, 'success');
    }, 600);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-40 rounded-md" />
        <Skeleton className="h-24 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink-900 dark:text-ink-100">Milestones</h1>
        <p className="mt-1 text-sm text-ink-500 dark:text-ink-400">
          Track your project milestones and check in as you complete each one.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div className="space-y-5">
          {upcoming && (
            <Card className="overflow-hidden border-brand-200 bg-gradient-to-br from-brand-50 via-white to-teal-50 dark:border-brand-900/60 dark:from-brand-950/40 dark:via-ink-900 dark:to-teal-950/30">
              <CardBody className="p-6"><div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center"><div><p className="text-[11px] font-bold uppercase tracking-[0.18em] text-brand-700 dark:text-brand-300">Up next</p><h2 className="mt-2 font-display text-xl font-bold text-ink-900 dark:text-ink-100">{upcoming.title}</h2><p className="mt-2 flex items-center gap-2 text-sm text-ink-500 dark:text-ink-400"><CalendarClock className="h-4 w-4" />Due {upcoming.dueDate} · {daysUntil(upcoming.dueDate)} days remaining</p></div><Button onClick={() => { setCheckInMilestone(upcoming); setNote(''); }}><CheckCircle2 className="h-4 w-4" />Start check-in</Button></div></CardBody>
            </Card>
          )}
          {overdue.length > 0 && <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 dark:border-rose-900/60 dark:bg-rose-950/25"><div className="flex items-start gap-3"><AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" /><div><p className="font-semibold text-rose-900 dark:text-rose-100">{overdue.length} overdue milestone{overdue.length > 1 ? 's' : ''}</p><p className="mt-1 text-sm text-rose-700 dark:text-rose-300">Prioritize a check-in so your mentor can help unblock the next step.</p></div></div></div>}
          <Card><CardHeader title="Project journey" subtitle="A connected path from foundation to final delivery" /><CardBody className="p-5"><div className="space-y-0">{milestones.map((m, index) => { const complete = m.status === 'complete'; const overdueItem = !complete && daysUntil(m.dueDate) < 0; const reviewed = complete && Boolean(m.checkInNote); const expanded = expandedId === m.id; return <div key={m.id} className="relative flex gap-4 pb-6 last:pb-0"><div className="flex w-9 shrink-0 justify-center"><div className={`z-10 flex h-9 w-9 items-center justify-center rounded-full ring-4 ring-white dark:ring-ink-900 ${complete ? reviewed ? 'bg-blue-500 text-white' : 'bg-emerald-500 text-white' : overdueItem ? 'bg-rose-500 text-white' : index > 0 && milestones[index - 1].status !== 'complete' ? 'bg-slate-200 text-slate-500 dark:bg-slate-700 dark:text-slate-300' : 'bg-amber-400 text-white'}`}>{complete ? <CheckCircle2 className="h-5 w-5" /> : overdueItem ? <AlertTriangle className="h-4 w-4" /> : index > 0 && milestones[index - 1].status !== 'complete' ? <LockKeyhole className="h-4 w-4" /> : <span className="text-sm font-bold">{m.number}</span>}</div>{index < milestones.length - 1 && <div className="absolute bottom-0 top-9 w-px bg-ink-200 dark:bg-ink-700" />}</div><div className="min-w-0 flex-1 rounded-xl border border-ink-100/80 bg-white/90 p-4 shadow-sm shadow-ink-900/5 dark:border-ink-800 dark:bg-ink-900/90"><div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-start"><div><div className="flex flex-wrap items-center gap-2"><h3 className={`font-semibold ${complete ? 'text-ink-500 dark:text-ink-400' : 'text-ink-900 dark:text-ink-100'}`}>{m.title}</h3><Badge color={complete ? reviewed ? 'info' : 'success' : overdueItem ? 'error' : 'warning'}>{complete ? reviewed ? 'Mentor reviewed' : 'Complete' : overdueItem ? 'Overdue' : 'Upcoming'}</Badge></div><p className={`mt-2 flex items-center gap-1.5 text-xs ${overdueItem ? 'font-semibold text-rose-600' : 'text-ink-500 dark:text-ink-400'}`}><CalendarClock className="h-3.5 w-3.5" />Due {m.dueDate}{!complete && ` · ${Math.abs(daysUntil(m.dueDate))} days ${overdueItem ? 'late' : 'remaining'}`}</p></div>{!complete && <Button variant="secondary" size="sm" onClick={() => { setCheckInMilestone(m); setNote(''); }}><CheckCircle2 className="h-3.5 w-3.5" />Check in</Button>}</div>{m.checkInNote && <><button onClick={() => setExpandedId(expanded ? null : m.id)} className="mt-3 flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400">{expanded ? 'Hide check-in note' : 'Read check-in note'}<ChevronDown className={`h-3.5 w-3.5 transition-transform ${expanded ? 'rotate-180' : ''}`} /></button>{expanded && <div className="mt-3 border-l-2 border-blue-300 bg-blue-50/60 px-4 py-3 dark:border-blue-700 dark:bg-blue-950/25"><p className="flex items-center gap-1.5 text-xs font-semibold text-blue-700 dark:text-blue-300"><UserRound className="h-3.5 w-3.5" />Student check-in · {m.checkedInAt}</p><p className="mt-2 font-serif text-sm italic leading-6 text-ink-700 dark:text-ink-200">{m.checkInNote}</p></div>}</>}</div></div> })}</div></CardBody></Card>
        </div>
        <aside className="space-y-5"><Card><CardHeader title="Phase progress" subtitle="A quick view of project health" /><CardBody className="space-y-4">{phases.map((phase) => { const done = phase.items.filter((m) => m.status === 'complete').length; const phaseProgress = Math.round((done / phase.items.length) * 100); return <div key={phase.label}><div className="flex justify-between text-sm"><span className="font-medium text-ink-700 dark:text-ink-200">{phase.label}</span><span className="text-ink-500">{done}/{phase.items.length}</span></div><div className="mt-2 h-2 rounded-full bg-ink-100 dark:bg-ink-800"><div className="h-full rounded-full bg-brand-500" style={{ width: `${phaseProgress}%` }} /></div></div> })}</CardBody></Card><Card><CardHeader title="Recent check-ins" subtitle="Latest project activity" /><CardBody className="space-y-3">{milestones.filter((m) => m.checkedInAt).slice(0, 3).map((m) => <div key={m.id} className="border-l-2 border-brand-400 pl-3"><p className="text-sm font-medium text-ink-800 dark:text-ink-100">{m.title}</p><p className="mt-1 text-xs text-ink-500">{m.checkedInAt}</p></div>)}{!milestones.some((m) => m.checkedInAt) && <p className="text-sm text-ink-500">No check-ins yet. Your next update will appear here.</p>}</CardBody></Card></aside>
      </div>

      {/* Check-in Modal */}
      <Modal
        open={checkInMilestone !== null}
        onClose={() => {
          setCheckInMilestone(null);
          setNote('');
        }}
        title="Milestone Check-In"
        maxWidth="max-w-md"
      >
        {checkInMilestone && (
          <div className="space-y-4">
            <div className="rounded-lg bg-ink-50 px-4 py-3 dark:bg-ink-800/50">
              <p className="text-xs text-ink-400 dark:text-ink-500">Milestone {checkInMilestone.number}</p>
              <p className="mt-0.5 font-display font-semibold text-ink-800 dark:text-ink-100">
                {checkInMilestone.title}
              </p>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink-700 dark:text-ink-200">
                Check-in note
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={4}
                placeholder="What did you accomplish for this milestone? Any notes for your mentor?"
                className="input-field resize-none text-sm"
              />
              <p className="mt-2 text-xs text-ink-400 dark:text-ink-500">
                This note will be visible to your mentor in the log book.
              </p>
            </div>
            <div className="flex justify-end gap-3 border-t border-ink-100 pt-4 dark:border-ink-800">
              <Button
                variant="secondary"
                onClick={() => {
                  setCheckInMilestone(null);
                  setNote('');
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleCheckIn} disabled={saving || !note.trim()}>
                {saving ? 'Saving...' : 'Confirm check-in'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
