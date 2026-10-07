import { useEffect, useState } from 'react';
import {
  ToggleLeft,
  ToggleRight,
  Clock,
  CalendarPlus,
  Trash2,
  Users,
} from 'lucide-react';
import { Card, CardHeader, CardBody, Button, Badge, Skeleton, EmptyState } from '@/components/ui';
import { useToast } from '@/components/Toast';
import {
  adminMentors,
  MAX_MENTOR_GROUPS,
  adminGroups,
  extensions as initialExtensions,
  controlWindows,
  mockCurrentTime,
  type Extension,
} from '@/data/adminData';

export function AdminControlsPage() {
  const [loading, setLoading] = useState(true);
  const [windows, setWindows] = useState(controlWindows);
  const [mockTime, setMockTime] = useState(mockCurrentTime);
  const [timeInput, setTimeInput] = useState('');
  const [extList, setExtList] = useState<Extension[]>(initialExtensions);
  const [mentors, setMentors] = useState(adminMentors.map((m) => ({ ...m })));

  // Extension form state
  const [extGroupId, setExtGroupId] = useState('');
  const [extOffset, setExtOffset] = useState('7');
  const [extReason, setExtReason] = useState('');

  const { showToast } = useToast();

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(t);
  }, []);

  const toggleWindow = (key: 'registration' | 'round1' | 'round2') => {
    setWindows((prev) => ({
      ...prev,
      [key]: { ...prev[key], open: !prev[key].open },
    }));
    showToast(
      `${key === 'registration' ? 'Registration' : key === 'round1' ? 'Round 1' : 'Round 2'} window ${windows[key].open ? 'closed' : 'opened'}.`,
      'success'
    );
  };

  const applyMockTime = () => {
    if (!timeInput.trim()) {
      showToast('Enter a datetime first.', 'error');
      return;
    }
    const d = new Date(timeInput);
    if (isNaN(d.getTime())) {
      showToast('Invalid datetime.', 'error');
      return;
    }
    const formatted =
      d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) +
      ' · ' +
      d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    setMockTime(formatted);
    showToast(`Mock time set to ${formatted}.`, 'success');
  };

  const grantExtension = () => {
    if (!extGroupId) {
      showToast('Select a group.', 'error');
      return;
    }
    const offset = parseInt(extOffset, 10);
    if (isNaN(offset) || offset <= 0) {
      showToast('Enter a valid number of days.', 'error');
      return;
    }
    if (!extReason.trim()) {
      showToast('Provide a reason for the extension.', 'error');
      return;
    }
    const group = adminGroups.find((g) => g.id === extGroupId);
    if (!group) return;

    const newExt: Extension = {
      id: `ext-${Date.now()}`,
      groupId: group.id,
      groupName: group.name,
      offsetDays: offset,
      reason: extReason.trim(),
      grantedAt:
        new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      grantedBy: 'Dr. Priya Krishnan',
    };
    setExtList((prev) => [newExt, ...prev]);
    showToast(`Extension granted to ${group.name}: +${offset} days.`, 'success');
    setExtGroupId('');
    setExtOffset('7');
    setExtReason('');
  };

  const revokeExtension = (id: string) => {
    setExtList((prev) => prev.filter((e) => e.id !== id));
    showToast('Extension revoked.', 'info');
  };

  const updateCapacity = (mentorId: string, newCap: number) => {
    if (newCap < 0 || newCap > MAX_MENTOR_GROUPS) return;
    setMentors((prev) =>
      prev.map((m) => (m.id === mentorId ? { ...m, capacity: newCap } : m))
    );
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
          Manage windows, deadlines, extensions, and mentor capacity.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Windows */}
        <Card>
          <CardHeader title="Windows" subtitle="Toggle registration and preference rounds" />
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
                <div className="flex items-center gap-2 shrink-0">
                  <Badge color={windows[key].open ? 'success' : 'neutral'}>
                    {windows[key].open ? 'Open' : 'Closed'}
                  </Badge>
                  <button
                    onClick={() => toggleWindow(key)}
                    className="text-ink-400 hover:text-brand-600 transition-colors dark:text-ink-500 dark:hover:text-brand-400"
                    aria-label={`Toggle ${label}`}
                  >
                    {windows[key].open ? (
                      <ToggleRight className="h-7 w-7 text-brand-500 dark:text-brand-400" />
                    ) : (
                      <ToggleLeft className="h-7 w-7" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </CardBody>
        </Card>

        {/* Mock clock */}
        <Card>
          <CardHeader
            title="Mock Clock"
            subtitle="Demo window auto-close and deadline behavior"
          />
          <CardBody className="space-y-4">
            <div className="flex items-center gap-3 rounded-lg bg-ink-50 dark:bg-ink-900/50 px-4 py-3">
              <Clock className="h-5 w-5 text-ink-400 dark:text-ink-500" />
              <div>
                <p className="text-xs font-medium text-ink-400 dark:text-ink-500">Current mock time</p>
                <p className="text-sm font-semibold text-ink-800 dark:text-ink-100">{mockTime}</p>
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink-700 dark:text-ink-200">
                Set mock datetime
              </label>
              <div className="flex flex-col gap-2 sm:flex-row">
                <input
                  type="datetime-local"
                  value={timeInput}
                  onChange={(e) => setTimeInput(e.target.value)}
                  className="input-field flex-1"
                />
                <Button variant="secondary" onClick={applyMockTime}>
                  Apply
                </Button>
              </div>
              <p className="mt-2 text-xs text-ink-400 dark:text-ink-500">
                In a real deployment, window auto-close and deadlines would use the server clock.
                This control is for demonstration only.
              </p>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Extensions */}
      <Card>
        <CardHeader title="Extended Deadlines" subtitle="Grant deadline extensions to specific groups" />
        <CardBody className="space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink-700 dark:text-ink-200">Group</label>
              <select
                value={extGroupId}
                onChange={(e) => setExtGroupId(e.target.value)}
                className="input-field"
              >
                <option value="">Select...</option>
                {adminGroups.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </select>
            </div>
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

      {/* Mentor capacity */}
      <Card>
        <CardHeader
          title="Mentor Capacity"
          subtitle="Each mentor can supervise a maximum of 3 groups"
        />
        <CardBody className="p-0">
          {mentors.length === 0 ? (
            <EmptyState
              icon={<Users className="h-7 w-7" />}
              title="No mentors"
              message="Add mentors to manage their capacity."
            />
          ) : (
            <div className="divide-y divide-ink-50 dark:divide-ink-800">
              {mentors.map((m) => (
                <div
                  key={m.id}
                  className="flex items-center justify-between gap-3 px-5 py-4"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-ink-800 dark:text-ink-100">{m.name}</p>
                    <p className="text-xs text-ink-400 truncate dark:text-ink-500">{m.domain}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <Badge color={m.currentLoad >= m.capacity ? 'error' : 'info'}>
                      {m.currentLoad}/{m.capacity}
                    </Badge>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => updateCapacity(m.id, m.capacity - 1)}
                        className="flex h-7 w-7 items-center justify-center rounded-lg bg-ink-100 text-ink-500 hover:bg-ink-200 transition-colors dark:bg-ink-800 dark:text-ink-400 dark:hover:bg-ink-700"
                        aria-label="Decrease capacity"
                      >
                        –
                      </button>
                      <input
                        type="number"
                        value={m.capacity}
                        min={m.currentLoad}
                        max={MAX_MENTOR_GROUPS}
                        onChange={(e) =>
                          updateCapacity(m.id, parseInt(e.target.value, 10) || 0)
                        }
                        className="h-7 w-12 rounded-lg border border-ink-200 dark:border-ink-700 text-center text-sm font-semibold text-ink-800 dark:text-ink-100 focus:border-brand-500 dark:focus:border-brand-400 focus:outline-none"
                      />
                      <button
                        onClick={() => updateCapacity(m.id, m.capacity + 1)}
                        disabled={m.capacity >= MAX_MENTOR_GROUPS}
                        className="flex h-7 w-7 items-center justify-center rounded-lg bg-ink-100 text-ink-500 hover:bg-ink-200 transition-colors dark:bg-ink-800 dark:text-ink-400 dark:hover:bg-ink-700"
                        aria-label="Increase capacity"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
