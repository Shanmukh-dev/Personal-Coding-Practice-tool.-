import { UserGamification, Achievement, Difficulty, ReviewOutcome } from '../types';
import { getLocalDateKey } from '../utils/dateUtils';

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_problem',
    title: 'First Step',
    description: 'Completed your first problem reflection on AlgoOS',
    iconName: 'Sparkles',
    xpReward: 100,
  },
  {
    id: 'streak_3',
    title: '3-Day Consistency',
    description: 'Maintained a 3-day active practice streak',
    iconName: 'Flame',
    xpReward: 250,
  },
  {
    id: 'streak_7',
    title: 'Unstoppable Momentum',
    description: 'Reached a 7-day active practice streak',
    iconName: 'Zap',
    xpReward: 500,
  },
  {
    id: 'reflections_10',
    title: 'Mindful Engineer',
    description: 'Completed 10 detailed post-problem reflections',
    iconName: 'BookOpen',
    xpReward: 300,
  },
  {
    id: 'revisions_20',
    title: 'Memory Master',
    description: 'Completed 20 spaced-repetition revisions',
    iconName: 'RotateCw',
    xpReward: 400,
  },
  {
    id: 'level_5',
    title: 'Algo Scholar',
    description: 'Reached Level 5 through active learning effort',
    iconName: 'Trophy',
    xpReward: 600,
  },
];

export type GamificationActionType =
  | 'problem_completed'
  | 'revision_completed'
  | 'reflection_added'
  | 'mistake_logged'
  | 'pattern_mastery';

export interface GamificationActionPayload {
  action: GamificationActionType;
  difficulty?: Difficulty;
  confidence?: number;
  recognizedPatternImmediately?: boolean;
  requiredHintsOrEditorial?: boolean;
  hasNotes?: boolean;
  reviewOutcome?: ReviewOutcome;
  reviewCount?: number;
}

/**
 * Calculates level from total XP using a quadratic scale:
 * Level 1: 0 - 149 XP
 * Level 2: 150 - 449 XP
 * Level 3: 450 - 899 XP
 * Level 4: 900 - 1499 XP
 * Level 5: 1500 - 2249 XP
 * Level L requires 75 * L * (L - 1) total XP.
 */
export function calculateLevel(xp: number): number {
  if (xp <= 0) return 1;
  return Math.max(1, Math.floor((1 + Math.sqrt(1 + (4 * xp) / 75)) / 2));
}

export function getXpThresholdForLevel(level: number): number {
  if (level <= 1) return 0;
  return 75 * level * (level - 1);
}

export function getLevelProgress(xp: number): {
  level: number;
  currentLevelThreshold: number;
  nextLevelThreshold: number;
  progressPercent: number;
  xpInCurrentLevel: number;
  xpNeededForNextLevel: number;
} {
  const level = calculateLevel(xp);
  const currentLevelThreshold = getXpThresholdForLevel(level);
  const nextLevelThreshold = getXpThresholdForLevel(level + 1);
  const xpInCurrentLevel = xp - currentLevelThreshold;
  const xpNeededForNextLevel = nextLevelThreshold - currentLevelThreshold;
  const progressPercent = Math.min(
    100,
    Math.max(0, Math.round((xpInCurrentLevel / (xpNeededForNextLevel || 1)) * 100))
  );

  return {
    level,
    currentLevelThreshold,
    nextLevelThreshold,
    progressPercent,
    xpInCurrentLevel,
    xpNeededForNextLevel,
  };
}

