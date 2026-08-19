import React, { useState, useEffect } from 'react';
import { 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  Wifi, 
  WifiOff, 
  ExternalLink, 
  Layers, 
  Radio,
  Clock,
  ArrowUpRight,
  ShieldCheck
} from 'lucide-react';

export interface SyncStatusWidgetProps {
  lastSyncTime: number | null;
  isSyncing: boolean;
  isExtensionDetected: boolean;
  onManualSync: () => void;
  onOpenPairModal: () => void;
  currentUser: any;
  compact?: boolean;
}

export const SyncStatusWidget: React.FC<SyncStatusWidgetProps> = ({
  lastSyncTime,
  isSyncing,
  isExtensionDetected,
  onManualSync,
  onOpenPairModal,
  currentUser,
  compact = false,
}) => {
  const [timeAgo, setTimeAgo] = useState<string>('Just now');
  const [showTooltip, setShowTooltip] = useState<boolean>(false);

  // Compute friendly relative time for last synchronization
  useEffect(() => {
    const updateFormattedTime = () => {
      if (!lastSyncTime) {
        setTimeAgo('Waiting for first sync');
        return;
      }
      const diffSec = Math.floor((Date.now() - lastSyncTime) / 1000);
      if (diffSec < 5) {
        setTimeAgo('Just now');
      } else if (diffSec < 60) {
        setTimeAgo(`${diffSec}s ago`);
      } else if (diffSec < 3600) {
        const mins = Math.floor(diffSec / 60);
        setTimeAgo(`${mins}m ago`);
      } else {
        const hrs = Math.floor(diffSec / 3600);
        setTimeAgo(`${hrs}h ago`);
      }
    };

    updateFormattedTime();
    const timer = setInterval(updateFormattedTime, 4000);
    return () => clearInterval(timer);
  }, [lastSyncTime]);

  if (compact) {
    return (
      <div 
        id="sync-status-compact"
        className="relative flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-900/90 border border-zinc-800/80 shadow-sm text-xs select-none"
      >
        <button
          onClick={onManualSync}
          disabled={isSyncing}
          className="flex items-center gap-1.5 text-zinc-300 hover:text-zinc-100 transition-colors group cursor-pointer"
          title="Click to force live synchronization with Chrome Extension & Cloud Server"
        >
          <span className="relative flex h-2 w-2">
            {isExtensionDetected ? (
              <>
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </>
            ) : (
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400"></span>
            )}
          </span>
          <span className="font-mono text-[11px] font-medium text-zinc-300 group-hover:text-zinc-100 flex items-center gap-1">
            <span>{isSyncing ? 'Syncing...' : isExtensionDetected ? 'Live Synced' : 'Cloud Polling'}</span>
          </span>
          <RefreshCw className={`w-3 h-3 text-zinc-400 group-hover:text-zinc-200 transition-transform ${isSyncing ? 'animate-spin text-blue-400' : ''}`} />
        </button>

        <span className="text-zinc-600 font-mono text-[10px]">&bull;</span>
        <span className="text-[10px] font-mono text-zinc-400 truncate max-w-[80px]" title={`Last sync: ${lastSyncTime ? new Date(lastSyncTime).toLocaleTimeString() : 'Pending'}`}>
          {timeAgo}
        </span>
      </div>
    );
  }

  return (
    <div 
      id="sync-status-detailed-widget"
      className="p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all"
    >
      <div className="flex items-center space-x-3.5 min-w-0">
        <div className={`p-2.5 rounded-xl border flex items-center justify-center shrink-0 ${
          isExtensionDetected 
            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
            : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
        }`}>
          {isExtensionDetected ? (
            <Radio className="w-5 h-5 animate-pulse text-emerald-400" />
          ) : (
            <WifiOff className="w-5 h-5 text-amber-400" />
          )}
        </div>

        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-zinc-100 flex items-center gap-1.5">
              <span>Extension & Dashboard Sync</span>
            </span>

            {isExtensionDetected ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                <span>Active Bridge Connected</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                <span>Cloud Standalone Sync</span>
              </span>
            )}
          </div>

          <p className="text-xs text-zinc-400 flex items-center gap-1.5">
            <Clock className="w-3 h-3 text-zinc-500 shrink-0" />
            <span>Last state synchronization: <strong className="text-zinc-200 font-mono">{timeAgo}</strong></span>
            {lastSyncTime && (
              <span className="hidden sm:inline text-zinc-500 font-mono text-[11px]">
                ({new Date(lastSyncTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })})
              </span>
            )}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2.5 shrink-0 self-end md:self-center">
        <button
          id="btn-manual-sync-dashboard"
          onClick={onManualSync}
          disabled={isSyncing}
          className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 active:scale-95 text-zinc-200 border border-zinc-700 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-slate-300 ${isSyncing ? 'animate-spin text-blue-400' : ''}`} />
          <span>{isSyncing ? 'Syncing...' : 'Sync Now'}</span>
        </button>

        <button
          id="btn-open-pair-sync"
          onClick={onOpenPairModal}
          className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-zinc-950 text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
        >
          <ShieldCheck className="w-3.5 h-3.5 text-zinc-900" />
          <span>{isExtensionDetected ? 'Pairing Info' : 'Pair Extension'}</span>
        </button>
      </div>
    </div>
  );
};
