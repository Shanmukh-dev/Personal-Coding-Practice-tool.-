// Omega Extension Popup Logic

document.addEventListener('DOMContentLoaded', () => {
  // Top Views
  const unauthenticatedView = document.getElementById('unauthenticatedView');
  const authenticatedView = document.getElementById('authenticatedView');

  // Server Status & Config Elements
  const statusDot = document.getElementById('statusDot');
  const serverStatusText = document.getElementById('serverStatusText');
  const toggleServerConfigBtn = document.getElementById('toggleServerConfigBtn');
  const serverConfigDrawer = document.getElementById('serverConfigDrawer');
  const serverUrlInput = document.getElementById('serverUrlInput');
  const saveServerUrlBtn = document.getElementById('saveServerUrlBtn');
  const autoDetectTabUrlBtn = document.getElementById('autoDetectTabUrlBtn');

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
  const toggleInput = document.getElementById('trackingToggle');
  const toggleLabel = document.getElementById('toggleStatusLabel');
  const todayDateStr = document.getElementById('todayDateStr');
  const todayCountNum = document.getElementById('todayCountNum');
  const todayProgressBar = document.getElementById('todayProgressBar');
  const targetStatusText = document.getElementById('targetStatusText');
  const streakCount = document.getElementById('streakCount');

  const monthNameLabel = document.getElementById('monthNameLabel');
  const monthTotalCount = document.getElementById('monthTotalCount');
  const monthActiveDays = document.getElementById('monthActiveDays');
  const heatmapGrid = document.getElementById('heatmapGrid');

  const recentLogsList = document.getElementById('recentLogsList');
  const recentLogsBadge = document.getElementById('recentLogsBadge');

  const openAppBtn = document.getElementById('openAppBtn');
  const testModalBtn = document.getElementById('testModalBtn');

  let currentAppUrl = 'http://localhost:3000';
  let isSignUpMode = false;

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
      let newUrl = (serverUrlInput.value || '').trim();
      if (!newUrl) {
        showAuthAlert('Please enter a valid Omega App URL', 'error');
        return;
      }
      if (!/^https?:\/\//i.test(newUrl)) {
        newUrl = 'https://' + newUrl;
      }
      newUrl = newUrl.replace(/\/+$/, '');
      currentAppUrl = newUrl;
      serverUrlInput.value = newUrl;

      chrome.runtime.sendMessage({ type: 'SET_APP_URL', url: newUrl }, (res) => {
        showAuthAlert('Server URL updated! Checking connection...', 'success');
        testServerConnectivity(newUrl);
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
            if (tab.url.includes('.run.app') || tab.url.includes('localhost:3000') || tab.url.includes('127.0.0.1:3000')) {
              foundUrl = new URL(tab.url).origin;
              break;
            }
          }
        }

        if (foundUrl) {
          currentAppUrl = foundUrl;
          if (serverUrlInput) serverUrlInput.value = foundUrl;
          chrome.runtime.sendMessage({ type: 'SET_APP_URL', url: foundUrl }, () => {
            showAuthAlert(`Detected active Omega tab: ${foundUrl}`, 'success');
            testServerConnectivity(foundUrl);
          });
        } else {
          showAuthAlert('No open Omega tabs found. Open your Omega web app in Chrome first.', 'error');
        }
      } catch (err) {
        showAuthAlert('Could not auto-detect tab URL: ' + err.message, 'error');
      }
    });
  }

  // 4. Test Server Connectivity
  function testServerConnectivity(urlToTest) {
    if (statusDot) {
      statusDot.className = 'status-dot';
    }
    if (serverStatusText) {
      serverStatusText.textContent = 'Connecting...';
    }

    chrome.runtime.sendMessage({ type: 'PING_SERVER', url: urlToTest || currentAppUrl }, (res) => {
      if (res && res.success) {
        if (statusDot) statusDot.className = 'status-dot online';
        if (serverStatusText) {
          const display = urlToTest ? new URL(urlToTest).hostname : 'Connected';
          serverStatusText.textContent = `Online: ${display}`;
          serverStatusText.title = `Connected to ${urlToTest || currentAppUrl}`;
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

  // 5. Watch for storage changes (auto-update if web app pairs in another tab!)
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'local') {
      if (changes.omega_user) {
        const newUser = changes.omega_user.newValue;
        renderAuthState(newUser);
        if (newUser) {
          loadPopupData();
        }
      }
      if (changes.omega_app_url) {
        currentAppUrl = changes.omega_app_url.newValue || currentAppUrl;
        if (serverUrlInput) serverUrlInput.value = currentAppUrl;
        testServerConnectivity(currentAppUrl);
      }
    }
  });

  // Load initial status
  loadPopupData();

  function loadPopupData() {
    chrome.runtime.sendMessage({ type: 'GET_STATUS' }, (res) => {
      if (chrome.runtime.lastError || !res) {
        console.warn('Could not connect to background script:', chrome.runtime.lastError);
        return;
      }

      currentAppUrl = res.appUrl || 'http://localhost:3000';
      if (serverUrlInput) serverUrlInput.value = currentAppUrl;
      testServerConnectivity(currentAppUrl);

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

        const dailyGoal = 3;
        const progressPercent = Math.min(100, Math.round((count / dailyGoal) * 100));
        if (todayProgressBar) todayProgressBar.style.width = `${progressPercent}%`;

        if (targetStatusText) {
          if (count >= dailyGoal) {
            targetStatusText.textContent = `Goal Reached! (${count}/${dailyGoal})`;
            targetStatusText.style.color = '#34d399';
          } else {
            targetStatusText.textContent = `${dailyGoal - count} more to reach goal`;
            targetStatusText.style.color = '#fbbf24';
          }
        }

        // Streak
        const streak = res.streak || (count > 0 ? 1 : 0);
        if (streakCount) streakCount.textContent = `${streak}d streak`;

        // Render Current Month Heatmap
        renderCurrentMonthHeatmap(res.dailyCounts || {});

        // Render Recent Logs
        renderRecentLogs(res.recentLogs || []);
      }
    });
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

  // Test Modal on active tab
  if (testModalBtn) {
    testModalBtn.addEventListener('click', () => {
      chrome.runtime.sendMessage({ type: 'TRIGGER_TEST_MODAL' }, (res) => {
        if (res && res.success) {
          window.close(); // Close popup so user sees test modal on active tab
        } else {
          alert('Could not trigger modal: Please open a LeetCode problem tab first (e.g. leetcode.com/problems/3sum).');
        }
      });
    });
  }

  // Helper: Render Current Month Heatmap
  function renderCurrentMonthHeatmap(dailyCounts) {
    if (!heatmapGrid) return;
    heatmapGrid.innerHTML = '';

    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth(); // 0-indexed

    const monthNames = [
      'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
      'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'
    ];
    if (monthNameLabel) {
      monthNameLabel.textContent = `${monthNames[currentMonth]} ${currentYear}`;
    }

    const firstDay = new Date(currentYear, currentMonth, 1).getDay(); // 0 = Sun
    const totalDaysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    let totalMonthSolved = 0;
    let activeDaysCount = 0;

    // Pad blank days before 1st of the month
    for (let i = 0; i < firstDay; i++) {
      const blank = document.createElement('div');
      blank.className = 'hm-cell empty';
      heatmapGrid.appendChild(blank);
    }

    // Days of month
    for (let day = 1; day <= totalDaysInMonth; day++) {
      const dayStr = String(day).padStart(2, '0');
      const monthStr = String(currentMonth + 1).padStart(2, '0');
      const dateKey = `${currentYear}-${monthStr}-${dayStr}`;

      const count = dailyCounts[dateKey] || 0;
      totalMonthSolved += count;
      if (count > 0) activeDaysCount++;

      const isToday =
        day === now.getDate() &&
        currentMonth === now.getMonth() &&
        currentYear === now.getFullYear();

      const cell = document.createElement('div');
      let lvClass = 'lv0';
      if (count === 1) lvClass = 'lv1';
      else if (count === 2) lvClass = 'lv2';
      else if (count >= 3 && count <= 4) lvClass = 'lv3';
      else if (count >= 5) lvClass = 'lv4';

      cell.className = `hm-cell ${lvClass} ${isToday ? 'today-ring' : ''}`;
      cell.setAttribute('data-date', `${monthNames[currentMonth].substring(0, 3)} ${day}: ${count} solved`);
      cell.title = `${dateKey}: ${count} solved`;

      heatmapGrid.appendChild(cell);
    }

    if (monthTotalCount) monthTotalCount.textContent = totalMonthSolved;
    if (monthActiveDays) monthActiveDays.textContent = activeDaysCount;
  }

  // Helper: Render Recent Logs
  function renderRecentLogs(logs) {
    if (!recentLogsList) return;
    recentLogsList.innerHTML = '';

    if (recentLogsBadge) {
      recentLogsBadge.textContent = `${logs.length} ${logs.length === 1 ? 'Log' : 'Logs'}`;
    }

    if (logs.length === 0) {
      recentLogsList.innerHTML = `
        <div class="empty-logs">
          No practice reflections logged yet. Solve a problem on LeetCode to auto-trigger reflection!
        </div>
      `;
      return;
    }

    logs.forEach((log) => {
      const item = document.createElement('div');
      item.className = 'log-item';

      const diff = log.feltDifficulty || log.difficulty || 'Medium';
      const diffClass = `diff-${diff.toLowerCase()}`;
      const stars = '★'.repeat(log.confidence || 3) + '☆'.repeat(5 - (log.confidence || 3));

      item.innerHTML = `
        <div class="log-item-header">
          <span class="log-title" title="${log.problemTitle || log.problemSlug}">${log.problemTitle || log.problemSlug}</span>
          <span class="log-diff ${diffClass}">${diff}</span>
        </div>
        <div class="log-meta">
          <span class="log-stars">${stars}</span>
          <span>${formatTimeAgo(log.timestamp)}</span>
        </div>
      `;
      recentLogsList.appendChild(item);
    });
  }

  function formatTimeAgo(timestamp) {
    if (!timestamp) return 'Recently';
    const elapsed = Math.floor((Date.now() - timestamp) / 1000);
    if (elapsed < 60) return 'Just now';
    if (elapsed < 3600) return `${Math.floor(elapsed / 60)}m ago`;
    if (elapsed < 86400) return `${Math.floor(elapsed / 3600)}h ago`;
    return `${Math.floor(elapsed / 86400)}d ago`;
  }
});
