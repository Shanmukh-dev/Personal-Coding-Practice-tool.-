// Omega Background Service Worker (Manifest V3)

const DEFAULT_APP_URL = 'http://localhost:3000';

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
    (res) => {
      const isEnabled = res.omega_enabled !== undefined ? res.omega_enabled : true;
      const logs = res.omega_logs || [];
      const dailyCounts = res.omega_daily_counts || {};
      const appUrl = res.omega_app_url || DEFAULT_APP_URL;
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
  chrome.storage.local.get(['omega_enabled', 'omega_daily_counts'], (res) => {
    const isEnabled =
      explicitEnabled !== undefined
        ? explicitEnabled
        : res.omega_enabled !== undefined
        ? res.omega_enabled
        : true;

    if (isEnabled) {
      const todayKey = getTodayKey();
      const count = (res.omega_daily_counts && res.omega_daily_counts[todayKey]) || 0;
      if (count > 0) {
        chrome.action.setBadgeText({ text: String(count) });
        chrome.action.setBadgeBackgroundColor({ color: '#10b981' }); // Emerald
      } else {
        chrome.action.setBadgeText({ text: 'ON' });
        chrome.action.setBadgeBackgroundColor({ color: '#10b981' }); // Emerald
      }
    } else {
      chrome.action.setBadgeText({ text: 'OFF' });
      chrome.action.setBadgeBackgroundColor({ color: '#64748b' }); // Muted Slate
    }
  });
}

// Handle messages from content script & popup
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
      (res) => {
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
          appUrl: res.omega_app_url || DEFAULT_APP_URL,
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

  // 3. User Authentication: Login with Email / Password
  if (message.type === 'AUTH_LOGIN') {
    chrome.storage.local.get(['omega_app_url'], async (res) => {
      const appUrl = (res.omega_app_url || DEFAULT_APP_URL).replace(/\/+$/, '');
      try {
        const resp = await fetch(`${appUrl}/api/extension/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: message.email,
            password: message.password,
          }),
        });
        const data = await resp.json();
        if (resp.ok && data.success && data.user) {
          chrome.storage.local.set({ omega_user: data.user }, () => {
            sendResponse({ success: true, user: data.user, message: data.message });
          });
        } else {
          sendResponse({ success: false, error: data.error || 'Authentication failed' });
        }
      } catch (err) {
        sendResponse({
          success: false,
          error: `Could not connect to Omega Server (${err.message})`,
        });
      }
    });
    return true;
  }

  // 4. User Authentication: Pair with 6-Digit Code
  if (message.type === 'AUTH_PAIR_CODE') {
    chrome.storage.local.get(['omega_app_url'], async (res) => {
      const appUrl = (res.omega_app_url || DEFAULT_APP_URL).replace(/\/+$/, '');
      try {
        const resp = await fetch(`${appUrl}/api/extension/auth/pair-code`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            pairCode: message.pairCode,
          }),
        });
        const data = await resp.json();
        if (resp.ok && data.success && data.user) {
          chrome.storage.local.set({ omega_user: data.user }, () => {
            sendResponse({ success: true, user: data.user, message: data.message });
          });
        } else {
          sendResponse({ success: false, error: data.error || 'Invalid or expired pair code' });
        }
      } catch (err) {
        sendResponse({
          success: false,
          error: `Could not connect to Omega Server (${err.message})`,
        });
      }
    });
    return true;
  }

  // 5. User Authentication: Sign Out
  if (message.type === 'AUTH_LOGOUT') {
    chrome.storage.local.set({ omega_user: null }, () => {
      sendResponse({ success: true });
    });
    return true;
  }

  // 6. Record Practice Log
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
            syncToServer(res.omega_app_url || DEFAULT_APP_URL, newLog, user);
            sendResponse({ success: true, todayCount: dailyCounts[todayKey] });
          }
        );
      }
    );
    return true;
  }

  // 7. Trigger Test Modal on Active Tab
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

  // 8. Configure Server URL
  if (message.type === 'SET_APP_URL') {
    const url = message.url || DEFAULT_APP_URL;
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

