import { useState, useRef, useEffect } from 'react';
import { Lock } from 'lucide-react';
import { Badge, PageHeader, Skeleton } from '@/components/ui/ui';
import { useToast } from '@/components/ui/Toast';
import {
  topicDraft,
  topicVersions,
  discussionMessages as initialMessages,
  currentUser,
  assignedMentor,
} from '@/data/mockData';
import type { TopicStatus } from '@/types';
import { TopicForm } from './topic/TopicForm';
import { TopicDiscussion } from './topic/TopicDiscussion';
import { TopicVersionHistory } from './topic/TopicVersionHistory';

export function TopicStudioPage() {
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState(topicDraft);
  const [savedDraft, setSavedDraft] = useState(topicDraft);
  const [isApproved] = useState(false);
  const [currentStatus] = useState<TopicStatus>('changes_requested');
  const [messages, setMessages] = useState(initialMessages);
  const [reply, setReply] = useState('');
  const [versions, setVersions] = useState(topicVersions);
  const [submitting, setSubmitting] = useState(false);
  const { showToast } = useToast();
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(t);
  }, []);

  const hasUnsavedChanges = JSON.stringify(draft) !== JSON.stringify(savedDraft);

  // Auto-save indicator
  useEffect(() => {
    if (!hasUnsavedChanges) return;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      setSavedDraft(draft);
      showToast('All changes saved', 'success');
    }, 2000);
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [draft]); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-40 rounded-md" />
        <Skeleton className="h-24 w-full rounded-xl" />
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    );
  }

  const updateField = (field: keyof typeof draft, value: string) => {
    setDraft((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    setSubmitting(true);
    setTimeout(() => {
      const now = new Date();
      const newVersion = {
        version: versions.length + 1,
        submittedAt:
          now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) +
          ' · ' +
          now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
        status: 'pending' as TopicStatus,
      };
      setVersions((prev) => [newVersion, ...prev]);
      setSubmitting(false);
      showToast('Topic v' + newVersion.version + ' submitted for review.', 'success');
    }, 800);
  };

  const handleReply = () => {
    if (!reply.trim()) return;
    const now = new Date();
    setMessages((prev) => [
      ...prev,
      {
        id: `msg-${Date.now()}`,
        author: currentUser.name,
        role: 'Student',
        avatarColor: currentUser.avatarColor,
        body: reply.trim(),
        time:
          now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) +
          ' · ' +
          now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
      },
    ]);
    setReply('');
    showToast('Reply posted.', 'success');
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <PageHeader
          title="Topic Studio"
          subtitle="Define, refine, and submit your project topic for mentor approval."
        />
        {isApproved && (
          <Badge color="success">
            <Lock className="h-3.5 w-3.5" />
            Approved (read-only)
          </Badge>
        )}
      </div>

      <TopicForm
        draft={draft}
        savedDraft={savedDraft}
        isApproved={isApproved}
        currentStatus={currentStatus}
        versions={versions}
        submitting={submitting}
        hasUnsavedChanges={hasUnsavedChanges}
        onUpdateField={updateField}
        onRevert={() => {
          setDraft(savedDraft);
          showToast('Reverted to last saved version.', 'info');
        }}
        onSubmit={handleSubmit}
      />

      <TopicVersionHistory versions={versions} />

      <TopicDiscussion
        messages={messages}
        reply={reply}
        mentorName={assignedMentor.name}
        currentUser={currentUser}
        onReplyChange={setReply}
        onPostReply={handleReply}
      />
    </div>
  );
}
