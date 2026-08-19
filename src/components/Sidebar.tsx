import React, { useState } from 'react';
import {
  Flame,
  Zap,
  Target,
  BookOpen,
  RotateCw,
  Layers,
  Brain,
  Bug,
  Bot,
  Link2,
  User as UserIcon,
  Sparkles,
  Trophy,
  Menu,
  X,
  Calendar,
  Sliders,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import { UserProfile, UserGamification } from '../types';
import { getProfileAvatarUrl } from '../utils/avatar';
import { Logo } from './Logo';

interface SidebarProps {
  userProfile: UserProfile | null;
  gamification: UserGamification | null;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenAuth: () => void;
  onSignOut?: () => void;
  onOpenOnboarding: () => void;
  onOpenExtensionPair?: () => void;
  onOpenDownloadExtension?: () => void;
  dueRevisionsCount?: number;
  queueProgressText?: string;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  lastSyncTime?: number | null;
  isSyncing?: boolean;
  isExtensionDetected?: boolean;
  onManualSync?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  userProfile,
  gamification,
  activeTab,
  setActiveTab,
  onOpenAuth,
  dueRevisionsCount = 0,
  queueProgressText,
  isCollapsed: propIsCollapsed,
  onToggleCollapse,
}) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [internalCollapsed, setInternalCollapsed] = useState(false);
  const isCollapsed = propIsCollapsed ?? internalCollapsed;

  const handleToggleCollapse = () => {
    if (onToggleCollapse) {
      onToggleCollapse();
    } else {
      setInternalCollapsed(!internalCollapsed);
    }
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Target },
    {
      id: 'daily-queue',
      label: 'Daily Queue',
      icon: Layers,
      badge: queueProgressText,
    },
    {
      id: 'calendar',
      label: 'Calendar Schedule',
      icon: Calendar,
    },
    {
      id: 'revision',
      label: 'Revisions',
      icon: RotateCw,
      badge: dueRevisionsCount > 0 ? `${dueRevisionsCount}` : undefined,
      badgeColor: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    },
    { id: 'catalog', label: 'Problem Catalog', icon: BookOpen },
    { id: 'patterns', label: 'Pattern Taxonomy', icon: Brain },
    { id: 'memory', label: 'Knowledge Memory', icon: Sparkles },
    { id: 'mistakes', label: 'Mistake Journal', icon: Bug },
    { id: 'connectors', label: 'Platforms', icon: Link2 },
    { id: 'coach', label: 'AI Adaptive Coach', icon: Bot },
    { id: 'gamification', label: 'Streaks & Badges', icon: Trophy },
    { id: 'settings', label: 'Settings & Theme', icon: Sliders },
  ];

  const handleTabClick = (id: string) => {
    setActiveTab(id);
    setMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Top Header */}
      <div className="md:hidden sticky top-0 z-40 w-full h-14 bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800 px-4 flex items-center justify-between">
        <div
          className="flex items-center space-x-2.5 cursor-pointer"
          onClick={() => handleTabClick('dashboard')}
        >
          <Logo size="sm" />
          <span className="font-bold tracking-tight text-zinc-100 text-sm">
            Omega
          </span>
        </div>

        <div className="flex items-center space-x-2">
          {userProfile && (
            <div className="flex items-center space-x-1 px-2 py-0.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-[11px] font-mono">
              <Flame className="w-3 h-3 fill-orange-400/20" />
              <span>{gamification?.currentStreak || 0}d</span>
            </div>
          )}

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-zinc-100"
            aria-label="Toggle Sidebar"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/70 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 bg-zinc-950 border-r border-zinc-800/80 flex flex-col overflow-hidden transition-all duration-300 ease-in-out md:translate-x-0 ${
          isCollapsed ? 'w-64 md:w-16' : 'w-64 md:w-64'
        } ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Top Header & Branding */}
        <div className={`flex flex-col space-y-3 p-3 border-b border-zinc-800/80 shrink-0 ${isCollapsed ? 'items-center' : ''}`}>
          <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between w-full'}`}>
            {isCollapsed ? (
              <button
                onClick={handleToggleCollapse}
                className="group relative flex items-center justify-center cursor-pointer focus:outline-none"
                title="Expand Sidebar"
              >
                {/* Standard Logo */}
                <div className="transition-all duration-200 group-hover:opacity-0 group-hover:scale-95">
                  <Logo size="md" />
                </div>

                {/* Expand Button Icon shown on Hover */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 scale-95 group-hover:scale-100 bg-zinc-800 text-zinc-100 border border-zinc-700 rounded-md shadow-sm">
                  <PanelLeftOpen className="w-5 h-5 text-zinc-100" />
                </div>
              </button>
            ) : (
              <div
                className="flex items-center space-x-3 cursor-pointer"
                onClick={() => handleTabClick('dashboard')}
                title="Omega - Dashboard"
              >
                <Logo size="md" />
                <div className="flex flex-col min-w-0">
                  <span className="font-bold tracking-tight text-zinc-100 text-sm flex items-center gap-1.5">
                    Omega
                  </span>
                  <span className="text-[10px] font-mono text-zinc-500">
                    Adaptive Learning OS
                  </span>
                </div>
              </div>
            )}

            <div className="flex items-center space-x-1">
              {!isCollapsed && (
                <button
                  onClick={handleToggleCollapse}
                  className="hidden md:flex p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
                  title="Collapse Sidebar"
                >
                  <PanelLeftClose className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={() => setMobileOpen(false)}
                className="md:hidden p-1 rounded-lg text-zinc-400 hover:text-zinc-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* User Gamification Strip in Sidebar */}
          {userProfile && (
            !isCollapsed ? (
              <div className="p-2 rounded-xl bg-zinc-900/80 border border-zinc-800/80 flex items-center justify-around">
                <div className="flex items-center space-x-1.5">
                  <Flame className="w-3.5 h-3.5 text-orange-400 fill-orange-400/20" />
                  <div className="flex flex-col">
                    <span className="text-[9px] font-mono text-zinc-500 uppercase leading-none">
                      Streak
                    </span>
                    <span className="text-xs font-mono font-bold text-orange-400">
                      {gamification?.currentStreak || 0} Days
                    </span>
                  </div>
                </div>

                <div className="h-5 w-[1px] bg-zinc-800" />

                <div className="flex items-center space-x-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <div className="flex flex-col">
                    <span className="text-[9px] font-mono text-zinc-500 uppercase leading-none">
                      Level
                    </span>
                    <span className="text-xs font-mono font-bold text-zinc-200">
                      Lvl {gamification?.level || 1}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div
                className="py-1 px-1 rounded-lg bg-zinc-900/80 border border-zinc-800/80 flex flex-col items-center gap-1"
                title={`Streak: ${gamification?.currentStreak || 0} Days | Level: ${gamification?.level || 1}`}
              >
                <div className="flex items-center space-x-0.5 text-orange-400">
                  <Flame className="w-3.5 h-3.5 fill-orange-400/20 shrink-0" />
                  <span className="text-[10px] font-mono font-bold">{gamification?.currentStreak || 0}</span>
                </div>
              </div>
            )
          )}
        </div>

        {/* Navigation Items */}
        <div className="flex-1 min-h-0 overflow-y-auto px-2 py-2 space-y-1 custom-scrollbar">
          {!isCollapsed && (
            <div className="px-3 pb-1 pt-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 font-semibold block">
                Navigation
              </span>
            </div>
          )}

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                title={item.label}
                className={`w-full flex items-center ${
                  isCollapsed ? 'justify-center p-2.5' : 'justify-between px-3 py-2'
                } rounded-lg text-xs font-medium transition-all group relative ${
                  isActive
                    ? 'bg-zinc-800 text-zinc-100 font-bold border border-zinc-700/80 shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50'
                }`}
              >
                <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-2.5'} min-w-0`}>
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-colors ${
                      isActive ? 'text-zinc-100' : 'text-zinc-500 group-hover:text-zinc-300'
                    }`}
                  />
                  {!isCollapsed && <span className="truncate">{item.label}</span>}
                </div>

                {!isCollapsed && item.badge && (
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.5 rounded border shrink-0 ${
                      item.badgeColor || 'bg-zinc-800 text-zinc-400 border-zinc-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}

                {isCollapsed && item.badge && (
                  <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-blue-500 ring-2 ring-zinc-950" />
                )}
              </button>
            );
          })}
        </div>

        {/* Bottom Profile Footer */}
        <div className="p-2 border-t border-zinc-800/80 bg-zinc-950/60 shrink-0">
          {userProfile ? (
            !isCollapsed ? (
              <button
                onClick={() => handleTabClick('profile')}
                className={`w-full p-2.5 rounded-xl border flex items-center space-x-3 text-left transition-all group ${
                  activeTab === 'profile'
                    ? 'bg-blue-600/10 border-blue-500/40 ring-1 ring-blue-500/30'
                    : 'bg-zinc-900/70 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/60'
                }`}
                title="Engineer Profile & Account"
              >
                <div className="w-8 h-8 rounded-lg bg-zinc-800 border border-zinc-700 overflow-hidden flex items-center justify-center shrink-0">
                  <img
                    src={getProfileAvatarUrl(userProfile.photoURL, userProfile.email, userProfile.displayName)}
                    alt={userProfile.displayName || 'Profile'}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                </div>
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="text-xs font-semibold text-zinc-200 truncate block group-hover:text-zinc-100">
                    {userProfile.displayName ||
                      userProfile.email?.split('@')[0] ||
                      'Engineer'}
                  </span>
                  <span className="text-[10px] font-mono text-zinc-400 truncate block">
                    {userProfile.targetInterviewLevel} Level
                  </span>
                </div>
              </button>
            ) : (
              <div className="flex flex-col items-center py-1">
                <button
                  onClick={() => handleTabClick('profile')}
                  className={`w-9 h-9 rounded-lg border overflow-hidden flex items-center justify-center shrink-0 transition-all ${
                    activeTab === 'profile'
                      ? 'bg-zinc-800 border-blue-500 ring-2 ring-blue-500/30'
                      : 'bg-zinc-800 border-zinc-700 hover:border-zinc-500'
                  }`}
                  title={`${userProfile.displayName || 'Profile'} (${userProfile.targetInterviewLevel} Level)`}
                >
                  <img
                    src={getProfileAvatarUrl(userProfile.photoURL, userProfile.email, userProfile.displayName)}
                    alt={userProfile.displayName || 'Profile'}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </button>
              </div>
            )
          ) : (
            <button
              onClick={onOpenAuth}
              className={`w-full py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-zinc-950 font-semibold text-xs transition-all shadow-md flex items-center justify-center ${
                isCollapsed ? 'p-2' : 'gap-2 px-3'
              }`}
              title="Sign In / Sync Data"
            >
              <UserIcon className="w-4 h-4 shrink-0" />
              {!isCollapsed && <span>Sign In</span>}
            </button>
          )}
        </div>
      </aside>
    </>
  );
};
