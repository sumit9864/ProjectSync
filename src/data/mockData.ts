import type {
  Mentor,
  GroupMember,
  Notification,
  ActivityItem,
  Deadline,
  TopicVersion,
  DiscussionMessage,
  Milestone,
  LogBookEntry,
  ElectiveOption,
} from '@/types';

export const electives: ElectiveOption[] = [
  { id: 'ai', label: 'Artificial Intelligence', code: 'CS701' },
  { id: 'ml', label: 'Machine Learning & Data Science', code: 'CS702' },
  { id: 'web', label: 'Web & Mobile Application Dev', code: 'CS703' },
  { id: 'iot', label: 'Internet of Things & Embedded', code: 'CS704' },
  { id: 'cloud', label: 'Cloud & Distributed Systems', code: 'CS705' },
  { id: 'cyber', label: 'Cybersecurity & Cryptography', code: 'CS706' },
];

export const currentUser = {
  name: 'Aarav Sharma',
  email: 'aarav.sharma@university.edu',
  rollNumber: 'CS21B1042',
  role: 'Student',
  elective: 'Machine Learning & Data Science',
  avatarColor: 'bg-brand-600',
};

export const teamMembers: GroupMember[] = [
  {
    id: 'm1',
    name: 'Aarav Sharma',
    rollNumber: 'CS21B1042',
    email: 'aarav.sharma@university.edu',
    elective: 'Machine Learning & Data Science',
  },
  {
    id: 'm2',
    name: 'Priya Nair',
    rollNumber: 'CS21B1055',
    email: 'priya.nair@university.edu',
    elective: 'Machine Learning & Data Science',
  },
  {
    id: 'm3',
    name: 'Rohan Kapoor',
    rollNumber: 'CS21B1067',
    email: 'rohan.kapoor@university.edu',
    elective: 'Machine Learning & Data Science',
  },
];

export const groupName = 'Neural Knights';
export const groupDescription =
  'A transformer-based early-warning system for cardiovascular anomalies using wearable ECG data.';

export const pipelineStages = [
  { key: 'registered', label: 'Registered', order: 0 },
  { key: 'mentor_assigned', label: 'Mentor Assigned', order: 1 },
  { key: 'topic_approved', label: 'Topic Approved', order: 2 },
  { key: 'github_connected', label: 'GitHub Connected', order: 3 },
] as const;

export const completedStages: string[] = ['registered', 'mentor_assigned'];

export const projectProgress = 62;
export const groupHealth = 'Good';

export const assignedMentor = {
  name: 'Dr. Eliza Mathews',
  domain: 'Applied Machine Learning',
  focus: 'Time-series anomaly detection in health-tech',
  avatarColor: 'bg-brand-600',
};

export const nextDeadline = {
  title: 'Mentor Preference Round 1 Submission',
  date: 'Oct 3, 2026',
  daysLeft: 6,
};

export const notifications: Notification[] = [
  {
    id: 'n1',
    title: 'Mentor assigned',
    body: 'Dr. Eliza Mathews has been assigned as your project mentor.',
    time: '2h ago',
    read: false,
    type: 'success',
  },
  {
    id: 'n2',
    title: 'Round 1 deadline approaching',
    body: 'Your mentor preference shortlist is due in 6 days.',
    time: '5h ago',
    read: false,
    type: 'warning',
  },
  {
    id: 'n3',
    title: 'Group registration confirmed',
    body: 'Group "Neural Knights" is now officially registered.',
    time: '1d ago',
    read: false,
    type: 'info',
  },
  {
    id: 'n4',
    title: 'Welcome to ProjectSync',
    body: 'Your final-year project workspace is ready. Start by completing your group registration.',
    time: '3d ago',
    read: true,
    type: 'info',
  },
];

export const recentActivity: ActivityItem[] = [
  {
    id: 'a1',
    action: 'was assigned as your mentor',
    actor: 'Dr. Eliza Mathews',
    time: '2 hours ago',
    icon: 'user-check',
  },
  {
    id: 'a2',
    action: 'updated the group description',
    actor: 'Priya Nair',
    time: '1 day ago',
    icon: 'edit',
  },
  {
    id: 'a3',
    action: 'submitted mentor preferences for Round 1',
    actor: 'You',
    time: '2 days ago',
    icon: 'list',
  },
  {
    id: 'a4',
    action: 'confirmed group registration',
    actor: 'You',
    time: '3 days ago',
    icon: 'check-circle',
  },
  {
    id: 'a5',
    action: 'created the group "Neural Knights"',
    actor: 'Aarav Sharma',
    time: '4 days ago',
    icon: 'users',
  },
];

