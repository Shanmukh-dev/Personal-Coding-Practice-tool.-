import { RevisionCard, ReviewOutcome } from '../types';

export function calculateNextRevision(
  existingCard: RevisionCard | null,
  problemId: string,
  userId: string,
  outcome: ReviewOutcome
): RevisionCard {
  const now = Date.now();

  let reviewCount = existingCard ? existingCard.reviewCount + 1 : 1;
  let intervalDays = existingCard ? existingCard.intervalDays : 1;
  let easeFactor = existingCard ? existingCard.easeFactor : 2.5;

  switch (outcome) {
    case 'Forgot':
      intervalDays = 1;
      easeFactor = Math.max(1.3, easeFactor - 0.2);
      break;
    case 'Hard':
      intervalDays = Math.max(1, Math.round(intervalDays * 1.2));
      easeFactor = Math.max(1.3, easeFactor - 0.15);
      break;
    case 'Good':
      intervalDays = Math.max(1, Math.round(intervalDays * easeFactor));
      break;
    case 'Easy':
      intervalDays = Math.max(2, Math.round(intervalDays * easeFactor * 1.4));
      easeFactor = Math.min(3.5, easeFactor + 0.15);
      break;
  }

  const nextReviewAt = now + intervalDays * 24 * 60 * 60 * 1000;

  let status: 'due' | 'scheduled' | 'graduated' = 'scheduled';
  if (intervalDays >= 30) {
    status = 'graduated';
  } else if (nextReviewAt <= now) {
    status = 'due';
  }

  return {
    id: existingCard ? existingCard.id : `rev-${problemId}`,
    userId,
    problemId,
    reviewCount,
    lastReviewedAt: now,
    nextReviewAt,
    intervalDays,
    easeFactor,
    status,
  };
}

export interface RescheduleResult {
  updatedCards: RevisionCard[];
  rescheduledCount: number;
  rescheduledDetails: { problemId: string; newDateKey: string; daysOffset: number }[];
}

/**
 * Intelligent Automatic Rescheduling System:
 * Analyzes overdue revision cards (scheduled before today) and distributes them
 * evenly across upcoming days to maintain spaced repetition efficiency and prevent review fatigue.
 */
export function intelligentAutoRescheduleOverdueCards(
  cards: RevisionCard[],
  maxOverduePerDay = 3
): RescheduleResult {
  const now = Date.now();
  const todayDate = new Date();
  todayDate.setHours(0, 0, 0, 0);
  const startOfTodayMs = todayDate.getTime();

  // Find overdue cards
  const overdueCards = cards.filter((card) => {
    return card.status !== 'graduated' && card.nextReviewAt < startOfTodayMs;
  });

  if (overdueCards.length === 0) {
    return {
      updatedCards: cards,
      rescheduledCount: 0,
      rescheduledDetails: [],
    };
  }

  // Sort overdue cards by priority:
  // Harder problems (lower easeFactor) and higher review count first
  const sortedOverdue = [...overdueCards].sort((a, b) => {
    if (a.easeFactor !== b.easeFactor) return a.easeFactor - b.easeFactor; // lower ease first
    return b.reviewCount - a.reviewCount; // higher reviews first
  });

  const rescheduledDetails: { problemId: string; newDateKey: string; daysOffset: number }[] = [];
  const updatedCardsMap = new Map<string, RevisionCard>(cards.map((c) => [c.id, c]));

  sortedOverdue.forEach((card, index) => {
    // Calculate target day offset (0 = today, 1 = tomorrow, 2 = +2 days, etc.)
    const dayOffset = Math.floor(index / maxOverduePerDay);
    
    // Set target date at 09:00 AM on that future day
    const targetDate = new Date(startOfTodayMs + dayOffset * 24 * 60 * 60 * 1000);
    targetDate.setHours(9, 0, 0, 0);
    const targetTimestamp = targetDate.getTime();

    const yStr = targetDate.getFullYear();
    const mStr = String(targetDate.getMonth() + 1).padStart(2, '0');
    const dStr = String(targetDate.getDate()).padStart(2, '0');
    const newDateKey = `${yStr}-${mStr}-${dStr}`;

    const updatedCard: RevisionCard = {
      ...card,
      nextReviewAt: targetTimestamp,
      intervalDays: Math.max(1, dayOffset === 0 ? 1 : dayOffset),
      status: targetTimestamp <= now ? 'due' : 'scheduled',
    };

    updatedCardsMap.set(updatedCard.id, updatedCard);
    rescheduledDetails.push({
      problemId: card.problemId,
      newDateKey,
      daysOffset: dayOffset,
    });
  });

  return {
    updatedCards: Array.from(updatedCardsMap.values()),
    rescheduledCount: overdueCards.length,
    rescheduledDetails,
  };
}

