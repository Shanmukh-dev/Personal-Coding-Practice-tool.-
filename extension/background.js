// Omega Background Service Worker (Manifest V3)

const DEFAULT_FALLBACK_URL = 'https://omega-dsa.ai.studio';
const APPLET_ID = 'b890841e-b34c-4b6c-a3b5-1066998148ae';

// Helper to normalize and sanitize Omega server URLs
function normalizeAppUrl(rawUrl) {
  if (!rawUrl || typeof rawUrl !== 'string') return DEFAULT_FALLBACK_URL;
  let url = rawUrl.trim();
  if (
    url.includes('aistudio.google.com') ||
    url === 'https://ai.studio' ||
    url === 'http://ai.studio' ||
    url === 'https://ai.studio/' ||
    url.includes('google.com') ||
    url === ''
  ) {
    return DEFAULT_FALLBACK_URL;
  }
  if (!/^https?:\/\//i.test(url)) {
    url = 'https://' + url;
  }
  return url.replace(/\/+$/, '');
}

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

// Helper: Query authoritative database state from candidate server URLs
async function fetchAuthoritativeCloudStats(appUrl, user, token, todayKey, tzOffset) {
  const primaryUrl = normalizeAppUrl(appUrl);
  const candidateUrls = [
    primaryUrl,
    'https://ais-dev-xe62wcz6ciunnsbrgansz7-15217695281.asia-east1.run.app',
    'https://ais-pre-xe62wcz6ciunnsbrgansz7-15217695281.asia-east1.run.app',
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'https://omega-dsa.ai.studio',
  ];

  try {
    const detected = await detectOmegaTabUrl();
    if (detected && !candidateUrls.includes(detected)) {
      candidateUrls.unshift(detected);
    }
  } catch (e) {}

  const uniqueUrls = Array.from(new Set(candidateUrls.map((u) => (u || '').replace(/\/+$/, '')))).filter(Boolean);

  for (const targetUrl of uniqueUrls) {
    try {
      let statsResp = null;
      if (token) {
        // Dedicated secure endpoint with JWT authentication
        statsResp = await fetch(
          `${targetUrl}/api/extension/secure/data?todayKey=${encodeURIComponent(todayKey)}&tzOffset=${tzOffset}`,
          {
            headers: {
              'Accept': 'application/json',
              'Authorization': `Bearer ${token}`,
              'x-today-date-key': todayKey,
              'x-timezone-offset': String(tzOffset),
            },
          }
        );
      } else if (user && (user.uid || user.email)) {
        // Fallback query endpoint
        const queryParams = new URLSearchParams();
        if (user.uid) queryParams.set('userId', user.uid);
        if (user.email) queryParams.set('email', user.email);
        queryParams.set('todayKey', todayKey);
        queryParams.set('tzOffset', String(tzOffset));
        statsResp = await fetch(`${targetUrl}/api/extension/user-stats?${queryParams.toString()}`, {
          headers: {
            'Accept': 'application/json',
            'x-today-date-key': todayKey,
            'x-timezone-offset': String(tzOffset),
          },
        });
      }

      if (statsResp && statsResp.ok) {
        const cloudData = await statsResp.json();
        if (cloudData && cloudData.success) {
          const cloudStats = cloudData.stats || cloudData;
          chrome.storage.local.set({ omega_app_url: targetUrl });
          return {
            isCloudSynced: true,
            workingUrl: targetUrl,
            cloudStats: cloudStats,
            dailyQueue: cloudData.dailyQueue || [],
            revisionsDue: cloudData.revisionsDue || [],
            mistakes: cloudData.mistakes || [],
          };
        }
      }
    } catch (err) {
      // Continue to next candidate URL
    }
  }

  return { isCloudSynced: false, workingUrl: primaryUrl, cloudStats: null };
}

