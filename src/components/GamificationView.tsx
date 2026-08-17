import React from 'react';
import { Flame, Zap, Trophy, Sparkles, BookOpen, RotateCw, Info, CheckCircle2, ShieldCheck, Target, Brain } from 'lucide-react';
import { UserGamification } from '../types';
import { ACHIEVEMENTS, getLevelProgress, getXpThresholdForLevel } from '../services/gamificationService';

interface GamificationViewProps {
  gamification: UserGamification | null;
}

export const GamificationView: React.FC<GamificationViewProps> = ({ gamification }) => {
  const currentXp = gamification?.xp || 0;
  const currentStreak = gamification?.currentStreak || 0;
  const longestStreak = gamification?.longestStreak || 0;
  const unlocked = gamification?.unlockedAchievements || [];

  const {
    level: currentLevel,
    currentLevelThreshold,
    nextLevelThreshold,
    progressPercent,
    xpInCurrentLevel,
    xpNeededForNextLevel,
  } = getLevelProgress(currentXp);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="p-6 rounded-xl bg-zinc-900 border border-zinc-800 space-y-2">
        <span className="text-xs font-mono text-orange-400 font-medium uppercase">
          Learning & Consistency Engine
        </span>
        <h1 className="text-2xl font-bold text-zinc-100">
          Learning Progress, Streaks & Badges
        </h1>
        <p className="text-xs text-zinc-400 max-w-xl">
          XP and Levels measure your actual learning depth and problem-solving effort, not time passed or arbitrary logins.
        </p>
      </div>

      {/* Clarification Banner: No Automatic Increment */}
      <div className="p-5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-200/90 space-y-2">
        <div className="flex items-center space-x-2 text-amber-400 font-semibold text-sm">
          <Info className="w-5 h-5 shrink-0" />
          <span>100% Learning-Driven Advancement</span>
        </div>
        <p className="text-xs text-amber-200/80 leading-relaxed">
          <strong>Important Note:</strong> Your XP and Level <strong>do not automatically increment</strong> simply because days pass or you log in.
          XP is earned strictly through active learning effort: completing problem reflections, independent solves without hints, high-quality spaced revisions, and analyzing mistake patterns.
        </p>
      </div>

      {/* Gamification Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Level & XP */}
        <div className="p-6 rounded-xl bg-zinc-900 border border-zinc-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Zap className="w-5 h-5 text-amber-400" />
              <h3 className="font-bold text-sm text-zinc-100">Level & XP</h3>
            </div>
            <span className="text-xl font-mono font-bold text-amber-400">
              Lvl {currentLevel}
            </span>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs font-mono text-zinc-400">
              <span>{currentXp} Total XP</span>
              <span>Next Lvl: {nextLevelThreshold} XP</span>
            </div>
            <div className="w-full bg-zinc-950 h-2.5 rounded-full overflow-hidden border border-zinc-800">
              <div
                className="bg-amber-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <p className="text-[11px] text-zinc-400 font-mono">
              {xpInCurrentLevel} / {xpNeededForNextLevel} XP earned toward Level {currentLevel + 1}
            </p>
          </div>
        </div>

        {/* Streaks */}
        <div className="p-6 rounded-xl bg-zinc-900 border border-zinc-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Flame className="w-5 h-5 text-orange-400" />
              <h3 className="font-bold text-sm text-zinc-100">Active Practice Streak</h3>
            </div>
            <span className="text-xl font-mono font-bold text-orange-400">
              {currentStreak} Days
            </span>
          </div>

          <p className="text-xs text-zinc-400">
            Longest recorded active practice streak: <strong className="text-zinc-200">{longestStreak} days</strong>.
          </p>
        </div>

        {/* Achievements Count */}
        <div className="p-6 rounded-xl bg-zinc-900 border border-zinc-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Trophy className="w-5 h-5 text-purple-400" />
              <h3 className="font-bold text-sm text-zinc-100">Badges Unlocked</h3>
            </div>
            <span className="text-xl font-mono font-bold text-purple-400">
              {unlocked.length} / {ACHIEVEMENTS.length}
            </span>
          </div>

          <p className="text-xs text-zinc-400">
            Earned through verified problem reflections and spaced repetition milestones.
          </p>
        </div>
      </div>

      {/* How XP Is Earned: Rules & Breakdown */}
      <div className="p-6 rounded-xl bg-zinc-900 border border-zinc-800 space-y-6">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div className="flex items-center space-x-2">
            <Brain className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-base text-zinc-100">How You Earn XP (Merit-Based Rules)</h3>
          </div>
          <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full">
            Verified Learning Effort
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Problem Completion */}
          <div className="p-4 rounded-lg bg-zinc-950 border border-zinc-800/80 space-y-2">
            <div className="flex items-center space-x-2 text-zinc-200 font-semibold text-xs">
              <Target className="w-4 h-4 text-sky-400" />
              <span>Problem Difficulty</span>
            </div>
            <ul className="text-xs font-mono text-zinc-400 space-y-1">
              <li className="flex justify-between"><span>Easy Problem:</span> <span className="text-sky-300 font-bold">+40 XP</span></li>
              <li className="flex justify-between"><span>Medium Problem:</span> <span className="text-sky-300 font-bold">+80 XP</span></li>
              <li className="flex justify-between"><span>Hard Problem:</span> <span className="text-sky-300 font-bold">+150 XP</span></li>
            </ul>
          </div>

          {/* Quality Bonuses */}
          <div className="p-4 rounded-lg bg-zinc-950 border border-zinc-800/80 space-y-2">
            <div className="flex items-center space-x-2 text-zinc-200 font-semibold text-xs">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Reflection Quality</span>
            </div>
            <ul className="text-xs font-mono text-zinc-400 space-y-1">
              <li className="flex justify-between"><span>No Hints Used:</span> <span className="text-amber-300 font-bold">+20 XP</span></li>
              <li className="flex justify-between"><span>Immediate Pattern:</span> <span className="text-amber-300 font-bold">+15 XP</span></li>
              <li className="flex justify-between"><span>5/5 Confidence:</span> <span className="text-amber-300 font-bold">+25 XP</span></li>
              <li className="flex justify-between"><span>Reflection Notes:</span> <span className="text-amber-300 font-bold">+15 XP</span></li>
            </ul>
          </div>

          {/* Spaced Revisions */}
          <div className="p-4 rounded-lg bg-zinc-950 border border-zinc-800/80 space-y-2">
            <div className="flex items-center space-x-2 text-zinc-200 font-semibold text-xs">
              <RotateCw className="w-4 h-4 text-purple-400" />
              <span>Spaced Revisions</span>
            </div>
            <ul className="text-xs font-mono text-zinc-400 space-y-1">
              <li className="flex justify-between"><span>Easy Recall:</span> <span className="text-purple-300 font-bold">+75 XP</span></li>
              <li className="flex justify-between"><span>Good Recall:</span> <span className="text-purple-300 font-bold">+50 XP</span></li>
              <li className="flex justify-between"><span>Hard Recall:</span> <span className="text-purple-300 font-bold">+25 XP</span></li>
              <li className="flex justify-between"><span>Forgot & Review:</span> <span className="text-purple-300 font-bold">+10 XP</span></li>
            </ul>
          </div>

          {/* Mistake Logging */}
          <div className="p-4 rounded-lg bg-zinc-950 border border-zinc-800/80 space-y-2">
            <div className="flex items-center space-x-2 text-zinc-200 font-semibold text-xs">
              <BookOpen className="w-4 h-4 text-emerald-400" />
              <span>Mistake Analysis</span>
            </div>
            <ul className="text-xs font-mono text-zinc-400 space-y-1">
              <li className="flex justify-between"><span>Mistake Entry:</span> <span className="text-emerald-300 font-bold">+25 XP</span></li>
              <li className="flex justify-between"><span>Pattern Milestone:</span> <span className="text-emerald-300 font-bold">+50 XP</span></li>
              <li className="flex justify-between"><span>Badge Unlocks:</span> <span className="text-emerald-300 font-bold">+100-600 XP</span></li>
            </ul>
          </div>
        </div>

        {/* Level Requirements Table */}
        <div className="pt-2">
          <h4 className="text-xs font-bold text-zinc-300 mb-3 uppercase tracking-wider">Level Threshold Requirements</h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 text-center font-mono text-xs">
            {[1, 2, 3, 4, 5, 6].map((lvl) => {
              const thresh = getXpThresholdForLevel(lvl);
              const isCurrent = lvl === currentLevel;
              return (
                <div
                  key={lvl}
                  className={`p-2.5 rounded-lg border ${
                    isCurrent
                      ? 'bg-amber-500/10 border-amber-500/40 text-amber-300'
                      : 'bg-zinc-950 border-zinc-800/80 text-zinc-400'
                  }`}
                >
                  <span className="block font-bold">Lvl {lvl}</span>
                  <span className="text-[10px] text-zinc-500 block">{thresh} Total XP</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Achievements List */}
      <div className="space-y-4">
        <h3 className="font-bold text-base text-zinc-100">Available Badges & Achievements</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {ACHIEVEMENTS.map((ach) => {
            const isUnlocked = unlocked.includes(ach.id);

            return (
              <div
                key={ach.id}
                className={`p-4 rounded-xl border flex items-start gap-3 transition-all ${
                  isUnlocked
                    ? 'bg-zinc-900 border-amber-500/30'
                    : 'bg-zinc-900/40 border-zinc-800 opacity-50'
                }`}
              >
                <div className={`p-2.5 rounded-lg shrink-0 ${isUnlocked ? 'bg-amber-500/10 text-amber-400' : 'bg-zinc-800 text-zinc-600'}`}>
                  <Trophy className="w-5 h-5" />
                </div>
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-xs text-zinc-100 truncate">{ach.title}</h4>
                    <span className="text-[10px] font-mono text-slate-200 font-bold shrink-0">
                      +{ach.xpReward} XP
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-400 leading-snug">{ach.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

