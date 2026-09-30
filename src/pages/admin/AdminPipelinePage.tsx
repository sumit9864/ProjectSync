import { useEffect, useState, useRef } from 'react';
import {
  Search,
  Download,
  MoreVertical,
  Users,
  GitBranch,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { Card, CardBody, Button, Badge, Skeleton, EmptyState } from '@/components/ui';
import {
  adminGroups,
  pipelineStageLabels,
  topicStatusLabel,
  type AdminGroup,
  type AdminPipelineStage,
} from '@/data/adminData';

const stageBadgeColor: Record<AdminPipelineStage, 'warning' | 'info' | 'brand' | 'success'> = {
  awaiting_allocation: 'warning',
  mentor_assigned: 'info',
  topic_review: 'brand',
  building: 'success',
};

const topicBadgeColor: Record<AdminGroup['topicStatus'], 'neutral' | 'warning' | 'success' | 'error'> = {
  none: 'neutral',
  pending: 'warning',
  approved: 'success',
  changes_requested: 'error',
};

export function AdminPipelinePage() {
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState<AdminPipelineStage | 'all'>('all');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenuId(null);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const filtered = adminGroups.filter((g) => {
    const matchesSearch =
      g.name.toLowerCase().includes(search.toLowerCase()) ||
      g.projectId.toLowerCase().includes(search.toLowerCase()) ||
      g.elective.toLowerCase().includes(search.toLowerCase());
    const matchesStage = stageFilter === 'all' || g.stage === stageFilter;
    return matchesSearch && matchesStage;
  });

  const exportCsv = () => {
    const headers = ['Group Name', 'Project ID', 'Members', 'Elective', 'Mentor', 'Topic Status', 'GitHub', 'Stage'];
    const rows = adminGroups.map((g) => [
      g.name,
      g.projectId,
      String(g.memberCount),
      g.elective,
      g.mentorName ?? 'Unassigned',
      topicStatusLabel[g.topicStatus],
      g.githubConnected ? 'Connected' : 'Not Connected',
      pipelineStageLabels[g.stage],
    ]);
    const csv = [headers, ...rows]
      .map((r) => r.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'pipeline-export.csv';
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
          <h1 className="font-display text-2xl font-bold text-ink-900">Pipeline</h1>
          <p className="mt-1 text-sm text-ink-500">
            All {adminGroups.length} groups across every stage of the project lifecycle.
          </p>
        </div>
        <Button variant="secondary" size="sm" onClick={exportCsv}>
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* Search + filter bar */}
      <Card>
        <CardBody className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, project ID, or elective..."
              className="input-field pl-9"
            />
          </div>
          <select
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value as AdminPipelineStage | 'all')}
            className="input-field sm:w-52"
          >
            <option value="all">All stages</option>
            {(Object.keys(pipelineStageLabels) as AdminPipelineStage[]).map((s) => (
              <option key={s} value={s}>
                {pipelineStageLabels[s]}
              </option>
            ))}
          </select>
        </CardBody>
      </Card>

      {/* Table */}
      <Card>
        <CardBody className="p-0">
          {filtered.length === 0 ? (
            <EmptyState
              icon={<Search className="h-7 w-7" />}
              title="No groups found"
              message="Try adjusting your search or stage filter."
            />
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden overflow-x-auto lg:block">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-ink-100 text-left text-xs font-semibold uppercase tracking-wide text-ink-400">
                      <th className="px-5 py-3">Group</th>
                      <th className="px-5 py-3">Members</th>
                      <th className="px-5 py-3">Elective</th>
                      <th className="px-5 py-3">Mentor</th>
                      <th className="px-5 py-3">Topic</th>
                      <th className="px-5 py-3">GitHub</th>
                      <th className="px-5 py-3">Stage</th>
                      <th className="px-5 py-3"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ink-50">
                    {filtered.map((g) => (
                      <tr key={g.id} className="transition-colors hover:bg-ink-50/60">
                        <td className="px-5 py-3.5">
                          <p className="font-semibold text-ink-800">{g.name}</p>
                          <p className="text-xs text-ink-400">{g.projectId}</p>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="flex items-center gap-1.5 text-ink-600">
                            <Users className="h-3.5 w-3.5 text-ink-400" />
                            {g.memberCount}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-ink-600">{g.elective}</td>
                        <td className="px-5 py-3.5">
                          {g.mentorName ? (
                            <span className="text-ink-700">{g.mentorName}</span>
                          ) : (
                            <Badge color="error">Unassigned</Badge>
                          )}
                        </td>
                        <td className="px-5 py-3.5">
                          <Badge color={topicBadgeColor[g.topicStatus]}>
                            {topicStatusLabel[g.topicStatus]}
                          </Badge>
                        </td>
                        <td className="px-5 py-3.5">
                          {g.githubConnected ? (
                            <CheckCircle2 className="h-4.5 w-4.5 text-emerald-500" />
                          ) : (
                            <XCircle className="h-4.5 w-4.5 text-ink-300" />
                          )}
                        </td>
                        <td className="px-5 py-3.5">
                          <Badge color={stageBadgeColor[g.stage]}>
                            {pipelineStageLabels[g.stage]}
                          </Badge>
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <div className="relative inline-block" ref={openMenuId === g.id ? menuRef : undefined}>
                            <button
                              onClick={() => setOpenMenuId(openMenuId === g.id ? null : g.id)}
                              className="rounded-lg p-1.5 text-ink-400 hover:bg-ink-100 hover:text-ink-600 transition-colors"
                              aria-label="Row actions"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </button>
                            {openMenuId === g.id && (
                              <div className="absolute right-0 top-9 z-20 w-44 rounded-xl border border-ink-200 bg-white shadow-xl animate-scale-in">
                                <button className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-ink-600 hover:bg-ink-50 transition-colors">
                                  <GitBranch className="h-4 w-4 text-ink-400" />
                                  View details
                                </button>
                                <button className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-ink-600 hover:bg-ink-50 transition-colors">
                                  <Users className="h-4 w-4 text-ink-400" />
                                  Reassign mentor
                                </button>
                                <button className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-ink-600 hover:bg-ink-50 transition-colors">
                                  <Download className="h-4 w-4 text-ink-400" />
                                  Export group
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="divide-y divide-ink-50 lg:hidden">
                {filtered.map((g) => (
                  <div key={g.id} className="px-5 py-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-semibold text-ink-800">{g.name}</p>
                        <p className="text-xs text-ink-400">{g.projectId}</p>
                      </div>
                      <Badge color={stageBadgeColor[g.stage]}>
                        {pipelineStageLabels[g.stage]}
                      </Badge>
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                      <span className="flex items-center gap-1 text-ink-500">
                        <Users className="h-3.5 w-3.5" />
                        {g.memberCount}
                      </span>
                      <Badge color={topicBadgeColor[g.topicStatus]}>
                        {topicStatusLabel[g.topicStatus]}
                      </Badge>
                      {g.mentorName ? (
                        <span className="text-ink-600">{g.mentorName}</span>
                      ) : (
                        <Badge color="error">Unassigned</Badge>
                      )}
                      {g.githubConnected ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-ink-300" />
                      )}
                    </div>
                    <p className="mt-1.5 text-xs text-ink-400">{g.elective}</p>
                  </div>
                ))}
              </div>
            </>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
