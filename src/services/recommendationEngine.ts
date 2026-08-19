import {
  Problem,
  UserProfile,
  SolvingRecord,
  PatternMastery,
  RevisionCard,
  DailyQueueItem,
  Reflection,
} from '../types';
import { DSA_PATTERNS } from '../data/dsaPatterns';

export interface ScoredProblem {
  problem: Problem;
  score: number;
  reasons: string[];
}

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

export function parseDateKeyToMs(dateKey: string): number {
  if (!dateKey) return Date.now();
  const parts = dateKey.split('-').map(Number);
  if (parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(parts[2])) {
    return new Date(parts[0], parts[1] - 1, parts[2]).getTime();
  }
  return new Date(dateKey).getTime();
}

/**
 * Checks if a problem was previously scheduled in the daily queue within the last 1.5 weeks (10.5 days),
 * or is scheduled on today / future dates in existingQueue.
 */
export function isProblemScheduledInLastWeeks(
  problemId: string,
  targetDateKey: string,
  existingQueue: DailyQueueItem[],
  weeks: number = 1.5
): boolean {
  const thresholdDays = weeks * 7; // 1.5 * 7 = 10.5 days
  const targetMs = parseDateKeyToMs(targetDateKey);

  return existingQueue.some((item) => {
    if (item.problemId !== problemId) return false;

    const itemMs = parseDateKeyToMs(item.dateKey);
    const diffDays = (targetMs - itemMs) / ONE_DAY_MS;

    // Scheduled in the last 10.5 days OR scheduled in the future / today
    return diffDays <= thresholdDays;
  });
}

export function scoreCandidateProblem(
  problem: Problem,
  userProfile: UserProfile,
  solvingRecords: SolvingRecord[],
  patternMasteries: PatternMastery[],
  reflections: Reflection[]
): ScoredProblem {
  let score = 50; // base score
  const reasons: string[] = [];

  // Check if solved
  const isSolved = solvingRecords.some((s) => s.problemId === problem.id);
  if (isSolved) {
    score -= 100; // Unsolved preferred for new queue
  }

  // Topic match
  const selectedTopics = userProfile.selectedTopics || [];
  const probPatterns = problem.dsaPatterns || [];
  const matchesSelectedTopic = probPatterns.some((p) =>
    selectedTopics.includes(p)
  );
  if (matchesSelectedTopic) {
    score += 40;
    reasons.push('Matches your selected learning topics');
  }

  // Interview importance weight from DSA taxonomy
  for (const patId of probPatterns) {
    const patMeta = DSA_PATTERNS.find((dp) => dp.id === patId);
    if (patMeta) {
      if (patMeta.interviewWeight === 'Essential') {
        score += 25;
        reasons.push(`High interview priority (${patMeta.name})`);
      } else if (patMeta.interviewWeight === 'High') {
        score += 15;
      }
    }
  }

  // Pattern mastery check - prioritize patterns with lower mastery scores
  for (const patId of problem.dsaPatterns) {
    const mastery = patternMasteries.find((m) => m.patternId === patId);
    if (mastery) {
      if (mastery.recognitionScore < 60) {
        score += 30;
        reasons.push(`Strengthens weak pattern (${mastery.patternName})`);
      }
    } else {
      // Unpracticed pattern
      score += 15;
      reasons.push('New unpracticed pattern');
    }
  }

  // Interview target difficulty alignment
  const targetLevel = userProfile.targetInterviewLevel || 'Junior';
  if (targetLevel === 'Internship' || targetLevel === 'Junior') {
    if (problem.difficulty === 'Easy') score += 20;
    else if (problem.difficulty === 'Medium') score += 10;
    else if (problem.difficulty === 'Hard') score -= 15;
  } else if (targetLevel === 'Mid') {
    if (problem.difficulty === 'Medium') score += 25;
    else if (problem.difficulty === 'Easy') score += 5;
    else if (problem.difficulty === 'Hard') score += 10;
  } else if (targetLevel === 'Senior' || targetLevel === 'FAANG/Top Tech') {
    if (problem.difficulty === 'Medium') score += 20;
    else if (problem.difficulty === 'Hard') score += 30;
  }

  return { problem, score, reasons };
}

