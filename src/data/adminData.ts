import type { Notification } from '@/types';

export const MAX_MENTOR_GROUPS = 3;

export const adminUser = {
  name: 'Dr. Priya Krishnan',
  email: 'priya.krishnan@university.edu',
  role: 'Administrator',
  avatarColor: 'bg-violet-600',
};

export type AdminPipelineStage =
  | 'awaiting_allocation'
  | 'mentor_assigned'
  | 'topic_review'
  | 'building';

export type AdminGroup = {
  id: string;
  projectId: string;
  name: string;
  memberCount: number;
  elective: string;
  mentorId: string | null;
  mentorName: string | null;
  topicStatus: 'none' | 'pending' | 'approved' | 'changes_requested';
  githubConnected: boolean;
  stage: AdminPipelineStage;
  preferences: { mentorId: string; rank: number }[];
};

export type AdminMentor = {
  id: string;
  name: string;
  domain: string;
  email: string;
  capacity: number;
  currentLoad: number;
  avatarColor: string;
};

export type AuditEvent = {
  id: string;
  timestamp: string;
  description: string;
  actor: string;
  group: string;
};

export type ArchiveEntry = {
  id: string;
  year: string;
  title: string;
  group: string;
  elective: string;
  abstract: string;
  mentor: string;
  grade: string;
};

export type AllocationResult = {
  groupId: string;
  groupName: string;
  projectId: string;
  matchedRank: number | null;
  matchedMentorId: string | null;
  matchedMentorName: string | null;
  status: 'assigned' | 'unassigned';
  reason: string;
};

export type AllocationHistoryEntry = {
  id: string;
  round: number;
  runAt: string;
  assigned: number;
  unassigned: number;
  runBy: string;
};

export type Extension = {
  id: string;
  groupId: string;
  groupName: string;
  offsetDays: number;
  reason: string;
  grantedAt: string;
  grantedBy: string;
};

export type AdminNotification = Notification;

export const pipelineStageLabels: Record<AdminPipelineStage, string> = {
  awaiting_allocation: 'Awaiting Allocation',
  mentor_assigned: 'Mentor Assigned',
  topic_review: 'Topic Review',
  building: 'Building',
};

export const topicStatusLabel: Record<AdminGroup['topicStatus'], string> = {
  none: 'Not Submitted',
  pending: 'Pending Review',
  approved: 'Approved',
  changes_requested: 'Changes Requested',
};

export const adminMentors: AdminMentor[] = [
  { id: 'mentor-1', name: 'Dr. Eliza Mathews', domain: 'Applied Machine Learning', email: 'eliza.mathews@university.edu', capacity: 3, currentLoad: 2, avatarColor: 'bg-brand-600' },
  { id: 'mentor-2', name: 'Dr. Vikram Reddy', domain: 'Natural Language Processing', email: 'vikram.reddy@university.edu', capacity: 3, currentLoad: 2, avatarColor: 'bg-sky-600' },
  { id: 'mentor-3', name: 'Prof. Sarah Chen', domain: 'Computer Vision', email: 'sarah.chen@university.edu', capacity: 3, currentLoad: 1, avatarColor: 'bg-violet-600' },
  { id: 'mentor-4', name: 'Dr. Arjun Patel', domain: 'Cloud & Distributed Systems', email: 'arjun.patel@university.edu', capacity: 3, currentLoad: 1, avatarColor: 'bg-amber-600' },
  { id: 'mentor-5', name: 'Dr. Meera Iyer', domain: 'Cybersecurity', email: 'meera.iyer@university.edu', capacity: 3, currentLoad: 2, avatarColor: 'bg-rose-600' },
  { id: 'mentor-6', name: 'Dr. James OConnor', domain: 'Internet of Things', email: 'james.oconnor@university.edu', capacity: 3, currentLoad: 1, avatarColor: 'bg-emerald-600' },
  { id: 'mentor-7', name: 'Dr. Fatima Al-Zahra', domain: 'Human-Computer Interaction', email: 'fatima.alzahra@university.edu', capacity: 3, currentLoad: 1, avatarColor: 'bg-cyan-600' },
  { id: 'mentor-8', name: 'Dr. Ken Watanabe', domain: 'Blockchain & Web3', email: 'ken.watanabe@university.edu', capacity: 3, currentLoad: 2, avatarColor: 'bg-indigo-600' },
];

