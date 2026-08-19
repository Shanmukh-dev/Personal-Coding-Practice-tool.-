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

  const CLOUD_APP_URL = 'https://omega-dsa.ai.studio';

  function getSanitizedOrigin() {
    try {
      const raw = window.location.origin;
      if (
        raw.includes('aistudio.google.com') ||
        raw === 'https://ai.studio' ||
        raw === 'http://ai.studio' ||
        raw.includes('google.com') ||
        raw.includes('googleusercontent.com')
      ) {
        return CLOUD_APP_URL;
      }
      return raw;
    } catch (e) {
      return CLOUD_APP_URL;
    }
  }

  const appUrl = getSanitizedOrigin();

  // 1. Store the valid web app origin as the Omega Server URL if not explicitly configured
  try {
    if (isExtensionContextValid() && chrome.storage && chrome.storage.local) {
      chrome.storage.local.get(['omega_app_url'], (res) => {
        if (!res?.omega_app_url || res.omega_app_url.includes('aistudio.google.com') || res.omega_app_url === 'https://ai.studio') {
          chrome.storage.local.set({ omega_app_url: appUrl }, () => {
            if (chrome.runtime.lastError) return;
            console.log('[Omega Extension Bridge] Set omega_app_url to:', appUrl);
          });
        }
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
        const token = event.data.token || null;
        const targetAppUrl = event.data.appUrl || appUrl;

        if (user && user.uid && isExtensionContextValid() && chrome.storage?.local) {
          const storePayload = {
            omega_user: user,
            omega_app_url: targetAppUrl,
          };
          if (token) {
            storePayload.omega_token = token;
          }

          chrome.storage.local.set(
            storePayload,
            () => {
              if (chrome.runtime.lastError || !isExtensionContextValid()) return;
              console.log('[Omega Extension Bridge] User authenticated via web app:', user.email || user.displayName);
              try {
                if (isExtensionContextValid()) {
                  chrome.runtime.sendMessage({
                    type: 'UPDATE_AUTH_FROM_BRIDGE',
                    user: user,
                    token: token,
                    appUrl: targetAppUrl,
                  });
                }
              } catch (e) {}

              // Notify web app of successful sync
              window.postMessage(
                {
                  type: 'OMEGA_EXTENSION_AUTH_SUCCESS',
                  user: user,
                  hasToken: Boolean(token),
                },
                '*'
              );
            }
          );
        }
      }

      // Handle user stats synchronization from web app (authoritative state sync)
      if (event.data.type === 'OMEGA_SET_STATS') {
        const stats = event.data.stats;
        if (stats && typeof stats === 'object' && isExtensionContextValid() && chrome.storage?.local) {
          const incomingCounts = (stats.dailyCounts && typeof stats.dailyCounts === 'object') ? stats.dailyCounts : {};
          const todayCount = typeof stats.todayCount === 'number' ? stats.todayCount : 0;
          const streak = typeof stats.streak === 'number' ? stats.streak : 0;
          const dailyGoal = typeof stats.dailyGoal === 'number' && stats.dailyGoal > 0 ? stats.dailyGoal : 3;
          const monthlySolved = typeof stats.monthlySolved === 'number' ? stats.monthlySolved : 0;
          const activeDays = typeof stats.activeDays === 'number' ? stats.activeDays : 0;
          const recentLogs = Array.isArray(stats.recentLogs) ? stats.recentLogs : [];

          const payload = {
            omega_daily_counts: incomingCounts,
            omega_streak: streak,
            omega_today_count: todayCount,
            omega_daily_goal: dailyGoal,
            omega_logs: recentLogs,
            omega_monthly_solved: monthlySolved,
            omega_active_days: activeDays,
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
                    dailyGoal,
                    dailyCounts: incomingCounts,
                    recentLogs,
                    monthlySolved,
                    activeDays,
                  },
                });
              }
            } catch (e) {}
          });
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
