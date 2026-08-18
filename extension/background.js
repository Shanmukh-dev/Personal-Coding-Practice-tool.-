// Omega Background Service Worker (Manifest V3)

const DEFAULT_FALLBACK_URL = 'https://ais-dev-xe62wcz6ciunnsbrgansz7-15217695281.asia-east1.run.app';
const APPLET_ID = 'b890841e-b34c-4b6c-a3b5-1066998148ae';

// Initialize default state & badge on install/startup
chrome.runtime.onInstalled.addListener(() => {
  initializeStorage();
  chrome.alarms.create('omega_keepalive', { periodInMinutes: 1 });
});

chrome.runtime.onStartup.addListener(() => {
  updateBadgeState();
  chrome.alarms.create('omega_keepalive', { periodInMinutes: 1 });
});

// Periodic alarm keepalive to ensure service worker responsiveness
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'omega_keepalive') {
    updateBadgeState();
  }
});

// Helper: Get today's local date key YYYY-MM-DD
function getTodayKey() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Find open Omega tabs to auto-detect the web app URL if needed
async function detectOmegaTabUrl() {
  try {
    const tabs = await chrome.tabs.query({});
    for (const tab of tabs) {
      if (tab.url) {
        if (
          tab.url.includes('.run.app') ||
          tab.url.includes('localhost:3000') ||
          tab.url.includes('127.0.0.1:3000') ||
          tab.url.includes('localhost:5173') ||
          tab.url.includes('web.app') ||
          tab.url.includes('firebaseapp.com') ||
          tab.url.includes('aistudio.google.com')
        ) {
          try {
            const urlObj = new URL(tab.url);
            if (urlObj.origin && !urlObj.origin.includes('chrome-extension://')) {
              return urlObj.origin;
            }
          } catch (e) {}
        }
      }
    }
  } catch (e) {
    console.warn('[Omega Background] tab query notice:', e);
  }
  return null;
}

// Initialize default storage data
function initializeStorage() {
  chrome.storage.local.get(
    [
      'omega_enabled',
      'omega_logs',
      'omega_daily_counts',
      'omega_app_url',
      'omega_streak',
      'omega_user',
    ],
    async (res) => {
      const isEnabled = res.omega_enabled !== undefined ? res.omega_enabled : true;
      const logs = res.omega_logs || [];
      const dailyCounts = res.omega_daily_counts || {};
      let appUrl = res.omega_app_url;

      if (!appUrl) {
        const detected = await detectOmegaTabUrl();
        appUrl = detected || DEFAULT_FALLBACK_URL;
      }

      const streak = res.omega_streak || 0;
      const user = res.omega_user || null;

      chrome.storage.local.set(
        {
          omega_enabled: isEnabled,
          omega_logs: logs,
          omega_daily_counts: dailyCounts,
          omega_app_url: appUrl,
          omega_streak: streak,
          omega_user: user,
        },
        () => {
          updateBadgeState(isEnabled);
        }
      );
    }
  );
}

// Update Extension Icon Badge text & background color
function updateBadgeState(explicitEnabled) {
  chrome.storage.local.get(['omega_enabled', 'omega_daily_counts', 'omega_user'], (res) => {
    const isEnabled =
      explicitEnabled !== undefined
        ? explicitEnabled
        : res.omega_enabled !== undefined
        ? res.omega_enabled
        : true;

    if (!isEnabled) {
      chrome.action.setBadgeText({ text: 'OFF' });
      chrome.action.setBadgeBackgroundColor({ color: '#64748b' }); // Muted Slate
      return;
    }

    const todayKey = getTodayKey();
    const count = (res.omega_daily_counts && res.omega_daily_counts[todayKey]) || 0;
    if (count > 0) {
      chrome.action.setBadgeText({ text: String(count) });
      chrome.action.setBadgeBackgroundColor({ color: '#10b981' }); // Emerald
    } else {
      chrome.action.setBadgeText({ text: 'ON' });
      chrome.action.setBadgeBackgroundColor({ color: '#10b981' }); // Emerald
    }
  });
}

