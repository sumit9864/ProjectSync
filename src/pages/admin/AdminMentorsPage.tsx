import { useEffect, useState } from 'react';
import {
  UserPlus,
  Upload,
  Trash2,
  Users,
  Mail,
  Check,
} from 'lucide-react';
import { Card, CardHeader, CardBody, Button, Badge, Avatar, Skeleton, EmptyState } from '@/components/ui';
import { useToast } from '@/components/Toast';
import { adminMentors, type AdminMentor } from '@/data/adminData';

const avatarColors = [
  'bg-brand-600',
  'bg-sky-600',
  'bg-violet-600',
  'bg-amber-600',
  'bg-rose-600',
  'bg-emerald-600',
  'bg-cyan-600',
  'bg-indigo-600',
];

export function AdminMentorsPage() {
  const [loading, setLoading] = useState(true);
  const [mentors, setMentors] = useState<AdminMentor[]>(adminMentors);

  // Single add form
  const [name, setName] = useState('');
  const [domain, setDomain] = useState('');
  const [email, setEmail] = useState('');
  const [capacity, setCapacity] = useState('5');

  // Bulk add
  const [bulkText, setBulkText] = useState('');
  const [bulkPreview, setBulkPreview] = useState<AdminMentor[] | null>(null);

  const { showToast } = useToast();

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(t);
  }, []);

  const addMentor = () => {
    if (!name.trim() || !email.trim()) {
      showToast('Name and email are required.', 'error');
      return;
    }
    const newMentor: AdminMentor = {
      id: `mentor-${Date.now()}`,
      name: name.trim(),
      domain: domain.trim() || 'Unspecified',
      email: email.trim(),
      capacity: parseInt(capacity, 10) || 5,
      currentLoad: 0,
      avatarColor: avatarColors[mentors.length % avatarColors.length],
    };
    setMentors((prev) => [...prev, newMentor]);
    showToast(`${newMentor.name} added.`, 'success');
    setName('');
    setDomain('');
    setEmail('');
    setCapacity('5');
  };

  const parseBulk = () => {
    const lines = bulkText.trim().split('\n').filter(Boolean);
    if (lines.length === 0) {
      showToast('Paste at least one line.', 'error');
      return;
    }
    const parsed: AdminMentor[] = [];
    for (const line of lines) {
      const parts = line.split(',').map((s) => s.trim());
      if (parts.length < 2) continue;
      const [n, em, dom = 'Unspecified', cap = '5'] = parts;
      if (!n || !em) continue;
      parsed.push({
        id: `mentor-bulk-${Date.now()}-${parsed.length}`,
        name: n,
        email: em,
        domain: dom,
        capacity: parseInt(cap, 10) || 5,
        currentLoad: 0,
        avatarColor: avatarColors[(mentors.length + parsed.length) % avatarColors.length],
      });
    }
    if (parsed.length === 0) {
      showToast('No valid entries. Use: Name, Email, Domain, Capacity', 'error');
      return;
    }
    setBulkPreview(parsed);
  };

  const confirmBulk = () => {
    if (!bulkPreview || bulkPreview.length === 0) return;
    setMentors((prev) => [...prev, ...bulkPreview]);
    showToast(`${bulkPreview.length} mentors added.`, 'success');
    setBulkPreview(null);
    setBulkText('');
  };

  const removeMentor = (id: string) => {
    setMentors((prev) => prev.filter((m) => m.id !== id));
    showToast('Mentor removed.', 'info');
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-40 rounded-md" />
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Skeleton className="h-64 w-full rounded-xl" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink-900">Mentor Management</h1>
        <p className="mt-1 text-sm text-ink-500">
          Add mentors individually or in bulk, and manage the roster.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Single add */}
        <Card>
          <CardHeader title="Add Single Mentor" subtitle="Create one mentor at a time" />
          <CardBody className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink-700">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Dr. Jane Doe"
                className="input-field"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink-700">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jane.doe@university.edu"
                className="input-field"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink-700">Domain</label>
              <input
                type="text"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                placeholder="e.g. Applied Machine Learning"
                className="input-field"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink-700">Capacity</label>
              <input
                type="number"
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
                min="1"
                max="20"
                className="input-field w-24"
              />
            </div>
            <Button onClick={addMentor}>
              <UserPlus className="h-4 w-4" />
              Add Mentor
            </Button>
          </CardBody>
        </Card>

        {/* Bulk add */}
        <Card>
          <CardHeader
            title="Bulk Add Mentors"
            subtitle="Paste a comma-separated list"
          />
          <CardBody className="space-y-4">
            <p className="text-xs text-ink-400">
              One mentor per line. Format: <span className="font-mono text-ink-500">Name, Email, Domain, Capacity</span>
            </p>
            <textarea
              value={bulkText}
              onChange={(e) => setBulkText(e.target.value)}
              rows={6}
              placeholder={'Dr. Jane Doe, jane.doe@university.edu, Computer Vision, 5\nDr. John Smith, john.smith@university.edu, Cloud Systems, 4'}
              className="input-field resize-none font-mono text-xs"
            />
            <Button variant="secondary" onClick={parseBulk}>
              <Upload className="h-4 w-4" />
              Preview Entries
            </Button>

            {bulkPreview && (
              <div className="rounded-xl border border-ink-100 bg-ink-50/50 p-4 space-y-3">
                <p className="text-sm font-semibold text-ink-700">
                  {bulkPreview.length} mentor{bulkPreview.length !== 1 ? 's' : ''} ready to add
                </p>
                <div className="divide-y divide-ink-100">
                  {bulkPreview.map((m) => (
                    <div key={m.id} className="flex items-center gap-3 py-2">
                      <Check className="h-4 w-4 shrink-0 text-emerald-500" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-ink-800 truncate">{m.name}</p>
                        <p className="text-xs text-ink-400 truncate">{m.email} · {m.domain} · cap {m.capacity}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" onClick={confirmBulk}>
                    <Check className="h-3.5 w-3.5" />
                    Confirm & Add
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setBulkPreview(null)}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </CardBody>
        </Card>
      </div>

      {/* Mentor roster */}
      <Card>
        <CardHeader title="Mentor Roster" subtitle={`${mentors.length} mentors in the system`} />
        <CardBody className="p-0">
          {mentors.length === 0 ? (
            <EmptyState
              icon={<Users className="h-7 w-7" />}
              title="No mentors yet"
              message="Add mentors using the forms above."
            />
          ) : (
            <div className="divide-y divide-ink-50">
              {mentors.map((m) => (
                <div key={m.id} className="flex items-center justify-between gap-3 px-5 py-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar name={m.name} color={m.avatarColor} size="sm" />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-ink-800 truncate">{m.name}</p>
                      <p className="text-xs text-ink-400 truncate flex items-center gap-1.5">
                        <Mail className="h-3 w-3" />
                        {m.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="hidden sm:block text-xs text-ink-500">{m.domain}</span>
                    <Badge color={m.currentLoad >= m.capacity ? 'error' : 'info'}>
                      {m.currentLoad}/{m.capacity}
                    </Badge>
                    <button
                      onClick={() => removeMentor(m.id)}
                      className="rounded-lg p-1.5 text-ink-400 hover:bg-rose-50 hover:text-rose-500 transition-colors"
                      aria-label="Remove mentor"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
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