export const adminGroups: AdminGroup[] = [
  { id: 'g1', projectId: 'FYP-2026-014', name: 'Neural Knights', memberCount: 3, elective: 'Machine Learning & Data Science', mentorId: 'mentor-1', mentorName: 'Dr. Eliza Mathews', topicStatus: 'changes_requested', githubConnected: true, stage: 'topic_review', preferences: [{ mentorId: 'mentor-1', rank: 1 }, { mentorId: 'mentor-2', rank: 2 }, { mentorId: 'mentor-5', rank: 3 }] },
  { id: 'g2', projectId: 'FYP-2026-022', name: 'Data Dynamos', memberCount: 3, elective: 'Machine Learning & Data Science', mentorId: 'mentor-1', mentorName: 'Dr. Eliza Mathews', topicStatus: 'pending', githubConnected: false, stage: 'topic_review', preferences: [{ mentorId: 'mentor-1', rank: 1 }, { mentorId: 'mentor-3', rank: 2 }, { mentorId: 'mentor-5', rank: 3 }] },
  { id: 'g3', projectId: 'FYP-2026-031', name: 'Code Crafters', memberCount: 3, elective: 'Artificial Intelligence', mentorId: 'mentor-2', mentorName: 'Dr. Vikram Reddy', topicStatus: 'approved', githubConnected: true, stage: 'building', preferences: [{ mentorId: 'mentor-2', rank: 1 }, { mentorId: 'mentor-1', rank: 2 }, { mentorId: 'mentor-8', rank: 3 }] },
  { id: 'g4', projectId: 'FYP-2026-045', name: 'Vision Vanguards', memberCount: 2, elective: 'Computer Vision', mentorId: 'mentor-3', mentorName: 'Prof. Sarah Chen', topicStatus: 'pending', githubConnected: false, stage: 'topic_review', preferences: [{ mentorId: 'mentor-3', rank: 1 }, { mentorId: 'mentor-7', rank: 2 }] },
  { id: 'g5', projectId: 'FYP-2026-058', name: 'Cloud Pioneers', memberCount: 4, elective: 'Cloud & Distributed Systems', mentorId: 'mentor-4', mentorName: 'Dr. Arjun Patel', topicStatus: 'none', githubConnected: false, stage: 'mentor_assigned', preferences: [{ mentorId: 'mentor-4', rank: 1 }, { mentorId: 'mentor-8', rank: 2 }] },
  { id: 'g6', projectId: 'FYP-2026-067', name: 'Cyber Sentinels', memberCount: 3, elective: 'Cybersecurity & Cryptography', mentorId: 'mentor-5', mentorName: 'Dr. Meera Iyer', topicStatus: 'approved', githubConnected: true, stage: 'building', preferences: [{ mentorId: 'mentor-5', rank: 1 }, { mentorId: 'mentor-8', rank: 2 }] },
  { id: 'g7', projectId: 'FYP-2026-072', name: 'IoT Innovators', memberCount: 3, elective: 'Internet of Things & Embedded', mentorId: 'mentor-6', mentorName: 'Dr. James OConnor', topicStatus: 'changes_requested', githubConnected: false, stage: 'topic_review', preferences: [{ mentorId: 'mentor-6', rank: 1 }, { mentorId: 'mentor-4', rank: 2 }] },
  { id: 'g8', projectId: 'FYP-2026-081', name: 'Quantum Quill', memberCount: 3, elective: 'Artificial Intelligence', mentorId: null, mentorName: null, topicStatus: 'none', githubConnected: false, stage: 'awaiting_allocation', preferences: [{ mentorId: 'mentor-1', rank: 1 }, { mentorId: 'mentor-2', rank: 2 }, { mentorId: 'mentor-5', rank: 3 }] },
  { id: 'g9', projectId: 'FYP-2026-093', name: 'Pixel Forge', memberCount: 2, elective: 'Web & Mobile Application Dev', mentorId: null, mentorName: null, topicStatus: 'none', githubConnected: false, stage: 'awaiting_allocation', preferences: [{ mentorId: 'mentor-7', rank: 1 }, { mentorId: 'mentor-2', rank: 2 }] },
  { id: 'g10', projectId: 'FYP-2026-104', name: 'Data Miners', memberCount: 4, elective: 'Machine Learning & Data Science', mentorId: null, mentorName: null, topicStatus: 'none', githubConnected: false, stage: 'awaiting_allocation', preferences: [{ mentorId: 'mentor-1', rank: 1 }, { mentorId: 'mentor-3', rank: 2 }, { mentorId: 'mentor-2', rank: 3 }] },
  { id: 'g11', projectId: 'FYP-2026-119', name: 'Neural Ninjas', memberCount: 3, elective: 'Artificial Intelligence', mentorId: 'mentor-2', mentorName: 'Dr. Vikram Reddy', topicStatus: 'pending', githubConnected: false, stage: 'topic_review', preferences: [{ mentorId: 'mentor-2', rank: 1 }, { mentorId: 'mentor-1', rank: 2 }] },
  { id: 'g12', projectId: 'FYP-2026-127', name: 'Block Builders', memberCount: 3, elective: 'Blockchain & Web3', mentorId: 'mentor-8', mentorName: 'Dr. Ken Watanabe', topicStatus: 'approved', githubConnected: true, stage: 'building', preferences: [{ mentorId: 'mentor-8', rank: 1 }, { mentorId: 'mentor-5', rank: 2 }] },
  { id: 'g13', projectId: 'FYP-2026-138', name: 'Access Allies', memberCount: 3, elective: 'Web & Mobile Application Dev', mentorId: 'mentor-7', mentorName: 'Dr. Fatima Al-Zahra', topicStatus: 'none', githubConnected: false, stage: 'mentor_assigned', preferences: [{ mentorId: 'mentor-7', rank: 1 }, { mentorId: 'mentor-2', rank: 2 }] },
  { id: 'g14', projectId: 'FYP-2026-145', name: 'Edge Explorers', memberCount: 4, elective: 'Internet of Things & Embedded', mentorId: null, mentorName: null, topicStatus: 'none', githubConnected: false, stage: 'awaiting_allocation', preferences: [{ mentorId: 'mentor-6', rank: 1 }, { mentorId: 'mentor-4', rank: 2 }] },
  { id: 'g15', projectId: 'FYP-2026-156', name: 'Secure Scholars', memberCount: 3, elective: 'Cybersecurity & Cryptography', mentorId: 'mentor-5', mentorName: 'Dr. Meera Iyer', topicStatus: 'changes_requested', githubConnected: false, stage: 'topic_review', preferences: [{ mentorId: 'mentor-5', rank: 1 }, { mentorId: 'mentor-6', rank: 2 }] },
];

