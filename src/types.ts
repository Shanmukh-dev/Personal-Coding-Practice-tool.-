export type Platform =
  | 'LeetCode'
  | 'CodeChef'
  | 'Codeforces'
  | 'HackerRank'
  | 'GeeksforGeeks';

export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export type ReviewOutcome = 'Easy' | 'Good' | 'Hard' | 'Forgot';

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  dailyLimit: number; // default 3-5
  targetInterviewLevel: 'Internship' | 'Junior' | 'Mid' | 'Senior' | 'FAANG/Top Tech';
  selectedTopics: string[]; // DSA pattern IDs
  theme?:
    | 'system'
    | 'light'
    | 'dark'
    | 'obsidian-slate'
    | 'cyberpunk-matrix'
    | 'sunset-crimson'
    | 'nordic-frost'
    | string;
  onboardingCompleted: boolean;
  createdAt: number;
}

export interface PlatformConnection {
  platform: Platform;
  username: string;
  connected: boolean;
  lastSyncedAt?: number;
  syncStatus: 'idle' | 'syncing' | 'success' | 'error';
  errorMessage?: string;
  solvedCount?: number;
}

export interface Problem {
  id: string;
  title: string;
  platform: Platform;
  platformProblemId: string;
  url: string;
  difficulty: Difficulty;
  tags: string[];
  dsaPatterns: string[];
  estimatedSolvingTimeMinutes: number;
  isPremium?: boolean;
  isStriverSheet?: boolean;
  striverTopic?: string;
  striverSubTopic?: string;
}

export interface Reflection {
  id: string;
  userId: string;
  problemId: string;
  timestamp: number;
  confidence: number; // 1-5
  feltDifficulty: Difficulty;
  recognizedPatternImmediately: boolean;
  requiredHintsOrEditorial: boolean;
  notes?: string;
  improvementAnswers?: {
    speedImprovement?: string;
    avoidedPreviousMistakes?: string;
    interviewReadiness?: string;
  };
  aiAnalysis?: {
    summary: string;
    identifiedMistakes: string[];
    suggestedFocus: string;
    confidenceMismatchNotice?: string;
  };
}

export interface SolvingRecord {
  id: string;
  userId: string;
  problemId: string;
  completedAt: number;
  source: 'sync' | 'manual' | 'userscript' | 'extension' | 'revision';
  reflectionId?: string;
  isRevision?: boolean;
}

export interface RevisionCard {
  id: string;
  userId: string;
  problemId: string;
  reviewCount: number;
  lastReviewedAt: number;
  nextReviewAt: number;
  intervalDays: number;
  easeFactor: number;
  status: 'due' | 'scheduled' | 'graduated';
}

export interface DailyQueueItem {
  id: string;
  userId: string;
  problemId: string;
  dateKey: string; // YYYY-MM-DD
  status: 'pending' | 'completed' | 'carried_over';
  isRevision: boolean;
  isRescheduled?: boolean;
  addedAt: number;
}

export interface PatternMastery {
  patternId: string;
  patternName: string;
  category: string;
  totalSolved: number;
  recognitionScore: number; // 0 - 100%
  implementationScore: number; // 0 - 100%
  retentionScore: number; // 0 - 100%
  confidenceScore: number; // 0 - 100%
  averageSpeedMinutes: number;
  relativeRank?: number;
  comparativeStatus?: 'Strongest' | 'Above Average' | 'Average' | 'Needs Focus' | 'Critical Weakness';
  masteryTier?: 'Novice' | 'Developing' | 'Proficient' | 'Mastered';
  trend?: 'improving' | 'stable' | 'declining';
  mistakeFrequency?: number;
  lastPracticedAt?: number;
  comparisonInsight?: string;
  keyWeaknessNote?: string;
}

export interface MistakeEntry {
  id: string;
  userId: string;
  patternId: string;
  problemId: string;
  mistakeType:
    | 'Wrong Algorithm Selection'
    | 'Implementation Bug'
    | 'Off-by-One Error'
    | 'Forgotten Edge Case'
    | 'Misunderstood Concept'
    | 'Time/Space Complexity Failure';
  description: string;
  timestamp: number;
}

export interface LearningMemory {
  problemId: string;
  userId: string;
  firstSolvedDate: number;
  lastReviewedDate: number;
  reviewCount: number;
  confidenceHistory: { timestamp: number; score: number }[];
  reflectionHistory: Reflection[];
  mistakes: MistakeEntry[];
  keyInsights: string[];
}

export interface AICoachMessage {
  id: string;
  userId: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface UserGamification {
  userId: string;
  xp: number;
  level: number;
  currentStreak: number;
  longestStreak: number;
  lastActiveDateKey: string; // YYYY-MM-DD
  unlockedAchievements: string[];
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  iconName: string;
  xpReward: number;
}
