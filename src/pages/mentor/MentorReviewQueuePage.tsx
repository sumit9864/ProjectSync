import { useEffect, useState } from 'react';
import {
  ClipboardCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Send,
  AlertCircle,
  ChevronRight,
  Users,
  Lightbulb,
  Check,
  MessageSquare,
} from 'lucide-react';
import { Card, CardHeader, CardBody, Button, Badge, Avatar, Skeleton, EmptyState } from '@/components/ui';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { useToast } from '@/components/Toast';
import { mentorUser, mentorGroups } from '@/data/mentorData';
import type { MentorGroup, TopicVersionMentor } from '@/data/mentorData';

const statusConfig: Record<
  string,
  { label: string; color: 'warning' | 'success' | 'error' }
> = {
  pending: { label: 'Pending Review', color: 'warning' },
  approved: { label: 'Approved', color: 'success' },
  changes_requested: { label: 'Changes Requested', color: 'error' },
};

export function MentorReviewQueuePage({
  preselectedGroupId,
  onNavigateToLogBook,
}: {
  preselectedGroupId?: string | null;
  onNavigateToLogBook: (groupId: string) => void;
}) {
  const [loading, setLoading] = useState(true);
  const [groups, setGroups] = useState<MentorGroup[]>(mentorGroups);
  const [selectedId, setSelectedId] = useState<string | null>(
    preselectedGroupId ?? mentorGroups[0]?.id ?? null
  );
  const [reply, setReply] = useState('');
  const [bulkSelected, setBulkSelected] = useState<Set<string>>(new Set());
  const [confirmAction, setConfirmAction] = useState<{
    type: 'approve' | 'reject' | 'bulk_approve' | 'bulk_reject';
    groupId?: string;
  } | null>(null);
  const [feedbackText, setFeedbackText] = useState('');
  const { showToast } = useToast();

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(t);
  }, []);

  const selectedGroup = groups.find((g) => g.id === selectedId) ?? null;
  const pendingGroups = groups.filter((g) => g.topicVersions[0]?.status === 'pending');

  const updateGroupTopicStatus = (
    groupId: string,
    newStatus: 'approved' | 'changes_requested',
    feedback?: string
  ) => {
    setGroups((prev) =>
      prev.map((g) => {
        if (g.id !== groupId) return g;
        const versions = [...g.topicVersions];
        if (versions.length > 0) {
          versions[0] = {
            ...versions[0],
            status: newStatus,
            feedback: feedback ?? versions[0].feedback,
          };
        }
        return {
          ...g,
          topicVersions: versions,
          status:
            newStatus === 'approved'
              ? 'topic_approved'
              : 'topic_changes_requested',
        };
      })
    );
  };

  const addReply = (groupId: string) => {
    if (!reply.trim()) return;
    const now = new Date();
    const timeStr =
      now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) +
      ' · ' +
      now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    setGroups((prev) =>
      prev.map((g) =>
        g.id === groupId
          ? {
              ...g,
              discussion: [
                ...g.discussion,
                {
                  id: `msg-${Date.now()}`,
                  author: mentorUser.name,
                  role: 'Mentor',
                  avatarColor: mentorUser.avatarColor,
                  body: reply.trim(),
                  time: timeStr,
                },
              ],
            }
          : g
      )
    );
    setReply('');
    showToast('Reply posted.', 'success');
  };

  const toggleBulkSelect = (groupId: string) => {
    setBulkSelected((prev) => {
      const next = new Set(prev);
      if (next.has(groupId)) next.delete(groupId);
      else next.add(groupId);
      return next;
    });
  };

  const handleConfirmAction = () => {
    if (!confirmAction) return;
    const { type, groupId } = confirmAction;

    if (type === 'approve' && groupId) {
      updateGroupTopicStatus(groupId, 'approved', feedbackText || undefined);
      showToast('Topic approved.', 'success');
    } else if (type === 'reject' && groupId) {
      if (!feedbackText.trim()) {
        showToast('Please provide feedback when requesting changes.', 'error');
        return;
      }
      updateGroupTopicStatus(groupId, 'changes_requested', feedbackText);
      showToast('Changes requested with feedback.', 'success');
    } else if (type === 'bulk_approve') {
      bulkSelected.forEach((id) => updateGroupTopicStatus(id, 'approved'));
      showToast(`Approved ${bulkSelected.size} topics.`, 'success');
      setBulkSelected(new Set());
    } else if (type === 'bulk_reject') {
      if (!feedbackText.trim()) {
        showToast('Please provide feedback for the requested changes.', 'error');
        return;
      }
      bulkSelected.forEach((id) =>
        updateGroupTopicStatus(id, 'changes_requested', feedbackText)
      );
      showToast(`Requested changes for ${bulkSelected.size} topics.`, 'success');
      setBulkSelected(new Set());
    }

    setConfirmAction(null);
    setFeedbackText('');
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-40 rounded-md" />
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Skeleton className="h-96 w-full rounded-xl" />
          <Skeleton className="h-96 w-full rounded-xl lg:col-span-2" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink-900">Review Queue</h1>
        <p className="mt-1 text-sm text-ink-500">
          Review pending topic submissions and provide decisions.
        </p>
      </div>

      {/* Bulk action bar */}
      {pendingGroups.length > 0 && (
        <Card className={bulkSelected.size > 0 ? 'border-brand-200 bg-brand-50/40' : ''}>
          <CardBody className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <ClipboardCheck className="h-5 w-5 text-brand-600" />
              <p className="text-sm text-ink-700">
                {bulkSelected.size > 0
                  ? `${bulkSelected.size} selected for bulk action`
                  : `${pendingGroups.length} pending review${pendingGroups.length > 1 ? 's' : ''} — select multiple to act at once`}
              </p>
            </div>
            {bulkSelected.size > 0 && (
              <div className="flex items-center gap-2">
                <Button variant="secondary" size="sm" onClick={() => setBulkSelected(new Set())}>
                  Clear
                </Button>
                <Button
                  size="sm"
                  onClick={() => setConfirmAction({ type: 'bulk_approve' })}
                >
                  <Check className="h-3.5 w-3.5" />
                  Approve all ({bulkSelected.size})
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => setConfirmAction({ type: 'bulk_reject' })}
                >
                  <XCircle className="h-3.5 w-3.5" />
                  Request changes
                </Button>
              </div>
            )}
          </CardBody>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Left: group list */}
        <div className="lg:col-span-1">
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
                <div className="divide-y divide-ink-50">
                  {groups.map((group) => {
                    const latestVersion = group.topicVersions[0];
                    const statusInfo = latestVersion
                      ? statusConfig[latestVersion.status]
                      : null;
                    const isPending = latestVersion?.status === 'pending';
                    const isSelected = selectedId === group.id;
                    const isBulkSelected = bulkSelected.has(group.id);

                    return (
                      <div
                        key={group.id}
                        className={`flex items-start gap-2 px-3 py-1 transition-colors ${
                          isSelected ? 'bg-brand-50/50' : ''
                        }`}
                      >
                        {isPending && (
                          <button
                            onClick={() => toggleBulkSelect(group.id)}
                            className={`mt-3 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-all ${
                              isBulkSelected
                                ? 'border-brand-500 bg-brand-500 text-white'
                                : 'border-ink-300 hover:border-brand-400'
                            }`}
                            aria-label="Select for bulk action"
                          >
                            {isBulkSelected && <Check className="h-3 w-3" />}
                          </button>
                        )}
                        <button
                          onClick={() => setSelectedId(group.id)}
                          className={`flex flex-1 items-start gap-3 rounded-lg px-2 py-3 text-left transition-colors hover:bg-ink-50 ${
                            isSelected ? '' : ''
                          }`}
                        >
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-ink-100 text-xs font-semibold text-ink-600">
                            {group.name.split(' ').map((w) => w[0]).slice(0, 2).join('')}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-ink-800 truncate">
                              {group.name}
                            </p>
                            <p className="text-xs text-ink-400 truncate">
                              {group.projectId}
                              {latestVersion && ` · v${latestVersion.version}`}
                            </p>
                            <div className="mt-1.5 flex items-center gap-1.5">
                              {statusInfo && (
                                <Badge color={statusInfo.color}>{statusInfo.label}</Badge>
                              )}
                              {group.daysSinceLastActivity > 3 && isPending && (
                                <span className="flex items-center gap-1 text-xs text-amber-600">
                                  <Clock className="h-3 w-3" />
                                  {group.daysSinceLastActivity}d
                                </span>
                              )}
                            </div>
                          </div>
                          {isSelected && (
                            <ChevronRight className="mt-3 h-4 w-4 shrink-0 text-brand-500" />
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardBody>
          </Card>
        </div>

        {/* Right: detail view */}
        <div className="lg:col-span-2">
          {!selectedGroup ? (
            <Card>
              <EmptyState
                icon={<ClipboardCheck className="h-7 w-7" />}
                title="Select a group"
                message="Choose a group from the list to view its topic submission and take action."
              />
            </Card>
          ) : (
            <ReviewDetail
              group={selectedGroup}
              reply={reply}
              setReply={setReply}
              onReply={() => addReply(selectedGroup.id)}
              onApprove={() => {
                setFeedbackText('');
                setConfirmAction({ type: 'approve', groupId: selectedGroup.id });
              }}
              onRequestChanges={() => {
                setFeedbackText('');
                setConfirmAction({ type: 'reject', groupId: selectedGroup.id });
              }}
              onNavigateToLogBook={() => onNavigateToLogBook(selectedGroup.id)}
            />
          )}
        </div>
      </div>

      {/* Confirmation dialog */}
      <ConfirmDialog
        open={confirmAction !== null}
        title={
          confirmAction?.type === 'approve'
            ? 'Approve topic?'
            : confirmAction?.type === 'bulk_approve'
            ? `Approve ${bulkSelected.size} topics?`
            : confirmAction?.type === 'bulk_reject'
            ? `Request changes for ${bulkSelected.size} topics?`
            : 'Request changes?'
        }
        message={
          <div className="space-y-3">
            <p>
              {confirmAction?.type === 'approve' &&
                `You are approving the topic for "${selectedGroup?.name}". The group will be notified and can proceed to the next stage.`}
              {confirmAction?.type === 'reject' &&
                `You are requesting changes for "${selectedGroup?.name}". Provide specific feedback below.`}
              {confirmAction?.type === 'bulk_approve' &&
                `You are approving topics for ${bulkSelected.size} groups at once. Each group will be notified.`}
              {confirmAction?.type === 'bulk_reject' &&
                `You are requesting changes for ${bulkSelected.size} groups. The same feedback will be sent to all selected groups.`}
            </p>
            {(confirmAction?.type === 'reject' || confirmAction?.type === 'bulk_reject') && (
              <textarea
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                rows={3}
                placeholder="Enter specific feedback for the students..."
                className="input-field resize-none text-sm"
                autoFocus
              />
            )}
            {confirmAction?.type === 'approve' && (
              <textarea
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                rows={2}
                placeholder="Optional: add a note for the students..."
                className="input-field resize-none text-sm"
              />
            )}
          </div>
        }
        confirmLabel={
          confirmAction?.type === 'approve' || confirmAction?.type === 'bulk_approve'
            ? 'Confirm approval'
            : 'Send feedback'
        }
        cancelLabel="Cancel"
        destructive={confirmAction?.type === 'reject' || confirmAction?.type === 'bulk_reject'}
        onConfirm={handleConfirmAction}
        onCancel={() => {
          setConfirmAction(null);
          setFeedbackText('');
        }}
      />
    </div>
  );
}

function ReviewDetail({
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
              <p className="text-xs text-ink-400">{group.projectId}</p>
              <h2 className="mt-0.5 font-display text-lg font-bold text-ink-900">
                {group.name}
              </h2>
              <p className="mt-1 text-sm text-ink-600">{group.description}</p>
            </div>
            {statusInfo && <Badge color={statusInfo.color}>{statusInfo.label}</Badge>}
          </div>

          {/* Members */}
          <div className="mt-4 flex flex-wrap gap-2">
            {group.members.map((m) => (
              <div
                key={m.id}
                className="flex items-center gap-2 rounded-lg bg-ink-50 px-3 py-1.5"
              >
                <Avatar name={m.name} color="bg-ink-400" size="sm" />
                <div>
                  <p className="text-xs font-medium text-ink-700">{m.name}</p>
                  <p className="text-xs text-ink-400">{m.rollNumber}</p>
                </div>
              </div>
            ))}
          </div>

          {quietWarning && (
            <div className="mt-3 flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-700">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {quietWarning} — consider following up.
            </div>
          )}

          {/* Previous feedback */}
          {latestVersion.feedback && !isPending && (
            <div className="mt-3 rounded-lg bg-ink-50 px-4 py-3">
              <p className="text-xs font-semibold text-ink-400">Your previous feedback</p>
              <p className="mt-1 text-sm text-ink-600">{latestVersion.feedback}</p>
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
          <TopicField label="Proposed Difference" content={latestVersion.fields.proposedDifference} />
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
        <CardBody className="space-y-4">
          <div className="space-y-4">
            {group.discussion.map((msg) => (
              <div key={msg.id} className="flex items-start gap-3">
                <Avatar name={msg.author} color={msg.avatarColor} size="sm" />
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold text-ink-800">{msg.author}</span>
                    <Badge color={msg.role === 'Mentor' ? 'brand' : 'neutral'}>{msg.role}</Badge>
                    <span className="text-xs text-ink-400">{msg.time}</span>
                  </div>
                  <p className="mt-1.5 rounded-lg bg-ink-50 px-3.5 py-2.5 text-sm text-ink-700 leading-relaxed">
                    {msg.body}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Reply box */}
          <div className="border-t border-ink-100 pt-4">
            <div className="flex items-start gap-3">
              <Avatar name={mentorUser.name} color={mentorUser.avatarColor} size="sm" />
              <div className="flex-1">
                <textarea
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  rows={2}
                  placeholder="Write a reply..."
                  className="input-field resize-none text-sm"
                />
                <div className="mt-2 flex justify-end">
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
      <Card className={isPending ? 'border-brand-200' : ''}>
        <CardBody className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-ink-900">Decision</p>
            <p className="text-xs text-ink-400">
              {isPending
                ? 'Approve or request changes for this topic submission.'
                : 'A decision has already been made on this version.'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={onNavigateToLogBook}>
              Open log book
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={onRequestChanges}
              disabled={!isPending}
            >
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

function TopicField({ label, content }: { label: string; content: string }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">{label}</p>
      <p className="mt-1 text-sm text-ink-700 leading-relaxed">{content}</p>
    </div>
  );
}
