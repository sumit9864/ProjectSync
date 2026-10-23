/**
 * mockData/mentors.ts
 * ───────────────────
 * Hardcoded mentor list. Migrated from src/data/mockData.ts (mentor array).
 * Mutable — admin CRUD routes mutate this array in-memory.
 * In Phase 3 this file is deleted; data comes from PostgreSQL.
 */

export interface Mentor {
  id:           string;
  name:         string;
  domain:       string;
  focus:        string;
  capacity:     number;
  currentLoad:  number;
  bio:          string;
  pastProjects: string[];
  avatarColor:  string;
  email:        string;   // admin-visible field
}

export const mentors: Mentor[] = [
  {
    id:          'mentor-1',
    name:        'Dr. Eliza Mathews',
    domain:      'Applied Machine Learning',
    focus:       'Deep Learning, Computer Vision',
    capacity:    4,
    currentLoad: 2,
    bio:         'Dr. Eliza Mathews specialises in deploying ML systems in resource-constrained environments. She has led projects ranging from on-device inference to large-scale distributed training pipelines.',
    pastProjects: ['Cardiac Anomaly Detection', 'Edge AI for Agriculture', 'NLP Pipeline for Legal Documents'],
    avatarColor:  'bg-indigo-500',
    email:        'mentor@university.edu',
  },
  {
    id:          'mentor-2',
    name:        'Prof. Arjun Desai',
    domain:      'Distributed Systems',
    focus:       'Microservices, Kubernetes, Cloud-native',
    capacity:    3,
    currentLoad: 3,
    bio:         'Prof. Desai has 15 years of industry experience at hyperscalers before joining academia. His research focuses on consensus algorithms and fault-tolerant distributed architectures.',
    pastProjects: ['Self-healing Microservice Mesh', 'Raft Consensus Simulator', 'Serverless Cold-start Analyser'],
    avatarColor:  'bg-amber-500',
    email:        'arjun.desai@university.edu',
  },
  {
    id:          'mentor-3',
    name:        'Dr. Sana Mirza',
    domain:      'Cybersecurity',
    focus:       'Threat Modelling, Zero-trust, Cryptography',
    capacity:    3,
    currentLoad: 1,
    bio:         'Dr. Mirza consults for national-level cybersecurity agencies. Her academic work centres on formal verification of cryptographic protocols and adversarial ML.',
    pastProjects: ['Zero-trust VPN Framework', 'Adversarial Patch Detection', 'Smart Contract Auditing Tool'],
    avatarColor:  'bg-rose-500',
    email:        'sana.mirza@university.edu',
  },
  {
    id:          'mentor-4',
    name:        'Dr. Kabir Nair',
    domain:      'Human-Computer Interaction',
    focus:       'Accessibility, UX Research, AR/VR',
    capacity:    4,
    currentLoad: 1,
    bio:         'Dr. Nair\'s lab builds inclusive interfaces for people with motor and cognitive disabilities. He is also a pioneer in educational AR applications for rural schools.',
    pastProjects: ['Gesture-driven IDE for Motor-impaired Devs', 'AR Chemistry Lab', 'Accessible CAPTCHA System'],
    avatarColor:  'bg-emerald-500',
    email:        'kabir.nair@university.edu',
  },
];
