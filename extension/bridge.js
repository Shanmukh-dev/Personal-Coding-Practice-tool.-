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
          chrome.storage.local.set(
            {
              omega_daily_counts: stats.dailyCounts || {},
              omega_streak: stats.streak || 0,
              omega_today_count: stats.todayCount || 0,
              omega_daily_goal: stats.dailyGoal || 3,
              omega_logs: stats.recentLogs || [],
              omega_monthly_solved: stats.monthlySolved || 0,
              omega_active_days: stats.activeDays || 0,
              omega_last_stats_sync: Date.now(),
            },
            () => {
              if (chrome.runtime.lastError || !isExtensionContextValid()) return;
              console.log('[Omega Extension Bridge] Stats synchronized from web app:', stats.todayCount, 'today, streak:', stats.streak);
              try {
                if (isExtensionContextValid()) {
                  chrome.runtime.sendMessage({
                    type: 'UPDATE_STATS_FROM_BRIDGE',
                    stats: stats,
                  });
                }
              } catch (e) {}
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
})();
