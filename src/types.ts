export type PipelineStage =
  | 'registered'
  | 'mentor_assigned'
  | 'topic_approved'
  | 'github_connected';

export type TopicStatus = 'pending' | 'approved' | 'changes_requested';

export type MilestoneStatus = 'complete' | 'incomplete';

export type Mentor = {
  id: string;
  name: string;
  domain: string;
  focus: string;
  capacity: number;
  currentLoad: number;
  bio: string;
  pastProjects: string[];
  avatarColor: string;
};

export type GroupMember = {
  id: string;
  name: string;
  rollNumber: string;
  email: string;
  elective: string;
};

export type Notification = {
  id: string;
  title: string;
  body: string;
  time: string;
  read: boolean;
  type: 'info' | 'success' | 'warning';
};

export type ActivityItem = {
  id: string;
  action: string;
  actor: string;
  time: string;
  icon: string;
};

export type Deadline = {
  id: string;
  title: string;
  date: string;
  daysLeft: number;
  page: string;
};

export type TopicVersion = {
  version: number;
  submittedAt: string;
  status: TopicStatus;
  feedback?: string;
};

export type DiscussionMessage = {
  id: string;
  author: string;
  role: string;
  avatarColor: string;
  body: string;
  time: string;
};

export type Milestone = {
  id: string;
  number: number;
  title: string;
  dueDate: string;
  status: MilestoneStatus;
  checkInNote?: string;
  checkedInAt?: string;
};

export type LogBookEntry = {
  id: string;
  entryNumber: number;
  date: string;
  lastEditedAt: string;
  attendance: { name: string; present: boolean }[];
  pointsDiscussed: string;
  mentorSuggestions: string;
  remarks: string;
  editHistory?: {
    editedAt: string;
    pointsDiscussed: string;
    mentorSuggestions: string;
    remarks: string;
  }[];
};

export type ElectiveOption = {
  id: string;
  label: string;
  code: string;
};

export type ShortlistEntry = {
  mentorId: string;
  rank: number;
};

export type ShortlistSubmission = {
  round: 1 | 2;
  entries: ShortlistEntry[];
  submittedAt: string;
};
