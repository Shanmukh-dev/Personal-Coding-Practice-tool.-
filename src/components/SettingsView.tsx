import React, { useState } from 'react';
import {
  Sliders,
  Target,
  User as UserIcon,
  Check,
  Sparkles,
  ShieldCheck,
  LogOut,
  RefreshCw,
  BookOpen,
  Link2,
  CheckCircle2,
  SlidersHorizontal,
  Flame,
  Zap,
} from 'lucide-react';
import { UserProfile, PlatformConnection, UserGamification } from '../types';
import { DSA_PATTERNS } from '../data/dsaPatterns';
import { ThemeSwitcher } from './ThemeSwitcher';
import { useTheme } from '../context/ThemeContext';
import { getProfileAvatarUrl } from '../utils/avatar';

interface SettingsViewProps {
  userProfile: UserProfile | null;
  connections: PlatformConnection[];
  gamification: UserGamification | null;
  onSaveProfile: (updated: Partial<UserProfile>) => Promise<void>;
  onOpenAuth: () => void;
  onSignOut: () => void;
  onNavigateTab: (tab: string) => void;
  onOpenOnboarding: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  userProfile,
  connections,
  gamification,
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

  const handleSaveSettings = async () => {
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
      console.error('Error saving settings:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-zinc-900 border border-zinc-800">
        <div>
          <div className="flex items-center space-x-2">
            <Sliders className="w-5 h-5 text-slate-300" />
            <h1 className="text-xl sm:text-2xl font-bold text-zinc-100">
              System Settings & Configuration
            </h1>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Customize visual themes, adaptive study pacing, practice topics, and account sync.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {saveSuccess && (
            <span className="text-xs font-mono text-slate-200 bg-slate-100/10 border border-slate-300/30 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5" />
              Settings saved!
            </span>
          )}
          <button
            onClick={handleSaveSettings}
            disabled={saving}
            className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-zinc-950 font-bold text-xs flex items-center gap-2 transition-all shadow-md disabled:opacity-50"
          >
            <Check className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save All Preferences'}</span>
          </button>
        </div>
      </div>

      {/* 1. Visual Theme Section */}
      <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4">
        <ThemeSwitcher />
      </div>

      {/* 2. Adaptive Learning Pacing & Goals */}
      <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
          <div>
            <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2">
              <Target className="w-4 h-4 text-slate-300" />
              <span>Adaptive Study Pacing & Target Level</span>
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Adjust your target difficulty curve and daily question load.
            </p>
          </div>
          <button
            onClick={onOpenOnboarding}
            className="text-xs font-mono text-slate-300 hover:underline flex items-center gap-1"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Re-run Onboarding Wizard</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Target Interview Level */}
          <div className="space-y-3">
            <label className="text-xs font-mono font-semibold text-zinc-300 uppercase tracking-wider block">
              Target Interview Seniority
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(['Intern', 'Junior', 'Mid', 'Senior', 'Staff'] as UserProfile['targetInterviewLevel'][]).map(
                (lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setTargetLevel(lvl)}
                    className={`p-3 rounded-xl border text-xs text-left transition-all flex items-center justify-between ${
                      targetLevel === lvl
                        ? 'bg-slate-100/10 border-slate-300 text-slate-100 font-bold shadow-sm'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                    }`}
                  >
                    <span>{lvl} Engineer</span>
                    {targetLevel === lvl && <Check className="w-3.5 h-3.5 text-slate-200" />}
                  </button>
                )
              )}
            </div>
          </div>

          {/* Daily Problem Limit */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono font-semibold text-zinc-300 uppercase tracking-wider">
                Daily Problem Goal
              </label>
              <span className="text-xs font-mono text-slate-200 font-bold bg-slate-100/10 border border-slate-300/20 px-2.5 py-1 rounded-lg">
                {dailyLimit} Problems / Day
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              The recommendation engine will curate this number of spaced retrieval problems every 24 hours.
            </p>
            <input
              type="range"
              min={1}
              max={10}
              step={1}
              value={dailyLimit}
              onChange={(e) => setDailyLimit(Number(e.target.value))}
              className="w-full accent-slate-300 bg-zinc-800 h-2 rounded-lg cursor-pointer mt-2"
            />
            <div className="flex justify-between text-[10px] font-mono text-zinc-500">
              <span>1 Light</span>
              <span>5 Balanced</span>
              <span>10 Intensive</span>
            </div>
          </div>
        </div>

        {/* Practice Topics Checklist */}
        <div className="pt-4 border-t border-zinc-800 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-mono font-semibold text-zinc-300 uppercase tracking-wider">
              Active DSA Topics & Algorithms ({selectedTopics.length}/{DSA_PATTERNS.length})
            </label>
            <button
              type="button"
              onClick={() =>
                setSelectedTopics(
                  selectedTopics.length === DSA_PATTERNS.length ? [] : DSA_PATTERNS.map((p) => p.id)
                )
              }
              className="text-xs font-mono text-slate-300 hover:underline"
            >
              {selectedTopics.length === DSA_PATTERNS.length ? 'Deselect All' : 'Select All'}
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {DSA_PATTERNS.map((pattern) => {
              const selected = selectedTopics.includes(pattern.id);
              return (
                <button
                  key={pattern.id}
                  type="button"
                  onClick={() => toggleTopic(pattern.id)}
                  className={`p-2.5 rounded-xl border text-xs text-left transition-all flex items-center justify-between ${
                    selected
                      ? 'bg-slate-100/10 border-slate-300/60 text-slate-200 font-semibold'
                      : 'bg-zinc-950/80 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                  }`}
                >
                  <span className="truncate">{pattern.name}</span>
                  {selected && <Check className="w-3.5 h-3.5 text-slate-200 shrink-0 ml-1" />}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. Account & Platform Integration */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* User Account Sync */}
        <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4">
          <div className="flex items-center space-x-2">
            <UserIcon className="w-4 h-4 text-slate-300" />
            <h3 className="text-base font-bold text-zinc-100">Account & Auth Status</h3>
          </div>

          {userProfile?.email ? (
            <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-zinc-800 border border-zinc-700 overflow-hidden flex items-center justify-center shrink-0">
                  <img
                    src={getProfileAvatarUrl(
                      userProfile.photoURL,
                      userProfile.email,
                      userProfile.displayName
                    )}
                    alt={userProfile.displayName || 'Profile'}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-zinc-100">
                    {userProfile.displayName || 'Engineer'}
                  </h4>
                  <p className="text-xs text-zinc-400 font-mono">{userProfile.email}</p>
                </div>
              </div>

              <div className="pt-3 border-t border-zinc-800 flex items-center justify-between">
                <span className="text-[11px] font-mono text-slate-300 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Cloud Firestore Sync Active
                </span>
                <button
                  onClick={onSignOut}
                  className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-3">
              <p className="text-xs text-zinc-400 leading-relaxed">
                You are currently exploring Omega as a <strong>Guest Engineer</strong>. Sign in or create an account to sync your practice history and custom reflections across devices.
              </p>
              <button
                onClick={onOpenAuth}
                className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-zinc-950 text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md"
              >
                <UserIcon className="w-4 h-4" />
                <span>Sign In / Create Account</span>
              </button>
            </div>
          )}
        </div>

        {/* Platform Integrations Overview */}
        <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Link2 className="w-4 h-4 text-slate-300" />
              <h3 className="text-base font-bold text-zinc-100">Platform Integrations</h3>
            </div>
            <button
              onClick={() => onNavigateTab('connectors')}
              className="text-xs font-mono text-slate-300 hover:underline"
            >
              Manage Connectors →
            </button>
          </div>

          <p className="text-xs text-zinc-400">
            Connect LeetCode, HackerRank, Codeforces, or NeetCode to automatically ingest solved problems into your review queue.
          </p>

          <div className="space-y-2 pt-1">
            {['LeetCode', 'HackerRank', 'Codeforces', 'NeetCode'].map((platform) => {
              const isConn = connectedPlatforms.some((c) => c.platform === platform);
              return (
                <div
                  key={platform}
                  className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800/80 flex items-center justify-between text-xs"
                >
                  <span className="font-semibold text-zinc-200">{platform}</span>
                  {isConn ? (
                    <span className="text-[10px] font-mono text-slate-200 bg-slate-100/10 border border-slate-300/20 px-2 py-0.5 rounded-full flex items-center gap-1 font-bold">
                      <CheckCircle2 className="w-3 h-3" />
                      Connected
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono text-zinc-500">Not Connected</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
