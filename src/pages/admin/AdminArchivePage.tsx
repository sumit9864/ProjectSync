import { useEffect, useState } from 'react';
import { Search, Archive, BookOpen, Library, Sparkles, GraduationCap } from 'lucide-react';
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

  const mentorCount = new Set(archiveEntries.map((entry) => entry.mentor)).size;
  const electiveCount = new Set(archiveEntries.map((entry) => entry.elective)).size;
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
        <h1 className="font-display text-2xl font-bold text-ink-900 dark:text-ink-100">Project Archive</h1>
        <p className="mt-1 text-sm text-ink-500 dark:text-ink-400">
          Browse past years' project titles and abstracts for reference.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {[{ label: 'Completed projects', value: archiveEntries.length, icon: Library }, { label: 'Mentors represented', value: mentorCount, icon: GraduationCap }, { label: 'Electives covered', value: electiveCount, icon: Sparkles }].map(({ label, value, icon: Icon }) => <Card key={label} className="border-brand-100 bg-brand-50/30 dark:border-brand-900/50 dark:bg-brand-950/20"><CardBody className="flex items-center justify-between p-4"><div><p className="text-xs font-medium text-ink-500 dark:text-ink-400">{label}</p><p className="mt-1 font-display text-2xl font-bold text-ink-900 dark:text-ink-100">{value}</p></div><Icon className="h-5 w-5 text-brand-600 dark:text-brand-400" /></CardBody></Card>)}
      </div>

      <Card className="border-ink-100/80 bg-white/90 dark:border-ink-800 dark:bg-ink-900/90">
        <CardBody className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400 dark:text-ink-500" />
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

      <div className="flex items-end justify-between gap-3"><div><p className="text-sm font-semibold text-ink-800 dark:text-ink-100">Project library</p><p className="mt-1 text-xs text-ink-500">{filtered.length} of {archiveEntries.length} projects shown</p></div><span className="hidden text-xs text-ink-400 sm:block">Curated academic work</span></div>

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
    <Card className="group overflow-hidden border-ink-100/80 transition-all hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-cardhover dark:border-ink-800 dark:hover:border-brand-800 dark:hover:shadow-cardhover-dark">
      <CardBody>
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-xs font-medium text-ink-400 dark:text-ink-500">
              {entry.year} · {entry.group}
            </p>
            <p className="mt-0.5 font-display text-lg font-semibold leading-snug text-ink-900 transition-colors group-hover:text-brand-700 dark:text-ink-100 dark:group-hover:text-brand-300">
              {entry.title}
            </p>
          </div>
          <Badge color="brand">{entry.grade}</Badge>
        </div>
        <p className="mt-2 text-sm text-ink-600 dark:text-ink-300 leading-relaxed line-clamp-3">
          {entry.abstract}
        </p>
        <div className="mt-3 flex items-center gap-3 border-t border-ink-100 dark:border-ink-800 pt-3 text-xs text-ink-500 dark:text-ink-400">
          <span className="flex items-center gap-1.5">
            <BookOpen className="h-3.5 w-3.5 text-ink-400 dark:text-ink-500" />
            {entry.elective}
          </span>
          <span className="text-ink-300 dark:text-ink-600">·</span>
          <span>{entry.mentor}</span>
        </div>
      </CardBody>
    </Card>
  );
}