export const upcomingDeadlines: Deadline[] = [
  {
    id: 'd1',
    title: 'Mentor Preference Round 1',
    date: 'Oct 3, 2026',
    daysLeft: 6,
    page: 'preferences',
  },
  {
    id: 'd2',
    title: 'Topic Studio Submission',
    date: 'Oct 14, 2026',
    daysLeft: 17,
    page: 'topic',
  },
  {
    id: 'd3',
    title: 'Milestone 1: Literature Review',
    date: 'Oct 22, 2026',
    daysLeft: 25,
    page: 'milestones',
  },
  {
    id: 'd4',
    title: 'GitHub Repo Connection',
    date: 'Oct 30, 2026',
    daysLeft: 33,
    page: 'github',
  },
];

export const mentors: Mentor[] = [
  {
    id: 'mentor-1',
    name: 'Dr. Eliza Mathews',
    domain: 'Applied Machine Learning',
    focus: 'Time-series anomaly detection in health-tech',
    capacity: 6,
    currentLoad: 4,
    bio: 'Associate Professor with 12 years of experience in clinical ML. Has guided 30+ undergraduate projects spanning predictive diagnostics, wearable sensor analytics, and edge-deployed neural networks.',
    pastProjects: [
      'Real-time seizure detection via EEG transformer',
      'Federated learning for cross-hospital patient risk scoring',
      'Edge-deployed arrhythmia classifier on smartwatch ECG',
      'GAN-based synthetic ECG data generation for rare conditions',
      'Multi-modal sleep stage classifier using PPG + accelerometer',
    ],
    avatarColor: 'bg-brand-600',
  },
  {
    id: 'mentor-2',
    name: 'Dr. Vikram Reddy',
    domain: 'Natural Language Processing',
    focus: 'Low-resource language models & retrieval-augmented generation',
    capacity: 5,
    currentLoad: 3,
    bio: 'Associate Professor researching efficient LLMs for Indic languages. Industry consultant for two NLP startups. Has supervised 25+ final-year projects on retrieval, summarization, and dialogue systems.',
    pastProjects: [
      'Indic-language legal document summarizer',
      'RAG pipeline for university admission FAQs',
      'Code-switched sentiment analysis for social media',
      'Efficient BERT distillation for mobile deployment',
    ],
    avatarColor: 'bg-sky-600',
  },
  {
    id: 'mentor-3',
    name: 'Prof. Sarah Chen',
    domain: 'Computer Vision',
    focus: 'Medical imaging & autonomous perception',
    capacity: 4,
    currentLoad: 4,
    bio: 'Professor specializing in deep learning for visual perception. Previously a research scientist at a leading AV company. Guides projects on segmentation, detection, and multimodal fusion.',
    pastProjects: [
      'Retinal disease grading from fundus images',
      'Real-time lane detection for low-compute vehicles',
      '3D point-cloud segmentation for warehouse robotics',
      'Few-shot defect detection in manufacturing lines',
    ],
    avatarColor: 'bg-violet-600',
  },
  {
    id: 'mentor-4',
    name: 'Dr. Arjun Patel',
    domain: 'Cloud & Distributed Systems',
    focus: 'Serverless orchestration & edge computing',
    capacity: 6,
    currentLoad: 2,
    bio: 'Assistant Professor working on serverless platforms and edge-cloud continua. Former cloud architect at a major hyperscaler. Mentors projects on orchestration, observability, and cost optimization.',
    pastProjects: [
      'Serverless video transcoding pipeline',
      'Edge-cloud collaborative inference for IoT cameras',
      'Cost-aware autoscaler for multi-cloud deployments',
      'Distributed tracing framework for serverless apps',
    ],
    avatarColor: 'bg-amber-600',
  },
  {
    id: 'mentor-5',
    name: 'Dr. Meera Iyer',
    domain: 'Cybersecurity',
    focus: 'Adversarial ML & privacy-preserving systems',
    capacity: 5,
    currentLoad: 3,
    bio: 'Associate Professor researching adversarial robustness and differential privacy. PhD from a top security lab. Guides projects on model security, secure multiparty computation, and threat detection.',
    pastProjects: [
      'Adversarial-robust malware classifier',
      'Differentially-private federated training framework',
      'Membership-inference attack benchmark toolkit',
      'Hardware-rooted attestation for edge ML inference',
    ],
    avatarColor: 'bg-rose-600',
  },
  {
    id: 'mentor-6',
    name: 'Dr. James OConnor',
    domain: 'Internet of Things',
    focus: 'Sensor fusion & smart-environment systems',
    capacity: 5,
    currentLoad: 5,
    bio: 'Associate Professor specializing in IoT architectures and sensor fusion. Collaborates with the campus smart-city initiative. Guides projects on edge analytics, protocol design, and energy-harvesting devices.',
    pastProjects: [
      'Campue-wide occupancy sensing network',
      'Energy-harvesting smart parking sensor',
      'Federated anomaly detection across IoT gateways',
      'BLE-based indoor localization with adaptive beacons',
    ],
    avatarColor: 'bg-emerald-600',
  },
  {
    id: 'mentor-7',
    name: 'Dr. Fatima Al-Zahra',
    domain: 'Human-Computer Interaction',
    focus: 'Accessible interfaces & voice-first design',
    capacity: 4,
    currentLoad: 1,
    bio: 'Assistant Professor researching accessible computing and voice interfaces. Has guided 20+ projects on screen-reader compatibility, voice assistants, and inclusive design tooling.',
    pastProjects: [
      'Voice-first navigation app for visually impaired users',
      'Accessible math equation editor for screen readers',
      'Gesture-based interface for motor-impaired users',
      'Low-literacy voice assistant for rural health info',
    ],
    avatarColor: 'bg-cyan-600',
  },
  {
    id: 'mentor-8',
    name: 'Dr. Ken Watanabe',
    domain: 'Blockchain & Web3',
    focus: 'Consensus protocols & decentralized identity',
    capacity: 4,
    currentLoad: 2,
    bio: 'Associate Professor working on consensus algorithms and decentralized identity. Industry advisor to a blockchain startup. Guides projects on L2 scaling, zero-knowledge proofs, and credential systems.',
    pastProjects: [
      'ZK-proof-based university credential verifier',
      'L2 rollup gas optimization study',
      'Decentralized academic publishing prototype',
      'Cross-chain bridge security analyzer',
    ],
    avatarColor: 'bg-indigo-600',
  },
];

