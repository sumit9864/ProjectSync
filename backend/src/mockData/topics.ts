/**
 * mockData/topics.ts
 * ──────────────────
 * Hardcoded topic data per group. Migrated from src/data/mockData.ts.
 * Keyed by groupId. Mutable in-memory.
 * In Phase 3 this file is deleted; data comes from PostgreSQL.
 */

export type TopicStatus = 'pending' | 'approved' | 'changes_requested';

export interface TopicDraft {
  workingTitle:       string;
  existingWork:       string;
  problemIdentified:  string;
  proposedDifference: string;
  innovation:         string;
  feasibility:        string;
}

export interface TopicVersion {
  version:     number;
  submittedAt: string;
  status:      TopicStatus;
  feedback?:   string;
  fields:      TopicDraft;
}

export interface DiscussionMessage {
  id:          string;
  author:      string;
  role:        string;
  avatarColor: string;
  body:        string;
  time:        string;
}

export interface TopicData {
  draft:         TopicDraft;
  versions:      TopicVersion[];
  currentStatus: TopicStatus | null;
  discussion:    DiscussionMessage[];
}

// Keyed by groupId
export const topicsByGroup: Record<string, TopicData> = {
  'group-1': {
    draft: {
      workingTitle:       'ECG-based Cardiovascular Anomaly Detection using Transformers',
      existingWork:       'Several CNN-based approaches exist for ECG classification (e.g. PhysioNet challenge winners). Rule-based systems like QRS detection are widely deployed in clinical practice.',
      problemIdentified:  'Existing models require high computational resources and fail on edge devices. Real-time anomaly detection in wearables remains unsolved at low power budgets.',
      proposedDifference: 'We propose a lightweight transformer variant (MobileViT-ECG) that achieves near-SOTA accuracy while running in real-time on ARM Cortex-M7 microcontrollers.',
      innovation:         'Novel quantisation-aware training pipeline, combined with an attention-based temporal encoder specifically tuned for 12-lead ECG signals.',
      feasibility:        'Hardware (STM32H7 dev board) already procured. Dataset (PTB-XL, 21,799 records) downloaded. PyTorch implementation prototype benchmarked at 94.2% accuracy.',
    },
    versions: [
      {
        version:     1,
        submittedAt: '2026-09-20T14:30:00.000Z',
        status:      'changes_requested',
        feedback:    'Good problem statement. Please expand on feasibility — specifically how you will handle the quantisation loss on 12-lead data. Also clarify timeline for hardware testing.',
        fields: {
          workingTitle:       'ECG-based Cardiovascular Anomaly Detection',
          existingWork:       'Several CNN-based approaches exist...',
          problemIdentified:  'Existing models require high computational resources...',
          proposedDifference: 'We propose a lightweight transformer variant...',
          innovation:         'Novel quantisation-aware training pipeline...',
          feasibility:        'Hardware already procured.',
        }
      },
      {
        version:     2,
        submittedAt: '2026-09-28T09:15:00.000Z',
        status:      'approved',
        fields: {
          workingTitle:       'ECG-based Cardiovascular Anomaly Detection using Transformers',
          existingWork:       'Several CNN-based approaches exist for ECG classification (e.g. PhysioNet challenge winners). Rule-based systems like QRS detection are widely deployed in clinical practice.',
          problemIdentified:  'Existing models require high computational resources and fail on edge devices. Real-time anomaly detection in wearables remains unsolved at low power budgets.',
          proposedDifference: 'We propose a lightweight transformer variant (MobileViT-ECG) that achieves near-SOTA accuracy while running in real-time on ARM Cortex-M7 microcontrollers.',
          innovation:         'Novel quantisation-aware training pipeline, combined with an attention-based temporal encoder specifically tuned for 12-lead ECG signals.',
          feasibility:        'Hardware (STM32H7 dev board) already procured. Dataset (PTB-XL, 21,799 records) downloaded. PyTorch implementation prototype benchmarked at 94.2% accuracy.',
        }
      },
    ],
    currentStatus: 'approved',
    discussion: [
      {
        id:          'msg-1',
        author:      'Aarav Sharma',
        role:        'Student',
        avatarColor: 'bg-brand-600',
        body:        'We have updated the feasibility section to include our quantisation-aware training pipeline details and a revised timeline. Hardware testing is scheduled for Week 8.',
        time:        '2026-09-28T09:20:00.000Z',
      },
      {
        id:          'msg-2',
        author:      'Dr. Eliza Mathews',
        role:        'Mentor',
        avatarColor: 'bg-indigo-500',
        body:        'Much better. The timeline looks realistic. Topic approved — you can now begin the development milestones.',
        time:        '2026-09-28T11:45:00.000Z',
      },
    ],
  },
};
