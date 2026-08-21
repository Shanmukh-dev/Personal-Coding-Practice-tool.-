import { SolvingRecord, Reflection } from '../types';
import { getLocalDateKey } from './dateUtils';

export interface DayActivityMetrics {
  total: number;
  scheduled: number;
  revision: number;
}

export interface ActivityStatsSummary {
  todayKey: string;
  todayCount: number;
  todayScheduled: number;
  todayRevision: number;
  allTimeSolvedCount: number;
  dailyMap: Map<string, DayActivityMetrics>;
  dailyCountsRecord: Record<string, number>;
}

/**
 * Builds the canonical deduplicated activity map and statistics across all solving records and reflections.
 * This guarantees 100% consistency across the Top Header banner, the Activity Heatmap, Calendar, Profile, and Extension bridge.
 */
export function computeActivityStats(
  solvingRecords: SolvingRecord[] = [],
  reflections: Reflection[] = [],
  targetDate: Date = new Date()
): ActivityStatsSummary {
  const dailyMap = new Map<string, DayActivityMetrics>();
  const dailyCountsRecord: Record<string, number> = {};

  const getOrCreate = (key: string): DayActivityMetrics => {
    if (!dailyMap.has(key)) {
      dailyMap.set(key, { total: 0, scheduled: 0, revision: 0 });
    }
    return dailyMap.get(key)!;
  };

  const processedDayProblems = new Set<string>();
  const processedRecordIds = new Set<string>();
  const allTimeUniqueProblems = new Set<string>();

  // 1. Process solvingRecords (primary source of truth)
  (solvingRecords || []).forEach((rec) => {
    if (!rec.completedAt) return;
    const dKey = rec.dateKey || getLocalDateKey(rec.completedAt);
    const entry = getOrCreate(dKey);
    const problemKey = `${dKey}_${rec.problemId || rec.id}`;
    const rawProblemId = rec.problemId || rec.id;

    if (rawProblemId) {
      allTimeUniqueProblems.add(rawProblemId);
    }

    if (!processedDayProblems.has(problemKey) && !processedRecordIds.has(rec.id)) {
      processedDayProblems.add(problemKey);
      processedRecordIds.add(rec.id);
      if (rec.reflectionId) processedRecordIds.add(rec.reflectionId);
      entry.total += 1;
      dailyCountsRecord[dKey] = (dailyCountsRecord[dKey] || 0) + 1;

      if (rec.source === 'revision' || rec.isRevision) {
        entry.revision += 1;
      } else {
        entry.scheduled += 1;
      }
    }
  });

  // 2. Process reflections (fallback for any reflection not linked to a solvingRecord)
  (reflections || []).forEach((ref) => {
    if (!ref.timestamp) return;
    const dKey = ref.dateKey || getLocalDateKey(ref.timestamp);
    const entry = getOrCreate(dKey);
    const problemKey = `${dKey}_${ref.problemId || ref.id}`;
    const rawProblemId = ref.problemId || ref.id;

    if (rawProblemId) {
      allTimeUniqueProblems.add(rawProblemId);
    }

    if (!processedDayProblems.has(problemKey) && !processedRecordIds.has(ref.id)) {
      processedDayProblems.add(problemKey);
      processedRecordIds.add(ref.id);
      entry.total += 1;
      dailyCountsRecord[dKey] = (dailyCountsRecord[dKey] || 0) + 1;

      if (ref.isRevision) {
        entry.revision += 1;
      } else {
        entry.scheduled += 1;
      }
    }
  });

  const todayKey = getLocalDateKey(targetDate);
  const todayEntry = dailyMap.get(todayKey) || { total: 0, scheduled: 0, revision: 0 };

  return {
    todayKey,
    todayCount: todayEntry.total,
    todayScheduled: todayEntry.scheduled,
    todayRevision: todayEntry.revision,
    allTimeSolvedCount: allTimeUniqueProblems.size,
    dailyMap,
    dailyCountsRecord,
  };
}

/**
 * Calculates total solved count and active days for a given year and month.
 */
export function computeMonthActivityMetrics(
  dailyMap: Map<string, DayActivityMetrics>,
  year: number,
  month: number // 0-indexed (0 = Jan, 11 = Dec)
): { monthlySolved: number; activeDays: number } {
  const monthPrefix = `${year}-${String(month + 1).padStart(2, '0')}`;
  let monthlySolved = 0;
  let activeDays = 0;

  dailyMap.forEach((entry, dKey) => {
    if (dKey.startsWith(monthPrefix) && entry.total > 0) {
      monthlySolved += entry.total;
      activeDays += 1;
    }
  });

  return { monthlySolved, activeDays };
}
