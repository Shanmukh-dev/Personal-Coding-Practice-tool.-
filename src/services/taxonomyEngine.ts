import {
  PatternMastery,
  SolvingRecord,
  Reflection,
  LearningMemory,
  MistakeEntry,
  Problem,
} from '../types';
import { DSA_PATTERNS } from '../data/dsaPatterns';

export interface TaxonomyAnalysisInput {
  solvingRecords: SolvingRecord[];
  reflections: Reflection[];
  memories: LearningMemory[];
  mistakes: MistakeEntry[];
  catalog: Problem[];
}

/**
 * Smartly analyzes user practice logs across knowledge memory (solving records, reflections,
 * learning memories, mistake journal, and problem catalog) to generate or update the Pattern Taxonomy.
 *
 * Rules:
 * 1. Shows ONLY patterns that the user has actually practiced.
 * 2. Compares past logs on each pattern and performs cross-pattern comparison against other practiced patterns.
 * 3. Derives relative rank, comparative status, mastery tier, trend, and human-readable comparative insights.
 */
export function computePatternTaxonomy({
  solvingRecords = [],
  reflections = [],
  memories = [],
  mistakes = [],
  catalog = [],
}: TaxonomyAnalysisInput): PatternMastery[] {
  // Map problems to their associated DSA patterns
  const problemToPatternsMap = new Map<string, string[]>();
  const catalogMap = new Map<string, Problem>();

  for (const prob of catalog) {
    catalogMap.set(prob.id, prob);
    if (prob.dsaPatterns && prob.dsaPatterns.length > 0) {
      problemToPatternsMap.set(prob.id, prob.dsaPatterns);
    }
  }

  // Identify which patterns have practiced logs
  const practicedPatternIds = new Set<string>();

  // 1. Check solving records
  for (const record of solvingRecords) {
    const patterns = problemToPatternsMap.get(record.problemId) || [];
    for (const pat of patterns) {
      practicedPatternIds.add(pat);
    }
  }

  // 2. Check reflections
  for (const ref of reflections) {
    const patterns = problemToPatternsMap.get(ref.problemId) || [];
    for (const pat of patterns) {
      practicedPatternIds.add(pat);
    }
  }

  // 3. Check learning memories
  for (const mem of memories) {
    const patterns = problemToPatternsMap.get(mem.problemId) || [];
    for (const pat of patterns) {
      practicedPatternIds.add(pat);
    }
  }

  // 4. Check mistake journal entries
  for (const m of mistakes) {
    if (m.patternId) {
      practicedPatternIds.add(m.patternId);
    }
    if (m.problemId) {
      const patterns = problemToPatternsMap.get(m.problemId) || [];
      for (const pat of patterns) {
        practicedPatternIds.add(pat);
      }
    }
  }

  // Strictly return empty list if user has not practiced any pattern yet
  if (practicedPatternIds.size === 0) {
    return [];
  }

  // Analyze past logs for each practiced pattern
  const rawStatsList: Array<{
    patternId: string;
    patternName: string;
    category: string;
    totalSolved: number;
    recognitionScore: number;
    implementationScore: number;
    retentionScore: number;
    confidenceScore: number;
    averageSpeedMinutes: number;
    mistakeCount: number;
    lastPracticedAt: number;
    trend: 'improving' | 'stable' | 'declining';
    keyWeaknessNote?: string;
  }> = [];

  for (const patId of Array.from(practicedPatternIds)) {
    const meta = DSA_PATTERNS.find((p) => p.id === patId);
    const patternName = meta?.name || patId.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
    const category = meta?.category || 'Algorithms & Data Structures';

    // Find all problems in catalog tagged with this pattern
    const patternProblemIds = new Set<string>();
    for (const [pId, pats] of problemToPatternsMap.entries()) {
      if (pats.includes(patId)) {
        patternProblemIds.add(pId);
      }
    }

    // Filter logs for this pattern
    const patternSolvings = solvingRecords.filter((s) => patternProblemIds.has(s.problemId));
    const patternReflections = reflections.filter((r) => patternProblemIds.has(r.problemId));
    const patternMemories = memories.filter((m) => patternProblemIds.has(m.problemId));
    const patternMistakes = mistakes.filter(
      (m) => m.patternId === patId || (m.problemId && patternProblemIds.has(m.problemId))
    );

    // Unique solved problem count
    const solvedProblemIds = new Set([
      ...patternSolvings.map((s) => s.problemId),
      ...patternReflections.map((r) => r.problemId),
      ...patternMemories.map((m) => m.problemId),
    ]);
    const totalSolved = Math.max(solvedProblemIds.size, patternSolvings.length);

    // Skip if there's no actual record found
    if (totalSolved === 0 && patternMistakes.length === 0 && patternReflections.length === 0) {
      continue;
    }

    // Recognition Score Calculation (0 - 100%)
    let recognitionScore = 50;
    if (patternReflections.length > 0) {
      const immediateCount = patternReflections.filter((r) => r.recognizedPatternImmediately).length;
      const ratio = immediateCount / patternReflections.length;
      recognitionScore = Math.round(ratio * 100);
    } else {
      recognitionScore = 60;
    }

    // Implementation Score Calculation (0 - 100%)
    let implementationScore = 50;
    if (patternReflections.length > 0) {
      const noEditorialCount = patternReflections.filter((r) => !r.requiredHintsOrEditorial).length;
      const ratio = noEditorialCount / patternReflections.length;
      implementationScore = Math.round(ratio * 100);
    } else {
      implementationScore = 65;
    }

    // Penalize implementation score for logged bugs/mistakes on this pattern
    if (patternMistakes.length > 0) {
      implementationScore = Math.max(10, implementationScore - patternMistakes.length * 10);
    }

    // Retention Score & Confidence Score Calculation
    const confidenceValues: number[] = [];
    for (const r of patternReflections) {
      if (typeof r.confidence === 'number') confidenceValues.push(r.confidence);
    }
    for (const m of patternMemories) {
      for (const ch of m.confidenceHistory || []) {
        if (typeof ch.score === 'number') confidenceValues.push(ch.score);
      }
    }

    let retentionScore = 60;
    let confidenceScore = 60;
    if (confidenceValues.length > 0) {
      const avgConf = confidenceValues.reduce((a, b) => a + b, 0) / confidenceValues.length;
      retentionScore = Math.round((avgConf / 5) * 100);
      confidenceScore = Math.round((avgConf / 5) * 100);
    }

    // Average Solving Speed (Minutes)
    let totalEstimatedMinutes = 0;
    let countedProbs = 0;
    for (const pId of Array.from(solvedProblemIds)) {
      const prob = catalogMap.get(pId);
      if (prob && prob.estimatedSolvingTimeMinutes) {
        totalEstimatedMinutes += prob.estimatedSolvingTimeMinutes;
        countedProbs++;
      }
    }
    const averageSpeedMinutes = countedProbs > 0 ? Math.round(totalEstimatedMinutes / countedProbs) : 25;

    // Last Practiced Timestamp
    const timestamps = [
      ...patternSolvings.map((s) => s.completedAt),
      ...patternReflections.map((r) => r.timestamp),
      ...patternMemories.map((m) => m.lastReviewedDate),
      ...patternMistakes.map((m) => m.timestamp),
    ].filter((t) => typeof t === 'number' && !isNaN(t));

    const lastPracticedAt = timestamps.length > 0 ? Math.max(...timestamps) : Date.now();

    // Trend analysis over time
    let trend: 'improving' | 'stable' | 'declining' = 'stable';
    if (confidenceValues.length >= 2) {
      const mid = Math.floor(confidenceValues.length / 2);
      const firstHalf = confidenceValues.slice(0, mid);
      const secondHalf = confidenceValues.slice(mid);
      const avg1 = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
      const avg2 = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;

      if (avg2 > avg1 + 0.3) trend = 'improving';
      else if (avg2 < avg1 - 0.3) trend = 'declining';
    }

    // Key weakness note
    let keyWeaknessNote: string | undefined = undefined;
    if (patternMistakes.length > 0) {
      keyWeaknessNote = `Logged ${patternMistakes.length} mistake(s), e.g., ${patternMistakes[0].mistakeType}`;
    } else if (implementationScore < recognitionScore - 15) {
      keyWeaknessNote = 'Good pattern recognition, but implementation required hints/editorial';
    } else if (recognitionScore < 50) {
      keyWeaknessNote = 'Immediate pattern recognition can be improved with more problem exposure';
    }

    rawStatsList.push({
      patternId: patId,
      patternName,
      category,
      totalSolved,
      recognitionScore: Math.min(100, Math.max(10, recognitionScore)),
      implementationScore: Math.min(100, Math.max(10, implementationScore)),
      retentionScore: Math.min(100, Math.max(10, retentionScore)),
      confidenceScore: Math.min(100, Math.max(10, confidenceScore)),
      averageSpeedMinutes,
      mistakeCount: patternMistakes.length,
      lastPracticedAt,
      trend,
      keyWeaknessNote,
    });
  }

  if (rawStatsList.length === 0) {
    return [];
  }

  // Cross-pattern comparison analysis
  const avgRecognition = rawStatsList.reduce((a, b) => a + b.recognitionScore, 0) / rawStatsList.length;
  const avgImplementation = rawStatsList.reduce((a, b) => a + b.implementationScore, 0) / rawStatsList.length;
  const avgRetention = rawStatsList.reduce((a, b) => a + b.retentionScore, 0) / rawStatsList.length;
  const globalAvg = (avgRecognition + avgImplementation + avgRetention) / 3;

  // Calculate composite score for ranking
  const scoredPatterns = rawStatsList
    .map((item) => {
      const compositeScore =
        item.recognitionScore * 0.35 +
        item.implementationScore * 0.35 +
        item.retentionScore * 0.30;
      return { ...item, compositeScore };
    })
    .sort((a, b) => b.compositeScore - a.compositeScore);

  const totalPracticed = scoredPatterns.length;

  return scoredPatterns.map((item, index) => {
    const relativeRank = index + 1;

    // Determine comparative status against user's overall pattern portfolio
    let comparativeStatus: 'Strongest' | 'Above Average' | 'Average' | 'Needs Focus' | 'Critical Weakness';
    if (relativeRank === 1 && totalPracticed > 1) {
      comparativeStatus = 'Strongest';
    } else if (item.compositeScore >= globalAvg + 8) {
      comparativeStatus = 'Above Average';
    } else if (item.compositeScore <= 35 || item.implementationScore <= 30) {
      comparativeStatus = 'Critical Weakness';
    } else if (item.compositeScore <= globalAvg - 8) {
      comparativeStatus = 'Needs Focus';
    } else {
      comparativeStatus = 'Average';
    }

    // Determine mastery tier
    let masteryTier: 'Novice' | 'Developing' | 'Proficient' | 'Mastered';
    if (item.compositeScore >= 80) masteryTier = 'Mastered';
    else if (item.compositeScore >= 60) masteryTier = 'Proficient';
    else if (item.compositeScore >= 40) masteryTier = 'Developing';
    else masteryTier = 'Novice';

    // Generate smart comparison insight comparing this pattern to past logs and other patterns
    let comparisonInsight = '';
    if (totalPracticed === 1) {
      comparisonInsight = `Analyzed from your ${item.totalSolved} solved problem(s). Practice more patterns to enable relative benchmarking.`;
    } else {
      const recDiff = Math.round(item.recognitionScore - avgRecognition);
      const impDiff = Math.round(item.implementationScore - avgImplementation);

      if (relativeRank === 1) {
        comparisonInsight = `Top-ranked pattern! Recognition (${item.recognitionScore}%) is ${Math.abs(recDiff)}% ${
          recDiff >= 0 ? 'above' : 'below'
        } your average across all ${totalPracticed} practiced patterns.`;
      } else if (comparativeStatus === 'Critical Weakness' || comparativeStatus === 'Needs Focus') {
        comparisonInsight = `Implementation accuracy (${item.implementationScore}%) is ${Math.abs(impDiff)}% below your global average. High priority for revision.`;
      } else {
        comparisonInsight = `Ranked #${relativeRank} of ${totalPracticed} practiced patterns. ${
          item.trend === 'improving' ? 'Showing positive trajectory across recent reviews.' : 'Stable performance across practice logs.'
        }`;
      }
    }

    const finalMastery: PatternMastery = {
      patternId: item.patternId,
      patternName: item.patternName,
      category: item.category,
      totalSolved: item.totalSolved,
      recognitionScore: item.recognitionScore,
      implementationScore: item.implementationScore,
      retentionScore: item.retentionScore,
      confidenceScore: item.confidenceScore,
      averageSpeedMinutes: item.averageSpeedMinutes,
      relativeRank,
      comparativeStatus,
      masteryTier,
      trend: item.trend,
      mistakeFrequency: item.mistakeCount,
      lastPracticedAt: item.lastPracticedAt,
      comparisonInsight,
      keyWeaknessNote: item.keyWeaknessNote,
    };

    return finalMastery;
  });
}
