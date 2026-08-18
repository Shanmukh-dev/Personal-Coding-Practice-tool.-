// Omega Web App Bridge (Content Script)
// Runs automatically on Omega Web App domains (localhost, Cloud Run, *.run.app)
// Automatically syncs authenticated user profile, server URL, and extension state.

(function () {
  'use strict';

  // Helper to verify extension context is valid
  function isExtensionContextValid() {
    try {
      return Boolean(typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id);
    } catch (e) {
      return false;
    }
  }

  if (!isExtensionContextValid()) {
    return;
  }

  const appUrl = window.location.origin;

  // 1. Immediately store the current web app origin as the Omega Server URL
  try {
    if (isExtensionContextValid() && chrome.storage && chrome.storage.local) {
      chrome.storage.local.set({ omega_app_url: appUrl }, () => {
        if (chrome.runtime.lastError) {
          // ignore context invalidation silently
          return;
        }
        console.log('[Omega Extension Bridge] Set omega_app_url to:', appUrl);
      });
    }
  } catch (err) {
    console.warn('[Omega Extension Bridge] Storage init notice:', err.message);
  }

  // 2. Announce presence to the web application
  function announceExtensionReady() {
    if (!isExtensionContextValid()) return;
    try {
      window.postMessage(
        {
          type: 'OMEGA_EXTENSION_INSTALLED',
          version: '2.0.0',
          appUrl: appUrl,
        },
        '*'
      );
    } catch (e) {}
  }

  // Announce immediately and again when DOM is ready
  announceExtensionReady();
  window.addEventListener('DOMContentLoaded', announceExtensionReady);

  // 3. Listen for auth messages & sync requests from the Omega web dashboard
  function handleWindowMessage(event) {
    // Check if extension context is still valid (e.g. extension was reloaded or updated)
    if (!isExtensionContextValid()) {
      window.removeEventListener('message', handleWindowMessage);
      return;
    }

    // Only accept messages from same origin or valid Omega messages
    if (!event.data || typeof event.data !== 'object') return;

    try {
      // Handle user auth synchronization from web app
      if (event.data.type === 'OMEGA_SET_AUTH') {
        const user = event.data.user;
        const targetAppUrl = event.data.appUrl || appUrl;

        if (user && user.uid && isExtensionContextValid() && chrome.storage?.local) {
          chrome.storage.local.set(
            {
              omega_user: user,
              omega_app_url: targetAppUrl,
            },
            () => {
              if (chrome.runtime.lastError || !isExtensionContextValid()) return;
              console.log('[Omega Extension Bridge] User authenticated via web app:', user.email || user.displayName);
              try {
                if (isExtensionContextValid()) {
                  chrome.runtime.sendMessage({
                    type: 'UPDATE_AUTH_FROM_BRIDGE',
                    user: user,
                    appUrl: targetAppUrl,
                  });
                }
              } catch (e) {}

              // Notify web app of successful sync
              window.postMessage(
                {
                  type: 'OMEGA_EXTENSION_AUTH_SUCCESS',
                  user: user,
                },
                '*'
              );
            }
          );
        }
      }

      // Handle user stats synchronization from web app (heatmap, streak, today solved, recent logs)
      if (event.data.type === 'OMEGA_SET_STATS') {
        const stats = event.data.stats;
        if (stats && typeof stats === 'object' && isExtensionContextValid() && chrome.storage?.local) {
          chrome.storage.local.get(
            [
              'omega_daily_counts',
              'omega_logs',
              'omega_streak',
              'omega_today_count',
              'omega_monthly_solved',
              'omega_active_days',
            ],
            (currentRes) => {
              if (chrome.runtime.lastError || !isExtensionContextValid()) return;

              const currentDailyCounts = currentRes?.omega_daily_counts || {};
              const currentLogs = Array.isArray(currentRes?.omega_logs) ? currentRes.omega_logs : [];
              const mergedDailyCounts = { ...currentDailyCounts };

              if (stats.dailyCounts && typeof stats.dailyCounts === 'object') {
                Object.entries(stats.dailyCounts).forEach(([k, v]) => {
                  if (typeof v === 'number') {
                    mergedDailyCounts[k] = Math.max(mergedDailyCounts[k] || 0, v);
                  }
                });
              }

              // Also count any logs stored in local logs list
              currentLogs.forEach((l) => {
                if (l && l.timestamp) {
                  const d = new Date(l.timestamp);
                  const lKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
                  mergedDailyCounts[lKey] = Math.max(mergedDailyCounts[lKey] || 0, 1);
                }
              });

              // Merge logs preserving existing extension logs
              const incomingLogs = Array.isArray(stats.recentLogs) ? stats.recentLogs : [];
              const logMap = new Map();
              currentLogs.forEach((l) => { if (l && l.id) logMap.set(l.id, l); });
              incomingLogs.forEach((l) => { if (l && l.id) logMap.set(l.id, l); });
              const mergedLogs = Array.from(logMap.values())
                .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))
                .slice(0, 30);

              const now = new Date();
              const todayKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
              const todayLogsCount = currentLogs.filter((l) => {
                if (!l || !l.timestamp) return false;
                const d = new Date(l.timestamp);
                const lKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
                return lKey === todayKey;
              }).length;

              const todayCount = Math.max(
                currentRes?.omega_today_count || 0,
                mergedDailyCounts[todayKey] || 0,
                typeof stats.todayCount === 'number' ? stats.todayCount : 0,
                todayLogsCount
              );
              mergedDailyCounts[todayKey] = todayCount;

              const streak = Math.max(
                currentRes?.omega_streak || 0,
                typeof stats.streak === 'number' ? stats.streak : 0,
                todayCount > 0 ? 1 : 0
              );

              const payload = {
                omega_daily_counts: mergedDailyCounts,
                omega_streak: streak,
                omega_today_count: todayCount,
                omega_daily_goal: stats.dailyGoal || 3,
                omega_logs: mergedLogs,
                omega_monthly_solved: Math.max(currentRes?.omega_monthly_solved || 0, stats.monthlySolved || 0),
                omega_active_days: Math.max(currentRes?.omega_active_days || 0, stats.activeDays || 0),
                omega_last_stats_sync: Date.now(),
              };

              chrome.storage.local.set(payload, () => {
                if (chrome.runtime.lastError || !isExtensionContextValid()) return;
                try {
                  if (isExtensionContextValid()) {
                    chrome.runtime.sendMessage({
                      type: 'UPDATE_STATS_FROM_BRIDGE',
                      stats: {
                        todayCount,
                        streak,
                        dailyGoal: stats.dailyGoal || 3,
                        dailyCounts: mergedDailyCounts,
                        recentLogs: mergedLogs,
                        monthlySolved: payload.omega_monthly_solved,
                        activeDays: payload.omega_active_days,
                      },
                    });
                  }
                } catch (e) {}
              });
            }
          );
        }
      }

      // Handle user logout synchronization from web app
      if (event.data.type === 'OMEGA_LOGOUT') {
        if (isExtensionContextValid() && chrome.storage?.local) {
          chrome.storage.local.set({ omega_user: null }, () => {
            if (chrome.runtime.lastError || !isExtensionContextValid()) return;
            console.log('[Omega Extension Bridge] Extension user signed out via web app.');
            try {
              if (isExtensionContextValid()) {
                chrome.runtime.sendMessage({ type: 'AUTH_LOGOUT' });
              }
            } catch (e) {}
          });
        }
      }

      // Handle ping/presence check from web app
      if (event.data.type === 'OMEGA_PING_EXTENSION') {
        if (isExtensionContextValid() && chrome.storage?.local) {
          chrome.storage.local.get(['omega_user', 'omega_enabled'], (res) => {
            if (chrome.runtime.lastError || !isExtensionContextValid()) return;
            window.postMessage(
              {
                type: 'OMEGA_PONG_EXTENSION',
                version: '2.0.0',
                user: res.omega_user || null,
                enabled: res.omega_enabled !== false,
                appUrl: appUrl,
              },
              '*'
            );
          });
        }
      }
    } catch (err) {
      if (err.message && err.message.includes('Extension context invalidated')) {
        window.removeEventListener('message', handleWindowMessage);
      }
    }
  }

  window.addEventListener('message', handleWindowMessage);

  // 4. Listen for runtime broadcasts from background service worker and forward to web page
  try {
    if (isExtensionContextValid() && chrome.runtime && chrome.runtime.onMessage) {
      chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (!isExtensionContextValid() || !message || typeof message !== 'object') return;

        if (message.type === 'OMEGA_EXTENSION_LOG_RECEIVED' && message.log) {
          console.log('[Omega Extension Bridge] Forwarding extension log to dashboard window:', message.log.problemTitle || message.log.problemSlug);
          window.postMessage(
            {
              type: 'OMEGA_EXTENSION_LOG_RECEIVED',
              log: message.log,
              user: message.user,
            },
            '*'
          );
          if (sendResponse) sendResponse({ success: true, forwarded: true });
        }
      });
    }
  } catch (err) {
    console.warn('[Omega Extension Bridge] runtime listener notice:', err.message);
  }
})();
