import { useEffect, useState } from 'react';
import {
  Users,
  BookOpen,
  Lightbulb,
  CheckCircle2,
} from 'lucide-react';
import { Card, CardBody, Button, Badge, Skeleton, EmptyState } from '@/components/ui';
import { mentorGroups } from '@/data/mentorData';
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

export function MentorMyGroupsPage({
  onOpenReview,
  onOpenLogBook,
}: {
  onOpenReview: (groupId: string) => void;
  onOpenLogBook: (groupId: string) => void;
}) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(t);
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-40 rounded-md" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-56 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink-900 dark:text-ink-100">My Groups</h1>
        <p className="mt-1 text-sm text-ink-500 dark:text-ink-400">
          All groups assigned to you for mentoring this semester.
        </p>
      </div>

      {mentorGroups.length === 0 ? (
        <Card>
          <EmptyState
            icon={<Users className="h-7 w-7" />}
            title="No groups assigned yet"
            message="When groups are assigned to you, they will appear here with their project details and quick actions."
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {mentorGroups.map((group) => {
            const info = statusBadgeMap[group.status];
            const completedMilestones = group.milestones.filter(
              (m) => m.status === 'complete'
            ).length;
            const totalMilestones = group.milestones.length;
            const progress = Math.round((completedMilestones / totalMilestones) * 100);
            const latestVersion = group.topicVersions[0];

            return (
              <Card key={group.id} className="transition-shadow hover:shadow-cardhover">
                <CardBody className="space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-ink-400 dark:text-ink-500">{group.projectId}</p>
                      <p className="mt-0.5 font-display text-lg font-bold text-ink-900 truncate dark:text-ink-100">
                        {group.name}
                      </p>
                    </div>
                    <Badge color={info.color}>{info.label}</Badge>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-ink-600 line-clamp-2 dark:text-ink-300">{group.description}</p>

                  {/* Members */}
                  <div className="flex items-center gap-1.5">
                    {group.members.map((m) => (
                      <div
                        key={m.id}
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-ink-200 text-xs font-semibold text-ink-600 dark:bg-ink-700 dark:text-ink-300"
                        title={m.name}
                      >
                        {m.name.split(' ').map((w) => w[0]).slice(0, 2).join('')}
                      </div>
                    ))}
                    <span className="ml-1 text-xs text-ink-400 dark:text-ink-500">
                      {group.members.length} members
                    </span>
                  </div>

                  {/* Milestone progress */}
                  <div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1.5 text-ink-500 dark:text-ink-400">
                        <CheckCircle2 className="h-3.5 w-3.5 text-brand-500 dark:text-brand-400" />
                        {completedMilestones}/{totalMilestones} milestones
                      </span>
                      <span className="font-medium text-ink-600 dark:text-ink-300">{progress}%</span>
                    </div>
                    <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-ink-100 dark:bg-ink-800">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-brand-500 to-brand-600 transition-all duration-500"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Topic version */}
                  {latestVersion && (
                    <div className="flex items-center gap-2 text-xs text-ink-500 dark:text-ink-400">
                      <Lightbulb className="h-3.5 w-3.5 text-ink-400 dark:text-ink-500" />
                      Current topic: v{latestVersion.version}
                      <Badge
                        color={
                          latestVersion.status === 'approved'
                            ? 'success'
                            : latestVersion.status === 'pending'
                            ? 'warning'
                            : 'error'
                        }
                      >
                        {latestVersion.status === 'approved'
                          ? 'Approved'
                          : latestVersion.status === 'pending'
                          ? 'Pending'
                          : 'Changes requested'}
                      </Badge>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-2 border-t border-ink-100 pt-3 dark:border-ink-800">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => onOpenLogBook(group.id)}
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
  );
}
