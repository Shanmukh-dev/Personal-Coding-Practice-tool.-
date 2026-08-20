// Omega Extension Popup Logic

document.addEventListener('DOMContentLoaded', () => {
  // Top Views
  const initialLoadingView = document.getElementById('initialLoadingView');
  const initialLoadingText = document.getElementById('initialLoadingText');
  const unauthenticatedView = document.getElementById('unauthenticatedView');
  const authenticatedView = document.getElementById('authenticatedView');
  const extSyncBar = document.getElementById('extSyncBar');

  // Server Status & Config Elements
  const statusDot = document.getElementById('statusDot');
  const serverStatusText = document.getElementById('serverStatusText');
  const toggleServerConfigBtn = document.getElementById('toggleServerConfigBtn');
  const serverConfigDrawer = document.getElementById('serverConfigDrawer');
  const serverUrlInput = document.getElementById('serverUrlInput');
  const saveServerUrlBtn = document.getElementById('saveServerUrlBtn');
  const resetDefaultUrlBtn = document.getElementById('resetDefaultUrlBtn');
  const autoDetectTabUrlBtn = document.getElementById('autoDetectTabUrlBtn');
  const serverDrawerAlert = document.getElementById('serverDrawerAlert');

  // Auth Elements
  const btnGoogleAuth = document.getElementById('btnGoogleAuth');
  const tabPairCode = document.getElementById('tabPairCode');
  const tabEmail = document.getElementById('tabEmail');
  const pairCodeTabContent = document.getElementById('pairCodeTabContent');
  const emailTabContent = document.getElementById('emailTabContent');
  const openAppForPairBtn = document.getElementById('openAppForPairBtn');
  const emailAuthForm = document.getElementById('emailAuthForm');
  const emailInput = document.getElementById('emailInput');
  const passwordInput = document.getElementById('passwordInput');
  const submitEmailBtn = document.getElementById('submitEmailBtn');
  const toggleSignUpBtn = document.getElementById('toggleSignUpBtn');
  const pairCodeInput = document.getElementById('pairCodeInput');
  const submitPairCodeBtn = document.getElementById('submitPairCodeBtn');
  const authAlert = document.getElementById('authAlert');

  // Authenticated Dashboard Elements
  const userAvatar = document.getElementById('userAvatar');
  const userDisplayName = document.getElementById('userDisplayName');
  const userEmail = document.getElementById('userEmail');
  const logoutBtn = document.getElementById('logoutBtn');
  const refreshStatsBtn = document.getElementById('refreshStatsBtn');
  const syncStatusPill = document.getElementById('syncStatusPill');
  const syncStatusDot = document.getElementById('syncStatusDot');
  const syncStatusText = document.getElementById('syncStatusText');
  const syncMetaRow = document.getElementById('syncMetaRow');
  const lastSyncTimeLabel = document.getElementById('lastSyncTimeLabel');
  const syncModeTag = document.getElementById('syncModeTag');
  const toggleInput = document.getElementById('trackingToggle');
  const toggleLabel = document.getElementById('toggleStatusLabel');
  const todayDateStr = document.getElementById('todayDateStr');
  const todayCountNum = document.getElementById('todayCountNum');
  const streakCount = document.getElementById('streakCount');

  const monthNameLabel = document.getElementById('monthNameLabel');
  const monthTotalCount = document.getElementById('monthTotalCount');
  const monthActiveDays = document.getElementById('monthActiveDays');
  const heatmapGrid = document.getElementById('heatmapGrid');

  const openAppBtn = document.getElementById('openAppBtn');

  const CLOUD_APP_URL = 'https://omega-dsa.ai.studio';
  let currentAppUrl = CLOUD_APP_URL;
  let isSignUpMode = false;

  // Helper to normalize and convert AI Studio URL if needed
  function normalizeAppUrl(rawUrl) {
    if (!rawUrl || typeof rawUrl !== 'string') return CLOUD_APP_URL;
    let url = rawUrl.trim();
    if (
      url.includes('aistudio.google.com') ||
      url === 'https://ai.studio' ||
      url === 'http://ai.studio' ||
      url === 'https://ai.studio/' ||
      url.includes('google.com') ||
      url === ''
    ) {
      return CLOUD_APP_URL;
    }
    if (!/^https?:\/\//i.test(url)) {
      url = 'https://' + url;
    }
    return url.replace(/\/+$/, '');
  }

  function showDrawerAlert(msg, type = 'success') {
    if (serverDrawerAlert) {
      serverDrawerAlert.textContent = msg;
      serverDrawerAlert.className = `auth-alert ${type}`;
      serverDrawerAlert.style.display = 'block';
      setTimeout(() => {
        if (serverDrawerAlert) serverDrawerAlert.style.display = 'none';
      }, 4000);
    }
  }

  // Format today's date readable
  const now = new Date();
  const options = { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' };
  if (todayDateStr) {
    todayDateStr.textContent = now.toLocaleDateString('en-US', options);
  }

  // 1. Server Configuration Drawer Toggle
  if (toggleServerConfigBtn && serverConfigDrawer) {
    toggleServerConfigBtn.addEventListener('click', () => {
      const isVisible = serverConfigDrawer.style.display !== 'none';
      serverConfigDrawer.style.display = isVisible ? 'none' : 'flex';
      if (!isVisible && serverUrlInput) {
        serverUrlInput.value = currentAppUrl;
      }
    });
  }

  // 2. Save Server URL
  if (saveServerUrlBtn && serverUrlInput) {
    saveServerUrlBtn.addEventListener('click', () => {
      let rawUrl = (serverUrlInput.value || '').trim();
      const newUrl = normalizeAppUrl(rawUrl);
      currentAppUrl = newUrl;
      serverUrlInput.value = newUrl;

      chrome.runtime.sendMessage({ type: 'SET_APP_URL', url: newUrl }, (res) => {
        showDrawerAlert(`Saved: ${newUrl}`, 'success');
        showAuthAlert(`Server URL updated to ${newUrl}`, 'success');
        testServerConnectivity(newUrl);
        setTimeout(hideAuthAlert, 3000);
      });
    });
  }

  // 2b. Reset to Default Server URL
  if (resetDefaultUrlBtn && serverUrlInput) {
    resetDefaultUrlBtn.addEventListener('click', () => {
      currentAppUrl = CLOUD_APP_URL;
      serverUrlInput.value = CLOUD_APP_URL;
      chrome.runtime.sendMessage({ type: 'SET_APP_URL', url: CLOUD_APP_URL }, () => {
        showDrawerAlert(`Reset to default: ${CLOUD_APP_URL}`, 'success');
        showAuthAlert(`Server URL reset to ${CLOUD_APP_URL}`, 'success');
        testServerConnectivity(CLOUD_APP_URL);
        setTimeout(hideAuthAlert, 3000);
      });
    });
  }

  // 3. Auto-detect from open tab
  if (autoDetectTabUrlBtn) {
    autoDetectTabUrlBtn.addEventListener('click', async () => {
      try {
        const tabs = await chrome.tabs.query({});
        let foundUrl = null;
        for (const tab of tabs) {
          if (tab.url) {
            if (tab.url.includes('localhost:3000') || tab.url.includes('127.0.0.1:3000')) {
              foundUrl = 'http://localhost:3000';
              break;
            } else if (tab.url.includes('.run.app')) {
              foundUrl = new URL(tab.url).origin;
              break;
            } else if (tab.url.includes('omega-dsa.ai.studio')) {
              foundUrl = CLOUD_APP_URL;
              break;
            }
          }
        }

        const targetUrl = foundUrl || CLOUD_APP_URL;
        currentAppUrl = targetUrl;
        if (serverUrlInput) serverUrlInput.value = targetUrl;
        chrome.runtime.sendMessage({ type: 'SET_APP_URL', url: targetUrl }, () => {
          showDrawerAlert(`Set to: ${targetUrl}`, 'success');
          showAuthAlert(`Connected to Omega: ${targetUrl}`, 'success');
          testServerConnectivity(targetUrl);
        });
      } catch (err) {
        showDrawerAlert('Auto-detect error: ' + err.message, 'error');
      }
    });
  }

  // 4. Test Server Connectivity with loading animation
  function testServerConnectivity(urlToTest) {
    const checkUrl = normalizeAppUrl(urlToTest || currentAppUrl);
    if (statusDot) {
      statusDot.className = 'status-dot loading';
    }
    if (serverStatusText) {
      serverStatusText.textContent = 'Checking server...';
    }

    chrome.runtime.sendMessage({ type: 'PING_SERVER', url: checkUrl }, (res) => {
      if (res && res.success) {
        if (statusDot) statusDot.className = 'status-dot online';
        if (serverStatusText) {
          try {
            const host = new URL(checkUrl).hostname;
            serverStatusText.textContent = `Online: ${host}`;
          } catch (e) {
            serverStatusText.textContent = 'Online';
          }
          serverStatusText.title = `Connected to ${checkUrl}`;
        }
      } else {
        if (statusDot) statusDot.className = 'status-dot offline';
        if (serverStatusText) {
          serverStatusText.textContent = 'Server Offline (Check URL)';
          serverStatusText.title = res?.error || 'Cannot reach server';
        }
      }
    });
  }

  // Tab Switching
  tabPairCode.addEventListener('click', () => {
    tabPairCode.classList.add('active');
    tabEmail.classList.remove('active');
    pairCodeTabContent.style.display = 'block';
    emailTabContent.style.display = 'none';
    hideAuthAlert();
  });

  tabEmail.addEventListener('click', () => {
    tabEmail.classList.add('active');
    tabPairCode.classList.remove('active');
    emailTabContent.style.display = 'block';
    pairCodeTabContent.style.display = 'none';
    hideAuthAlert();
  });

  // Sign In / Sign Up Mode Toggle
  toggleSignUpBtn.addEventListener('click', () => {
    isSignUpMode = !isSignUpMode;
    if (isSignUpMode) {
      submitEmailBtn.textContent = 'Create Omega Account';
      toggleSignUpBtn.textContent = 'Already have an account? Sign In';
    } else {
      submitEmailBtn.textContent = 'Sign In';
      toggleSignUpBtn.textContent = "Don't have an account? Sign Up";
    }
    hideAuthAlert();
  });

  function showAuthAlert(msg, type = 'error') {
    authAlert.textContent = msg;
    authAlert.className = `auth-alert ${type}`;
    authAlert.style.display = 'block';
  }

  function hideAuthAlert() {
    authAlert.style.display = 'none';
  }

  // 1. Google Sign-In Action (Opens Web App with Google Auth & Auto-Sync)
  btnGoogleAuth.addEventListener('click', async () => {
    // Check if open tab with Omega already exists
    try {
      const tabs = await chrome.tabs.query({});
      let omegaTab = null;
      for (const tab of tabs) {
        if (tab.url && (tab.url.includes('.run.app') || tab.url.includes('localhost:3000'))) {
          omegaTab = tab;
          break;
        }
      }

      if (omegaTab) {
        currentAppUrl = new URL(omegaTab.url).origin;
        chrome.tabs.update(omegaTab.id, { active: true, url: `${currentAppUrl}?ext_pair=1` });
      } else {
        const pairUrl = `${currentAppUrl.replace(/\/+$/, '')}?ext_pair=1`;
        chrome.tabs.create({ url: pairUrl });
      }

      showAuthAlert('Opening Omega Web Dashboard! Sign in with Google on the web page to instantly pair your extension.', 'success');
    } catch (e) {
      const pairUrl = `${currentAppUrl.replace(/\/+$/, '')}?ext_pair=1`;
      chrome.tabs.create({ url: pairUrl });
    }
  });

  // Open Web App to generate pair code
  openAppForPairBtn.addEventListener('click', () => {
    const pairUrl = `${currentAppUrl.replace(/\/+$/, '')}?ext_pair=1`;
    chrome.tabs.create({ url: pairUrl });
  });

  // 2. 6-Digit Pair Code Submission
  submitPairCodeBtn.addEventListener('click', handlePairCodeSubmit);
  pairCodeInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handlePairCodeSubmit();
    }
  });

  function handlePairCodeSubmit() {
    const code = (pairCodeInput.value || '').trim();
    if (!code || code.length < 6) {
      showAuthAlert('Please enter a valid 6-digit numeric pair code.', 'error');
      return;
    }

    submitPairCodeBtn.disabled = true;
    submitPairCodeBtn.textContent = 'Connecting...';
    hideAuthAlert();

    chrome.runtime.sendMessage(
      {
        type: 'AUTH_PAIR_CODE',
        pairCode: code,
      },
      (res) => {
        submitPairCodeBtn.disabled = false;
        submitPairCodeBtn.textContent = 'Connect';

        if (res && res.success && res.user) {
          showAuthAlert('Successfully connected to Omega Cloud!', 'success');
          setTimeout(() => {
            renderAuthState(res.user);
            loadPopupData();
          }, 600);
        } else {
          showAuthAlert(res?.error || 'Invalid or expired pair code. Generate a fresh one in web dashboard.', 'error');
        }
      }
    );
  }

  // 3. Email & Password Authentication
  emailAuthForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = (emailInput.value || '').trim();
    const password = (passwordInput.value || '').trim();

    if (!email || !password) {
      showAuthAlert('Please enter both email and password.', 'error');
      return;
    }

    submitEmailBtn.disabled = true;
    submitEmailBtn.textContent = isSignUpMode ? 'Creating account...' : 'Signing in...';
    hideAuthAlert();

    chrome.runtime.sendMessage(
      {
        type: 'AUTH_LOGIN',
        email,
        password,
        isSignUp: isSignUpMode,
      },
      (res) => {
        submitEmailBtn.disabled = false;
        submitEmailBtn.textContent = isSignUpMode ? 'Create Omega Account' : 'Sign In';

        if (res && res.success && res.user) {
          showAuthAlert(res.message || 'Connected successfully!', 'success');
          setTimeout(() => {
            renderAuthState(res.user);
            loadPopupData();
          }, 600);
        } else {
          showAuthAlert(res?.error || 'Authentication failed. Please check credentials.', 'error');
        }
      }
    );
  });

  // 4. Logout Action
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      if (confirm('Disconnect extension from your Omega account?')) {
        chrome.runtime.sendMessage({ type: 'AUTH_LOGOUT' }, () => {
          renderAuthState(null);
          showAuthAlert('Signed out from Omega Cloud.', 'success');
        });
      }
    });
  }

  // Helper for subtle syncing indicator in popup
  function setSyncingState(isSyncing) {
    if (extSyncBar) {
      extSyncBar.style.display = isSyncing ? 'block' : 'none';
    }
    if (refreshStatsBtn) {
      if (isSyncing) {
        refreshStatsBtn.classList.add('is-syncing');
      } else {
        refreshStatsBtn.classList.remove('is-syncing');
      }
    }
    if (syncStatusPill && syncStatusDot && syncStatusText && isSyncing) {
      syncStatusPill.className = 'cloud-pill syncing';
      syncStatusDot.className = 'cloud-dot syncing';
      syncStatusText.textContent = 'Syncing...';
    }
  }

  // 4b. Refresh / Sync Stats Action with subtle loading animation
  if (refreshStatsBtn) {
    refreshStatsBtn.addEventListener('click', () => {
      setSyncingState(true);

      chrome.runtime.sendMessage({ type: 'SYNC_USER_STATS' }, (res) => {
        loadPopupData(false);
        setTimeout(() => {
          setSyncingState(false);
        }, 400);
      });
    });
  }

  // 5. Watch for storage changes (auto-update if web app pairs in another tab!)
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'local') {
      if (changes.omega_user) {
        const newUser = changes.omega_user.newValue;
        renderAuthState(newUser);
        if (newUser) {
          loadPopupData(false);
        }
      }
      if (changes.omega_app_url) {
        currentAppUrl = changes.omega_app_url.newValue || currentAppUrl;
        if (serverUrlInput) serverUrlInput.value = currentAppUrl;
        testServerConnectivity(currentAppUrl);
      }
    }
  });

  // Load initial status (with initial resolving view)
  loadPopupData(true);

  function loadPopupData(isInitial = false) {
    if (isInitial && initialLoadingView) {
      initialLoadingView.style.display = 'flex';
      if (unauthenticatedView) unauthenticatedView.style.display = 'none';
      if (authenticatedView) authenticatedView.style.display = 'none';
    }

    chrome.runtime.sendMessage({ type: 'GET_STATUS' }, (res) => {
      if (chrome.runtime.lastError || !res) {
        console.warn('Could not connect to background script:', chrome.runtime.lastError);
        if (initialLoadingView) initialLoadingView.style.display = 'none';
        renderAuthState(null);
        return;
      }

      currentAppUrl = normalizeAppUrl(res.appUrl || CLOUD_APP_URL);
      if (serverUrlInput) serverUrlInput.value = currentAppUrl;
      testServerConnectivity(currentAppUrl);

      // Hide initial loading screen
      if (initialLoadingView) {
        initialLoadingView.style.display = 'none';
      }

      // Update User Auth State
      const isAuthenticated = res.user && res.user.uid && res.user.uid !== 'guest';
      renderAuthState(isAuthenticated ? res.user : null);

      if (isAuthenticated) {
        // Update On/Off Toggle
        const isEnabled = res.enabled !== false;
        if (toggleInput) {
          toggleInput.checked = isEnabled;
          updateToggleUI(isEnabled);
        }

        // Update Today's Solved Count
        const count = res.todayCount || 0;
        if (todayCountNum) todayCountNum.textContent = count;

        // Streak
        const streak = res.streak || (count > 0 ? 1 : 0);
        if (streakCount) streakCount.textContent = `${streak}d streak`;

        // Update Sync Status UI in Popup
        updateSyncStatusUI(res.lastSyncTime, res.isCloudSynced !== false);

        // Render Current Month Heatmap
        renderCurrentMonthHeatmap(res.dailyCounts || {});
      }
    });
  }

  // Format and update sync status pill and timestamp metadata
  function updateSyncStatusUI(lastSyncTime, isConnected) {
    if (!syncStatusPill || !syncStatusText || !syncStatusDot) return;

    if (!lastSyncTime) {
      syncStatusText.textContent = 'Sync Ready';
      syncStatusPill.className = 'cloud-pill';
      syncStatusDot.className = 'cloud-dot';
      if (lastSyncTimeLabel) lastSyncTimeLabel.textContent = 'Pending sync';
      if (syncModeTag) syncModeTag.textContent = 'Cloud Standby';
      return;
    }

    const diffSec = Math.floor((Date.now() - lastSyncTime) / 1000);
    let timeStr = 'Just now';
    if (diffSec >= 5 && diffSec < 60) {
      timeStr = `${diffSec}s ago`;
    } else if (diffSec >= 60 && diffSec < 3600) {
      const m = Math.floor(diffSec / 60);
      timeStr = `${m}m ago`;
    } else if (diffSec >= 3600) {
      const h = Math.floor(diffSec / 3600);
      timeStr = `${h}h ago`;
    }

    if (lastSyncTimeLabel) {
      lastSyncTimeLabel.textContent = timeStr;
      lastSyncTimeLabel.title = new Date(lastSyncTime).toLocaleTimeString();
    }

    if (isConnected) {
      syncStatusText.textContent = 'Synced';
      syncStatusPill.className = 'cloud-pill';
      syncStatusDot.className = 'cloud-dot';
      if (syncModeTag) syncModeTag.textContent = 'Live Connected';
    } else {
      syncStatusText.textContent = 'Cached';
      syncStatusPill.className = 'cloud-pill offline';
      syncStatusDot.className = 'cloud-dot offline';
      if (syncModeTag) syncModeTag.textContent = 'Local Cache';
    }
  }

  // Switch between unauthenticated & authenticated views
  function renderAuthState(user) {
    if (user && user.uid && user.uid !== 'guest') {
      unauthenticatedView.style.display = 'none';
      authenticatedView.style.display = 'block';

      if (userDisplayName) {
        userDisplayName.textContent = user.displayName || user.email?.split('@')[0] || 'Engineer';
      }
      if (userEmail) {
        userEmail.textContent = user.email || 'Cloud Synced Account';
      }
      if (userAvatar) {
        if (user.photoURL) {
          userAvatar.innerHTML = `<img src="${user.photoURL}" style="width:100%;height:100%;border-radius:50%;object-fit:cover;" alt="Avatar">`;
        } else {
          const initial = (user.displayName || user.email || 'Ω')[0].toUpperCase();
          userAvatar.textContent = initial;
        }
      }
    } else {
      authenticatedView.style.display = 'none';
      unauthenticatedView.style.display = 'flex';
      hideAuthAlert();
    }
  }

  // Toggle Tracking on/off
  if (toggleInput) {
    toggleInput.addEventListener('change', () => {
      const enabled = toggleInput.checked;
      chrome.runtime.sendMessage({ type: 'TOGGLE_STATUS', enabled }, (res) => {
        if (res && res.success) {
          updateToggleUI(enabled);
        }
      });
    });
  }

  function updateToggleUI(enabled) {
    if (toggleLabel) {
      toggleLabel.textContent = enabled ? 'Active' : 'Paused';
      toggleLabel.style.color = enabled ? '#34d399' : '#a1a1aa';
    }
  }

  // Open Web App button
  if (openAppBtn) {
    openAppBtn.addEventListener('click', () => {
      chrome.tabs.create({ url: currentAppUrl });
    });
  }

  // Helper: Render Current Month Heatmap using week columns aligned with S M T W T F S
  function renderCurrentMonthHeatmap(dailyCounts) {
    if (!heatmapGrid) return;
    heatmapGrid.innerHTML = '';

    const currentNow = new Date();
    const currentYear = currentNow.getFullYear();
    const currentMonth = currentNow.getMonth(); // 0-indexed

    const monthNames = [
      'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
      'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'
    ];
    if (monthNameLabel) {
      monthNameLabel.textContent = `${monthNames[currentMonth]} ${currentYear}`;
    }

    const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay(); // 0 = Sun .. 6 = Sat
    const totalDaysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    let totalMonthSolved = 0;
    let activeDaysCount = 0;

    // Calculate total weeks (columns)
    const totalCells = firstDayOfWeek + totalDaysInMonth;
    const totalWeeks = Math.ceil(totalCells / 7);

    let currentDayNumber = 1;

    for (let w = 0; w < totalWeeks; w++) {
      const col = document.createElement('div');
      col.className = 'heatmap-col';

      for (let dayOfWeek = 0; dayOfWeek < 7; dayOfWeek++) {
        const cellIndex = w * 7 + dayOfWeek;
        const sq = document.createElement('div');

        if (cellIndex < firstDayOfWeek || currentDayNumber > totalDaysInMonth) {
          sq.className = 'heatmap-sq outside-month';
        } else {
          const day = currentDayNumber;
          currentDayNumber++;

          const dayStr = String(day).padStart(2, '0');
          const monthStr = String(currentMonth + 1).padStart(2, '0');
          const dateKey = `${currentYear}-${monthStr}-${dayStr}`;

          const count = (dailyCounts && dailyCounts[dateKey]) || 0;
          totalMonthSolved += count;
          if (count > 0) activeDaysCount++;

          const isToday =
            day === currentNow.getDate() &&
            currentMonth === currentNow.getMonth() &&
            currentYear === currentNow.getFullYear();

          let lvClass = 'lv0';
          if (count === 1) lvClass = 'lv1';
          else if (count === 2) lvClass = 'lv2';
          else if (count >= 3 && count <= 4) lvClass = 'lv3';
          else if (count >= 5) lvClass = 'lv4';

          sq.className = `heatmap-sq ${lvClass} ${isToday ? 'is-today' : ''}`;
          sq.setAttribute('data-date', `${monthNames[currentMonth].substring(0, 3)} ${day}: ${count} solved`);
          sq.title = `${dateKey}: ${count} solved`;
        }

        col.appendChild(sq);
      }

      heatmapGrid.appendChild(col);
    }

    if (monthTotalCount) monthTotalCount.textContent = totalMonthSolved;
    if (monthActiveDays) monthActiveDays.textContent = activeDaysCount;
  }

  // Auto-reload data whenever local storage changes
  if (chrome.storage && chrome.storage.onChanged) {
    chrome.storage.onChanged.addListener((changes, areaName) => {
      if (areaName === 'local') {
        loadPopupData();
      }
    });
  }
});
