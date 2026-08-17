// Omega Background Service Worker (Manifest V3)

const DEFAULT_FALLBACK_URL = 'http://localhost:3000';

// Initialize default state & badge on install/startup
chrome.runtime.onInstalled.addListener(() => {
  initializeStorage();
});

chrome.runtime.onStartup.addListener(() => {
  updateBadgeState();
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
        if (tab.url.includes('.run.app') || tab.url.includes('localhost:3000') || tab.url.includes('127.0.0.1:3000')) {
          const urlObj = new URL(tab.url);
          return urlObj.origin;
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
  // 1. Get Status & User
  if (message.type === 'GET_STATUS') {
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
        let appUrl = res.omega_app_url;
        if (!appUrl || appUrl === DEFAULT_FALLBACK_URL) {
          const detected = await detectOmegaTabUrl();
          if (detected) {
            appUrl = detected;
            chrome.storage.local.set({ omega_app_url: detected });
          }
        }

        const todayKey = getTodayKey();
        const dailyCounts = res.omega_daily_counts || {};
        const todayCount = dailyCounts[todayKey] || 0;
        const logs = res.omega_logs || [];
        const isEnabled = res.omega_enabled !== undefined ? res.omega_enabled : true;

        sendResponse({
          enabled: isEnabled,
          todayCount,
          dailyCounts,
          recentLogs: logs.slice(0, 10),
          appUrl: appUrl || DEFAULT_FALLBACK_URL,
          streak: res.omega_streak || (todayCount > 0 ? 1 : 0),
          user: res.omega_user || null,
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
        const logs = res.omega_logs || [];
        const dailyCounts = res.omega_daily_counts || {};
        const currentCount = dailyCounts[todayKey] || 0;
        dailyCounts[todayKey] = currentCount + 1;

        logs.unshift(newLog);

        let streak = res.omega_streak || 1;
        if (currentCount === 0) {
          streak += 1;
        }

        const user = res.omega_user || null;

        chrome.storage.local.set(
          {
            omega_logs: logs,
            omega_daily_counts: dailyCounts,
            omega_streak: streak,
          },
          () => {
            updateBadgeState();
            // Sync to hosted or local Omega server
            syncToServer(res.omega_app_url || DEFAULT_FALLBACK_URL, newLog, user);
            sendResponse({ success: true, todayCount: dailyCounts[todayKey] });
          }
        );
      }
    );
    return true;
  }

  // 8. Trigger Test Modal on Active Tab
  if (message.type === 'TRIGGER_TEST_MODAL') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs && tabs[0] && tabs[0].id) {
        chrome.tabs.sendMessage(
          tabs[0].id,
          {
            type: 'SHOW_LOG_MODAL_MANUAL',
            problem: message.problem || {
              title: '3Sum',
              slug: '3sum',
              url: tabs[0].url || 'https://leetcode.com/problems/3sum/',
              difficulty: 'Medium',
            },
          },
          (response) => {
            sendResponse(response || { success: true });
          }
        );
      } else {
        sendResponse({ success: false, error: 'No active tab found' });
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
