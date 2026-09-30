import { useEffect, useState } from 'react';
import { Search, Archive, BookOpen } from 'lucide-react';
import { Card, CardBody, Badge, Skeleton, EmptyState } from '@/components/ui';
import { archiveEntries, type ArchiveEntry } from '@/data/adminData';

export function AdminArchivePage() {
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [yearFilter, setYearFilter] = useState<string>('all');

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(t);
  }, []);

  const years = Array.from(new Set(archiveEntries.map((e) => e.year))).sort().reverse();

  const filtered = archiveEntries.filter((e) => {
    const matchesSearch =
      e.title.toLowerCase().includes(search.toLowerCase()) ||
      e.group.toLowerCase().includes(search.toLowerCase()) ||
      e.mentor.toLowerCase().includes(search.toLowerCase()) ||
      e.elective.toLowerCase().includes(search.toLowerCase()) ||
      e.abstract.toLowerCase().includes(search.toLowerCase());
    const matchesYear = yearFilter === 'all' || e.year === yearFilter;
    return matchesSearch && matchesYear;
  });

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
      <div>
        <h1 className="font-display text-2xl font-bold text-ink-900">Project Archive</h1>
        <p className="mt-1 text-sm text-ink-500">
          Browse past years' project titles and abstracts for reference.
        </p>
      </div>

      <Card>
        <CardBody className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title, group, mentor, or elective..."
              className="input-field pl-9"
            />
          </div>
          <select
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value)}
            className="input-field sm:w-36"
          >
            <option value="all">All years</option>
            {years.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </CardBody>
      </Card>

      {filtered.length === 0 ? (
        <Card>
          <EmptyState
            icon={<Archive className="h-7 w-7" />}
            title="No projects found"
            message="Try adjusting your search or year filter."
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {filtered.map((entry) => (
            <ArchiveCard key={entry.id} entry={entry} />
          ))}
        </div>
      )}
    </div>
  );
}

function ArchiveCard({ entry }: { entry: ArchiveEntry }) {
  return (
    <Card className="transition-shadow hover:shadow-cardhover">
      <CardBody>
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-xs font-medium text-ink-400">
              {entry.year} · {entry.group}
            </p>
            <p className="mt-0.5 font-display font-semibold text-ink-900 leading-snug">
              {entry.title}
            </p>
          </div>
          <Badge color="brand">{entry.grade}</Badge>
        </div>
        <p className="mt-2 text-sm text-ink-600 leading-relaxed line-clamp-3">
          {entry.abstract}
        </p>
        <div className="mt-3 flex items-center gap-3 border-t border-ink-100 pt-3 text-xs text-ink-500">
          <span className="flex items-center gap-1.5">
            <BookOpen className="h-3.5 w-3.5 text-ink-400" />
            {entry.elective}
          </span>
          <span className="text-ink-300">·</span>
          <span>{entry.mentor}</span>
        </div>
      </CardBody>
    </Card>
  );
}