export const auditEvents: AuditEvent[] = [
  { id: 'ae1', timestamp: 'Sep 27, 2026 · 3:45 PM', description: 'Mentor preference Round 1 deadline auto-closed', actor: 'System', group: 'All groups' },
  { id: 'ae2', timestamp: 'Sep 27, 2026 · 2:10 PM', description: 'Manual mentor assignment: Dr. Arjun Patel assigned to Cloud Pioneers', actor: 'Dr. Priya Krishnan', group: 'Cloud Pioneers' },
  { id: 'ae3', timestamp: 'Sep 26, 2026 · 4:35 PM', description: 'Neural Knights submitted topic v2 for review', actor: 'Aarav Sharma', group: 'Neural Knights' },
  { id: 'ae4', timestamp: 'Sep 26, 2026 · 9:05 PM', description: 'Data Dynamos submitted topic v1 for review', actor: 'Sneha Gupta', group: 'Data Dynamos' },
  { id: 'ae5', timestamp: 'Sep 25, 2026 · 10:00 AM', description: 'Allocation Round 1 executed: 7 groups assigned, 3 unassigned', actor: 'Dr. Priya Krishnan', group: 'All groups' },
  { id: 'ae6', timestamp: 'Sep 24, 2026 · 3:10 PM', description: 'Dr. Eliza Mathews updated log book entry #3 for Neural Knights', actor: 'Dr. Eliza Mathews', group: 'Neural Knights' },
  { id: 'ae7', timestamp: 'Sep 23, 2026 · 6:00 PM', description: 'Vision Vanguards submitted topic v1 for review', actor: 'Riya Desai', group: 'Vision Vanguards' },
  { id: 'ae8', timestamp: 'Sep 22, 2026 · 1:00 PM', description: 'Extension granted to Code Crafters: +7 days (milestone 1)', actor: 'Dr. Priya Krishnan', group: 'Code Crafters' },
  { id: 'ae9', timestamp: 'Sep 21, 2026 · 9:30 AM', description: 'Topic v3 approved for Code Crafters by Dr. Eliza Mathews', actor: 'Dr. Eliza Mathews', group: 'Code Crafters' },
  { id: 'ae10', timestamp: 'Sep 20, 2026 · 5:00 PM', description: 'Registration window opened for FYP 2026', actor: 'Dr. Priya Krishnan', group: 'All groups' },
  { id: 'ae11', timestamp: 'Sep 18, 2026 · 11:15 AM', description: 'Neural Knights submitted topic v1 for review', actor: 'Aarav Sharma', group: 'Neural Knights' },
  { id: 'ae12', timestamp: 'Sep 15, 2026 · 9:00 AM', description: 'Mentor capacity updated: Dr. James OConnor set to 5', actor: 'Dr. Priya Krishnan', group: 'All groups' },
];

