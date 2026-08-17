// Omega Web App Bridge (Content Script)
// Runs automatically on Omega Web App domains (localhost, Cloud Run, *.run.app)
// Automatically syncs authenticated user profile, server URL, and extension state.

(function () {
  'use strict';

  const appUrl = window.location.origin;

  // 1. Immediately store the current web app origin as the Omega Server URL
  try {
    chrome.storage.local.set({ omega_app_url: appUrl }, () => {
      console.log('[Omega Extension Bridge] Set omega_app_url to:', appUrl);
    });
  } catch (err) {
    console.warn('[Omega Extension Bridge] Storage init error:', err);
  }

  // 2. Announce presence to the web application
  function announceExtensionReady() {
    window.postMessage(
      {
        type: 'OMEGA_EXTENSION_INSTALLED',
        version: '2.0.0',
        appUrl: appUrl,
      },
      '*'
    );
  }

  // Announce immediately and again when DOM is ready
  announceExtensionReady();
  window.addEventListener('DOMContentLoaded', announceExtensionReady);

  // 3. Listen for auth messages & sync requests from the Omega web dashboard
  window.addEventListener('message', (event) => {
    // Only accept messages from same origin or valid Omega messages
    if (!event.data || typeof event.data !== 'object') return;

    // Handle user auth synchronization from web app
    if (event.data.type === 'OMEGA_SET_AUTH') {
      const user = event.data.user;
      const targetAppUrl = event.data.appUrl || appUrl;

      if (user && user.uid) {
        chrome.storage.local.set(
          {
            omega_user: user,
            omega_app_url: targetAppUrl,
          },
          () => {
            console.log('[Omega Extension Bridge] User authenticated via web app:', user.email || user.displayName);
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

    // Handle user logout synchronization from web app
    if (event.data.type === 'OMEGA_LOGOUT') {
      chrome.storage.local.set({ omega_user: null }, () => {
        console.log('[Omega Extension Bridge] Extension user signed out via web app.');
      });
    }

    // Handle ping/presence check from web app
    if (event.data.type === 'OMEGA_PING_EXTENSION') {
      chrome.storage.local.get(['omega_user', 'omega_enabled'], (res) => {
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
  });
})();
