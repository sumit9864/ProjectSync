import { useEffect, useState } from 'react';
import { Download, ScrollText, Search } from 'lucide-react';
import { Card, CardBody, Button, Badge, Skeleton, EmptyState } from '@/components/ui';
import { auditEvents } from '@/data/adminData';

export function AdminAuditLogPage() {
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(t);
  }, []);

  const filtered = auditEvents.filter(
    (e) =>
      e.description.toLowerCase().includes(search.toLowerCase()) ||
      e.actor.toLowerCase().includes(search.toLowerCase()) ||
      e.group.toLowerCase().includes(search.toLowerCase())
  );

  const exportCsv = () => {
    const headers = ['Timestamp', 'Description', 'Actor', 'Group'];
    const rows = auditEvents.map((e) => [e.timestamp, e.description, e.actor, e.group]);
    const csv = [headers, ...rows]
      .map((r) => r.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'audit-log-export.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-40 rounded-md" />
        <Skeleton className="h-12 w-full rounded-xl" />
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink-900">Audit Log</h1>
          <p className="mt-1 text-sm text-ink-500">
            Complete system event history, newest first.
          </p>
        </div>
        <Button variant="secondary" size="sm" onClick={exportCsv}>
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
      </div>

      <Card>
        <CardBody>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by description, actor, or group..."
              className="input-field pl-9"
            />
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardBody className="p-0">
          {filtered.length === 0 ? (
            <EmptyState
              icon={<ScrollText className="h-7 w-7" />}
              title="No events found"
              message="Try adjusting your search terms."
            />
          ) : (
            <div className="divide-y divide-ink-50">
              {filtered.map((event) => (
                <div key={event.id} className="flex items-start gap-3 px-5 py-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-ink-100 text-ink-500">
                    <ScrollText className="h-4.5 w-4.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-ink-800">{event.description}</p>
                    <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs">
                      <span className="text-ink-400">{event.timestamp}</span>
                      <span className="text-ink-300">·</span>
                      <Badge color="info">{event.actor}</Badge>
                      <span className="text-ink-300">·</span>
                      <span className="text-ink-500">{event.group}</span>
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
