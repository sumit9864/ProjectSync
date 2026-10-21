import { Button, Card, CardBody, CardHeader, Badge } from '@/components/ui/ui';
import { CheckCircle2, Save, Send } from 'lucide-react';
import type { TopicStatus } from '@/types';

const statusConfig: Record<
  string,
  { label: string; color: 'warning' | 'success' | 'error'; icon: typeof CheckCircle2 }
> = {
  pending: { label: 'Waiting on mentor review', color: 'warning', icon: CheckCircle2 },
  approved: { label: 'Topic approved', color: 'success', icon: CheckCircle2 },
  changes_requested: { label: 'Changes requested by mentor', color: 'error', icon: CheckCircle2 },
};

export type TopicDraft = {
  workingTitle: string;
  existingWork: string;
  problemIdentified: string;
  proposedDifference: string;
  innovation: string;
  feasibility: string;
};

type Props = {
  draft: TopicDraft;
  savedDraft: TopicDraft;
  isApproved: boolean;
  currentStatus: TopicStatus;
  versions: { version: number; submittedAt: string; status: TopicStatus; feedback?: string }[];
  submitting: boolean;
  hasUnsavedChanges: boolean;
  onUpdateField: (field: keyof TopicDraft, value: string) => void;
  onRevert: () => void;
  onSubmit: () => void;
};

const FIELDS: { key: keyof TopicDraft; label: string; placeholder: string; rows: number }[] = [
  {
    key: 'workingTitle',
    label: 'Working Title',
    placeholder: 'A concise title for your project',
    rows: 1,
  },
  {
    key: 'existingWork',
    label: 'Existing Work',
    placeholder: 'What has already been done in this area?',
    rows: 3,
  },
  {
    key: 'problemIdentified',
    label: 'Problem Identified',
    placeholder: 'What specific problem are you solving?',
    rows: 3,
  },
  {
    key: 'proposedDifference',
    label: 'Proposed Difference',
    placeholder: 'How is your approach different from existing work?',
    rows: 3,
  },
  {
    key: 'innovation',
    label: 'Innovation',
    placeholder: 'What is the novel contribution?',
    rows: 3,
  },
  {
    key: 'feasibility',
    label: 'Feasibility',
    placeholder: 'Why is this achievable in the given timeline?',
    rows: 3,
  },
];

/**
 * The 6-field topic submission form card.
 * Parent keeps all state; this component is purely presentational.
 */
export function TopicForm({
  draft,
  isApproved,
  currentStatus,
  versions,
  submitting,
  hasUnsavedChanges,
  onUpdateField,
  onRevert,
  onSubmit,
}: Props) {
  const statusInfo = statusConfig[currentStatus];
  const StatusIcon = statusInfo.icon;

  return (
    <>
      {/* Decision status callout */}
      <Card
        className={
          statusInfo.color === 'warning'
            ? 'border-amber-200 bg-amber-50/50 dark:border-amber-800/60 dark:bg-amber-950/30'
            : statusInfo.color === 'success'
              ? 'border-emerald-200 bg-emerald-50/50 dark:border-emerald-800/60 dark:bg-emerald-950/30'
              : 'border-rose-200 bg-rose-50/50 dark:border-rose-800/60 dark:bg-rose-950/30'
        }
      >
        <CardBody className="flex items-start gap-3 p-5">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
              statusInfo.color === 'warning'
                ? 'bg-amber-100 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400'
                : statusInfo.color === 'success'
                  ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400'
                  : 'bg-rose-100 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400'
            }`}
          >
            <StatusIcon className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <p className="font-display font-semibold text-ink-900 dark:text-ink-100">
              {statusInfo.label}
            </p>
            {currentStatus === 'changes_requested' && versions[0]?.feedback && (
              <p className="mt-1 text-sm text-ink-600 dark:text-ink-300">
                <span className="font-medium">Mentor feedback:</span> {versions[0].feedback}
              </p>
            )}
            {currentStatus === 'approved' && (
              <p className="mt-1 text-sm text-ink-600 dark:text-ink-300">
                Your topic is approved. You can no longer edit it.
              </p>
            )}
          </div>
        </CardBody>
      </Card>

      {/* Editable form */}
      <Card className="overflow-hidden border-brand-100/80 bg-white shadow-sm shadow-brand-900/5 dark:border-brand-900/50 dark:bg-ink-900">
        <CardHeader
          title="Topic Details"
          subtitle={`Current draft — version ${versions.length + 1}`}
          action={
            <div className="flex items-center gap-2">
              {hasUnsavedChanges ? (
                <span className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400">
                  <span className="h-2 w-2 animate-pulse-dot rounded-full bg-amber-400" />
                  Unsaved changes
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  All changes saved
                </span>
              )}
            </div>
          }
        />
        <CardBody className="space-y-5">
          {FIELDS.map((field) => (
            <div
              key={field.key}
              className="rounded-xl border border-brand-100/70 bg-white p-4 shadow-sm shadow-brand-900/[0.03] dark:border-brand-900/50 dark:bg-ink-900/60"
            >
              <label className="mb-1.5 block text-sm font-semibold text-ink-800 dark:text-ink-100">
                {field.label}
              </label>
              {field.rows === 1 ? (
                <input
                  type="text"
                  value={draft[field.key]}
                  onChange={(e) => onUpdateField(field.key, e.target.value)}
                  disabled={isApproved}
                  placeholder={field.placeholder}
                  className="input-field border-0 bg-transparent px-0 shadow-none focus:ring-0 disabled:bg-transparent disabled:text-ink-500"
                />
              ) : (
                <textarea
                  value={draft[field.key]}
                  onChange={(e) => onUpdateField(field.key, e.target.value)}
                  disabled={isApproved}
                  rows={field.rows}
                  placeholder={field.placeholder}
                  className="input-field resize-none border-0 bg-transparent px-0 shadow-none focus:ring-0 disabled:bg-transparent disabled:text-ink-500"
                />
              )}
            </div>
          ))}

          {!isApproved && (
            <div className="flex justify-end gap-3 border-t border-ink-100 pt-4 dark:border-ink-800">
              <Button variant="secondary" onClick={onRevert} disabled={!hasUnsavedChanges}>
                Revert
              </Button>
              <Button onClick={onSubmit} disabled={submitting || hasUnsavedChanges}>
                {submitting ? (
                  <>
                    <Save className="h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Submit for review
                  </>
                )}
              </Button>
            </div>
          )}
        </CardBody>
      </Card>
    </>
  );
}
