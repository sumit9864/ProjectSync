/**
 * db-defaults.ts
 * ──────────────
 * The canonical "factory reset" state of the entire mock database.
 * Every pre-defined account and mentor profile is seeded here.
 * This is used by db.ts on first boot and by the reset utility.
 */

import type { DbSchema } from './db';

export function getDefaults(): DbSchema {
  return {
    // ── Users ──────────────────────────────────────────────────────────────
    users: [
      // Project Coordinator (Admin)
      {
        id:       'user-admin-1',
        name:     'Dr. Priya Krishnan',
        email:    'admin@kkwagh.edu.in',
        password: 'Admin@Sync2026',
        role:     'admin',
      },
      // Project Guides (Mentors) — linked to mentor profiles below
      {
        id:       'user-mentor-1',
        name:     'Dr. Eliza Mathews',
        email:    'emathews@kkwagh.edu.in',
        password: 'Mentor@123',
        role:     'mentor',
      },
      {
        id:       'user-mentor-2',
        name:     'Prof. Arjun Desai',
        email:    'adesai@kkwagh.edu.in',
        password: 'Mentor@123',
        role:     'mentor',
      },
      {
        id:       'user-mentor-3',
        name:     'Dr. Sana Mirza',
        email:    'smirza@kkwagh.edu.in',
        password: 'Mentor@123',
        role:     'mentor',
      },
      {
        id:       'user-mentor-4',
        name:     'Dr. Kabir Nair',
        email:    'knair@kkwagh.edu.in',
        password: 'Mentor@123',
        role:     'mentor',
      },
      // Students start empty — registered via POST /api/auth/register
    ],

    // ── Mentors (Project Guide profiles) ──────────────────────────────────
    mentors: [
      {
        id:          'mentor-1',
        userId:      'user-mentor-1',
        name:        'Dr. Eliza Mathews',
        email:       'emathews@kkwagh.edu.in',
        domain:      'Applied Machine Learning',
        focus:       'Deep Learning, Computer Vision',
        capacity:    3,
        currentLoad: 0,
        bio:         'Dr. Eliza Mathews specialises in deploying ML systems in resource-constrained environments. She has led projects ranging from on-device inference to large-scale distributed training pipelines.',
        pastProjects: [
          'Cardiac Anomaly Detection (2024)',
          'Edge AI for Agriculture (2023)',
          'NLP Pipeline for Legal Documents (2022)',
        ],
        avatarColor: 'bg-indigo-500',
      },
      {
        id:          'mentor-2',
        userId:      'user-mentor-2',
        name:        'Prof. Arjun Desai',
        email:       'adesai@kkwagh.edu.in',
        domain:      'Distributed Systems',
        focus:       'Microservices, Kubernetes, Cloud-native',
        capacity:    3,
        currentLoad: 0,
        bio:         'Prof. Desai has 15 years of industry experience at hyperscalers before joining academia. His research focuses on consensus algorithms and fault-tolerant distributed architectures.',
        pastProjects: [
          'Self-healing Microservice Mesh (2024)',
          'Raft Consensus Simulator (2023)',
          'Serverless Cold-start Analyser (2022)',
        ],
        avatarColor: 'bg-amber-500',
      },
      {
        id:          'mentor-3',
        userId:      'user-mentor-3',
        name:        'Dr. Sana Mirza',
        email:       'smirza@kkwagh.edu.in',
        domain:      'Cybersecurity',
        focus:       'Threat Modelling, Zero-trust, Cryptography',
        capacity:    3,
        currentLoad: 0,
        bio:         'Dr. Mirza consults for national-level cybersecurity agencies. Her academic work centres on formal verification of cryptographic protocols and adversarial ML.',
        pastProjects: [
          'Zero-trust VPN Framework (2024)',
          'Adversarial Patch Detection (2023)',
          'Smart Contract Auditing Tool (2022)',
        ],
        avatarColor: 'bg-rose-500',
      },
      {
        id:          'mentor-4',
        userId:      'user-mentor-4',
        name:        'Dr. Kabir Nair',
        email:       'knair@kkwagh.edu.in',
        domain:      'Human-Computer Interaction',
        focus:       'Accessibility, UX Research, AR/VR',
        capacity:    3,
        currentLoad: 0,
        bio:         "Dr. Nair's lab builds inclusive interfaces for people with motor and cognitive disabilities. He is also a pioneer in educational AR applications for rural schools.",
        pastProjects: [
          'Gesture-driven IDE for Motor-impaired Devs (2024)',
          'AR Chemistry Lab (2023)',
          'Accessible CAPTCHA System (2022)',
        ],
        avatarColor: 'bg-emerald-500',
      },
    ],

    // ── All other collections start empty ──────────────────────────────────
    groups:           [],
    preferences:      {},
    topics:           {},
    github:           {},
    milestones:       {},
    logbook:          {},
    notifications:    {},
    allocation:       [],
    extensions:       [],
    auditEvents:      [],
    archiveEntries:   [],
    windows: {
      registration: { open: false, opensOn: '2026-09-01', closesOn: '2026-09-14' },
      round1:       { open: false, opensOn: '2026-09-05', closesOn: '2026-09-12' },
      round2:       { open: false, opensOn: '2026-09-13', closesOn: '2026-09-19' },
    },
  };
}