export function calculateActionXp(payload: GamificationActionPayload): {
  totalXp: number;
  breakdown: string[];
} {
  const breakdown: string[] = [];
  let totalXp = 0;

  if (payload.action === 'problem_completed' || payload.action === 'reflection_added') {
    // Problem difficulty base XP
    let base = 60;
    if (payload.difficulty === 'Easy') base = 40;
    else if (payload.difficulty === 'Medium') base = 80;
    else if (payload.difficulty === 'Hard') base = 150;

    totalXp += base;
    breakdown.push(`+${base} XP (${payload.difficulty || 'Medium'} Problem)`);

    // Quality & Learning Independence Bonuses
    if (payload.requiredHintsOrEditorial === false) {
      totalXp += 20;
      breakdown.push('+20 XP (Independent Solve - No Hints)');
    }
    if (payload.recognizedPatternImmediately) {
      totalXp += 15;
      breakdown.push('+15 XP (Immediate Pattern Recognition)');
    }
    if (payload.confidence) {
      if (payload.confidence === 5) {
        totalXp += 25;
        breakdown.push('+25 XP (High Mastery Confidence 5/5)');
      } else if (payload.confidence === 4) {
        totalXp += 15;
        breakdown.push('+15 XP (Solid Confidence 4/5)');
      } else if (payload.confidence === 3) {
        totalXp += 5;
        breakdown.push('+5 XP (Moderate Confidence 3/5)');
      }
    }
    if (payload.hasNotes) {
      totalXp += 15;
      breakdown.push('+15 XP (Deep Reflection Note)');
    }
  } else if (payload.action === 'revision_completed') {
    let outcomeXp = 50;
    if (payload.reviewOutcome === 'Easy') outcomeXp = 75;
    else if (payload.reviewOutcome === 'Good') outcomeXp = 50;
    else if (payload.reviewOutcome === 'Hard') outcomeXp = 25;
    else if (payload.reviewOutcome === 'Forgot') outcomeXp = 10;

    totalXp += outcomeXp;
    breakdown.push(`+${outcomeXp} XP (Spaced Revision: ${payload.reviewOutcome || 'Good'})`);

    if (payload.reviewCount && payload.reviewCount > 1) {
      const bonus = Math.min(30, payload.reviewCount * 10);
      totalXp += bonus;
      breakdown.push(`+${bonus} XP (Retention Multiplier)`);
    }
  } else if (payload.action === 'mistake_logged') {
    totalXp = 25;
    breakdown.push('+25 XP (Mistake Journal & Root Cause Analysis)');
  } else if (payload.action === 'pattern_mastery') {
    totalXp = 50;
    breakdown.push('+50 XP (Pattern Mastery Milestone)');
  }

  return { totalXp, breakdown };
}

export function updateGamificationProgress(
  current: UserGamification | null,
  userId: string,
  actionInput: GamificationActionType | GamificationActionPayload
): { nextState: UserGamification; newlyUnlocked: Achievement[]; xpEarned: number } {
  const payload: GamificationActionPayload =
    typeof actionInput === 'string' ? { action: actionInput } : actionInput;

  const todayKey = getLocalDateKey(new Date());
  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterdayKey = getLocalDateKey(yesterdayDate);

  let xp = current ? current.xp : 0;
  let currentStreak = current ? current.currentStreak : 0;
  let longestStreak = current ? current.longestStreak : 0;
  const lastActiveDateKey = current ? current.lastActiveDateKey : '';
  const unlocked = current ? [...current.unlockedAchievements] : [];

  // Calculate merit-based XP for this action
  const { totalXp: xpGain } = calculateActionXp(payload);
  xp += xpGain;

  // Active practice streak logic (ONLY advances when user completes an active learning task)
  if (lastActiveDateKey === yesterdayKey) {
    currentStreak += 1;
  } else if (lastActiveDateKey !== todayKey) {
    currentStreak = 1; // streak started or reset
  }

  if (currentStreak > longestStreak) {
    longestStreak = currentStreak;
  }

  const level = calculateLevel(xp);
  const newlyUnlocked: Achievement[] = [];

  // Check achievements
  if (
    (payload.action === 'problem_completed' || payload.action === 'reflection_added') &&
    !unlocked.includes('first_problem')
  ) {
    unlocked.push('first_problem');
    const a = ACHIEVEMENTS.find((x) => x.id === 'first_problem');
    if (a) newlyUnlocked.push(a);
  }

  if (currentStreak >= 3 && !unlocked.includes('streak_3')) {
    unlocked.push('streak_3');
    const a = ACHIEVEMENTS.find((x) => x.id === 'streak_3');
    if (a) newlyUnlocked.push(a);
  }

  if (currentStreak >= 7 && !unlocked.includes('streak_7')) {
    unlocked.push('streak_7');
    const a = ACHIEVEMENTS.find((x) => x.id === 'streak_7');
    if (a) newlyUnlocked.push(a);
  }

  if (level >= 5 && !unlocked.includes('level_5')) {
    unlocked.push('level_5');
    const a = ACHIEVEMENTS.find((x) => x.id === 'level_5');
    if (a) newlyUnlocked.push(a);
  }

  // Add bonus XP for newly unlocked achievements
  for (const ach of newlyUnlocked) {
    xp += ach.xpReward;
  }

  const nextState: UserGamification = {
    userId,
    xp,
    level: calculateLevel(xp),
    currentStreak,
    longestStreak,
    lastActiveDateKey: todayKey,
    unlockedAchievements: unlocked,
  };

  return { nextState, newlyUnlocked, xpEarned: xpGain };
}

