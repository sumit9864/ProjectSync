/**
 * mockData/archive.ts
 * ────────────────────
 * Hardcoded archive entries (past-year projects). Migrated from src/data/adminData.ts.
 * Mutable in-memory. In Phase 3 this file is deleted.
 */

export interface ArchiveEntry {
  id:       string;
  year:     string;
  title:    string;
  group:    string;
  elective: string;
  abstract: string;
  mentor:   string;
  grade:    string;
}

export const archiveEntries: ArchiveEntry[] = [
  {
    id:       'arc-1',
    year:     '2025',
    title:    'Federated Learning for Privacy-preserving Medical Imaging',
    group:    'MedFL Team',
    elective: 'Machine Learning & Data Science',
    abstract: 'This project implemented a federated learning framework that trains a diagnostic imaging model across 5 hospital nodes without sharing raw patient data. Achieved 91.3% accuracy on a held-out test set.',
    mentor:   'Dr. Eliza Mathews',
    grade:    'A',
  },
  {
    id:       'arc-2',
    year:     '2025',
    title:    'Real-time Kubernetes Resource Optimiser using Reinforcement Learning',
    group:    'CloudOps Alpha',
    elective: 'Cloud & Distributed Systems',
    abstract: 'Developed a DQN-based agent that dynamically allocates pod resources in a Kubernetes cluster, reducing average p99 latency by 34% compared to the default scheduler.',
    mentor:   'Prof. Arjun Desai',
    grade:    'A+',
  },
  {
    id:       'arc-3',
    year:     '2024',
    title:    'Zero-knowledge Proof System for Secure Voting',
    group:    'CryptoVote',
    elective: 'Cybersecurity & Cryptography',
    abstract: 'Implemented a zk-SNARK-based e-voting protocol ensuring voter anonymity while enabling public verifiability. Prototype tested with 1,000 simulated voters.',
    mentor:   'Dr. Sana Mirza',
    grade:    'A',
  },
  {
    id:       'arc-4',
    year:     '2024',
    title:    'Accessible AR Navigation System for Visually Impaired Users',
    group:    'NavAR',
    elective: 'Human-Computer Interaction',
    abstract: 'Built an AR-assisted navigation app combining LiDAR, haptic feedback, and spatial audio to guide visually impaired users in unfamiliar indoor environments.',
    mentor:   'Dr. Kabir Nair',
    grade:    'A+',
  },
];
