export type Role = "golfer" | "admin";

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  handicap?: string;
  createdAt: string;
}

export interface Coach {
  id: string;
  name: string;
  tagline: string;
  positioning: string;
  philosophy: string;
  communication: string[];
  corePrinciple: string;
  active: boolean;
  accent: string; // tailwind gradient class fragment
  initials: string;
}

export interface Drill {
  name: string;
  why: string;
  how: string;
  reps: string;
  tags: string[]; // issue tags this drill addresses
}

export interface SwingInput {
  club: string;
  skillLevel: "beginner" | "intermediate" | "advanced";
  goal: string;
  context: string;
  issues: string[];
}

export type SwingStatus = "processing" | "completed" | "failed";

export interface Checkpoint { t: string; label: string; /** Extracted JPEG of this moment (ffmpeg pipeline), if available. */ frame?: string | null; }

export interface Observation {
  title: string;
  detail: string;
  severity: "good" | "attention" | "priority";
  checkpoint: Checkpoint;
}

export interface Analysis {
  summary: string;
  scores: { contact: number; consistency: number; distance: number; tempo: number; sequencing: number };
  observations: Observation[];
  strengths: string[];
  priorities: string[];
  drills: Drill[];
  plan: { day: number; focus: string; activities: string[] }[];
  disclaimer: string;
  generatedBy: "mock-v1" | "llm";
  createdAt: string;
}

export interface Swing {
  id: string;
  userId: string;
  coachId: string;
  input: SwingInput;
  videoPath: string | null;
  videoName: string | null;
  durationSec: number;
  status: SwingStatus;
  analysis: Analysis | null;
  paymentId: string | null;
  mode: "demo" | "live";
  error?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: string;
  userId: string;
  swingId: string | null;
  amountCents: number;
  currency: string;
  provider: "demo" | "stripe";
  status: "succeeded" | "pending" | "failed";
  createdAt: string;
}

export interface CoachOverride {
  systemPrompt?: string;
  drills?: Drill[];
}
