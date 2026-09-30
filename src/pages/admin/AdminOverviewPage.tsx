import { useEffect, useState } from 'react';
import {
  Users,
  UserPlus,
  ClipboardCheck,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  Activity,
} from 'lucide-react';
import { Card, CardHeader, CardBody, Skeleton, EmptyState } from '@/components/ui';
import type { AdminPageId } from '@/components/AdminShell';
import {
  adminGroups,
  adminMentors,
  auditEvents,
  pipelineStageLabels,
} from '@/data/adminData';

export function AdminOverviewPage({
  onNavigate,
}: {
  onNavigate: (page: AdminPageId) => void;
}) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(t);
  }, []);

  if (loading) return <OverviewSkeleton />;

  const activeGroups = adminGroups.length;
  const awaitingAllocation = adminGroups.filter(
    (g) => g.stage === 'awaiting_allocation'
  ).length;
  const topicReviewsDue = adminGroups.filter(
    (g) => g.topicStatus === 'pending'
  ).length;
  const pastAllocation = adminGroups.filter(
    (g) => g.stage !== 'awaiting_allocation'
  ).length;
  const pctOnTrack = activeGroups > 0
    ? Math.round((pastAllocation / activeGroups) * 100)
    : 0;

  const stageCounts = {
    awaiting_allocation: adminGroups.filter((g) => g.stage === 'awaiting_allocation').length,
    mentor_assigned: adminGroups.filter((g) => g.stage === 'mentor_assigned').length,
    topic_review: adminGroups.filter((g) => g.stage === 'topic_review').length,
    building: adminGroups.filter((g) => g.stage === 'building').length,
  };
  const maxStageCount = Math.max(...Object.values(stageCounts), 1);

  const attentionItems = adminGroups
    .filter(
      (g) =>
        g.mentorId === null ||
        (g.topicStatus === 'pending' && g.stage === 'topic_review') ||
        !g.githubConnected
    )
    .map((g) => ({
      id: g.id,
      name: g.name,
      projectId: g.projectId,
      reason:
        g.mentorId === null
          ? 'No mentor assigned'
          : g.topicStatus === 'pending'
            ? 'Topic stuck in review'
            : 'GitHub repo not connected',
    }));

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink-900">Program Overview</h1>
        <p className="mt-1 text-sm text-ink-500">
          Final-year project pipeline at a glance · {activeGroups} groups · {adminMentors.length} mentors
        </p>
      </div>

      {/* Stat row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<Users className="h-5 w-5" />}
          label="Active Groups"
          value={String(activeGroups)}
          sublabel="Registered this year"
          accent="brand"
        />
        <StatCard
          icon={<UserPlus className="h-5 w-5" />}
          label="Awaiting Allocation"
          value={String(awaitingAllocation)}
          sublabel="Need a mentor assigned"
          accent="amber"
        />
        <StatCard
          icon={<ClipboardCheck className="h-5 w-5" />}
          label="Topic Reviews Due"
          value={String(topicReviewsDue)}
          sublabel="Pending mentor decisions"
          accent="sky"
        />
        <StatCard
          icon={<TrendingUp className="h-5 w-5" />}
          label="% On Track"
          value={`${pctOnTrack}%`}
          sublabel="Past allocation stage"
          accent="emerald"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Pipeline stage chart */}
        <Card>
          <CardHeader title="Groups by Pipeline Stage" subtitle="Current distribution across the program" />
          <CardBody>
            <div className="space-y-4">
              {(Object.keys(stageCounts) as Array<keyof typeof stageCounts>).map((stage) => {
                const count = stageCounts[stage];
                const pct = Math.round((count / maxStageCount) * 100);
                return (
                  <div key={stage}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm font-medium text-ink-700">
                        {pipelineStageLabels[stage]}
                      </span>
                      <span className="text-sm font-semibold text-ink-900">{count}</span>
                    </div>
                    <div className="h-2.5 w-full overflow-hidden rounded-full bg-ink-100">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${stageColors[stage]}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardBody>
        </Card>

        {/* Attention needed */}
        <Card>
          <CardHeader title="Attention Needed" subtitle="Groups requiring admin intervention" />
          <CardBody className="p-0">
            {attentionItems.length === 0 ? (
              <EmptyState
                icon={<AlertTriangle className="h-7 w-7" />}
                title="Nothing needs attention"
                message="All groups have mentors, active reviews, and connected repos."
              />
            ) : (
              <div className="divide-y divide-ink-50">
                {attentionItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-3 px-5 py-4"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                        <AlertTriangle className="h-4.5 w-4.5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-ink-800 truncate">
                          {item.name}
                        </p>
                        <p className="text-xs text-ink-400 truncate">
                          {item.projectId} · {item.reason}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => onNavigate('pipeline')}
                      className="shrink-0 text-xs font-medium text-brand-600 hover:text-brand-700"
                    >
                      View
                    </button>
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>
      </div>

      {/* Latest activity */}
      <Card>
        <CardHeader
          title="Latest Activity"
          subtitle="Recent system-wide events"
          action={
            <button
              onClick={() => onNavigate('audit')}
              className="flex items-center gap-1 text-xs font-medium text-brand-600 hover:text-brand-700"
            >
              View full audit log
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          }
        />
        <CardBody className="p-0">
          {auditEvents.length === 0 ? (
            <EmptyState
              icon={<Activity className="h-7 w-7" />}
              title="No recent activity"
              message="System events will appear here as they occur."
            />
          ) : (
            <div className="divide-y divide-ink-50">
              {auditEvents.slice(0, 6).map((event) => (
                <div key={event.id} className="flex items-start gap-3 px-5 py-3.5">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-ink-100 text-ink-500">
                    <Activity className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-ink-800">{event.description}</p>
                    <p className="mt-0.5 text-xs text-ink-400">
                      {event.timestamp} · {event.actor} · {event.group}
                    </p>
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

const stageColors: Record<string, string> = {
  awaiting_allocation: 'bg-amber-400',
  mentor_assigned: 'bg-sky-400',
  topic_review: 'bg-brand-400',
  building: 'bg-emerald-400',
};

function StatCard({
  icon,
  label,
  value,
  sublabel,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sublabel: string;
  accent: 'brand' | 'amber' | 'sky' | 'emerald';
}) {
  const accents: Record<string, string> = {
    brand: 'bg-brand-50 text-brand-600',
    amber: 'bg-amber-50 text-amber-600',
    sky: 'bg-sky-50 text-sky-600',
    emerald: 'bg-emerald-50 text-emerald-600',
  };
  return (
    <Card className="transition-shadow hover:shadow-cardhover">
      <CardBody>
        <div className="flex items-center gap-3">
          <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${accents[accent]}`}>
            {icon}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-ink-400">{label}</p>
            <p className="mt-0.5 truncate font-display text-lg font-bold text-ink-900">{value}</p>
          </div>
        </div>
        <p className="mt-3 text-xs text-ink-400">{sublabel}</p>
      </CardBody>
    </Card>
  );
}

function OverviewSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-8 w-64" />
        <Skeleton className="mt-2 h-4 w-80" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <Card key={i}>
            <CardBody>
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-lg" />
                <div className="flex-1">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="mt-2 h-5 w-24" />
                </div>
              </div>
              <Skeleton className="mt-3 h-3 w-28" />
            </CardBody>
          </Card>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Skeleton className="h-64 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    </div>
  );
}
