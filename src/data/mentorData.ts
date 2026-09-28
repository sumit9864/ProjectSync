import type {
  Notification,
  Milestone,
  LogBookEntry,
  DiscussionMessage,
} from '@/types';

export const mentorUser = {
  name: 'Dr. Eliza Mathews',
  email: 'eliza.mathews@university.edu',
  role: 'Mentor',
  domain: 'Applied Machine Learning',
  avatarColor: 'bg-brand-600',
};

export type TopicVersionMentor = {
  version: number;
  submittedAt: string;
  status: 'pending' | 'approved' | 'changes_requested';
  feedback?: string;
  fields: {
    workingTitle: string;
    existingWork: string;
    problemIdentified: string;
    proposedDifference: string;
    innovation: string;
    feasibility: string;
  };
};

export type MentorGroup = {
  id: string;
  projectId: string;
  name: string;
  description: string;
  status: 'topic_pending' | 'topic_approved' | 'topic_changes_requested' | 'github_connected';
  members: { id: string; name: string; rollNumber: string; email: string }[];
  milestones: Milestone[];
  topicVersions: TopicVersionMentor[];
  discussion: DiscussionMessage[];
  logBook: LogBookEntry[];
  lastActivityAt: string;
  daysSinceLastActivity: number;
};

export const mentorGroups: MentorGroup[] = [
  {
    id: 'g1',
    projectId: 'FYP-2026-014',
    name: 'Neural Knights',
    description:
      'A transformer-based early-warning system for cardiovascular anomalies using wearable ECG data.',
    status: 'topic_changes_requested',
    members: [
      { id: 'm1', name: 'Aarav Sharma', rollNumber: 'CS21B1042', email: 'aarav.sharma@university.edu' },
      { id: 'm2', name: 'Priya Nair', rollNumber: 'CS21B1055', email: 'priya.nair@university.edu' },
      { id: 'm3', name: 'Rohan Kapoor', rollNumber: 'CS21B1067', email: 'rohan.kapoor@university.edu' },
    ],
    milestones: [
      { id: 'ms1', number: 1, title: 'Literature Review & Problem Statement', dueDate: 'Oct 22, 2026', status: 'incomplete' },
      { id: 'ms2', number: 2, title: 'System Design & Architecture Document', dueDate: 'Nov 15, 2026', status: 'incomplete' },
      { id: 'ms3', number: 3, title: 'Prototype Implementation & Mid-Review', dueDate: 'Jan 18, 2027', status: 'incomplete' },
      { id: 'ms4', number: 4, title: 'Final Evaluation & Demo', dueDate: 'Mar 30, 2027', status: 'incomplete' },
    ],
    topicVersions: [
      {
        version: 2,
        submittedAt: 'Sep 25, 2026 · 4:30 PM',
        status: 'changes_requested',
        feedback:
          'Strengthen the feasibility section — specify dataset size and compute requirements. Also clarify how your approach differs from the 2024 JHU arrhythmia paper.',
        fields: {
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
        },
      },
      {
        version: 1,
        submittedAt: 'Sep 18, 2026 · 11:15 AM',
        status: 'changes_requested',
        feedback:
          'Problem statement is too broad. Narrow it to a specific cardiovascular condition and target population.',
        fields: {
          workingTitle: 'ECG Anomaly Detection with Transformers',
          existingWork:
            'Several papers have explored deep learning for ECG analysis, including CNNs and LSTMs. Apple Watch and Fitbit have consumer-grade AF detection features.',
          problemIdentified:
            'Current wearable devices cannot detect all heart conditions accurately in real time.',
          proposedDifference:
            'We use a transformer architecture instead of CNN/LSTM for better temporal modeling.',
          innovation: 'On-device inference using model distillation.',
          feasibility: 'We have access to public ECG datasets and GPU compute via the lab.',
        },
      },
    ],
    discussion: [
      {
        id: 'msg1',
        author: 'Aarav Sharma',
        role: 'Student',
        avatarColor: 'bg-brand-600',
        body: 'We have submitted v2 with a much more focused problem statement. Could you review when you get a chance?',
        time: 'Sep 25, 2026 · 4:35 PM',
      },
      {
        id: 'msg2',
        author: 'Dr. Eliza Mathews',
        role: 'Mentor',
        avatarColor: 'bg-brand-600',
        body: 'Good progress on v2. The innovation section is much clearer now. One request: can you add a concrete false-positive rate target for the uncertainty-aware layer? Even a rough number helps me gauge whether this is realistic for the timeline.',
        time: 'Sep 26, 2026 · 10:20 AM',
      },
      {
        id: 'msg3',
        author: 'Aarav Sharma',
        role: 'Student',
        avatarColor: 'bg-brand-600',
        body: 'Thank you! We are targeting <2 false alerts per 24-hour period based on the Stanford wearable study benchmark. I will add that to the feasibility section in v3.',
        time: 'Sep 26, 2026 · 2:45 PM',
      },
    ],
    logBook: [
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
          'Reviewed v2 topic draft. Discussed narrowing the problem to atrial fibrillation specifically. Explored using MIT-BIH AFDB as primary dataset.',
        mentorSuggestions:
          'Add a concrete false-positive rate target. Clarify the distinction between your approach and the JHU benchmark.',
        remarks: 'Strong direction. Topic is close to approval — one more revision should be ready for sign-off.',
        editHistory: [
          {
            editedAt: 'Sep 24, 2026 · 5:00 PM',
            pointsDiscussed: 'Reviewed topic draft. Discussed the problem area and possible datasets.',
            mentorSuggestions: 'Narrow the problem scope. Add more detail to the feasibility section.',
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
          'Initial mentor introduction meeting. Discussed team interests in health-tech ML. Explored three potential project directions.',
        mentorSuggestions: 'ECG monitoring has the strongest novelty and feasibility combination. Begin literature survey.',
        remarks: 'Enthusiastic team. Good mix of ML and systems skills.',
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
        pointsDiscussed: 'Kickoff meeting. Introduced the FYPM workflow, timeline, and milestone expectations.',
        mentorSuggestions: 'Use Round 1 preferences strategically — rank mentors whose domain aligns with your top project idea.',
        remarks: 'Welcome aboard. Looking forward to working with the team this year.',
      },
    ],
    lastActivityAt: 'Sep 26, 2026 · 2:45 PM',
    daysSinceLastActivity: 1,
  },
  {
    id: 'g2',
    projectId: 'FYP-2026-022',
    name: 'Data Dynamos',
    description:
      'Federated learning framework for privacy-preserving patient risk scoring across hospital networks.',
    status: 'topic_pending',
    members: [
      { id: 'm4', name: 'Sneha Gupta', rollNumber: 'CS21B1071', email: 'sneha.gupta@university.edu' },
      { id: 'm5', name: 'Arjun Mehta', rollNumber: 'CS21B1083', email: 'arjun.mehta@university.edu' },
      { id: 'm6', name: 'Kavya Rao', rollNumber: 'CS21B1094', email: 'kavya.rao@university.edu' },
    ],
    milestones: [
      { id: 'ms1', number: 1, title: 'Literature Review & Problem Statement', dueDate: 'Oct 22, 2026', status: 'incomplete' },
      { id: 'ms2', number: 2, title: 'System Design & Architecture Document', dueDate: 'Nov 15, 2026', status: 'incomplete' },
      { id: 'ms3', number: 3, title: 'Prototype Implementation & Mid-Review', dueDate: 'Jan 18, 2027', status: 'incomplete' },
      { id: 'ms4', number: 4, title: 'Final Evaluation & Demo', dueDate: 'Mar 30, 2027', status: 'incomplete' },
    ],
    topicVersions: [
      {
        version: 1,
        submittedAt: 'Sep 26, 2026 · 9:00 PM',
        status: 'pending',
        fields: {
          workingTitle: 'Privacy-Preserving Federated Patient Risk Scoring',
          existingWork:
            'Google Health introduced federated learning for medical imaging in 2023. Existing frameworks like Flower and FedML provide general-purpose FL infrastructure but lack domain-specific privacy guarantees for clinical tabular data.',
          problemIdentified:
            'Hospitals cannot pool patient data due to HIPAA and GDPR constraints, leading to siloed models with poor generalization. Current FL frameworks do not address the heterogeneous feature schemas across hospital EHR systems.',
          proposedDifference:
            'We propose a schema-agnostic federated framework with differential privacy guarantees tailored for tabular EHR data, including a novel feature-alignment layer that handles heterogeneous hospital schemas without raw data sharing.',
          innovation:
            'A dual-privacy approach combining differential privacy with secure aggregation, plus an adaptive feature-alignment module that maps heterogeneous EHR schemas into a shared latent space.',
          feasibility:
            'We will use the MIMIC-III dataset partitioned across synthetic hospital nodes. The Flower framework provides the FL infrastructure. Compute: 4 lab GPUs. Timeline: literature (2 weeks), framework design (2 weeks), implementation (3 weeks), evaluation (2 weeks).',
        },
      },
    ],
    discussion: [
      {
        id: 'msg1',
        author: 'Sneha Gupta',
        role: 'Student',
        avatarColor: 'bg-sky-600',
        body: 'We just submitted our first topic draft! We would love your feedback on the federated approach, especially the dual-privacy mechanism.',
        time: 'Sep 26, 2026 · 9:05 PM',
      },
    ],
    logBook: [
      {
        id: 'lb2-1',
        entryNumber: 1,
        date: 'Sep 5, 2026',
        lastEditedAt: 'Sep 5, 2026 · 3:00 PM',
        attendance: [
          { name: 'Sneha Gupta', present: true },
          { name: 'Arjun Mehta', present: true },
          { name: 'Kavya Rao', present: true },
        ],
        pointsDiscussed: 'Kickoff meeting. Discussed team interest in federated learning and privacy-preserving ML.',
        mentorSuggestions: 'Explore Flower framework and MIMIC-III dataset. Focus on the schema heterogeneity problem.',
        remarks: 'Good start. The privacy angle is timely and well-motivated.',
      },
    ],
    lastActivityAt: 'Sep 26, 2026 · 9:05 PM',
    daysSinceLastActivity: 1,
  },
  {
    id: 'g3',
    projectId: 'FYP-2026-031',
    name: 'Code Crafters',
    description:
      'Retrieval-augmented generation pipeline for domain-specific legal document summarization in Indic languages.',
    status: 'topic_approved',
    members: [
      { id: 'm7', name: 'Vikram Singh', rollNumber: 'CS21B1102', email: 'vikram.singh@university.edu' },
      { id: 'm8', name: 'Ananya Iyer', rollNumber: 'CS21B1115', email: 'ananya.iyer@university.edu' },
      { id: 'm9', name: 'Karthik Reddy', rollNumber: 'CS21B1127', email: 'karthik.reddy@university.edu' },
    ],
    milestones: [
      { id: 'ms1', number: 1, title: 'Literature Review & Problem Statement', dueDate: 'Oct 22, 2026', status: 'complete', checkInNote: 'Comprehensive survey of 30+ papers on RAG and Indic NLP. Problem statement finalized.', checkedInAt: 'Oct 18, 2026 · 11:00 AM' },
      { id: 'ms2', number: 2, title: 'System Design & Architecture Document', dueDate: 'Nov 15, 2026', status: 'incomplete' },
      { id: 'ms3', number: 3, title: 'Prototype Implementation & Mid-Review', dueDate: 'Jan 18, 2027', status: 'incomplete' },
      { id: 'ms4', number: 4, title: 'Final Evaluation & Demo', dueDate: 'Mar 30, 2027', status: 'incomplete' },
    ],
    topicVersions: [
      {
        version: 3,
        submittedAt: 'Sep 20, 2026 · 2:00 PM',
        status: 'approved',
        feedback: 'Excellent work. The retrieval strategy is well-justified and the evaluation plan is rigorous. Approved.',
        fields: {
          workingTitle: 'Indic-Legal-RAG: Retrieval-Augmented Summarization for Indian Legal Documents',
          existingWork:
            'Prior work includes IN-LEGAL-BERT for Indian legal text classification and the ILDC dataset for legal judgment prediction. RAG approaches have been explored for English legal text but not for multi-lingual Indic legal documents.',
          problemIdentified:
            'Indian legal documents exist in 22 official languages with no cross-lingual summarization tool. Lawyers spend significant time manually summarizing lengthy judgments. Existing English-only tools cannot serve the majority of regional practitioners.',
          proposedDifference:
            'We build a multi-lingual RAG pipeline that retrieves relevant case law across Indic languages and generates summaries in the user preferred language, using a cross-lingual retrieval index built on top of IndicBERT.',
          innovation:
            'A code-mixed retrieval strategy that handles documents mixing English legal terms with Indic language text, plus a citation-grounded summarization module that links every generated sentence to a source passage.',
          feasibility:
            'We use the ILDC and LexRumor datasets plus a custom crawl of 5,000 Supreme Court judgments in 4 languages. Compute: 2 A100 GPUs via lab allocation. Timeline: data collection (2 weeks), retrieval index (2 weeks), generation model (3 weeks), evaluation (2 weeks).',
        },
      },
      {
        version: 2,
        submittedAt: 'Sep 10, 2026 · 1:00 PM',
        status: 'changes_requested',
        feedback: 'Add a concrete evaluation plan with human evaluation. The citation-grounding idea is great — flesh it out more.',
        fields: {
          workingTitle: 'Legal Document Summarization for Indian Courts',
          existingWork: 'IN-LEGAL-BERT and ILDC dataset exist. RAG has been used for English legal text.',
          problemIdentified: 'Indian legal documents exist in many languages with no summarization tool.',
          proposedDifference: 'We build a multi-lingual RAG pipeline using IndicBERT.',
          innovation: 'Cross-lingual retrieval and citation-grounded summarization.',
          feasibility: 'We have access to legal datasets and GPU compute.',
        },
      },
      {
        version: 1,
        submittedAt: 'Sep 1, 2026 · 10:00 AM',
        status: 'changes_requested',
        feedback: 'Too vague. Specify which languages, what datasets, and how you will evaluate.',
        fields: {
          workingTitle: 'Legal AI for India',
          existingWork: 'Some work exists on Indian legal NLP.',
          problemIdentified: 'No good summarization tool for Indian legal documents.',
          proposedDifference: 'We use RAG for legal summarization.',
          innovation: 'Multi-lingual approach.',
          feasibility: 'Feasible with available resources.',
        },
      },
    ],
    discussion: [
      {
        id: 'msg1',
        author: 'Vikram Singh',
        role: 'Student',
        avatarColor: 'bg-amber-600',
        body: 'We have submitted v3 with the full evaluation plan and expanded innovation section!',
        time: 'Sep 20, 2026 · 2:05 PM',
      },
      {
        id: 'msg2',
        author: 'Dr. Eliza Mathews',
        role: 'Mentor',
        avatarColor: 'bg-brand-600',
        body: 'Excellent work. The retrieval strategy is well-justified and the evaluation plan is rigorous. Approved. Now move on to the system design milestone.',
        time: 'Sep 21, 2026 · 9:30 AM',
      },
      {
        id: 'msg3',
        author: 'Ananya Iyer',
        role: 'Student',
        avatarColor: 'bg-amber-600',
        body: 'Thank you! We have started on the architecture document and will share a draft by next week.',
        time: 'Sep 21, 2026 · 11:00 AM',
      },
    ],
    logBook: [
      {
        id: 'lb3-1',
        entryNumber: 4,
        date: 'Sep 21, 2026',
        lastEditedAt: 'Sep 21, 2026 · 10:00 AM',
        attendance: [
          { name: 'Vikram Singh', present: true },
          { name: 'Ananya Iyer', present: true },
          { name: 'Karthik Reddy', present: true },
        ],
        pointsDiscussed: 'Topic v3 approved. Discussed next steps for the system design milestone. Reviewed the proposed architecture for the retrieval index.',
        mentorSuggestions: 'Start with the retrieval index design. Use FAISS for vector storage. Share a draft architecture document before the next session.',
        remarks: 'Great progress. This group is ahead of schedule.',
      },
      {
        id: 'lb3-2',
        entryNumber: 3,
        date: 'Sep 8, 2026',
        lastEditedAt: 'Sep 8, 2026 · 2:00 PM',
        attendance: [
          { name: 'Vikram Singh', present: true },
          { name: 'Ananya Iyer', present: true },
          { name: 'Karthik Reddy', present: false },
        ],
        pointsDiscussed: 'Reviewed v2 feedback. Discussed how to incorporate the evaluation plan and expand the citation-grounding section.',
        mentorSuggestions: 'Include both automatic metrics (ROUGE, BERTScore) and human evaluation by law students. Use the citation-grounding as your main novelty claim.',
        remarks: 'On the right track. v3 should be ready for approval.',
      },
      {
        id: 'lb3-3',
        entryNumber: 2,
        date: 'Aug 25, 2026',
        lastEditedAt: 'Aug 25, 2026 · 3:00 PM',
        attendance: [
          { name: 'Vikram Singh', present: true },
          { name: 'Ananya Iyer', present: true },
          { name: 'Karthik Reddy', present: true },
        ],
        pointsDiscussed: 'Discussed the initial topic idea. Explored the legal NLP landscape and available datasets.',
        mentorSuggestions: 'Narrow to Indian legal documents specifically. Look at the ILDC dataset. Consider multi-lingual support as a differentiator.',
        remarks: 'Promising direction. Needs more specificity.',
      },
      {
        id: 'lb3-4',
        entryNumber: 1,
        date: 'Aug 15, 2026',
        lastEditedAt: 'Aug 15, 2026 · 11:00 AM',
        attendance: [
          { name: 'Vikram Singh', present: true },
          { name: 'Ananya Iyer', present: true },
          { name: 'Karthik Reddy', present: true },
        ],
        pointsDiscussed: 'Kickoff meeting. Introduced FYPM workflow and timeline.',
        mentorSuggestions: 'Explore legal NLP and RAG literature. Bring a rough topic idea to the next session.',
        remarks: 'Enthusiastic team with good NLP background.',
      },
    ],
    lastActivityAt: 'Sep 21, 2026 · 11:00 AM',
    daysSinceLastActivity: 6,
  },
  {
    id: 'g4',
    projectId: 'FYP-2026-045',
    name: 'Vision Vanguards',
    description:
      'Edge-deployed real-time pothole detection and road quality mapping using smartphone cameras.',
    status: 'topic_pending',
    members: [
      { id: 'm10', name: 'Riya Desai', rollNumber: 'CS21B1138', email: 'riya.desai@university.edu' },
      { id: 'm11', name: 'Aditya Verma', rollNumber: 'CS21B1149', email: 'aditya.verma@university.edu' },
    ],
    milestones: [
      { id: 'ms1', number: 1, title: 'Literature Review & Problem Statement', dueDate: 'Oct 22, 2026', status: 'incomplete' },
      { id: 'ms2', number: 2, title: 'System Design & Architecture Document', dueDate: 'Nov 15, 2026', status: 'incomplete' },
      { id: 'ms3', number: 3, title: 'Prototype Implementation & Mid-Review', dueDate: 'Jan 18, 2027', status: 'incomplete' },
      { id: 'ms4', number: 4, title: 'Final Evaluation & Demo', dueDate: 'Mar 30, 2027', status: 'incomplete' },
    ],
    topicVersions: [
      {
        version: 1,
        submittedAt: 'Sep 23, 2026 · 6:00 PM',
        status: 'pending',
        fields: {
          workingTitle: 'Smartphone-Based Pothole Detection and Road Quality Mapping',
          existingWork:
            'RiderLog and StreetBump use accelerometer-based pothole detection. Vision-based approaches like RoadNet use dashcam footage but require dedicated hardware. No solution leverages smartphone cameras for real-time edge inference.',
          problemIdentified:
            'Municipal road maintenance relies on manual surveys that are slow and expensive. Existing crowd-sourced approaches use only accelerometer data, which has high false-positive rates on speed bumps and railway crossings.',
          proposedDifference:
            'We combine smartphone camera vision with accelerometer data in a multi-modal fusion model, running entirely on-device via model quantization, enabling real-time road quality mapping without dedicated hardware.',
          innovation:
            'A sensor-fusion approach that cross-validates vision detections with accelerometer signatures to suppress false positives, plus an efficient on-device architecture using INT8 quantization and depthwise separable convolutions.',
          feasibility:
            'Dataset: 2,000 annotated road images collected via campus routes plus the RDD2022 dataset. Compute: training on lab GPUs, inference benchmarked on mid-range Android phone. Timeline: data collection (1 week), model training (2 weeks), on-device port (2 weeks), field testing (1 week). Team has Android development experience.',
        },
      },
    ],
    discussion: [
      {
        id: 'msg1',
        author: 'Riya Desai',
        role: 'Student',
        avatarColor: 'bg-violet-600',
        body: 'We submitted our topic draft! The sensor-fusion idea is something we are really excited about. Looking forward to your feedback.',
        time: 'Sep 23, 2026 · 6:10 PM',
      },
      {
        id: 'msg2',
        author: 'Aditya Verma',
        role: 'Student',
        avatarColor: 'bg-violet-600',
        body: 'Just to add — we already have a prototype data collection app running. We can start collecting training data this week.',
        time: 'Sep 23, 2026 · 6:15 PM',
      },
    ],
    logBook: [
      {
        id: 'lb4-1',
        entryNumber: 1,
        date: 'Sep 3, 2026',
        lastEditedAt: 'Sep 3, 2026 · 1:00 PM',
        attendance: [
          { name: 'Riya Desai', present: true },
          { name: 'Aditya Verma', present: true },
        ],
        pointsDiscussed: 'Kickoff meeting. Discussed interest in computer vision and edge computing for civic problems.',
        mentorSuggestions: 'The pothole detection idea has strong practical impact. Focus on the sensor-fusion angle as your differentiator.',
        remarks: 'Small but capable team. Good complement of CV and mobile dev skills.',
      },
    ],
    lastActivityAt: 'Sep 23, 2026 · 6:15 PM',
    daysSinceLastActivity: 4,
  },
];

export const mentorNotifications: Notification[] = [
  {
    id: 'mn1',
    title: 'New topic submission',
    body: 'Data Dynamos submitted topic v1 for review.',
    time: '11h ago',
    read: false,
    type: 'warning',
  },
  {
    id: 'mn2',
    title: 'New topic submission',
    body: 'Vision Vanguards submitted topic v1 for review.',
    time: '4d ago',
    read: false,
    type: 'warning',
  },
  {
    id: 'mn3',
    title: 'Discussion reply',
    body: 'Aarav Sharma replied in Neural Knights discussion.',
    time: '1d ago',
    read: false,
    type: 'info',
  },
  {
    id: 'mn4',
    title: 'Milestone checked in',
    body: 'Code Crafters completed Milestone 1: Literature Review.',
    time: '6d ago',
    read: true,
    type: 'success',
  },
];

export const mentorStats = {
  assignedGroups: 4,
  pendingReviews: 2,
  avgResponseTime: '1.5 days',
  capacity: { current: 4, max: 6, spaces: 2 },
};

export const reviewWeekProgress = {
  reviewed: 2,
  total: 4,
  label: 'This week',
};

export const mentorCalendarEvents: { day: number; title: string; type: 'review' | 'session' | 'deadline' }[] = [
  { day: 3, title: 'Mentor Preference Round 1 Deadline', type: 'deadline' },
  { day: 8, title: 'Neural Knights — Review Session', type: 'session' },
  { day: 14, title: 'Topic Studio Submission Deadline', type: 'deadline' },
  { day: 15, title: 'Data Dynamos — Mentoring Session', type: 'session' },
  { day: 22, title: 'Milestone 1 Due Date', type: 'deadline' },
  { day: 25, title: 'Vision Vanguards — Review Session', type: 'session' },
  { day: 30, title: 'GitHub Repo Connection Deadline', type: 'deadline' },
];

export const calendarLatestActivity: { id: string; group: string; action: string; time: string }[] = [
  { id: 'ca1', group: 'Data Dynamos', action: 'submitted topic v1 for review', time: '11 hours ago' },
  { id: 'ca2', group: 'Neural Knights', action: 'replied in discussion thread', time: '1 day ago' },
  { id: 'ca3', group: 'Vision Vanguards', action: 'submitted topic v1 for review', time: '4 days ago' },
  { id: 'ca4', group: 'Code Crafters', action: 'completed Milestone 1', time: '6 days ago' },
  { id: 'ca5', group: 'Neural Knights', action: 'submitted topic v2 for review', time: '2 days ago' },
];