export const topicVersions: TopicVersion[] = [
  {
    version: 2,
    submittedAt: 'Sep 25, 2026 · 4:30 PM',
    status: 'changes_requested',
    feedback: 'Strengthen the feasibility section — specify dataset size and compute requirements. Also clarify how your approach differs from the 2024 JHU arrhythmia paper.',
  },
  {
    version: 1,
    submittedAt: 'Sep 18, 2026 · 11:15 AM',
    status: 'changes_requested',
    feedback: 'Problem statement is too broad. Narrow it to a specific cardiovascular condition and target population.',
  },
];

export const topicDraft = {
  workingTitle: 'Transformer-Based Early Warning System for Atrial Fibrillation using Wearable ECG',
  existingWork:
    'Prior work includes the 2024 JHU arrhythmia benchmark (CNN-based, 12-lead), the PhysioNet AF Challenge winner (LSTM, lead I), and two consumer-app approaches from Apple Watch and Fitbit studies. All focus on post-hoc detection rather than real-time on-device early warning.',
  problemIdentified:
    'Existing wearable ECG monitors detect atrial fibrillation only after sustained episodes (30+ seconds), missing brief paroxysmal AF that carries significant stroke risk. There is no lightweight, on-device system that flags pre-emptive waveform anomalies in real time.',
  proposedDifference:
    'We propose a sliding-window transformer that runs on-device with <100ms inference latency, detecting sub-30-second AF precursors rather than confirming sustained episodes. Unlike CNN/LSTM baselines, the attention mechanism captures long-range temporal dependencies across the full 30-second context window without recurrent bottlenecks.',
  innovation:
    'A two-stage architecture: (1) a lightweight feature extractor distillation from a large teacher model, enabling on-device inference, and (2) an uncertainty-aware alerting layer that suppresses false positives during motion artifact by quantifying prediction confidence.',
  feasibility:
    'Dataset: MIT-BIH AFDB (25 patients, 100k+ beats) plus PhysioNet 2017 Challenge data (8,528 recordings). Compute: training on a single A100 GPU (available via lab allocation), inference benchmarked on Cortex-M4. Timeline: data prep (2 weeks), model (3 weeks), on-device port (2 weeks), evaluation (1 week). Team has PyTorch and embedded-C experience.',
};

export const discussionMessages: DiscussionMessage[] = [
  {
    id: 'msg1',
    author: 'Dr. Eliza Mathews',
    role: 'Mentor',
    avatarColor: 'bg-brand-600',
    body: 'Good progress on v2. The innovation section is much clearer now. One request: can you add a concrete false-positive rate target for the uncertainty-aware layer? Even a rough number helps me gauge whether this is realistic for the timeline.',
    time: 'Sep 26, 2026 · 10:20 AM',
  },
  {
    id: 'msg2',
    author: 'Aarav Sharma',
    role: 'Student',
    avatarColor: 'bg-brand-600',
    body: 'Thank you! We are targeting <2 false alerts per 24-hour period based on the Stanford wearable study benchmark. I will add that to the feasibility section in v3.',
    time: 'Sep 26, 2026 · 2:45 PM',
  },
  {
    id: 'msg3',
    author: 'Dr. Eliza Mathews',
    role: 'Mentor',
    avatarColor: 'bg-brand-600',
    body: 'That benchmark is a great anchor. Also please mention how you will handle class imbalance in the training set — SMOTE, focal loss, or something else?',
    time: 'Sep 27, 2026 · 9:00 AM',
  },
];

