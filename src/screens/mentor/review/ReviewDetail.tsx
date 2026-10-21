import { Avatar, Badge, Button, Card, CardBody, CardHeader, EmptyState } from '@/components/ui/ui';
import { AlertCircle, CheckCircle2, Lightbulb, MessageSquare, Send, XCircle } from 'lucide-react';
import { mentorUser } from '@/data/mentorData';
import type { MentorGroup } from '@/data/mentorData';

const statusConfig: Record<string, { label: string; color: 'warning' | 'success' | 'error' }> = {
  pending: { label: 'Pending Review', color: 'warning' },
  approved: { label: 'Approved', color: 'success' },
  changes_requested: { label: 'Changes Requested', color: 'error' },
};

/** A single text field row inside the topic submission card. */
export function TopicField({ label, content }: { label: string; content: string }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-ink-400 dark:text-ink-500">
        {label}
      </p>
      <p className="mt-1 text-sm leading-relaxed text-ink-700 dark:text-ink-300">{content}</p>
    </div>
  );
}

/** Full detail panel shown when a group is selected in the Review Queue. */
export function ReviewDetail({
  group,
  reply,
  setReply,
  onReply,
  onApprove,
  onRequestChanges,
  onNavigateToLogBook,
}: {
  group: MentorGroup;
  reply: string;
  setReply: (v: string) => void;
  onReply: () => void;
  onApprove: () => void;
  onRequestChanges: () => void;
  onNavigateToLogBook: () => void;
}) {
  const latestVersion = group.topicVersions[0];
  const statusInfo = latestVersion ? statusConfig[latestVersion.status] : null;
  const isPending = latestVersion?.status === 'pending';
  const quietWarning =
    group.daysSinceLastActivity > 3 && isPending
      ? `Thread has been quiet for ${group.daysSinceLastActivity} days`
      : null;

  if (!latestVersion) {
    return (
      <Card>
        <EmptyState
          icon={<Lightbulb className="h-7 w-7" />}
          title="No topic submitted"
          message="This group has not submitted a topic for review yet."
        />
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card>
        <CardBody>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs text-ink-400 dark:text-ink-500">{group.projectId}</p>
              <h2 className="mt-0.5 font-display text-lg font-bold text-ink-900 dark:text-ink-100">
                {group.name}
              </h2>
              <p className="mt-1 text-sm text-ink-600 dark:text-ink-300">{group.description}</p>
            </div>
            {statusInfo && <Badge color={statusInfo.color}>{statusInfo.label}</Badge>}
          </div>

          {/* Members */}
          <div className="mt-4 flex flex-wrap gap-2">
            {group.members.map((m) => (
              <div
                key={m.id}
                className="flex items-center gap-2 rounded-lg bg-ink-50 px-3 py-1.5 dark:bg-ink-800/50"
              >
                <Avatar name={m.name} color="bg-ink-400" size="sm" />
                <div>
                  <p className="text-xs font-medium text-ink-700 dark:text-ink-200">{m.name}</p>
                  <p className="text-xs text-ink-400 dark:text-ink-500">{m.rollNumber}</p>
                </div>
              </div>
            ))}
          </div>

          {quietWarning && (
            <div className="mt-3 flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-700 dark:bg-amber-950/60 dark:text-amber-400">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {quietWarning} — consider following up.
            </div>
          )}

          {/* Previous feedback */}
          {latestVersion.feedback && !isPending && (
            <div className="mt-3 rounded-lg bg-ink-50 px-4 py-3 dark:bg-ink-800/50">
              <p className="text-xs font-semibold text-ink-400 dark:text-ink-500">
                Your previous feedback
              </p>
              <p className="mt-1 text-sm text-ink-600 dark:text-ink-300">
                {latestVersion.feedback}
              </p>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Topic fields */}
      <Card>
        <CardHeader
          title="Topic Submission"
          subtitle={`Version ${latestVersion.version} · submitted ${latestVersion.submittedAt}`}
        />
        <CardBody className="space-y-4">
          <TopicField label="Working Title" content={latestVersion.fields.workingTitle} />
          <TopicField label="Existing Work" content={latestVersion.fields.existingWork} />
          <TopicField label="Problem Identified" content={latestVersion.fields.problemIdentified} />
          <TopicField
            label="Proposed Difference"
            content={latestVersion.fields.proposedDifference}
          />
          <TopicField label="Innovation" content={latestVersion.fields.innovation} />
          <TopicField label="Feasibility" content={latestVersion.fields.feasibility} />
        </CardBody>
      </Card>

      {/* Discussion */}
      <Card>
        <CardHeader
          title="Discussion"
          subtitle={`Thread with ${group.name}`}
          action={
            <Badge color="brand">
              <MessageSquare className="h-3.5 w-3.5" />
              {group.discussion.length}
            </Badge>
          }
        />
        <CardBody className="space-y-4 bg-gradient-to-b from-ink-50/40 to-white dark:from-ink-950/30 dark:to-ink-900">
          <div className="space-y-3 rounded-xl border border-ink-100/80 bg-white/70 p-4 dark:border-ink-800 dark:bg-ink-900/50">
            {group.discussion.map((msg) => {
              const isStudent = msg.role === 'Student';
              return (
                <div
                  key={msg.id}
                  className={`flex items-end gap-2 ${isStudent ? 'justify-end' : 'justify-start'}`}
                >
                  {!isStudent && <Avatar name={msg.author} color={msg.avatarColor} size="sm" />}
                  <div
                    className={`flex max-w-[85%] flex-col ${isStudent ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`mb-1 flex items-center gap-2 px-1 ${isStudent ? 'flex-row-reverse' : ''}`}
                    >
                      <span className="text-xs font-semibold text-ink-600 dark:text-ink-300">
                        {msg.author}
                      </span>
                      <span className="text-[11px] text-ink-400 dark:text-ink-500">{msg.time}</span>
                    </div>
                    <div
                      className={`px-4 py-2.5 text-sm leading-relaxed shadow-sm ${isStudent ? 'rounded-2xl rounded-br-sm bg-brand-600 text-white dark:bg-brand-700' : 'rounded-2xl rounded-bl-sm border border-ink-100 bg-ink-50 text-ink-700 dark:border-ink-700 dark:bg-ink-800 dark:text-ink-200'}`}
                    >
                      {msg.body}
                    </div>
                  </div>
                  {isStudent && <Avatar name={msg.author} color={msg.avatarColor} size="sm" />}
                </div>
              );
            })}
          </div>

          {/* Reply box */}
          <div className="border-t border-ink-100 pt-4 dark:border-ink-800">
            <div className="flex items-end gap-2">
              <Avatar name={mentorUser.name} color={mentorUser.avatarColor} size="sm" />
              <div className="flex max-w-[85%] flex-1 flex-col items-start">
                <span className="mb-1 px-1 text-xs font-semibold text-ink-600 dark:text-ink-300">
                  {mentorUser.name}
                </span>
                <textarea
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  rows={2}
                  placeholder="Write a reply..."
                  className="input-field w-full resize-none rounded-2xl rounded-bl-sm border-ink-100 bg-ink-50 text-sm dark:border-ink-700 dark:bg-ink-800"
                />
                <div className="mt-2 flex w-full justify-end">
                  <Button size="sm" onClick={onReply} disabled={!reply.trim()}>
                    <Send className="h-3.5 w-3.5" />
                    Post reply
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Decision bar */}
      <Card className={isPending ? 'border-brand-200 dark:border-brand-800/60' : ''}>
        <CardBody className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-ink-900 dark:text-ink-100">Decision</p>
            <p className="text-xs text-ink-400 dark:text-ink-500">
              {isPending
                ? 'Approve or request changes for this topic submission.'
                : 'A decision has already been made on this version.'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={onNavigateToLogBook}>
              Open log book
            </Button>
            <Button variant="danger" size="sm" onClick={onRequestChanges} disabled={!isPending}>
              <XCircle className="h-3.5 w-3.5" />
              Request changes
            </Button>
            <Button size="sm" onClick={onApprove} disabled={!isPending}>
              <CheckCircle2 className="h-3.5 w-3.5" />
              Approve topic
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
