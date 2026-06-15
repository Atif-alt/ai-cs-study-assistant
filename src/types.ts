export type Category = "networks" | "coding" | "interview" | "general";
export type StudyMode = "standard" | "socratic" | "cheatsheet" | "quiz";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export interface ChatSession {
  id: string;
  name: string;
  category: Category;
  mode: StudyMode;
  messages: Message[];
  createdAt: string;
  updatedAt: string;
}

export interface SavedConcept {
  id: string;
  title: string;
  category: Category;
  content: string;
  codeSnippet?: string;
  savedAt: string;
}

export interface Flashcard {
  id: string;
  question: string;
  answer: string;
  category: Category;
  difficulty: "easy" | "medium" | "hard";
  lastReviewed?: string;
}

export interface SubnetConfig {
  ip: string;
  cidr: number;
}

export interface SubnetResult {
  ipAddress: string;
  subnetMask: string;
  networkAddress: string;
  broadcastAddress: string;
  usableRange: string;
  totalHosts: number;
  usableHosts: number;
  binaryMask: string;
}

export interface SubnetChallenge {
  ip: string;
  cidr: number;
  questionType: "mask" | "network" | "broadcast" | "hosts";
  questionText: string;
  correctAnswer: string;
}