// Find open Omega tabs to auto-detect the web app URL if needed
async function detectOmegaTabUrl() {
  try {
    const tabs = await chrome.tabs.query({});
    for (const tab of tabs) {
      if (tab.url) {
        if (tab.url.includes('omega-dsa.ai.studio')) {
          return DEFAULT_FALLBACK_URL;
        }
        if (tab.url.includes('localhost:3000') || tab.url.includes('127.0.0.1:3000')) {
          return 'http://localhost:3000';
        }
        if (tab.url.includes('.run.app')) {
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
  return DEFAULT_FALLBACK_URL;
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
      
      let appUrl = normalizeAppUrl(res.omega_app_url);
      if (!res.omega_app_url || res.omega_app_url.includes('aistudio.google.com')) {
        appUrl = DEFAULT_FALLBACK_URL;
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

// Helper to get theme-adaptive icon paths
// Rule:
// - Dark-themed browser toolbar -> Use icon with light background (iconXX-light.png) for high contrast
// - Light-themed browser toolbar -> Use icon with dark background (iconXX-dark.png) for high contrast
function getIconPaths(theme) {
  const isDarkBrowser = theme === 'dark';
  const suffix = isDarkBrowser ? '-light' : '-dark';
  return {
    16: `icons/icon16${suffix}.png`,
    32: `icons/icon32${suffix}.png`,
    48: `icons/icon48${suffix}.png`,
    128: `icons/icon128${suffix}.png`,
  };
}

// Update Extension Icon Badge text & background color
function updateBadgeState(explicitEnabled) {
  chrome.storage.local.get(['omega_enabled', 'omega_daily_counts', 'omega_user', 'omega_browser_theme'], (res) => {
    const isEnabled =
      explicitEnabled !== undefined
        ? explicitEnabled
        : res.omega_enabled !== undefined
        ? res.omega_enabled
        : true;

    const browserTheme = res.omega_browser_theme || 'light';
    const iconPaths = getIconPaths(browserTheme);

    if (!isEnabled) {
      // Inactive: No badge text or indicator dot
      chrome.action.setBadgeText({ text: '' });
      try {
        chrome.action.setIcon({ path: iconPaths });
      } catch (e) {}
      return;
    }

    // Set theme-adaptive active icon
    try {
      chrome.action.setIcon({ path: iconPaths });
    } catch (e) {}

    const todayKey = getTodayKey();
    const count = (res.omega_daily_counts && res.omega_daily_counts[todayKey]) || 0;
    if (count > 0) {
      // Show solve count alone when active and completed today
      chrome.action.setBadgeText({ text: String(count) });
      chrome.action.setBadgeBackgroundColor({ color: '#10b981' }); // Emerald Green
      try {
        if (chrome.action.setBadgeTextColor) {
          chrome.action.setBadgeTextColor({ color: '#ffffff' });
        }
      } catch (e) {}
    } else {
      // Active with 0 solve count: No dot or text badge
      chrome.action.setBadgeText({ text: '' });
    }
  });
}

// Handle messages from content script, bridge & popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // Browser theme change notification from content script / popup
  if (message.type === 'UPDATE_BROWSER_THEME') {
    const theme = message.theme === 'dark' ? 'dark' : 'light';
    chrome.storage.local.set({ omega_browser_theme: theme }, () => {
      updateBadgeState();
      sendResponse({ success: true, theme });
    });
    return true;
  }
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

  // Bridge Notification: Authoritative stats updated from web app
  if (message.type === 'UPDATE_STATS_FROM_BRIDGE') {
    const stats = message.stats || {};
    const todayCount = typeof stats.todayCount === 'number' ? stats.todayCount : 0;
    const streak = typeof stats.streak === 'number' ? stats.streak : 0;
    const dailyGoal = typeof stats.dailyGoal === 'number' && stats.dailyGoal > 0 ? stats.dailyGoal : 3;
    const monthlySolved = typeof stats.monthlySolved === 'number' ? stats.monthlySolved : 0;
    const activeDays = typeof stats.activeDays === 'number' ? stats.activeDays : 0;
    const dailyCounts = (stats.dailyCounts && typeof stats.dailyCounts === 'object') ? stats.dailyCounts : {};
    const recentLogs = Array.isArray(stats.recentLogs) ? stats.recentLogs : [];
    const lastSyncTime = Date.now();

    chrome.storage.local.set(
      {
        omega_daily_counts: dailyCounts,
        omega_streak: streak,
        omega_today_count: todayCount,
        omega_daily_goal: dailyGoal,
        omega_logs: recentLogs,
        omega_monthly_solved: monthlySolved,
        omega_active_days: activeDays,
        omega_last_stats_sync: lastSyncTime,
      },
      () => {
        updateBadgeState();
        sendResponse({ success: true, lastSyncTime });
      }
    );
    return true;
  }

  // 0. Update Auth from Bridge (Web App)
  if (message.type === 'UPDATE_AUTH_FROM_BRIDGE') {
    const user = message.user;
    const token = message.token || null;
    const appUrl = message.appUrl;
    const payload = { omega_user: user };
    if (token) payload.omega_token = token;
    if (appUrl) payload.omega_app_url = appUrl;

    chrome.storage.local.set(payload, () => {
      updateBadgeState();
      sendResponse({ success: true });
    });
    return true;
  }

  // 1. Get Status & User (Live sync with Firestore database via secure JWT endpoint)
  if (message.type === 'GET_STATUS' || message.type === 'SYNC_USER_STATS') {
    chrome.storage.local.get(
      [
        'omega_enabled',
        'omega_logs',
        'omega_daily_counts',
        'omega_app_url',
        'omega_streak',
        'omega_user',
        'omega_token',
        'omega_daily_goal',
        'omega_monthly_solved',
        'omega_active_days',
        'omega_last_stats_sync',
      ],
      async (res) => {
        const user = res.omega_user || null;
        const token = res.omega_token || null;
        const isEnabled = res.omega_enabled !== undefined ? res.omega_enabled : true;
        const todayKey = getTodayKey();
        const tzOffset = new Date().getTimezoneOffset();

        let dailyCounts = { ...(res.omega_daily_counts || {}) };
        let logs = Array.isArray(res.omega_logs) ? res.omega_logs : [];
        let todayCount = typeof res.omega_today_count === 'number' ? res.omega_today_count : (dailyCounts[todayKey] || 0);
        let streak = typeof res.omega_streak === 'number' ? res.omega_streak : (todayCount > 0 ? 1 : 0);
        let dailyGoal = res.omega_daily_goal || 3;
        let monthlySolved = typeof res.omega_monthly_solved === 'number' ? res.omega_monthly_solved : 0;
        let activeDays = typeof res.omega_active_days === 'number' ? res.omega_active_days : 0;
        let lastSyncTime = res.omega_last_stats_sync || null;
        let isCloudSynced = false;
        let dailyQueue = [];
        let revisionsDue = [];
        let mistakes = [];
        let xp = 0;
        let level = 1;
        let currentWorkingUrl = normalizeAppUrl(res.omega_app_url);

        // Fetch live authoritative state directly from the server database
        if (token || (user && (user.uid || user.email))) {
          const fetchResult = await fetchAuthoritativeCloudStats(
            res.omega_app_url,
            user,
            token,
            todayKey,
            tzOffset
          );

          if (fetchResult.isCloudSynced && fetchResult.cloudStats) {
            isCloudSynced = true;
            currentWorkingUrl = fetchResult.workingUrl;
            lastSyncTime = Date.now();
            const cs = fetchResult.cloudStats;

            if (cs.dailyCounts && typeof cs.dailyCounts === 'object') {
              dailyCounts = cs.dailyCounts;
            }
            if (typeof cs.todayCount === 'number') {
              todayCount = cs.todayCount;
            }
            if (typeof cs.streak === 'number') {
              streak = cs.streak;
            }
            if (typeof cs.dailyGoal === 'number' && cs.dailyGoal > 0) {
              dailyGoal = cs.dailyGoal;
            }
            if (typeof cs.monthlySolved === 'number') {
              monthlySolved = cs.monthlySolved;
            }
            if (typeof cs.activeDays === 'number') {
              activeDays = cs.activeDays;
            }
            if (typeof cs.xp === 'number') {
              xp = cs.xp;
            }
            if (typeof cs.level === 'number') {
              level = cs.level;
            }
            if (Array.isArray(cs.recentLogs)) {
              logs = cs.recentLogs;
            }
            if (Array.isArray(fetchResult.dailyQueue)) {
              dailyQueue = fetchResult.dailyQueue;
            }
            if (Array.isArray(fetchResult.revisionsDue)) {
              revisionsDue = fetchResult.revisionsDue;
            }
            if (Array.isArray(fetchResult.mistakes)) {
              mistakes = fetchResult.mistakes;
            }

            // Persist fresh authoritative stats to storage
            chrome.storage.local.set({
              omega_daily_counts: dailyCounts,
              omega_streak: streak,
              omega_today_count: todayCount,
              omega_daily_goal: dailyGoal,
              omega_logs: logs,
              omega_monthly_solved: monthlySolved,
              omega_active_days: activeDays,
              omega_last_stats_sync: lastSyncTime,
              omega_app_url: currentWorkingUrl,
            });
          }
        }

        // Recalculate monthly solved and active days if missing
        if (monthlySolved === 0 && activeDays === 0) {
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

        updateBadgeState(isEnabled);

        sendResponse({
          enabled: isEnabled,
          todayCount: todayCount,
          dailyGoal,
          dailyCounts,
          monthlySolved,
          activeDays,
          recentLogs: logs.slice(0, 15),
          dailyQueue,
          revisionsDue,
          mistakes,
          xp,
          level,
          appUrl: currentWorkingUrl || DEFAULT_FALLBACK_URL,
          streak,
          user,
          token,
          lastSyncTime,
          isCloudSynced,
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
          const storePayload = { omega_user: data.user };
          if (data.token) storePayload.omega_token = data.token;

          chrome.storage.local.set(storePayload, () => {
            updateBadgeState();
            sendResponse({ success: true, user: data.user, token: data.token, message: data.message });
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
          const storePayload = { omega_user: result.data.user };
          if (result.data.token) storePayload.omega_token = result.data.token;

          chrome.storage.local.set(storePayload, () => {
            updateBadgeState();
            sendResponse({ success: true, user: result.data.user, token: result.data.token, message: result.data.message });
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
    chrome.storage.local.set({ omega_user: null, omega_token: null }, () => {
      updateBadgeState();
      sendResponse({ success: true });
    });
    return true;
  }

  // 6. Test/Ping Server Connection
  if (message.type === 'PING_SERVER') {
    (async () => {
      const targetUrl = normalizeAppUrl(message.url);
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

  // 7. Record Practice Log (with JWT authentication & direct Firestore update)
  if (message.type === 'RECORD_LOG') {
    const newLog = message.log;

    chrome.storage.local.get(
      ['omega_logs', 'omega_app_url', 'omega_user', 'omega_token'],
      async (res) => {
        const user = res.omega_user || null;
        const token = res.omega_token || null;
        if (user) {
          if (user.uid) newLog.userId = user.uid;
          if (user.email) newLog.userEmail = user.email;
        }

        // Post directly to Omega backend endpoint for database update
        const syncResult = await syncToServer(res.omega_app_url || DEFAULT_FALLBACK_URL, newLog, user, token);
        broadcastLogToOmegaTabs(newLog, user);

        if (syncResult && syncResult.success) {
          const stats = syncResult.stats || {};
          const confirmedTodayCount = typeof syncResult.todayCount === 'number'
            ? syncResult.todayCount
            : (typeof stats.todayCount === 'number' ? stats.todayCount : 1);

          const updatePayload = {
            omega_today_count: confirmedTodayCount,
            omega_last_stats_sync: Date.now(),
          };
          if (stats.dailyCounts) updatePayload.omega_daily_counts = stats.dailyCounts;
          if (typeof stats.streak === 'number') updatePayload.omega_streak = stats.streak;
          if (typeof stats.dailyGoal === 'number') updatePayload.omega_daily_goal = stats.dailyGoal;
          if (Array.isArray(stats.recentLogs)) updatePayload.omega_logs = stats.recentLogs;
          if (typeof stats.monthlySolved === 'number') updatePayload.omega_monthly_solved = stats.monthlySolved;
          if (typeof stats.activeDays === 'number') updatePayload.omega_active_days = stats.activeDays;

          chrome.storage.local.set(updatePayload, () => {
            updateBadgeState();

            // Broadcast stats update to extension popup and pages
            try {
              chrome.runtime.sendMessage({
                type: 'OMEGA_EXTENSION_STATS_UPDATED',
                todayCount: confirmedTodayCount,
                stats: {
                  todayCount: confirmedTodayCount,
                  dailyCounts: stats.dailyCounts || updatePayload.omega_daily_counts,
                  streak: stats.streak || updatePayload.omega_streak,
                  monthlySolved: stats.monthlySolved || updatePayload.omega_monthly_solved,
                  activeDays: stats.activeDays || updatePayload.omega_active_days,
                  recentLogs: stats.recentLogs || updatePayload.omega_logs,
                  lastSyncTime: Date.now(),
                  isCloudSynced: syncResult.dbSynced !== false,
                  user: user,
                },
              }, () => {
                if (chrome.runtime.lastError) { /* ignore */ }
              });
            } catch (e) {}

            sendResponse({
              success: true,
              todayCount: confirmedTodayCount,
              dbSynced: syncResult.dbSynced !== false,
              logId: syncResult.logId,
              problemId: syncResult.problemId,
              xpEarned: syncResult.xpEarned,
              nextReviewAt: syncResult.nextReviewAt,
              aiAnalysis: syncResult.aiAnalysis,
              stats: syncResult.stats,
              message: syncResult.message || 'Practice log successfully stored in database.',
            });
          });
        } else if (syncResult && !syncResult.success && syncResult.error) {
          sendResponse({
            success: false,
            todayCount: 0,
            dbSynced: false,
            error: syncResult.error,
            code: syncResult.code || 'SYNC_ERROR',
          });
        } else {
          sendResponse({
            success: false,
            error: 'Failed to reach Omega database endpoint. Please verify connection.',
            code: 'ENDPOINT_FAILED',
          });
        }
      }
    );
    return true;
  }

  // 8. Fetch Problem Reflection History (to determine First vs Revision format)
  if (message.type === 'GET_PROBLEM_HISTORY') {
    const { slug, title, url } = message;
    const cleanSlug = (slug || '').trim().toLowerCase();
    const cleanTitle = (title || '').trim().toLowerCase();

    chrome.storage.local.get(['omega_logs', 'omega_user', 'omega_token', 'omega_app_url'], async (res) => {
      const logs = res.omega_logs || [];
      const token = res.omega_token || null;
      const appUrl = (res.omega_app_url || DEFAULT_FALLBACK_URL).replace(/\/+$/, '');
      
      // 1. First, check authoritative server/Firestore if JWT token is available
      if (token) {
        try {
          const queryParams = new URLSearchParams();
          if (cleanSlug) queryParams.set('slug', cleanSlug);
          if (cleanTitle) queryParams.set('title', cleanTitle);
          if (url) queryParams.set('url', url);

          const secureResp = await fetch(`${appUrl}/api/extension/secure/problem-status?${queryParams.toString()}`, {
            headers: {
              'Accept': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
          });

          if (secureResp.ok) {
            const data = await secureResp.json();
            if (data && data.success && data.hasPrevious && data.previousLog) {
              return sendResponse({
                hasPrevious: true,
                isRevision: true,
                previousLog: data.previousLog,
              });
            } else if (data && data.success && !data.hasPrevious) {
              return sendResponse({
                hasPrevious: false,
                isRevision: false,
                previousLog: null,
              });
            }
          }
        } catch (serverErr) {
          console.warn('[Omega Extension] Secure problem history fetch error, falling back to local:', serverErr);
        }
      }

      // 2. Fallback to local storage cache
      let previousLog = logs.find((l) => {
        const lSlug = (l.problemSlug || l.slug || '').trim().toLowerCase();
        const lTitle = (l.problemTitle || l.title || '').trim().toLowerCase();
        if (cleanSlug && lSlug && cleanSlug === lSlug) return true;
        if (cleanTitle && lTitle && cleanTitle === lTitle) return true;
        if (url && l.problemUrl && l.problemUrl === url) return true;
        return false;
      });

      if (previousLog) {
        sendResponse({
          hasPrevious: true,
          isRevision: true,
          previousLog: {
            confidence: previousLog.confidence || 3,
            feltDifficulty: previousLog.feltDifficulty || previousLog.difficulty || 'Medium',
            notes: previousLog.notes || previousLog.keyTakeaways || '',
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
    const url = normalizeAppUrl(message.url);
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

// Dedicated secure server synchronization with Firestore database
async function syncToServer(appUrl, logData, user, token) {
  const primaryUrl = (appUrl || DEFAULT_FALLBACK_URL).replace(/\/+$/, '');
  const candidateUrls = [
    primaryUrl,
    'https://ais-dev-xe62wcz6ciunnsbrgansz7-15217695281.asia-east1.run.app',
    'https://ais-pre-xe62wcz6ciunnsbrgansz7-15217695281.asia-east1.run.app',
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'https://omega-dsa.ai.studio',
  ];

  try {
    const detected = await detectOmegaTabUrl();
    if (detected && !candidateUrls.includes(detected)) {
      candidateUrls.unshift(detected);
    }
  } catch (e) {}

  const uniqueUrls = Array.from(new Set(candidateUrls.map((u) => (u || '').replace(/\/+$/, '')))).filter(Boolean);

  let lastError = null;

  const todayKey = getTodayKey();
  const tzOffset = new Date().getTimezoneOffset();

  for (const targetUrl of uniqueUrls) {
    // 1. If JWT token is present, use dedicated secure endpoint backed by Firestore
    if (token) {
      try {
        const secureEndpoint = `${targetUrl}/api/extension/secure/log`;
        const resp = await fetch(secureEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            'x-today-date-key': todayKey,
            'x-timezone-offset': String(tzOffset),
          },
          body: JSON.stringify({
            log: {
              ...logData,
              dateKey: logData.dateKey || todayKey,
            },
            todayDateKey: todayKey,
            tzOffset: tzOffset,
          }),
        });

        if (resp.ok) {
          const data = await resp.json();
          if (data && data.success) {
            console.log('[Omega Extension] Successfully written to Firestore database:', secureEndpoint, data);
            chrome.storage.local.set({ omega_app_url: targetUrl });
            return {
              success: true,
              dbSynced: true,
              logId: data.logId,
              problemId: data.problemId,
              xpEarned: data.xpEarned,
              nextReviewAt: data.nextReviewAt,
              aiAnalysis: data.aiAnalysis,
              todayCount: data.todayCount || data.stats?.todayCount,
              stats: data.stats,
              message: data.message,
            };
          }
        }
      } catch (err) {
        lastError = err;
        console.warn(`[Omega Extension] Secure database sync failed on ${targetUrl}:`, err.message);
      }
    }

    // 2. Standard endpoint fallback
    try {
      const targetEndpoint = `${targetUrl}/api/extension/log`;
      const resp = await fetch(targetEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          log: logData,
          userId: user ? user.uid : 'guest',
          userEmail: user ? user.email : undefined,
        }),
      });

      if (resp.ok) {
        const data = await resp.json();
        if (data && data.success) {
          chrome.storage.local.set({ omega_app_url: targetUrl });
          return {
            success: true,
            dbSynced: true,
            logId: data?.logId,
            todayCount: data?.todayCount || data?.stats?.todayCount,
            stats: data?.stats,
            message: data?.message || 'Synced to Omega server database.',
          };
        }
      }
    } catch (err) {
      lastError = err;
      console.warn(`[Omega Extension] Standard sync failed on ${targetUrl}:`, err.message);
    }
  }

  // 3. If offline or servers are unreachable, report endpoint error
  console.warn('[Omega Extension] All server endpoints offline/unreachable for practice logging.');
  return {
    success: false,
    dbSynced: false,
    offline: true,
    error: lastError?.message || 'Could not connect to Omega backend. Please check network.',
  };
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
          tabUrl.includes('omega-dsa.ai.studio') ||
          tabUrl.includes('ai.studio') ||
          tabUrl.includes('localhost') ||
          tabUrl.includes('127.0.0.1') ||
          tabUrl.includes('run.app') ||
          tabUrl.includes('web.app') ||
          tabUrl.includes('firebaseapp.com')
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
