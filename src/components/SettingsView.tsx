import React from 'react';
import {
  Sliders,
  User as UserIcon,
  Check,
  ShieldCheck,
  LogOut,
  Link2,
  CheckCircle2,
  Chrome,
  Download,
  Key,
  FolderOpen,
} from 'lucide-react';
import { UserProfile, PlatformConnection, UserGamification } from '../types';
import { ThemeSwitcher } from './ThemeSwitcher';
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
  onOpenExtensionPair?: () => void;
  onOpenDownloadExtension?: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  userProfile,
  connections,
  gamification,
  onSaveProfile,
  onOpenAuth,
  onSignOut,
  onNavigateTab,
  onOpenExtensionPair,
  onOpenDownloadExtension,
}) => {
  const connectedPlatforms = connections.filter((c) => c.connected);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-md">
        <div>
          <div className="flex items-center space-x-2">
            <Sliders className="w-5 h-5 text-slate-300" />
            <h1 className="text-xl sm:text-2xl font-bold text-zinc-100">
              System Settings & Configuration
            </h1>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Customize visual themes, Chrome extension connection, platform integrations, and account authentication.
          </p>
        </div>
      </div>

      {/* 1. Visual Theme Section */}
      <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-md">
        <ThemeSwitcher />
      </div>

      {/* 2. Chrome Extension Companion Suite */}
      <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800/80 pb-4">
          <div className="flex items-center space-x-3.5">
            <div className="w-11 h-11 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-xl shrink-0">
              <Chrome className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-zinc-100">Omega Chrome Extension</h3>
                <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full font-mono">
                  Manifest V3
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Download unpacked extension files and pair with a temporary 6-digit one-time code.
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigateTab('connectors')}
            className="text-xs text-slate-300 hover:text-slate-100 font-mono hover:underline flex items-center gap-1 cursor-pointer self-start sm:self-auto"
          >
            <span>View All Connectors →</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          {/* Download Extension Option */}
          <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800/80 flex flex-col justify-between space-y-3">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                  <Download className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-mono text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  Direct Save / ZIP
                </span>
              </div>
              <h4 className="text-sm font-bold text-zinc-100">Download Extension</h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Save the complete unpacked <code className="text-zinc-300 font-mono">omega-extension</code> directory directly to your machine or download as a .zip file.
              </p>
            </div>

            <button
              onClick={onOpenDownloadExtension}
              className="w-full py-2.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
            >
              <FolderOpen className="w-4 h-4" />
              <span>Download Extension</span>
            </button>
          </div>

          {/* Extension Auth Code Option */}
          <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800/80 flex flex-col justify-between space-y-3">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20">
                  <Key className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-mono text-blue-400 font-semibold bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                  6-Digit Code
                </span>
              </div>
              <h4 className="text-sm font-bold text-zinc-100">Extension Auth Code</h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Generate a temporary 6-digit pair token to authenticate the Chrome extension with your <strong className="text-zinc-200">{userProfile?.displayName || userProfile?.email || 'Omega account'}</strong>.
              </p>
            </div>

            <button
              onClick={onOpenExtensionPair}
              className="w-full py-2.5 px-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
            >
              <Key className="w-4 h-4" />
              <span>Generate 6-Digit Pair Code</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. Account & Platform Integration Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* User Account Sync */}
        <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4 shadow-md">
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
                  className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
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
                className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-zinc-950 text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer"
              >
                <UserIcon className="w-4 h-4" />
                <span>Sign In / Create Account</span>
              </button>
            </div>
          )}
        </div>

        {/* Platform Integrations Overview */}
        <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4 shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Link2 className="w-4 h-4 text-slate-300" />
              <h3 className="text-base font-bold text-zinc-100">Platform Integrations</h3>
            </div>
            <button
              onClick={() => onNavigateTab('connectors')}
              className="text-xs font-mono text-slate-300 hover:underline cursor-pointer"
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
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
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
