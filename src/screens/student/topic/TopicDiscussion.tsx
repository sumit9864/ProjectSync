import { Avatar, Badge, Button, Card, CardBody, CardHeader } from '@/components/ui/ui';
import { MessageSquare, Send } from 'lucide-react';

export type DiscussionMessage = {
  id: string;
  author: string;
  role: string;
  avatarColor: string;
  body: string;
  time: string;
};

type Props = {
  messages: DiscussionMessage[];
  reply: string;
  mentorName: string;
  currentUser: { name: string; avatarColor: string };
  onReplyChange: (v: string) => void;
  onPostReply: () => void;
};

/**
 * Discussion thread card — renders message bubbles and a reply box.
 * Used by both student TopicStudio and mentor ReviewQueue.
 */
export function TopicDiscussion({
  messages,
  reply,
  mentorName,
  currentUser,
  onReplyChange,
  onPostReply,
}: Props) {
  return (
    <Card>
      <CardHeader
        title="Discussion"
        subtitle={`Conversation with ${mentorName}`}
        action={
          <Badge color="brand">
            <MessageSquare className="h-3.5 w-3.5" />
            {messages.length} messages
          </Badge>
        }
      />
      <CardBody className="space-y-4 bg-gradient-to-b from-ink-50/50 to-white dark:from-ink-950/40 dark:to-ink-900">
        <div className="space-y-4 rounded-xl border border-ink-100/80 bg-white/70 p-4 dark:border-ink-800 dark:bg-ink-900/50">
          {messages.map((msg) => {
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
                    className={`relative px-4 py-2.5 text-sm leading-relaxed shadow-sm ${
                      isStudent
                        ? 'rounded-2xl rounded-br-sm bg-brand-600 text-white dark:bg-brand-700'
                        : 'rounded-2xl rounded-bl-sm border border-ink-100 bg-ink-50 text-ink-700 dark:border-ink-700 dark:bg-ink-800 dark:text-ink-200'
                    }`}
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
          <div className="flex items-start gap-3">
            <Avatar name={currentUser.name} color={currentUser.avatarColor} size="sm" />
            <div className="flex-1">
              <textarea
                value={reply}
                onChange={(e) => onReplyChange(e.target.value)}
                rows={2}
                placeholder="Write a reply..."
                className="input-field resize-none text-sm"
              />
              <div className="mt-2 flex justify-end">
                <Button size="sm" onClick={onPostReply} disabled={!reply.trim()}>
                  <Send className="h-3.5 w-3.5" />
                  Post reply
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
