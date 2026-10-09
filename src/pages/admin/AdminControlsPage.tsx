import { useEffect, useState } from 'react';
import {
  CalendarPlus,
  Trash2,
} from 'lucide-react';
import { Card, CardHeader, CardBody, Button, Badge, Skeleton, EmptyState } from '@/components/ui';
import { useToast } from '@/components/Toast';
import {
  extensions as initialExtensions,
  controlWindows,
  type Extension,
} from '@/data/adminData';

export function AdminControlsPage() {
  const [loading, setLoading] = useState(true);
  const [windows, setWindows] = useState(controlWindows);
  const [extList, setExtList] = useState<Extension[]>(initialExtensions);
  // Extension form state
  const [extOffset, setExtOffset] = useState('7');
  const [extReason, setExtReason] = useState('');

  const { showToast } = useToast();

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(t);
  }, []);

  const updateWindow = (key: 'registration' | 'round1' | 'round2', field: 'opensOn' | 'closesOn', value: string) => {
    setWindows((prev) => ({ ...prev, [key]: { ...prev[key], [field]: value } }));
    showToast('Schedule updated.', 'success');
  };

  const grantExtension = () => {
    const offset = parseInt(extOffset, 10);
    if (isNaN(offset) || offset <= 0) {
      showToast('Enter a valid number of days.', 'error');
      return;
    }
    if (!extReason.trim()) {
      showToast('Provide a reason for the extension.', 'error');
      return;
    }
    const newExt: Extension = {
      id: `ext-${Date.now()}`,
      groupId: 'all',
      groupName: 'All groups',
      offsetDays: offset,
      reason: extReason.trim(),
      grantedAt:
        new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      grantedBy: 'Dr. Priya Krishnan',
    };
    setExtList((prev) => [newExt, ...prev]);
    showToast(`Extension granted to all groups: +${offset} days.`, 'success');
    setExtOffset('7');
    setExtReason('');
  };

  const revokeExtension = (id: string) => {
    setExtList((prev) => prev.filter((e) => e.id !== id));
    showToast('Extension revoked.', 'info');
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-40 rounded-md" />
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Skeleton className="h-64 w-full rounded-xl" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
        <Skeleton className="h-48 w-full rounded-xl" />
      </div>
    );
  }

  const windowEntries: Array<{
    key: 'registration' | 'round1' | 'round2';
    label: string;
  }> = [
    { key: 'registration', label: 'Registration Window' },
    { key: 'round1', label: 'Preference Round 1' },
    { key: 'round2', label: 'Preference Round 2' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink-900 dark:text-ink-100">Controls</h1>
        <p className="mt-1 text-sm text-ink-500 dark:text-ink-400">
          Manage windows, deadlines, and extensions.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Windows */}
        <Card>
          <CardHeader title="Windows" subtitle="Edit dates and times for any phase, whether upcoming or active" />
          <CardBody className="space-y-4">
            {windowEntries.map(({ key, label }) => (
              <div
                key={key}
                className="flex items-center justify-between gap-3 rounded-lg border border-ink-100 dark:border-ink-800 px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-ink-800 dark:text-ink-100">{label}</p>
                  <p className="text-xs text-ink-400 dark:text-ink-500">
                    {windows[key].opensOn} — {windows[key].closesOn}
                  </p>
                </div>
                <div className="grid min-w-0 shrink-0 gap-2 sm:grid-cols-2">
                  <label className="text-xs text-ink-500"><span className="mb-1 block font-medium">Starts</span><input type="text" value={windows[key].opensOn} onChange={(e) => updateWindow(key, 'opensOn', e.target.value)} className="input-field text-xs" aria-label={`${label} start date and time`} /></label>
                  <label className="text-xs text-ink-500"><span className="mb-1 block font-medium">Closes</span><input type="text" value={windows[key].closesOn} onChange={(e) => updateWindow(key, 'closesOn', e.target.value)} className="input-field text-xs" aria-label={`${label} closing date and time`} /></label>
                </div>
              </div>
            ))}
          </CardBody>
        </Card>


      </div>

      {/* Extensions */}
      <Card>
        <CardHeader title="Extended Deadlines" subtitle="Grant a deadline extension across all groups" />
        <CardBody className="space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink-700 dark:text-ink-200">
                Offset (days)
              </label>
              <input
                type="number"
                value={extOffset}
                onChange={(e) => setExtOffset(e.target.value)}
                min="1"
                max="30"
                className="input-field"
              />
            </div>
            <div className="lg:col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-ink-700 dark:text-ink-200">Reason</label>
              <input
                type="text"
                value={extReason}
                onChange={(e) => setExtReason(e.target.value)}
                placeholder="e.g. Waiting on dataset access"
                className="input-field"
              />
            </div>
          </div>
          <Button onClick={grantExtension}>
            <CalendarPlus className="h-4 w-4" />
            Grant Extension
          </Button>

          {/* Existing extensions */}
          <div className="border-t border-ink-100 dark:border-ink-800 pt-4">
            {extList.length === 0 ? (
              <EmptyState
                icon={<CalendarPlus className="h-7 w-7" />}
                title="No extensions granted"
                message="Granted extensions will appear here."
              />
            ) : (
              <div className="space-y-2">
                {extList.map((ext) => (
                  <div
                    key={ext.id}
                    className="flex items-center justify-between gap-3 rounded-lg border border-ink-100 dark:border-ink-800 px-4 py-3"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-ink-800 dark:text-ink-100">
                        {ext.groupName}{' '}
                        <span className="font-normal text-brand-600 dark:text-brand-400">+{ext.offsetDays} days</span>
                      </p>
                      <p className="text-xs text-ink-400 truncate dark:text-ink-500">
                        {ext.reason} · granted {ext.grantedAt} by {ext.grantedBy}
                      </p>
                    </div>
                    <button
                      onClick={() => revokeExtension(ext.id)}
                      className="shrink-0 rounded-lg p-1.5 text-ink-400 hover:bg-rose-50 hover:text-rose-500 transition-colors dark:text-ink-500 dark:hover:bg-rose-950/60 dark:hover:text-rose-400"
                      aria-label="Revoke extension"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardBody>
      </Card>

    </div>
  );
}
