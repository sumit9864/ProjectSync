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
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink-900">
          Welcome back, {mentorUser.name.split(' ').slice(0, 2).join(' ')}
        </h1>
        <p className="mt-1 text-sm text-ink-500">
          You have {pendingReviews.length} topic {pendingReviews.length === 1 ? 'review' : 'reviews'} waiting and{' '}
          {mentorStats.assignedGroups} active groups.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
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

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Reviews waiting */}
        <Card className="lg:col-span-2">
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
              <div className="divide-y divide-ink-50">
                {pendingReviews.map((group) => {
                  const latestVersion = group.topicVersions[0];
                  const info = statusBadgeMap[group.status];
                  return (
                    <button
                      key={group.id}
                      onClick={() => onOpenReview(group.id)}
                      className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left transition-colors hover:bg-ink-50"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                          <Lightbulb className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-ink-800 truncate">
                            {group.name}
                          </p>
                          <p className="text-xs text-ink-400 truncate">
                            {group.projectId} · v{latestVersion.version} · submitted{' '}
                            {latestVersion.submittedAt}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge color={info.color}>{info.label}</Badge>
                        <ArrowRight className="h-4 w-4 text-ink-300" />
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
                    className="text-ink-100"
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
                  <p className="font-display text-xl font-bold text-ink-900">{weekProgress}%</p>
                </div>
              </div>
              <p className="mt-4 text-sm text-ink-600">
                <span className="font-semibold text-ink-800">{reviewWeekProgress.reviewed}</span> of{' '}
                {reviewWeekProgress.total} reviews completed
              </p>
              <p className="mt-1 text-xs text-ink-400">
                {reviewWeekProgress.total - reviewWeekProgress.reviewed} remaining this week
              </p>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Assigned group cards */}
      <div>
        <h2 className="mb-3 font-display text-lg font-semibold text-ink-900">Your Assigned Groups</h2>
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
                        <p className="text-xs font-medium text-ink-400">{group.projectId}</p>
                        <p className="mt-0.5 font-display font-semibold text-ink-900 truncate">
                          {group.name}
                        </p>
                      </div>
                      <Badge color={info.color}>{info.label}</Badge>
                    </div>
                    <p className="mt-2 text-sm text-ink-600 line-clamp-2">{group.description}</p>

                    <div className="mt-4 flex items-center gap-4 text-xs text-ink-500">
                      <span className="flex items-center gap-1.5">
                        <CheckCircle2 className="h-3.5 w-3.5 text-brand-500" />
                        {milestoneCount}/{group.milestones.length} milestones
                      </span>
                      {latestVersion && (
                        <span className="flex items-center gap-1.5">
                          <Lightbulb className="h-3.5 w-3.5 text-ink-400" />
                          Topic v{latestVersion.version}
                        </span>
                      )}
                    </div>

                    {group.daysSinceLastActivity > 3 && (
                      <div className="mt-3 flex items-center gap-1.5 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
                        <AlertCircle className="h-3.5 w-3.5" />
                        Last activity {group.daysSinceLastActivity} days ago
                      </div>
                    )}

                    <div className="mt-4 flex items-center gap-2 border-t border-ink-100 pt-3">
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
