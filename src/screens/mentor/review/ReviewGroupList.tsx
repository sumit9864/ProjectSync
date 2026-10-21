import { Badge, Card, CardBody, CardHeader, EmptyState } from '@/components/ui/ui';
import { Check, ChevronRight, Clock, Users } from 'lucide-react';
import type { MentorGroup } from '@/data/mentorData';

const statusConfig: Record<string, { label: string; color: 'warning' | 'success' | 'error' }> = {
  pending: { label: 'Pending Review', color: 'warning' },
  approved: { label: 'Approved', color: 'success' },
  changes_requested: { label: 'Changes Requested', color: 'error' },
};

type Props = {
  groups: MentorGroup[];
  selectedId: string | null;
  bulkSelected: Set<string>;
  onSelect: (id: string) => void;
  onToggleBulk: (id: string) => void;
};

/**
 * Left-panel list of assigned groups, each showing their latest topic status.
 * Supports single-select (for detail view) and checkbox bulk-select.
 */
export function ReviewGroupList({
  groups,
  selectedId,
  bulkSelected,
  onSelect,
  onToggleBulk,
}: Props) {
  return (
    <Card>
      <CardHeader title="Assigned Groups" subtitle="Latest topic status" />
      <CardBody className="p-0">
        {groups.length === 0 ? (
          <EmptyState
            icon={<Users className="h-7 w-7" />}
            title="No groups assigned"
            message="Groups assigned to you will appear here for review."
          />
        ) : (
          <div className="divide-y divide-ink-50 dark:divide-ink-800">
            {groups.map((group) => {
              const latestVersion = group.topicVersions[0];
              const statusInfo = latestVersion ? statusConfig[latestVersion.status] : null;
              const isPending = latestVersion?.status === 'pending';
              const isSelected = selectedId === group.id;
              const isBulkSelected = bulkSelected.has(group.id);

              return (
                <div
                  key={group.id}
                  className={`flex items-start gap-2 px-3 py-1 transition-colors ${
                    isSelected ? 'bg-brand-50/50 dark:bg-brand-950/30' : ''
                  }`}
                >
                  {isPending && (
                    <button
                      onClick={() => onToggleBulk(group.id)}
                      className={`mt-3 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-all ${
                        isBulkSelected
                          ? 'border-brand-500 bg-brand-500 text-white'
                          : 'border-ink-300 hover:border-brand-400 dark:border-ink-600 dark:hover:border-brand-500'
                      }`}
                      aria-label="Select for bulk action"
                    >
                      {isBulkSelected && <Check className="h-3 w-3" />}
                    </button>
                  )}
                  <button
                    onClick={() => onSelect(group.id)}
                    className="flex flex-1 items-start gap-3 rounded-lg px-2 py-3 text-left transition-colors hover:bg-ink-50 dark:hover:bg-ink-800/50"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-ink-100 text-xs font-semibold text-ink-600 dark:bg-ink-800 dark:text-ink-300">
                      {group.name
                        .split(' ')
                        .map((w) => w[0])
                        .slice(0, 2)
                        .join('')}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-ink-800 dark:text-ink-100">
                        {group.name}
                      </p>
                      <p className="truncate text-xs text-ink-400 dark:text-ink-500">
                        {group.projectId}
                        {latestVersion && ` · v${latestVersion.version}`}
                      </p>
                      <div className="mt-1.5 flex items-center gap-1.5">
                        {statusInfo && <Badge color={statusInfo.color}>{statusInfo.label}</Badge>}
                        {group.daysSinceLastActivity > 3 && isPending && (
                          <span className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
                            <Clock className="h-3 w-3" />
                            {group.daysSinceLastActivity}d
                          </span>
                        )}
                      </div>
                    </div>
                    {isSelected && (
                      <ChevronRight className="mt-3 h-4 w-4 shrink-0 text-brand-500 dark:text-brand-400" />
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </CardBody>
    </Card>
  );
}
