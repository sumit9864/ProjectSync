import { useEffect, useState } from 'react';
import { CalendarClock, CheckCircle2, ClipboardList, History, Plus, Trash2 } from 'lucide-react';
import { Card, CardHeader, CardBody, Button, Badge, Skeleton, EmptyState } from '@/components/ui';
import { useToast } from '@/components/Toast';
import { auditEvents, controlWindows, extensions as initialExtensions, type Extension } from '@/data/adminData';

type WindowKey = 'registration' | 'round1' | 'round2';
type AdminControlsPageProps = { onViewResults?: () => void; hasResults?: boolean };

export function AdminControlsPage({ onViewResults, hasResults = false }: AdminControlsPageProps) {
  const [loading, setLoading] = useState(true);
  const [windows, setWindows] = useState(controlWindows);
  const [extensions, setExtensions] = useState<Extension[]>(initialExtensions);
  const [event, setEvent] = useState<WindowKey>('registration');
  const [offset, setOffset] = useState('7');
  const [reason, setReason] = useState('');
  const { showToast } = useToast();

  useEffect(() => { const timer = setTimeout(() => setLoading(false), 400); return () => clearTimeout(timer); }, []);

  const updateWindow = (key: WindowKey, field: 'opensOn' | 'closesOn', value: string) => {
    setWindows((current) => ({ ...current, [key]: { ...current[key], [field]: value } }));
  };

  const grantExtension = () => {
    const days = Number(offset);
    if (!Number.isInteger(days) || days < 1 || !reason.trim()) { showToast('Add a valid number of days and a reason.', 'error'); return; }
    setExtensions((current) => [{ id: `ext-${Date.now()}`, groupId: 'all', groupName: 'All groups', offsetDays: days, reason: reason.trim(), grantedAt: 'Today', grantedBy: 'Dr. Priya Krishnan' }, ...current]);
    setReason(''); setOffset('7'); showToast(`Deadline extended for all groups by ${days} days.`, 'success');
  };

  if (loading) return <div className="flex flex-col gap-4"><Skeleton className="h-10 w-48 rounded-xl" /><Skeleton className="h-80 w-full rounded-2xl" /><Skeleton className="h-56 w-full rounded-2xl" /> </div>;
  const scheduleRows: Array<{ key: WindowKey; label: string; eyebrow: string }> = [
    { key: 'registration', label: 'Registration window', eyebrow: 'Project identity and team setup' },
    { key: 'round1', label: 'Preference round 1', eyebrow: 'First mentor preference pass' },
    { key: 'round2', label: 'Preference round 2', eyebrow: 'Final preference pass' },
  ];
  const allocationAudit = auditEvents.filter((entry) => /allocation|assigned|extension/i.test(entry.description));

  return <div className="flex flex-col gap-6 animate-fade-in">
    <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-700 dark:text-brand-300">Program operations</p><h1 className="mt-1 font-display text-3xl font-bold text-ink-900 dark:text-ink-100">Controls</h1><p className="mt-2 max-w-2xl text-sm text-ink-500 dark:text-ink-400">Schedule every project phase, record deadline exceptions, and keep allocation operations auditable.</p></div><Button variant={hasResults ? 'primary' : 'secondary'} onClick={onViewResults} disabled={!hasResults}>View results</Button></header>
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
      <Card className="overflow-hidden border-brand-100 dark:border-brand-900/50"><CardHeader title="Windows" subtitle="Set exact start and close date-times for every phase. Deadlines close automatically." /><CardBody className="flex flex-col gap-3 p-4">{scheduleRows.map(({ key, label, eyebrow }) => <div key={key} className="rounded-2xl border border-ink-100 bg-ink-50/30 p-4 dark:border-ink-800 dark:bg-ink-950/30"><div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center"><div className="min-w-0"><div className="flex items-center gap-2"><CalendarClock className="h-4 w-4 text-brand-600" /><p className="font-semibold text-ink-900 dark:text-ink-100">{label}</p></div><p className="mt-1 text-xs text-ink-500 dark:text-ink-400">{eyebrow}</p><Badge color={windows[key].open ? 'success' : 'neutral'}>{windows[key].open ? 'Scheduled' : 'Upcoming'}</Badge></div><div className="grid gap-3 sm:grid-cols-2 lg:w-[460px]"><label className="text-xs font-medium text-ink-500">Starts<input value={windows[key].opensOn} onChange={(e) => updateWindow(key, 'opensOn', e.target.value)} onBlur={() => showToast('Schedule saved.', 'success')} className="input-field mt-1 text-xs" /></label><label className="text-xs font-medium text-ink-500">Closes<input value={windows[key].closesOn} onChange={(e) => updateWindow(key, 'closesOn', e.target.value)} onBlur={() => showToast('Schedule saved.', 'success')} className="input-field mt-1 text-xs" /></label></div></div></div>)}</CardBody></Card>
      <Card className="h-fit"><CardHeader title="Round history" subtitle="Allocation-related audit entries only" /><CardBody className="p-0">{allocationAudit.length ? <div className="divide-y divide-ink-100 dark:divide-ink-800">{allocationAudit.map((entry) => <div key={entry.id} className="flex gap-3 px-5 py-4"><div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-700 dark:bg-brand-950/40 dark:text-brand-300"><History className="h-4 w-4" /></div><div className="min-w-0"><p className="text-sm font-medium text-ink-800 dark:text-ink-100">{entry.description}</p><p className="mt-1 text-xs text-ink-500">{entry.timestamp} · {entry.actor}</p></div></div>)}</div> : <EmptyState icon={<History className="h-6 w-6" />} title="No allocation activity" message="Round activity will appear here." />}</CardBody></Card>
    </div>
    <Card><CardHeader title="Extended deadline" subtitle="Apply a deadline extension to every group in one documented action." /><CardBody className="flex flex-col gap-4"><div className="grid gap-4 sm:grid-cols-[180px_minmax(0,1fr)_auto] sm:items-end"><label className="text-sm font-medium text-ink-700 dark:text-ink-200">Days<input type="number" min="1" max="30" value={offset} onChange={(e) => setOffset(e.target.value)} className="input-field mt-1" /></label><label className="text-sm font-medium text-ink-700 dark:text-ink-200">Reason<input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Why does every group need more time?" className="input-field mt-1" /></label><Button onClick={grantExtension}><Plus className="h-4 w-4" />Extend all deadlines</Button></div><div className="flex flex-col gap-2 border-t border-ink-100 pt-4 dark:border-ink-800">{extensions.map((extension) => <div key={extension.id} className="flex items-center justify-between gap-3 rounded-xl bg-ink-50 px-4 py-3 dark:bg-ink-950/40"><div><p className="text-sm font-semibold text-ink-800 dark:text-ink-100">All groups <span className="font-normal text-brand-700 dark:text-brand-300">+{extension.offsetDays} days</span></p><p className="text-xs text-ink-500">{extension.reason} · {extension.grantedAt} by {extension.grantedBy}</p></div><button onClick={() => setExtensions((current) => current.filter((item) => item.id !== extension.id))} aria-label="Revoke extension" className="rounded-lg p-2 text-ink-400 hover:bg-rose-50 hover:text-rose-600"><Trash2 className="h-4 w-4" /></button></div>)}</div></CardBody></Card>
    <Card className="border-brand-100 bg-brand-50/40 dark:border-brand-900/50 dark:bg-brand-950/20"><CardBody className="flex items-start gap-3"><CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" /><div><p className="font-semibold text-ink-900 dark:text-ink-100">Automatic deadline protection</p><p className="mt-1 text-sm text-ink-600 dark:text-ink-300">Dates are evaluated automatically, so a phase closes at its configured deadline without requiring an admin toggle.</p></div></CardBody></Card>
  </div>;
}

export default AdminControlsPage;