export function generateDailyQueue(
  todayDateKey: string,
  userProfile: UserProfile,
  catalog: Problem[],
  existingQueue: DailyQueueItem[],
  revisionCards: RevisionCard[],
  solvingRecords: SolvingRecord[],
  patternMasteries: PatternMastery[],
  reflections: Reflection[]
): DailyQueueItem[] {
  const dailyLimit = userProfile.dailyLimit || 3;
  const selectedTopics = userProfile.selectedTopics || [];
  const catalogMap = new Map<string, Problem>(catalog.map((p) => [p.id, p]));

  // Helper to check if a problem matches user's active selected topics
  const problemMatchesSelectedTopics = (problemId: string): boolean => {
    if (!selectedTopics || selectedTopics.length === 0) return true;
    const prob = catalogMap.get(problemId);
    if (!prob) return true;
    return (prob.dsaPatterns || []).some((pat) => selectedTopics.includes(pat));
  };

  // 1. Identify uncompleted carry-over items from previous days that match selected topics
  const carriedOver = existingQueue.filter(
    (item) =>
      item.status === 'pending' &&
      item.dateKey < todayDateKey &&
      problemMatchesSelectedTopics(item.problemId)
  );

  const newQueue: DailyQueueItem[] = [];

  // Update carried-over items to occupy today's queue slots up to dailyLimit
  for (const item of carriedOver) {
    if (newQueue.length < dailyLimit) {
      newQueue.push({
        ...item,
        status: 'carried_over',
        dateKey: todayDateKey,
      });
    }
  }

  // Keep today's existing queue items (completed items, or pending items matching selected topics)
  const todaysExisting = existingQueue.filter(
    (item) =>
      item.dateKey === todayDateKey &&
      (item.status === 'completed' || problemMatchesSelectedTopics(item.problemId))
  );

  for (const item of todaysExisting) {
    if (!newQueue.some((i) => i.id === item.id) && newQueue.length < dailyLimit) {
      newQueue.push(item);
    }
  }

  // Check how many open slots remain for today
  if (newQueue.length >= dailyLimit) {
    return newQueue;
  }

  const currentlyQueuedProblemIds = new Set(newQueue.map((item) => item.problemId));

  // Identify all problems scheduled in the last 1.5 weeks (10.5 days)
  const scheduledInLast15WeeksIds = new Set(
    catalog
      .filter((p) => isProblemScheduledInLastWeeks(p.id, todayDateKey, existingQueue, 1.5))
      .map((p) => p.id)
  );

  // Fill remaining slots up to dailyLimit with top-scored candidate problems strictly matching selectedTopics
  if (newQueue.length < dailyLimit) {
    let candidateProblems = catalog.filter((p) => {
      if (currentlyQueuedProblemIds.has(p.id)) return false;
      if (selectedTopics.length > 0 && !(p.dsaPatterns || []).some((pat) => selectedTopics.includes(pat))) {
        return false;
      }
      return true;
    });

    // Primary candidates: NOT scheduled in the last 1.5 weeks
    const primaryCandidates = candidateProblems.filter(
      (p) => !scheduledInLast15WeeksIds.has(p.id)
    );

    // If primary candidates exist, prioritize them; otherwise allow candidateProblems matching selectedTopics
    const poolToUse = primaryCandidates.length > 0 ? primaryCandidates : candidateProblems;

    const scored = poolToUse
      .map((p) => {
        const res = scoreCandidateProblem(
          p,
          userProfile,
          solvingRecords,
          patternMasteries,
          reflections
        );
        if (scheduledInLast15WeeksIds.has(p.id)) {
          res.score -= 200; // Penalize recently scheduled problems in fallback mode
        }
        return res;
      })
      .sort((a, b) => b.score - a.score);

    for (const item of scored) {
      if (newQueue.length >= dailyLimit) break;
      currentlyQueuedProblemIds.add(item.problem.id);
      newQueue.push({
        id: `dq-${todayDateKey}-${item.problem.id}`,
        userId: userProfile.uid,
        problemId: item.problem.id,
        dateKey: todayDateKey,
        status: 'pending',
        isRevision: false,
        addedAt: Date.now(),
      });
    }
  }

  return newQueue;
}