export const archiveEntries: ArchiveEntry[] = [
  { id: 'ar1', year: '2025', title: 'Real-Time Gesture Recognition for Sign Language Translation Using Depth Cameras', group: 'Sign Synth', elective: 'Computer Vision', abstract: 'A real-time sign language translation system using depth-sensing cameras and a lightweight temporal CNN. Achieved 92% accuracy on a 50-word Indian Sign Language vocabulary with sub-200ms latency.', mentor: 'Prof. Sarah Chen', grade: 'A' },
  { id: 'ar2', year: '2025', title: 'Federated Anomaly Detection across Distributed IoT Gateways', group: 'Edge Mesh', elective: 'Internet of Things & Embedded', abstract: 'A federated learning framework for detecting anomalies across heterogeneous IoT gateways without centralizing sensor data. Demonstrated on a campus-wide sensor network with 200+ nodes.', mentor: 'Dr. James OConnor', grade: 'A' },
  { id: 'ar3', year: '2025', title: 'ZK-Proof Based University Credential Verifier', group: 'Chain Scholars', elective: 'Blockchain & Web3', abstract: 'A decentralized credential verification system using zero-knowledge proofs on an L2 rollup. Enabled employers to verify degrees without accessing student records.', mentor: 'Dr. Ken Watanabe', grade: 'A-' },
  { id: 'ar4', year: '2025', title: 'Voice-First Navigation App for Visually Impaired Students', group: 'Echo Path', elective: 'Human-Computer Interaction', abstract: 'An indoor navigation app using Bluetooth beacons and voice-first interaction, designed for visually impaired students. Deployed across three campus buildings.', mentor: 'Dr. Fatima Al-Zahra', grade: 'A' },
  { id: 'ar5', year: '2024', title: 'Differentially Private Federated Training Framework for Healthcare Data', group: 'Privacy First', elective: 'Cybersecurity & Cryptography', abstract: 'A framework combining differential privacy with secure aggregation for federated model training on hospital data. Validated on MIMIC-III with minimal utility loss.', mentor: 'Dr. Meera Iyer', grade: 'A' },
  { id: 'ar6', year: '2024', title: 'Serverless Video Transcoding Pipeline with Cost-Aware Autoscaling', group: 'Cloud Stream', elective: 'Cloud & Distributed Systems', abstract: 'A serverless video transcoding pipeline with a cost-aware autoscaler that reduced cloud spend by 38% while maintaining SLA compliance for 4K streams.', mentor: 'Dr. Arjun Patel', grade: 'A+' },
  { id: 'ar7', year: '2024', title: 'Indic-Language Legal Document Summarizer with RAG', group: 'Legal Lens', elective: 'Natural Language Processing', abstract: 'A retrieval-augmented summarization pipeline for Indian legal documents across four Indic languages, with citation-grounded output linking every sentence to source passages.', mentor: 'Dr. Vikram Reddy', grade: 'A' },
  { id: 'ar8', year: '2024', title: 'Edge-Deployed Arrhythmia Classifier on Smartwatch ECG', group: 'Heart Beat', elective: 'Applied Machine Learning', abstract: 'An on-device arrhythmia classifier using model distillation, achieving 89% sensitivity on the MIT-BIH dataset with <50ms inference on a smartwatch MCU.', mentor: 'Dr. Eliza Mathews', grade: 'A+' },
];

export const allocationHistory: AllocationHistoryEntry[] = [
  { id: 'ah1', round: 1, runAt: 'Sep 25, 2026 · 10:00 AM', assigned: 7, unassigned: 3, runBy: 'Dr. Priya Krishnan' },
];

export const extensions: Extension[] = [
  { id: 'ext1', groupId: 'g3', groupName: 'Code Crafters', offsetDays: 7, reason: 'Waiting on external dataset access approval', grantedAt: 'Sep 22, 2026', grantedBy: 'Dr. Priya Krishnan' },
];

export const adminNotifications: AdminNotification[] = [
  { id: 'an1', title: 'Allocation needed', body: '3 groups are awaiting mentor allocation.', time: '2h ago', read: false, type: 'warning' },
  { id: 'an2', title: 'New registrations', body: '2 new groups registered in the last 24 hours.', time: '5h ago', read: false, type: 'info' },
  { id: 'an3', title: 'Extension requested', body: 'Code Crafters requested a milestone extension.', time: '1d ago', read: false, type: 'info' },
  { id: 'an4', title: 'Round 1 executed', body: 'Mentor allocation Round 1 completed: 7 assigned, 3 unassigned.', time: '2d ago', read: true, type: 'success' },
];

export const controlWindows = {
  registration: { open: true, closesOn: 'Oct 10, 2026 · 11:59 PM', opensOn: 'Sep 20, 2026 · 9:00 AM' },
  round1: { open: true, closesOn: 'Oct 3, 2026 · 11:59 PM', opensOn: 'Sep 20, 2026 · 9:00 AM' },
  round2: { open: false, closesOn: 'Oct 17, 2026 · 11:59 PM', opensOn: 'Oct 7, 2026 · 9:00 AM' },
};

