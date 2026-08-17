import React, { useState } from 'react';
import {
  User as UserIcon,
  ShieldCheck,
  Target,
  Sliders,
  Check,
  Sparkles,
  Link2,
  CheckCircle2,
  LogOut,
  Flame,
  Zap,
  BookOpen,
  Calendar,
  Layers,
  ChevronRight,
  AlertCircle,
  Clock,
  Palette,
} from 'lucide-react';
import { UserProfile, PlatformConnection, UserGamification } from '../types';
import { DSA_PATTERNS } from '../data/dsaPatterns';
import { ThemeSwitcher } from './ThemeSwitcher';
import { useTheme } from '../context/ThemeContext';
import { getProfileAvatarUrl } from '../utils/avatar';

interface ProfileViewProps {
  userProfile: UserProfile | null;
  connections: PlatformConnection[];
  gamification: UserGamification | null;
  solvedCount: number;
  onSaveProfile: (updated: Partial<UserProfile>) => Promise<void>;
  onOpenAuth: () => void;
  onSignOut: () => void;
  onNavigateTab: (tab: string) => void;
  onOpenOnboarding: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  userProfile,
  connections,
  gamification,
  solvedCount,
  onSaveProfile,
  onOpenAuth,
  onSignOut,
  onNavigateTab,
  onOpenOnboarding,
}) => {
  const { themeMode } = useTheme();

  const [targetLevel, setTargetLevel] = useState<UserProfile['targetInterviewLevel']>(
    userProfile?.targetInterviewLevel || 'Junior'
  );
  const [dailyLimit, setDailyLimit] = useState<number>(userProfile?.dailyLimit || 3);
  const [selectedTopics, setSelectedTopics] = useState<string[]>(
    userProfile?.selectedTopics && userProfile.selectedTopics.length > 0
      ? userProfile.selectedTopics
      : ['arrays', 'two_pointers', 'sliding_window', 'binary_search', 'hashmap', 'dfs', 'dynamic_programming']
  );

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const connectedPlatforms = connections.filter((c) => c.connected);

  const toggleTopic = (id: string) => {
    if (selectedTopics.includes(id)) {
      setSelectedTopics(selectedTopics.filter((t) => t !== id));
    } else {
      setSelectedTopics([...selectedTopics, id]);
    }
  };

  const handleSavePreferences = async () => {
    setSaving(true);
    try {
      await onSaveProfile({
        targetInterviewLevel: targetLevel,
        dailyLimit,
        selectedTopics,
        theme: themeMode,
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const createdDate = userProfile?.createdAt
    ? new Date(userProfile.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Recently';

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Profile Card */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-zinc-900 via-zinc-900 to-zinc-950 border border-zinc-800 relative overflow-hidden shadow-xl">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-slate-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-2xl bg-zinc-800 border border-zinc-700 overflow-hidden flex items-center justify-center shrink-0 shadow-md">
              <img
                src={getProfileAvatarUrl(
                  userProfile?.photoURL,
                  userProfile?.email,
                  userProfile?.displayName
                )}
                alt={userProfile?.displayName || 'Profile'}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-bold text-zinc-100">
                  {userProfile?.displayName || userProfile?.email?.split('@')[0] || 'Guest Engineer'}
                </h1>

                {userProfile ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100/10 text-slate-200 border border-slate-300/20 font-semibold">
                    <ShieldCheck className="w-3 h-3" /> Authenticated
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-semibold">
                    <AlertCircle className="w-3 h-3" /> Guest Mode
                  </span>
                )}
              </div>

              <p className="text-xs text-zinc-400 font-mono">
                {userProfile?.email || 'Sign in to persist stats across devices & sync platforms'}
              </p>

              <div className="flex items-center gap-4 text-[11px] text-zinc-500 font-mono pt-1">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-zinc-400" /> Joined {createdDate}
                </span>
                <span>•</span>
                <span className="text-slate-200 font-medium">
                  {targetLevel} Interview Track
                </span>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="shrink-0 w-full sm:w-auto">
            {userProfile ? (
              <button
                onClick={onSignOut}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-rose-500/10 hover:text-rose-400 hover:border-rose-500/30 text-zinc-300 font-semibold text-xs border border-zinc-700 transition-all flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            ) : (
              <button
                onClick={onOpenAuth}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-zinc-950 font-bold text-xs shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <span>Sign In / Sync Data</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Gamification & Metrics Overview Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 flex items-center space-x-3">
          <div className="p-2.5 rounded-lg bg-orange-500/10 text-orange-400 border border-orange-500/20">
            <Flame className="w-5 h-5 fill-orange-400/20" />
          </div>
          <div>
            <span className="text-[10px] font-mono text-zinc-500 uppercase block leading-none">
              Current Streak
            </span>
            <span className="text-base font-bold text-zinc-100 font-mono mt-0.5 block">
              {gamification?.currentStreak || 0} Days
            </span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 flex items-center space-x-3">
          <div className="p-2.5 rounded-lg bg-slate-100/10 text-slate-200 border border-slate-300/20">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-mono text-zinc-500 uppercase block leading-none">
              Level & XP
            </span>
            <span className="text-base font-bold text-zinc-100 font-mono mt-0.5 block">
              Lvl {gamification?.level || 1} • {gamification?.xp || 0} XP
            </span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 flex items-center space-x-3">
          <div className="p-2.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-mono text-zinc-500 uppercase block leading-none">
              Problems Solved
            </span>
            <span className="text-base font-bold text-zinc-100 font-mono mt-0.5 block">
              {solvedCount} Solved
            </span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 flex items-center space-x-3">
          <div className="p-2.5 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <Link2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-mono text-zinc-500 uppercase block leading-none">
              Connected Platforms
            </span>
            <span className="text-base font-bold text-zinc-100 font-mono mt-0.5 block">
              {connectedPlatforms.length} Active
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Theme & Settings + Connected Platforms */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Appearance & Interview & Learning Goals Editor */}
        <div className="lg:col-span-2 space-y-6">
          {/* Theme Switcher Section */}
          <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800">
            <ThemeSwitcher
              onSelectTheme={(mode) => {
                if (userProfile) {
                  onSaveProfile({
                    ...userProfile,
                    theme: mode,
                  });
                }
              }}
            />
          </div>

          <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-6">
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
              <div>
                <h2 className="text-base font-bold text-zinc-100 flex items-center gap-2">
                  <Target className="w-4 h-4 text-slate-300" />
                  <span>Interview Goals & Learning Preferences</span>
                </h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Customize your target interview tier, daily limit, and topic priorities.
                </p>
              </div>

            <button
              onClick={onOpenOnboarding}
              className="text-xs text-slate-300 hover:underline flex items-center gap-1 font-mono"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Restart Wizard</span>
            </button>
          </div>

          {/* 1. Target Level Selection */}
          <div className="space-y-2">
            <label className="block text-xs font-mono font-semibold text-zinc-300 uppercase tracking-wider">
              Target Interview Level
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {(
                ['Internship', 'Junior', 'Mid', 'Senior', 'FAANG/Top Tech'] as const
              ).map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setTargetLevel(lvl)}
                  className={`p-2.5 rounded-xl border text-xs text-left transition-all ${
                    targetLevel === lvl
                      ? 'bg-slate-100/10 border-slate-300 text-slate-100 font-semibold shadow-sm'
                      : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>{lvl}</span>
                    {targetLevel === lvl && <Check className="w-3.5 h-3.5 text-slate-200" />}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* 2. Daily Goal Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono font-semibold text-zinc-300 uppercase tracking-wider">
                Daily Problem Goal
              </label>
              <span className="text-xs font-mono text-slate-300 font-bold">
                {dailyLimit} problems / day
              </span>
            </div>
            <div className="flex items-center space-x-3 bg-zinc-950 p-3 rounded-xl border border-zinc-800">
              <Sliders className="w-4 h-4 text-zinc-500" />
              <input
                type="range"
                min={1}
                max={5}
                step={1}
                value={dailyLimit}
                onChange={(e) => setDailyLimit(Number(e.target.value))}
                className="w-full accent-slate-300 bg-zinc-800 h-1.5 rounded-lg cursor-pointer"
              />
            </div>
          </div>

          {/* 3. Topics Selection Grid */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono font-semibold text-zinc-300 uppercase tracking-wider">
                Priority Topics ({selectedTopics.length} selected)
              </label>
              <button
                type="button"
                onClick={() =>
                  setSelectedTopics(
                    selectedTopics.length === DSA_PATTERNS.length
                      ? []
                      : DSA_PATTERNS.map((p) => p.id)
                  )
                }
                className="text-[11px] text-slate-300 hover:underline font-mono"
              >
                {selectedTopics.length === DSA_PATTERNS.length ? 'Deselect All' : 'Select All'}
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-60 overflow-y-auto p-1.5 bg-zinc-950 rounded-xl border border-zinc-800 custom-scrollbar">
              {DSA_PATTERNS.map((p) => {
                const selected = selectedTopics.includes(p.id);
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => toggleTopic(p.id)}
                    className={`p-2 rounded-lg border text-[11px] text-left transition-all flex items-center justify-between ${
                      selected
                        ? 'bg-slate-100/10 border-slate-300 text-slate-200 font-medium'
                        : 'bg-zinc-900 border-zinc-800/80 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <span className="truncate">{p.name}</span>
                    {selected && <Check className="w-3 h-3 text-slate-200 shrink-0 ml-1" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Save Button */}
          <div className="pt-2 flex items-center justify-between border-t border-zinc-800">
            {saveSuccess && (
              <span className="text-xs text-slate-300 font-mono flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> Preferences updated successfully!
              </span>
            )}
            <button
              onClick={handleSavePreferences}
              disabled={saving}
              className="ml-auto px-6 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-zinc-950 font-bold text-xs flex items-center gap-2 transition-all shadow-md"
            >
              <Check className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save Learning Preferences'}</span>
            </button>
          </div>
        </div>
        </div>

        {/* Right Col: Connected Platforms & Sync Status */}
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
                <Link2 className="w-4 h-4 text-slate-300" />
                <span>Connected Platforms</span>
              </h3>

              <button
                onClick={() => onNavigateTab('connectors')}
                className="text-xs text-slate-300 hover:underline font-mono"
              >
                Manage
              </button>
            </div>

            {connectedPlatforms.length > 0 ? (
              <div className="space-y-2.5">
                {connectedPlatforms.map((c) => (
                  <div
                    key={c.platform}
                    className="p-3 rounded-xl bg-zinc-950 border border-zinc-800/80 flex items-center justify-between"
                  >
                    <div>
                      <span className="text-xs font-bold text-zinc-200 block">
                        {c.platform}
                      </span>
                      <span className="text-[10px] font-mono text-slate-300">
                        @{c.username}
                      </span>
                    </div>

                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100/10 text-slate-200 border border-slate-300/20">
                      Connected
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-5 text-center bg-zinc-950/60 rounded-xl border border-zinc-800/80 space-y-3">
                <p className="text-xs text-zinc-400">
                  No coding platforms connected yet. Connect LeetCode, Codeforces, or HackerRank to sync submissions.
                </p>
                <button
                  onClick={() => onNavigateTab('connectors')}
                  className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-slate-200 text-xs font-mono font-semibold border border-zinc-700 transition-all inline-flex items-center gap-1.5"
                >
                  <Link2 className="w-3.5 h-3.5" />
                  <span>Connect Platform</span>
                </button>
              </div>
            )}
          </div>

          {/* AlgoOS System Info Card */}
          <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 space-y-3">
            <h4 className="text-xs font-mono uppercase text-zinc-400 font-semibold tracking-wider">
              System Architecture
            </h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              AlgoOS uses an event-driven learning engine grounded in cognitive science: SuperMemo SM-2 spaced repetition, pattern mastery matrixes, and AI grounded feedback.
            </p>
            <div className="pt-1 text-[11px] font-mono text-zinc-500 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-slate-300 animate-pulse" />
              <span>AlgoOS Engine v2.0 Active</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