export const milestones: Milestone[] = [
  {
    id: 'ms1',
    number: 1,
    title: 'Literature Review & Problem Statement',
    dueDate: 'Oct 22, 2026',
    status: 'incomplete',
  },
  {
    id: 'ms2',
    number: 2,
    title: 'System Design & Architecture Document',
    dueDate: 'Nov 15, 2026',
    status: 'incomplete',
  },
  {
    id: 'ms3',
    number: 3,
    title: 'Prototype Implementation & Mid-Review',
    dueDate: 'Jan 18, 2027',
    status: 'incomplete',
  },
  {
    id: 'ms4',
    number: 4,
    title: 'Final Evaluation & Demo',
    dueDate: 'Mar 30, 2027',
    status: 'incomplete',
  },
];

export const logBookEntries: LogBookEntry[] = [
  {
    id: 'lb1',
    entryNumber: 3,
    date: 'Sep 24, 2026',
    lastEditedAt: 'Sep 25, 2026 · 3:10 PM',
    attendance: [
      { name: 'Aarav Sharma', present: true },
      { name: 'Priya Nair', present: true },
      { name: 'Rohan Kapoor', present: false },
    ],
    pointsDiscussed:
      'Reviewed v2 topic draft. Discussed narrowing the problem to atrial fibrillation specifically. Explored using MIT-BIH AFDB as primary dataset. Considered on-device inference constraints and model distillation strategy.',
    mentorSuggestions:
      'Add a concrete false-positive rate target. Clarify the distinction between your approach and the JHU benchmark. Include class imbalance handling strategy. Consider focal loss over SMOTE given the temporal nature of ECG data.',
    remarks:
      'Strong direction. Topic is close to approval — one more revision incorporating the above should be ready for sign-off.',
    editHistory: [
      {
        editedAt: 'Sep 24, 2026 · 5:00 PM',
        pointsDiscussed:
          'Reviewed topic draft. Discussed the problem area and possible datasets.',
        mentorSuggestions:
          'Narrow the problem scope. Add more detail to the feasibility section.',
        remarks: 'Good start, needs more focus.',
      },
    ],
  },
  {
    id: 'lb2',
    entryNumber: 2,
    date: 'Sep 10, 2026',
    lastEditedAt: 'Sep 10, 2026 · 4:30 PM',
    attendance: [
      { name: 'Aarav Sharma', present: true },
      { name: 'Priya Nair', present: true },
      { name: 'Rohan Kapoor', present: true },
    ],
    pointsDiscussed:
      'Initial mentor introduction meeting. Discussed team interests in health-tech ML. Reviewed the elective syllabus alignment. Explored three potential project directions: ECG monitoring, sleep staging, and medication adherence.',
    mentorSuggestions:
      'ECG monitoring has the strongest novelty and feasibility combination. Begin literature survey of transformer-based approaches for time-series medical data. Prepare a one-page problem statement for the next session.',
    remarks: 'Enthusiastic team. Good mix of ML and systems skills. Next session: bring a draft problem statement.',
  },
  {
    id: 'lb3',
    entryNumber: 1,
    date: 'Aug 28, 2026',
    lastEditedAt: 'Aug 28, 2026 · 2:00 PM',
    attendance: [
      { name: 'Aarav Sharma', present: true },
      { name: 'Priya Nair', present: true },
      { name: 'Rohan Kapoor', present: true },
    ],
    pointsDiscussed:
      'Kickoff meeting. Introduced the FYPM workflow, timeline, and milestone expectations. Discussed the mentor preference process and topic submission cycle.',
    mentorSuggestions:
      'Use Round 1 preferences strategically — rank mentors whose domain aligns with your top project idea. Don not wait until the deadline to submit.',
    remarks: 'Welcome aboard. Looking forward to working with the team this year.',
  },
];

export const githubRepo = {
  url: 'https://github.com/neural-knights/afib-early-warning',
  lastUpdated: 'Sep 26, 2026 · 8:15 PM',
  connected: true,
};

export const registrationWindow = {
  open: true,
  closesOn: 'Oct 10, 2026 · 11:59 PM',
};
