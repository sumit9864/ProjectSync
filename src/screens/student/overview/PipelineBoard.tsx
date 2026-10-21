import { Badge, Card, CardBody, CardHeader } from '@/components/ui/ui';
import { CheckCircle2, ChevronDown, Circle, Clock } from 'lucide-react';

type PipelineStage = {
  key: string;
  label: string;
};

type PipelineBoardProps = {
  pipelineStages: readonly PipelineStage[];
  completedStages: readonly string[];
  selectedStage: string | null;
  draggedStage: string | null;
  dropStage: string | null;
  onSelectStage: (key: string | null) => void;
  onDragStart: (key: string) => void;
  onDragOver: (key: string) => void;
  onDragLeave: () => void;
  onDrop: (key: string) => void;
  onDragEnd: () => void;
};

/**
 * Kanban-style project pipeline tracker.
 * Renders stage buttons with drag-and-drop reorder support and an expandable detail panel.
 */
export function PipelineBoard({
  pipelineStages,
  completedStages,
  selectedStage,
  draggedStage,
  dropStage,
  onSelectStage,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
  onDragEnd,
}: PipelineBoardProps) {
  return (
    <Card className="pipeline-card">
      <CardHeader title="Project Pipeline" subtitle="Track your progress through each stage" />
      <CardBody>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          {pipelineStages.map((stage, idx) => {
            const done = completedStages.includes(stage.key);
            const isCurrent = !done && idx === completedStages.length;
            return (
              <div key={stage.key} className="flex items-center sm:flex-1">
                <button
                  type="button"
                  draggable
                  aria-label={`Open details for ${stage.label}. Drag to reorder the pipeline.`}
                  aria-pressed={selectedStage === stage.key}
                  onClick={() => onSelectStage(selectedStage === stage.key ? null : stage.key)}
                  onDragStart={() => onDragStart(stage.key)}
                  onDragOver={(e) => {
                    e.preventDefault();
                    onDragOver(stage.key);
                  }}
                  onDragLeave={onDragLeave}
                  onDrop={(e) => {
                    e.preventDefault();
                    onDrop(stage.key);
                  }}
                  onDragEnd={onDragEnd}
                  className={`focus-ring pipeline-stage flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left sm:flex-1 ${
                    isCurrent ? 'pipeline-stage--current' : ''
                  } ${dropStage === stage.key && draggedStage !== stage.key ? 'drop-target' : ''} ${
                    done
                      ? 'bg-brand-50 dark:bg-brand-950/40'
                      : isCurrent
                        ? 'bg-amber-50 dark:bg-amber-950/40'
                        : 'bg-ink-50 dark:bg-ink-800/50'
                  }`}
                >
                  {done ? (
                    <CheckCircle2 className="h-5 w-5 text-brand-600 dark:text-brand-400" />
                  ) : isCurrent ? (
                    <Clock className="pipeline-icon--current h-5 w-5 text-amber-500 dark:text-amber-400" />
                  ) : (
                    <Circle className="h-5 w-5 text-ink-300 dark:text-ink-600" />
                  )}
                  <div className="min-w-0">
                    <p
                      className={`text-sm font-medium ${
                        done
                          ? 'text-brand-700 dark:text-brand-300'
                          : isCurrent
                            ? 'text-amber-700 dark:text-amber-400'
                            : 'text-ink-400 dark:text-ink-500'
                      }`}
                    >
                      {stage.label}
                    </p>
                    <p className="text-xs text-ink-400 dark:text-ink-500">
                      {done ? 'Complete' : isCurrent ? 'In progress' : 'Pending'}
                    </p>
                    <span className="sr-only">
                      Status is {done ? 'complete' : isCurrent ? 'in progress' : 'pending'}. Press
                      Enter to open details.
                    </span>
                  </div>
                  <ChevronDown
                    className={`ml-auto h-4 w-4 shrink-0 transition-transform sm:hidden ${
                      selectedStage === stage.key ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {idx < pipelineStages.length - 1 && (
                  <div
                    className={`pipeline-connector ${
                      isCurrent || (done && idx + 1 === completedStages.length)
                        ? 'pipeline-connector--active'
                        : ''
                    } mx-1 hidden h-px flex-1 sm:block ${
                      done ? 'bg-brand-300 dark:bg-brand-800' : 'bg-ink-200 dark:bg-ink-700'
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>

        {selectedStage && (
          <div
            className="motion-page mt-4 rounded-xl border border-brand-200/70 bg-brand-50/60 p-4 dark:border-brand-800/60 dark:bg-brand-950/25"
            role="status"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-brand-900 dark:text-brand-100">
                  {pipelineStages.find((s) => s.key === selectedStage)?.label}
                </p>
                <p className="mt-1 text-sm text-brand-800/80 dark:text-brand-200/80">
                  {completedStages.includes(selectedStage)
                    ? 'This stage is complete. Review the activity log for the latest updates.'
                    : 'This is your active focus. Complete the next milestone to keep the project on track.'}
                </p>
              </div>
              <Badge color={completedStages.includes(selectedStage) ? 'success' : 'warning'}>
                {completedStages.includes(selectedStage) ? 'Complete' : 'Focus'}
              </Badge>
            </div>
          </div>
        )}
      </CardBody>
    </Card>
  );
}
