import { Button, Card, EmptyState } from '@/components/ui/ui';
import { BookOpen, Plus } from 'lucide-react';
type SimpleGroup = { id: string; name: string };

type Props = {
  groups: SimpleGroup[];
  selectedGroupId: string;
  onSelectGroup: (id: string) => void;
  onNewSession: () => void;
};

/** Left-rail group selector tabs + "New session" button for the Log Book page. */
export function LogBookGroupSelector({ groups, selectedGroupId, onSelectGroup, onNewSession }: Props) {
  if (groups.length === 0) {
    return (
      <Card>
        <EmptyState
          icon={<BookOpen className="h-7 w-7" />}
          title="No groups assigned"
          message="You need assigned groups before you can log mentoring sessions."
        />
      </Card>
    );
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex flex-wrap gap-2">
        {groups.map((g) => (
          <button
            key={g.id}
            onClick={() => onSelectGroup(g.id)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
              selectedGroupId === g.id
                ? 'bg-brand-600 text-white shadow-sm dark:bg-brand-500'
                : 'border border-ink-200 bg-white text-ink-600 hover:bg-ink-50 dark:border-ink-700 dark:bg-ink-900 dark:text-ink-300 dark:hover:bg-ink-800'
            }`}
          >
            {g.name}
          </button>
        ))}
      </div>
      <Button onClick={onNewSession}>
        <Plus className="h-4 w-4" />
        New session
      </Button>
    </div>
  );
}
