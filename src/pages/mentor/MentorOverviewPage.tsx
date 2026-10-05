import { useEffect, useState } from 'react';
import {
  Users,
  ClipboardCheck,
  Clock,
  Gauge,
  ArrowRight,
  BookOpen,
  Lightbulb,
  CheckCircle2,
  AlertCircle,
  CalendarClock,
  Activity,
} from 'lucide-react';
import { Card, CardHeader, CardBody, Button, Badge, Skeleton, EmptyState } from '@/components/ui';
import type { MentorPageId } from '@/components/MentorShell';
import {
  mentorUser,
  mentorGroups,
  mentorStats,
  reviewWeekProgress,
} from '@/data/mentorData';
import type { MentorGroup } from '@/data/mentorData';

const statusBadgeMap: Record<
  MentorGroup['status'],
  { label: string; color: 'warning' | 'success' | 'error' | 'brand' }
> = {
  topic_pending: { label: 'Topic Pending', color: 'warning' },
  topic_approved: { label: 'Topic Approved', color: 'success' },
  topic_changes_requested: { label: 'Changes Requested', color: 'error' },
  github_connected: { label: 'GitHub Connected', color: 'brand' },
};

export function MentorOverviewPage({
  onNavigate,
  onOpenReview,
}: {
  onNavigate: (page: MentorPageId) => void;
  onOpenReview: (groupId: string) => void;
}) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(t);
  }, []);

  if (loading) return <OverviewSkeleton />;

  const pendingReviews = mentorGroups.filter(
    (g) => g.topicVersions[0]?.status === 'pending'
  );

  const weekProgress = Math.round(
    (reviewWeekProgress.reviewed / reviewWeekProgress.total) * 100
  );

  const getMilestoneCount = (group: MentorGroup) =>
    group.milestones.filter((m) => m.status === 'complete').length;

  return (
    <div className="dashboard-canvas motion-page space-y-7">
      <div className="motion-stagger">
        <p className="section-kicker">Mentor workspace</p>
        <h1 className="font-display text-3xl font-bold tracking-tight text-ink-900 dark:text-ink-100">
          Welcome back, {mentorUser.name.split(' ').slice(0, 2).join(' ')}
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-ink-500 dark:text-ink-400">
          You have {pendingReviews.length} topic {pendingReviews.length === 1 ? 'review' : 'reviews'} waiting and{' '}
          {mentorStats.assignedGroups} active groups.
        </p>
      </div>

      {/* Stat cards */}
      <div className="motion-stagger grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<Users className="h-5 w-5" />}
          label="Assigned Groups"
          value={String(mentorStats.assignedGroups)}
          sublabel="Active this semester"
          accent="brand"
        />
        <StatCard
          icon={<ClipboardCheck className="h-5 w-5" />}
          label="Pending Reviews"
          value={String(mentorStats.pendingReviews)}
          sublabel="Awaiting your decision"
          accent="amber"
        />
        <StatCard
          icon={<Clock className="h-5 w-5" />}
          label="Avg Response Time"
          value={mentorStats.avgResponseTime}
          sublabel="Last 30 days"
          accent="sky"
        />
        <StatCard
          icon={<Gauge className="h-5 w-5" />}
          label="Mentoring Capacity"
          value={`${mentorStats.capacity.current}/${mentorStats.capacity.max}`}
          sublabel={`${mentorStats.capacity.spaces} spaces remaining`}
          accent="emerald"
        />
      </div>

      <Card className="surface-glow motion-lift border-brand-200/70 dark:border-brand-900/60">
        <CardBody>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-950/60 dark:text-brand-400">
                <CalendarClock className="h-5 w-5" />
              </div>
              <div>
                <p className="section-kicker">Next best action</p>
                <h2 className="mt-1 font-display text-lg font-semibold text-ink-900 dark:text-ink-100">
                  {pendingReviews.length > 0 ? `Review ${pendingReviews[0].name}` : 'Keep groups moving'}
                </h2>
                <p className="mt-1 text-sm text-ink-500 dark:text-ink-400">
                  {pendingReviews.length > 0
                    ? 'A topic decision is blocking the next project milestone.'
                    : 'Check recent activity and follow up with any quiet group.'}
                </p>
              </div>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={() => pendingReviews.length > 0 ? onOpenReview(pendingReviews[0].id) : onNavigate('logbook')}
            >
              {pendingReviews.length > 0 ? 'Open review' : 'View activity'}
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </CardBody>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Reviews waiting */}
        <Card className="surface-glow motion-lift lg:col-span-2">
          <CardHeader
            title="Reviews Waiting for You"
            subtitle="Click a group to open it in the Review Queue"
          />
          <CardBody className="p-0">
            {pendingReviews.length === 0 ? (
              <EmptyState
                icon={<CheckCircle2 className="h-7 w-7" />}
                title="All caught up"
                message="No topic reviews are waiting. You will see new submissions here as they come in."
              />
            ) : (
              <div className="divide-y divide-ink-50 dark:divide-ink-800">
                {pendingReviews.map((group) => {
                  const latestVersion = group.topicVersions[0];
                  const info = statusBadgeMap[group.status];
                  return (
                    <button
                      key={group.id}
                      onClick={() => onOpenReview(group.id)}
                      className="activity-row focus-ring flex w-full items-center justify-between gap-3 px-5 py-4 text-left"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400">
                          <Lightbulb className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-ink-800 truncate dark:text-ink-100">
                            {group.name}
                          </p>
                          <p className="text-xs text-ink-400 truncate dark:text-ink-500">
                            {group.projectId} · v{latestVersion.version} · submitted{' '}
                            {latestVersion.submittedAt}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge color={info.color}>{info.label}</Badge>
                        <ArrowRight className="h-4 w-4 text-ink-300 dark:text-ink-600" />
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </CardBody>
        </Card>

        {/* This week card */}
        <Card>
          <CardHeader title="This Week" subtitle="Review progress" />
          <CardBody>
            <div className="flex flex-col items-center justify-center py-4">
              <div className="relative flex h-24 w-24 items-center justify-center">
                <svg className="h-24 w-24 -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="42"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="8"
                    className="text-ink-100 dark:text-ink-800"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="42"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="8"
                    strokeLinecap="round"
                    className="text-brand-500 transition-all duration-700"
                    strokeDasharray={`${(weekProgress / 100) * 264} 264`}
                  />
                </svg>
                <div className="absolute text-center">
                  <p className="font-display text-xl font-bold text-ink-900 dark:text-ink-100">{weekProgress}%</p>
                </div>
              </div>
              <p className="mt-4 text-sm text-ink-600 dark:text-ink-300">
                <span className="font-semibold text-ink-800 dark:text-ink-100">{reviewWeekProgress.reviewed}</span> of{' '}
                {reviewWeekProgress.total} reviews completed
              </p>
              <p className="mt-1 text-xs text-ink-400 dark:text-ink-500">
                {reviewWeekProgress.total - reviewWeekProgress.reviewed} remaining this week
              </p>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Assigned group cards */}
      <div>
        <h2 className="mb-3 font-display text-lg font-semibold text-ink-900 dark:text-ink-100">Your Assigned Groups</h2>
        {mentorGroups.length === 0 ? (
          <Card>
            <EmptyState
              icon={<Users className="h-7 w-7" />}
              title="No groups assigned yet"
              message="When groups are assigned to you, they will appear here with quick actions for reviewing topics and opening log books."
            />
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {mentorGroups.map((group) => {
              const info = statusBadgeMap[group.status];
              const milestoneCount = getMilestoneCount(group);
              const latestVersion = group.topicVersions[0];
              return (
                <Card key={group.id} className="transition-shadow hover:shadow-cardhover">
                  <CardBody>
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-ink-400 dark:text-ink-500">{group.projectId}</p>
                        <p className="mt-0.5 font-display font-semibold text-ink-900 truncate dark:text-ink-100">
                          {group.name}
                        </p>
                      </div>
                      <Badge color={info.color}>{info.label}</Badge>
                    </div>
                    <p className="mt-2 text-sm text-ink-600 line-clamp-2 dark:text-ink-300">{group.description}</p>

                    <div className="mt-4 flex items-center gap-4 text-xs text-ink-500 dark:text-ink-400">
                      <span className="flex items-center gap-1.5">
                        <CheckCircle2 className="h-3.5 w-3.5 text-brand-500 dark:text-brand-400" />
                        {milestoneCount}/{group.milestones.length} milestones
                      </span>
                      {latestVersion && (
                        <span className="flex items-center gap-1.5">
                          <Lightbulb className="h-3.5 w-3.5 text-ink-400 dark:text-ink-500" />
                          Topic v{latestVersion.version}
                        </span>
                      )}
                    </div>

                    {group.daysSinceLastActivity > 3 && (
                      <div className="mt-3 flex items-center gap-1.5 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700 dark:bg-amber-950/60 dark:text-amber-400">
                        <AlertCircle className="h-3.5 w-3.5" />
                        Last activity {group.daysSinceLastActivity} days ago
                      </div>
                    )}

                    <div className="mt-4 flex items-center gap-2 border-t border-ink-100 pt-3 dark:border-ink-800">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => onNavigate('logbook')}
                      >
                        <BookOpen className="h-3.5 w-3.5" />
                        Open log book
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => onOpenReview(group.id)}
                      >
                        <Lightbulb className="h-3.5 w-3.5" />
                        Review topic
                      </Button>
                    </div>
                  </CardBody>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

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
    brand: 'bg-brand-50 text-brand-600 dark:bg-brand-950/50 dark:text-brand-400',
    amber: 'bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400',
    sky: 'bg-sky-50 text-sky-600 dark:bg-sky-950/60 dark:text-sky-400',
    emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400',
  };
  return (
    <Card className="motion-lift">
      <CardBody>
        <div className="flex items-center gap-3">
          <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${accents[accent]}`}>
            {icon}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-ink-400 dark:text-ink-500">{label}</p>
            <p className="mt-0.5 truncate font-display text-lg font-bold text-ink-900 dark:text-ink-100">{value}</p>
          </div>
        </div>
        <p className="mt-3 text-xs text-ink-400 dark:text-ink-500">{sublabel}</p>
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
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Skeleton className="h-48 w-full rounded-xl lg:col-span-2" />
        <Skeleton className="h-48 w-full rounded-xl" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Skeleton className="h-48 w-full rounded-xl" />
        <Skeleton className="h-48 w-full rounded-xl" />
      </div>
    </div>
  );
}
