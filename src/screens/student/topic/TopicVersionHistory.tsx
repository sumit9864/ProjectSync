import { Badge, Card, CardBody, CardHeader } from '@/components/ui/ui';
import type { TopicStatus } from '@/types';

const statusConfig: Record<string, { label: string; color: 'warning' | 'success' | 'error' }> = {
  pending: { label: 'Waiting on mentor review', color: 'warning' },
  approved: { label: 'Topic approved', color: 'success' },
  changes_requested: { label: 'Changes requested by mentor', color: 'error' },
};

type Version = {
  version: number;
  submittedAt: string;
  status: TopicStatus;
  feedback?: string;
};

type Props = {
  versions: Version[];
};

/**
 * Version history timeline — shows all past topic submissions with status and feedback.
 */
export function TopicVersionHistory({ versions }: Props) {
  return (
    <Card>
      <CardHeader title="Version History" subtitle="All past submissions and their status" />
      <CardBody className="p-0">
        <div className="divide-y divide-ink-50 dark:divide-ink-800">
          {versions.length === 0 ? (
            <p className="px-5 py-8 text-center text-sm text-ink-400 dark:text-ink-500">
              No submissions yet. Submit your topic for review to see versions here.
            </p>
          ) : (
            versions.map((v) => {
              const vStatus = statusConfig[v.status];
              return (
                <div key={v.version} className="flex items-start gap-3 px-5 py-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-ink-100 text-xs font-semibold text-ink-600 dark:bg-ink-800 dark:text-ink-300">
                    v{v.version}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <Badge color={vStatus.color}>{vStatus.label}</Badge>
                      <span className="text-xs text-ink-400 dark:text-ink-500">
                        {v.submittedAt}
                      </span>
                    </div>
                    {v.feedback && (
                      <p className="mt-2 rounded-lg bg-ink-50 px-3 py-2 text-sm text-ink-600 dark:bg-ink-800/50 dark:text-ink-300">
                        {v.feedback}
                      </p>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardBody>
    </Card>
  );
}