// Handle messages from content script, bridge & popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // Bridge Notification: Auth updated
  if (message.type === 'UPDATE_AUTH_FROM_BRIDGE') {
    const user = message.user;
    const appUrl = message.appUrl;
    const updateObj = {};
    if (user) updateObj.omega_user = user;
    if (appUrl) updateObj.omega_app_url = appUrl;
    chrome.storage.local.set(updateObj, () => {
      updateBadgeState();
      sendResponse({ success: true });
    });
    return true;
  }

  // Bridge Notification: Stats updated
  if (message.type === 'UPDATE_STATS_FROM_BRIDGE') {
    const stats = message.stats || {};
    chrome.storage.local.get(
      [
        'omega_daily_counts',
        'omega_streak',
        'omega_daily_goal',
        'omega_logs',
        'omega_monthly_solved',
        'omega_active_days',
      ],
      (res) => {
        const localCounts = res.omega_daily_counts || {};
        const incomingCounts = stats.dailyCounts || {};
        const mergedCounts = { ...localCounts };
        Object.entries(incomingCounts).forEach(([dKey, val]) => {
          if (typeof val === 'number') {
            mergedCounts[dKey] = Math.max(mergedCounts[dKey] || 0, val);
          }
        });

        // Merge logs unioning by ID
        const localLogs = Array.isArray(res.omega_logs) ? res.omega_logs : [];
        const incomingLogs = Array.isArray(stats.recentLogs) ? stats.recentLogs : [];
        const logMap = new Map();
        localLogs.forEach((l) => { if (l && l.id) logMap.set(l.id, l); });
        incomingLogs.forEach((l) => { if (l && l.id) logMap.set(l.id, l); });
        const mergedLogs = Array.from(logMap.values())
          .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))
          .slice(0, 30);

        const todayKey = getTodayKey();
        const todayCount = Math.max(
          mergedCounts[todayKey] || 0,
          typeof stats.todayCount === 'number' ? stats.todayCount : 0
        );
        mergedCounts[todayKey] = todayCount;

        chrome.storage.local.set(
          {
            omega_daily_counts: mergedCounts,
            omega_streak: Math.max(res.omega_streak || 0, typeof stats.streak === 'number' ? stats.streak : 0, todayCount > 0 ? 1 : 0),
            omega_daily_goal: typeof stats.dailyGoal === 'number' && stats.dailyGoal > 0 ? stats.dailyGoal : (res.omega_daily_goal || 3),
            omega_logs: mergedLogs,
            omega_monthly_solved: Math.max(res.omega_monthly_solved || 0, typeof stats.monthlySolved === 'number' ? stats.monthlySolved : 0),
            omega_active_days: Math.max(res.omega_active_days || 0, typeof stats.activeDays === 'number' ? stats.activeDays : 0),
          },
          () => {
            updateBadgeState();
            sendResponse({ success: true });
          }
        );
      }
    );
    return true;
  }

  // 1. Get Status & User
  if (message.type === 'GET_STATUS' || message.type === 'SYNC_USER_STATS') {
    chrome.storage.local.get(
      [
        'omega_enabled',
        'omega_logs',
        'omega_daily_counts',
        'omega_app_url',
        'omega_streak',
        'omega_user',
        'omega_daily_goal',
        'omega_monthly_solved',
        'omega_active_days',
      ],
      async (res) => {
        let appUrl = res.omega_app_url;
        if (!appUrl || appUrl === DEFAULT_FALLBACK_URL) {
          const detected = await detectOmegaTabUrl();
          if (detected) {
            appUrl = detected;
            chrome.storage.local.set({ omega_app_url: detected });
          }
        }
        appUrl = (appUrl || DEFAULT_FALLBACK_URL).replace(/\/+$/, '');

        const todayKey = getTodayKey();
        let dailyCounts = { ...(res.omega_daily_counts || {}) };
        let logs = Array.isArray(res.omega_logs) ? res.omega_logs : [];
        let todayLogsCount = logs.filter((l) => {
          if (!l || !l.timestamp) return false;
          const d = new Date(l.timestamp);
          const lKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
          return lKey === todayKey;
        }).length;
        let todayCount = Math.max(dailyCounts[todayKey] || 0, todayLogsCount);
        dailyCounts[todayKey] = todayCount;

        let streak = res.omega_streak || (todayCount > 0 ? 1 : 0);
        let dailyGoal = res.omega_daily_goal || 3;
        let monthlySolved = res.omega_monthly_solved || 0;
        let activeDays = res.omega_active_days || 0;
        const user = res.omega_user || null;
        const isEnabled = res.omega_enabled !== undefined ? res.omega_enabled : true;

        // Try to fetch latest live stats from Omega Cloud Server if user is connected
        if (user && (user.uid || user.email)) {
          try {
            const queryParams = new URLSearchParams();
            if (user.uid) queryParams.set('userId', user.uid);
            if (user.email) queryParams.set('email', user.email);

            const fetchUrl = `${appUrl}/api/extension/user-stats?${queryParams.toString()}`;
            const statsResp = await fetch(fetchUrl);
            if (statsResp.ok) {
              const cloudStats = await statsResp.json();
              if (cloudStats && cloudStats.success) {
                // If cloud has daily counts, merge using Math.max
                if (cloudStats.dailyCounts && typeof cloudStats.dailyCounts === 'object') {
                  Object.entries(cloudStats.dailyCounts).forEach(([dKey, val]) => {
                    if (typeof val === 'number') {
                      dailyCounts[dKey] = Math.max(dailyCounts[dKey] || 0, val);
                    }
                  });
                }
                
                const cloudToday = typeof cloudStats.todayCount === 'number' ? cloudStats.todayCount : 0;
                todayCount = Math.max(todayCount, dailyCounts[todayKey] || 0, cloudToday, todayLogsCount);
                dailyCounts[todayKey] = todayCount;

                if (typeof cloudStats.streak === 'number' && cloudStats.streak > 0) {
                  streak = Math.max(streak, cloudStats.streak);
                }
                if (typeof cloudStats.dailyGoal === 'number' && cloudStats.dailyGoal > 0) {
                  dailyGoal = cloudStats.dailyGoal;
                }
                if (typeof cloudStats.monthlySolved === 'number' && cloudStats.monthlySolved > 0) {
                  monthlySolved = Math.max(monthlySolved, cloudStats.monthlySolved);
                }
                if (typeof cloudStats.activeDays === 'number' && cloudStats.activeDays > 0) {
                  activeDays = Math.max(activeDays, cloudStats.activeDays);
                }

                if (Array.isArray(cloudStats.recentLogs) && cloudStats.recentLogs.length > 0) {
                  const logMap = new Map();
                  logs.forEach((l) => { if (l && l.id) logMap.set(l.id, l); });
                  cloudStats.recentLogs.forEach((l) => { if (l && l.id) logMap.set(l.id, l); });
                  logs = Array.from(logMap.values())
                    .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))
                    .slice(0, 30);
                }

                // Cache fresh cloud data locally
                chrome.storage.local.set({
                  omega_daily_counts: dailyCounts,
                  omega_streak: streak,
                  omega_daily_goal: dailyGoal,
                  omega_logs: logs,
                  omega_monthly_solved: monthlySolved,
                  omega_active_days: activeDays,
                });
              }
            }
          } catch (cloudErr) {
            console.log('[Omega Extension] Fallback to local storage:', cloudErr.message);
          }
        }

        // Recalculate monthly solved and active days if needed
        if (monthlySolved === 0 || activeDays === 0) {
          const currentMonthPrefix = todayKey.substring(0, 7);
          let mSolved = 0;
          let mActive = 0;
          Object.entries(dailyCounts).forEach(([dKey, c]) => {
            if (dKey.startsWith(currentMonthPrefix) && typeof c === 'number' && c > 0) {
              mSolved += c;
              mActive += 1;
            }
          });
          if (mSolved > 0) monthlySolved = mSolved;
          if (mActive > 0) activeDays = mActive;
        }

        sendResponse({
          enabled: isEnabled,
          todayCount: todayCount || (dailyCounts[todayKey] || 0),
          dailyGoal,
          dailyCounts,
          monthlySolved,
          activeDays,
          recentLogs: logs.slice(0, 10),
          appUrl: appUrl || DEFAULT_FALLBACK_URL,
          streak,
          user,
        });
      }
    );
    return true; // Keep channel open for async response
  }

  // 2. Toggle On/Off
  if (message.type === 'TOGGLE_STATUS') {
    const newStatus = !!message.enabled;
    chrome.storage.local.set({ omega_enabled: newStatus }, () => {
      updateBadgeState(newStatus);
      sendResponse({ success: true, enabled: newStatus });
    });
    return true;
  }

  // 3. User Authentication: Login / Register with Email & Password
  if (message.type === 'AUTH_LOGIN') {
    (async () => {
      const res = await new Promise((r) => chrome.storage.local.get(['omega_app_url'], r));
      let appUrl = (res.omega_app_url || DEFAULT_FALLBACK_URL).replace(/\/+$/, '');

      async function attemptLogin(targetUrl) {
        const resp = await fetch(`${targetUrl}/api/extension/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: message.email,
            password: message.password,
            isSignUp: !!message.isSignUp,
            displayName: message.displayName || null,
          }),
        });
        return await resp.json();
      }

      try {
        let data;
        try {
          data = await attemptLogin(appUrl);
        } catch (fetchErr) {
          // If default failed, try auto-detecting open Omega tab
          const detected = await detectOmegaTabUrl();
          if (detected && detected !== appUrl) {
            appUrl = detected;
            chrome.storage.local.set({ omega_app_url: appUrl });
            data = await attemptLogin(appUrl);
          } else {
            throw fetchErr;
          }
        }

        if (data && data.success && data.user) {
          chrome.storage.local.set({ omega_user: data.user }, () => {
            updateBadgeState();
            sendResponse({ success: true, user: data.user, message: data.message });
          });
        } else {
          sendResponse({ success: false, error: data?.error || 'Authentication failed' });
        }
      } catch (err) {
        sendResponse({
          success: false,
          error: `Could not connect to Omega Server (${appUrl}). Check your Server URL settings.`,
        });
      }
    })();
    return true;
  }

  // 4. User Authentication: Pair with 6-Digit Code
  if (message.type === 'AUTH_PAIR_CODE') {
    (async () => {
      const res = await new Promise((r) => chrome.storage.local.get(['omega_app_url'], r));
      let appUrl = (res.omega_app_url || DEFAULT_FALLBACK_URL).replace(/\/+$/, '');

      async function attemptPair(targetUrl) {
        const resp = await fetch(`${targetUrl}/api/extension/auth/pair-code`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            pairCode: message.pairCode,
          }),
        });
        return { ok: resp.ok, status: resp.status, data: await resp.json() };
      }

      try {
        let result;
        try {
          result = await attemptPair(appUrl);
        } catch (fetchErr) {
          // Try auto-detecting open tab if target URL unreachable
          const detected = await detectOmegaTabUrl();
          if (detected && detected !== appUrl) {
            appUrl = detected;
            chrome.storage.local.set({ omega_app_url: appUrl });
            result = await attemptPair(appUrl);
          } else {
            throw fetchErr;
          }
        }

        if (result && result.ok && result.data && result.data.success && result.data.user) {
          chrome.storage.local.set({ omega_user: result.data.user }, () => {
            updateBadgeState();
            sendResponse({ success: true, user: result.data.user, message: result.data.message });
          });
        } else {
          sendResponse({
            success: false,
            error: result?.data?.error || 'Invalid or expired pair code',
          });
        }
      } catch (err) {
        sendResponse({
          success: false,
          error: `Could not connect to Omega Server (${appUrl}). Please ensure the Server URL is set to your active Omega web app or click "Configure Server URL".`,
        });
      }
    })();
    return true;
  }

  // 5. User Authentication: Sign Out
  if (message.type === 'AUTH_LOGOUT') {
    chrome.storage.local.set({ omega_user: null }, () => {
      updateBadgeState();
      sendResponse({ success: true });
    });
    return true;
  }

  // 6. Test/Ping Server Connection
  if (message.type === 'PING_SERVER') {
    (async () => {
      const targetUrl = (message.url || DEFAULT_FALLBACK_URL).replace(/\/+$/, '');
      try {
        const res = await fetch(`${targetUrl}/api/health`, { method: 'GET' });
        const data = await res.json();
        if (res.ok && data.status === 'ok') {
          sendResponse({ success: true, url: targetUrl });
        } else {
          sendResponse({ success: false, error: 'Invalid response from server' });
        }
      } catch (err) {
        sendResponse({ success: false, error: err.message || 'Cannot reach server' });
      }
    })();
    return true;
  }

  // 7. Record Practice Log
  if (message.type === 'RECORD_LOG') {
    const newLog = message.log;
    const todayKey = getTodayKey();

    chrome.storage.local.get(
      ['omega_logs', 'omega_daily_counts', 'omega_app_url', 'omega_streak', 'omega_user'],
      async (res) => {
        const user = res.omega_user || null;
        if (user) {
          if (user.uid) newLog.userId = user.uid;
          if (user.email) newLog.userEmail = user.email;
        }

        const logs = res.omega_logs || [];
        const dailyCounts = res.omega_daily_counts || {};
        const currentCount = dailyCounts[todayKey] || 0;
        dailyCounts[todayKey] = currentCount + 1;

        logs.unshift(newLog);

        let streak = res.omega_streak || 1;
        if (currentCount === 0) {
          streak += 1;
        }

        chrome.storage.local.set(
          {
            omega_logs: logs,
            omega_daily_counts: dailyCounts,
            omega_streak: streak,
          },
          () => {
            updateBadgeState();
            // Sync to hosted or local Omega server & broadcast to active tabs
            syncToServer(res.omega_app_url || DEFAULT_FALLBACK_URL, newLog, user);
            broadcastLogToOmegaTabs(newLog, user);
            sendResponse({ success: true, todayCount: dailyCounts[todayKey] });
          }
        );
      }
    );
    return true;
  }

  // 8. Fetch Problem Reflection History (to determine First vs Revision format)
  if (message.type === 'GET_PROBLEM_HISTORY') {
    const { slug, title, url } = message;
    const cleanSlug = (slug || '').trim().toLowerCase();
    const cleanTitle = (title || '').trim().toLowerCase();

    chrome.storage.local.get(['omega_logs', 'omega_user', 'omega_app_url'], async (res) => {
      const logs = res.omega_logs || [];
      
      // 1. Check local storage cache
      let previousLog = logs.find((l) => {
        const lSlug = (l.problemSlug || l.slug || '').trim().toLowerCase();
        const lTitle = (l.problemTitle || l.title || '').trim().toLowerCase();
        if (cleanSlug && lSlug && cleanSlug === lSlug) return true;
        if (cleanTitle && lTitle && cleanTitle === lTitle) return true;
        if (url && l.problemUrl && l.problemUrl === url) return true;
        return false;
      });

      // 2. If not found in local cache and server is configured, try querying server
      if (!previousLog && res.omega_user && res.omega_user.uid) {
        try {
          const appUrl = (res.omega_app_url || DEFAULT_FALLBACK_URL).replace(/\/+$/, '');
          const queryParams = new URLSearchParams({
            userId: res.omega_user.uid,
            slug: cleanSlug,
            title: cleanTitle,
          });
          const serverResp = await fetch(`${appUrl}/api/extension/problem-history?${queryParams}`, {
            headers: { 'Accept': 'application/json' }
          });
          if (serverResp.ok) {
            const historyData = await serverResp.json();
            if (historyData && historyData.hasPrevious && historyData.previousLog) {
              previousLog = historyData.previousLog;
            }
          }
        } catch (serverErr) {
          // Fallback gracefully
        }
      }

      if (previousLog) {
        sendResponse({
          hasPrevious: true,
          isRevision: true,
          previousLog: {
            confidence: previousLog.confidence || 3,
            feltDifficulty: previousLog.feltDifficulty || previousLog.difficulty || 'Medium',
            notes: previousLog.notes || '',
            timestamp: previousLog.timestamp || Date.now() - 86400000,
            recognizedPatternImmediately: previousLog.recognizedPatternImmediately ?? true,
            requiredHintsOrEditorial: previousLog.requiredHintsOrEditorial ?? false,
          },
        });
      } else {
        sendResponse({
          hasPrevious: false,
          isRevision: false,
          previousLog: null,
        });
      }
    });
    return true;
  }

  // 9. Configure Server URL
  if (message.type === 'SET_APP_URL') {
    const url = (message.url || DEFAULT_FALLBACK_URL).replace(/\/+$/, '');
    chrome.storage.local.set({ omega_app_url: url }, () => {
      sendResponse({ success: true, url });
    });
    return true;
  }

  // 10. Persistent Handled Submissions Deduplication
  if (message.type === 'MARK_SUBMISSION_HANDLED') {
    const key = message.key;
    if (key) {
      chrome.storage.local.get(['omega_handled_submissions'], (res) => {
        let list = res?.omega_handled_submissions || [];
        if (!Array.isArray(list)) list = [];
        const now = Date.now();
        list = list.filter((item) => {
          const ts = typeof item === 'object' && item?.ts ? item.ts : now;
          return now - ts < 48 * 3600 * 1000;
        });
        const exists = list.some((item) => (typeof item === 'string' ? item === key : item.key === key));
        if (!exists) {
          list.unshift({ key, ts: now });
          chrome.storage.local.set({ omega_handled_submissions: list.slice(0, 150) });
        }
        sendResponse({ success: true });
      });
      return true;
    }
  }
});

// Best effort server synchronization
async function syncToServer(appUrl, logData, user) {
  try {
    const targetUrl = `${appUrl.replace(/\/+$/, '')}/api/extension/log`;
    await fetch(targetUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        log: logData,
        userId: user ? user.uid : 'guest',
        userEmail: user ? user.email : undefined,
      }),
    });
    console.log('[Omega Extension] Synced log to server:', targetUrl);
  } catch (err) {
    console.log(
      '[Omega Extension] Server sync offline, stored locally in extension storage:',
      err.message
    );
  }
}

// Broadcast received logs to any open Omega web app tabs
function broadcastLogToOmegaTabs(logData, user) {
  try {
    chrome.tabs.query({}, (tabs) => {
      if (!tabs) return;
      tabs.forEach((tab) => {
        if (!tab.id) return;
        const tabUrl = tab.url || '';
        if (
          tabUrl.includes('localhost') ||
          tabUrl.includes('127.0.0.1') ||
          tabUrl.includes('run.app') ||
          tabUrl.includes('web.app') ||
          tabUrl.includes('firebaseapp.com') ||
          tabUrl.includes('aistudio.google.com')
        ) {
          chrome.tabs.sendMessage(
            tab.id,
            {
              type: 'OMEGA_EXTENSION_LOG_RECEIVED',
              log: logData,
              user: user,
            },
            () => {
              if (chrome.runtime.lastError) {
                // Ignore harmless communication errors on tabs without active listeners
              }
            }
          );
        }
      });
    });
  } catch (e) {
    console.log('[Omega Extension] Tab broadcast skipped:', e.message);
  }
}
