import { Badge, Card, CardBody, CardHeader, EmptyState } from '@/components/ui/ui';
import { CalendarClock, CheckCircle2, Target } from 'lucide-react';
type GroupWithMilestones = {
  name: string;
  milestones: { id: string; title: string; dueDate: string; status: string; number: number }[];
};

type Props = {
  group: GroupWithMilestones | null;
};

/**
 * Side panel showing milestone progress for the currently selected group.
 * Sticky on large screens so it stays visible while scrolling entries.
 */
export function LogBookVersionHistory({ group }: Props) {
  return (
    <Card className="lg:sticky lg:top-0">
      <CardHeader title="Milestone Progress" subtitle={group?.name ?? ''} />
      <CardBody className="p-0">
        {group ? (
          <div className="divide-y divide-ink-50 dark:divide-ink-800">
            {group.milestones.map((m) => {
              const isComplete = m.status === 'complete';
              return (
                <div key={m.id} className="flex items-start gap-3 px-5 py-3.5">
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                      isComplete
                        ? 'bg-brand-600 text-white dark:bg-brand-500'
                        : 'bg-ink-100 text-ink-500 dark:bg-ink-800 dark:text-ink-400'
                    }`}
                  >
                    {isComplete ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : (
                      <span className="text-xs font-bold">{m.number}</span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p
                      className={`text-sm font-medium ${
                        isComplete
                          ? 'text-ink-500 line-through dark:text-ink-600'
                          : 'text-ink-800 dark:text-ink-100'
                      }`}
                    >
                      {m.title}
                    </p>
                    <p className="mt-0.5 flex items-center gap-1 text-xs text-ink-400 dark:text-ink-500">
                      <CalendarClock className="h-3 w-3" />
                      Due {m.dueDate}
                    </p>
                  </div>
                  <Badge color={isComplete ? 'success' : 'warning'}>
                    {isComplete ? 'Done' : 'Pending'}
                  </Badge>
                </div>
              );
            })}
          </div>
        ) : (
          <EmptyState
            icon={<Target className="h-7 w-7" />}
            title="Select a group"
            message="Choose a group to see its milestone progress."
          />
        )}
      </CardBody>
    </Card>
  );
}
