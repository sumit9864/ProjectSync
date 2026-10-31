import { useState, useEffect } from 'react';
import { Check, ClipboardCheck, XCircle } from 'lucide-react';
import {
  Card,
  Button,
  Badge,
  CardBody,
  EmptyState,
  PageHeader,
  Skeleton,
} from '@/components/ui/ui';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useToast } from '@/components/ui/Toast';
import { apiGet, apiPost } from '@/lib/apiClient';
import { ReviewGroupList } from './review/ReviewGroupList';
import { ReviewDetail } from './review/ReviewDetail';

type MentorGroup = {
  id: string; projectId: string; name: string; status: string;
  members: { id: string; name: string; rollNumber: string; email: string }[];
  milestones: { id: string; status: string }[];
  topicVersions: { version: number; status: string; submittedAt: string; feedback?: string; fields?: any }[];
  discussion: { id: string; author: string; role: string; avatarColor: string; body: string; time: string }[];
  topicDraft: any;
  daysSinceLastActivity?: number;
};

export function MentorReviewQueuePage({
  preselectedGroupId,
  onNavigateToLogBook,
}: {
  preselectedGroupId?: string | null;
  onNavigateToLogBook: (groupId: string) => void;
}) {
  const [loading, setLoading] = useState(true);
  const [groups, setGroups] = useState<MentorGroup[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(preselectedGroupId ?? null);
  const [reply, setReply] = useState('');
  const [bulkSelected, setBulkSelected] = useState<Set<string>>(new Set());
  const [confirmAction, setConfirmAction] = useState<{
    type: 'approve' | 'reject' | 'bulk_approve' | 'bulk_reject';
    groupId?: string;
  } | null>(null);
  const [feedbackText, setFeedbackText] = useState('');
  const { showToast } = useToast();

  useEffect(() => {
    apiGet<{ groups: MentorGroup[] }>('/api/mentor/groups')
      .then(({ groups }) => {
        setGroups(groups);
        if (!preselectedGroupId && groups.length > 0) {
          setSelectedId(groups[0].id);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

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
          status: newStatus === 'approved' ? 'topic_approved' : 'topic_changes_requested',
        };
      })
    );
  };

  const addReply = async (groupId: string) => {
    if (!reply.trim()) return;
    try {
      const { message } = await apiPost<{ message: any }>(
        `/api/mentor/groups/${groupId}/discussion`,
        { body: reply.trim() }
      );
      setGroups((prev) =>
        prev.map((g) =>
          g.id === groupId ? { ...g, discussion: [...(g.discussion ?? []), message] } : g
        )
      );
      setReply('');
      showToast('Reply posted.', 'success');
    } catch {
      showToast('Failed to post reply.', 'error');
    }
  };

  const toggleBulkSelect = (groupId: string) => {
    setBulkSelected((prev) => {
      const next = new Set(prev);
      if (next.has(groupId)) next.delete(groupId);
      else next.add(groupId);
      return next;
    });
  };

  const handleConfirmAction = async () => {
    if (!confirmAction) return;
    const { type, groupId } = confirmAction;

    try {
      if (type === 'approve' && groupId) {
        await apiPost(`/api/mentor/groups/${groupId}/topic/decision`, {
          decision: 'approved', feedback: feedbackText || undefined,
        });
        updateGroupTopicStatus(groupId, 'approved', feedbackText || undefined);
        showToast('Topic approved.', 'success');
      } else if (type === 'reject' && groupId) {
        if (!feedbackText.trim()) {
          showToast('Please provide feedback when requesting changes.', 'error');
          return;
        }
        await apiPost(`/api/mentor/groups/${groupId}/topic/decision`, {
          decision: 'changes_requested', feedback: feedbackText,
        });
        updateGroupTopicStatus(groupId, 'changes_requested', feedbackText);
        showToast('Changes requested with feedback.', 'success');
      } else if (type === 'bulk_approve') {
        const ids = [...bulkSelected];
        await apiPost('/api/mentor/bulk-decision', { groupIds: ids, decision: 'approved', feedback: feedbackText || undefined });
        ids.forEach((id) => updateGroupTopicStatus(id, 'approved'));
        showToast(`Approved ${bulkSelected.size} topics.`, 'success');
        setBulkSelected(new Set());
      } else if (type === 'bulk_reject') {
        if (!feedbackText.trim()) {
          showToast('Please provide feedback for the requested changes.', 'error');
          return;
        }
        const ids = [...bulkSelected];
        await apiPost('/api/mentor/bulk-decision', { groupIds: ids, decision: 'changes_requested', feedback: feedbackText });
        ids.forEach((id) => updateGroupTopicStatus(id, 'changes_requested', feedbackText));
        showToast(`Requested changes for ${bulkSelected.size} topics.`, 'success');
        setBulkSelected(new Set());
      }
    } catch {
      showToast('Action failed. Please try again.', 'error');
    }

    setConfirmAction(null);
    setFeedbackText('');
  };

  return (
    <div className="animate-fade-in space-y-4">
      <PageHeader
        title="Review Queue"
        subtitle="Review pending topic submissions and provide decisions."
      />

      {/* Bulk action bar */}
      {pendingGroups.length > 0 && (
        <Card
          className={
            bulkSelected.size > 0
              ? 'border-brand-200 bg-brand-50/40 dark:border-brand-800/60 dark:bg-brand-950/30'
              : ''
          }
        >
          <CardBody className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <ClipboardCheck className="h-5 w-5 text-brand-600 dark:text-brand-400" />
              <p className="text-sm text-ink-700 dark:text-ink-300">
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
                <Button size="sm" onClick={() => setConfirmAction({ type: 'bulk_approve' })}>
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
          <ReviewGroupList
            groups={groups}
            selectedId={selectedId}
            bulkSelected={bulkSelected}
            onSelect={setSelectedId}
            onToggleBulk={toggleBulkSelect}
          />
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
