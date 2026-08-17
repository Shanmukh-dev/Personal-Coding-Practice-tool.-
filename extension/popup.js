// Omega Extension Popup Logic

document.addEventListener('DOMContentLoaded', () => {
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

  // Auth Elements
  const authLoggedInView = document.getElementById('authLoggedInView');
  const authLoggedOutView = document.getElementById('authLoggedOutView');
  const userAvatar = document.getElementById('userAvatar');
  const userDisplayName = document.getElementById('userDisplayName');
  const userEmail = document.getElementById('userEmail');
  const logoutBtn = document.getElementById('logoutBtn');

  const tabPairCode = document.getElementById('tabPairCode');
  const tabEmail = document.getElementById('tabEmail');
  const pairCodeTabContent = document.getElementById('pairCodeTabContent');
  const emailTabContent = document.getElementById('emailTabContent');

  const pairCodeInput = document.getElementById('pairCodeInput');
  const submitPairCodeBtn = document.getElementById('submitPairCodeBtn');
  const emailInput = document.getElementById('emailInput');
  const passwordInput = document.getElementById('passwordInput');
  const submitEmailBtn = document.getElementById('submitEmailBtn');
  const authAlert = document.getElementById('authAlert');

  let currentAppUrl = 'http://localhost:3000';

  // Format today's date readable
  const now = new Date();
  const options = { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' };
  todayDateStr.textContent = now.toLocaleDateString('en-US', options);

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

  function showAuthAlert(msg, type = 'error') {
    authAlert.textContent = msg;
    authAlert.className = `auth-alert ${type}`;
    authAlert.style.display = 'block';
  }

  function hideAuthAlert() {
    authAlert.style.display = 'none';
  }

  // Load initial status
  loadPopupData();

  function loadPopupData() {
    chrome.runtime.sendMessage({ type: 'GET_STATUS' }, (res) => {
      if (chrome.runtime.lastError || !res) {
        console.warn('Could not connect to background script:', chrome.runtime.lastError);
        return;
      }

      // Update On/Off Toggle
      const isEnabled = res.enabled !== false;
      toggleInput.checked = isEnabled;
      updateToggleUI(isEnabled);

      currentAppUrl = res.appUrl || 'http://localhost:3000';

      // Update User Auth State
      renderAuthState(res.user);

      // Update Today's Solved Count
      const count = res.todayCount || 0;
      todayCountNum.textContent = count;

      const dailyGoal = 3;
      const progressPercent = Math.min(100, Math.round((count / dailyGoal) * 100));
      todayProgressBar.style.width = `${progressPercent}%`;

      if (count >= dailyGoal) {
        targetStatusText.textContent = `Goal Reached! (${count}/${dailyGoal})`;
        targetStatusText.style.color = '#34d399';
      } else {
        targetStatusText.textContent = `${dailyGoal - count} more to reach goal`;
        targetStatusText.style.color = '#fbbf24';
      }

      // Streak
      const streak = res.streak || (count > 0 ? 1 : 0);
      streakCount.textContent = `${streak}d streak`;

      // Render Current Month Heatmap
      renderCurrentMonthHeatmap(res.dailyCounts || {});

      // Render Recent Logs
      renderRecentLogs(res.recentLogs || []);
    });
  }

  function renderAuthState(user) {
    if (user && user.uid && user.uid !== 'guest') {
      authLoggedInView.style.display = 'block';
      authLoggedOutView.style.display = 'none';

      const initial = (user.displayName || user.email || 'E').charAt(0).toUpperCase();
      userAvatar.textContent = initial;
      userDisplayName.textContent = user.displayName || 'Engineer';
      userEmail.textContent = user.email || 'Account Connected';
    } else {
      authLoggedInView.style.display = 'none';
      authLoggedOutView.style.display = 'block';
    }
  }

  // 1. Submit Pair Code
  submitPairCodeBtn.addEventListener('click', () => {
    const code = (pairCodeInput.value || '').trim();
    if (!code || code.length < 4) {
      showAuthAlert('Please enter your 6-digit pair code from the Omega dashboard.');
      return;
    }

    submitPairCodeBtn.disabled = true;
    submitPairCodeBtn.textContent = 'Verifying...';
    hideAuthAlert();

    chrome.runtime.sendMessage({ type: 'AUTH_PAIR_CODE', pairCode: code }, (res) => {
      submitPairCodeBtn.disabled = false;
      submitPairCodeBtn.textContent = 'Connect';

      if (res && res.success) {
        showAuthAlert('Successfully connected to Omega!', 'success');
        setTimeout(() => {
          hideAuthAlert();
          renderAuthState(res.user);
          loadPopupData();
        }, 600);
      } else {
        showAuthAlert(res?.error || 'Invalid or expired pair code. Generate a fresh code in Omega.');
      }
    });
  });

  // 2. Submit Email Login
  submitEmailBtn.addEventListener('click', () => {
    const email = (emailInput.value || '').trim();
    const password = (passwordInput.value || '').trim();

    if (!email || !email.includes('@')) {
      showAuthAlert('Please enter a valid email address.');
      return;
    }

    submitEmailBtn.disabled = true;
    submitEmailBtn.textContent = 'Signing in...';
    hideAuthAlert();

    chrome.runtime.sendMessage({ type: 'AUTH_LOGIN', email, password }, (res) => {
      submitEmailBtn.disabled = false;
      submitEmailBtn.textContent = 'Sign In to Omega';

      if (res && res.success) {
        showAuthAlert('Signed in successfully!', 'success');
        setTimeout(() => {
          hideAuthAlert();
          renderAuthState(res.user);
          loadPopupData();
        }, 600);
      } else {
        showAuthAlert(res?.error || 'Authentication failed. Please check your credentials.');
      }
    });
  });

  // 3. Logout
  logoutBtn.addEventListener('click', () => {
    chrome.runtime.sendMessage({ type: 'AUTH_LOGOUT' }, () => {
      renderAuthState(null);
      loadPopupData();
    });
  });

  // Toggle handler
  toggleInput.addEventListener('change', () => {
    const isEnabled = toggleInput.checked;
    updateToggleUI(isEnabled);
    chrome.runtime.sendMessage({ type: 'TOGGLE_STATUS', enabled: isEnabled });
  });

  function updateToggleUI(isEnabled) {
    if (isEnabled) {
      toggleLabel.textContent = 'Active';
      toggleLabel.className = 'toggle-label';
    } else {
      toggleLabel.textContent = 'Paused';
      toggleLabel.className = 'toggle-label inactive';
    }
  }

  // Current Month Heatmap Generator
  function renderCurrentMonthHeatmap(dailyCounts) {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth(); // 0-indexed

    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    monthNameLabel.textContent = `${monthNames[currentMonth].toUpperCase()} ${currentYear}`;

    // First and last day of month
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);

    // Align start to Sunday
    const startGrid = new Date(firstDay);
    startGrid.setDate(firstDay.getDate() - firstDay.getDay());

    // Align end to Saturday
    const endGrid = new Date(lastDay);
    endGrid.setDate(lastDay.getDate() + (6 - lastDay.getDay()));

    const days = [];
    let curr = new Date(startGrid);

    let totalMonthSolved = 0;
    let activeMonthDays = 0;

    const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    while (curr <= endGrid) {
      const yearStr = curr.getFullYear();
      const monthStr = String(curr.getMonth() + 1).padStart(2, '0');
      const dayStr = String(curr.getDate()).padStart(2, '0');
      const dateKey = `${yearStr}-${monthStr}-${dayStr}`;

      const isInCurrentMonth = curr.getMonth() === currentMonth && curr.getFullYear() === currentYear;
      const count = dailyCounts[dateKey] || 0;

      if (isInCurrentMonth) {
        totalMonthSolved += count;
        if (count > 0) activeMonthDays += 1;
      }

      days.push({
        dateKey,
        dateObj: new Date(curr),
        count,
        isInCurrentMonth,
        isToday: dateKey === todayKey,
      });

      curr.setDate(curr.getDate() + 1);
    }

    monthTotalCount.textContent = totalMonthSolved;
    monthActiveDays.textContent = activeMonthDays;

    // Group into columns of 7 days (weeks)
    const weeks = [];
    for (let i = 0; i < days.length; i += 7) {
      weeks.push(days.slice(i, i + 7));
    }

    heatmapGrid.innerHTML = '';

    weeks.forEach((week) => {
      const col = document.createElement('div');
      col.className = 'heatmap-col';

      week.forEach((day) => {
        const sq = document.createElement('div');
        let levelClass = 'lv0';
        if (day.count === 1) levelClass = 'lv1';
        else if (day.count === 2) levelClass = 'lv2';
        else if (day.count >= 3 && day.count <= 4) levelClass = 'lv3';
        else if (day.count >= 5) levelClass = 'lv4';

        sq.className = `heatmap-sq ${levelClass} ${day.isToday ? 'is-today' : ''} ${!day.isInCurrentMonth ? 'outside-month' : ''}`;

        const formattedDate = day.dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        sq.title = `${formattedDate}: ${day.count} problem${day.count === 1 ? '' : 's'} solved`;

        col.appendChild(sq);
      });

      heatmapGrid.appendChild(col);
    });
  }

  // Render recent solved logs
  function renderRecentLogs(logs) {
    if (!logs || logs.length === 0) {
      recentLogsList.innerHTML = `
        <div class="empty-logs">
          No submissions recorded yet today. Solve a problem on LeetCode to auto-trigger reflection!
        </div>
      `;
      recentLogsBadge.textContent = '0 Logs';
      return;
    }

    recentLogsBadge.textContent = `${logs.length} Log${logs.length === 1 ? '' : 's'}`;
    recentLogsList.innerHTML = '';

    logs.slice(0, 4).forEach((log) => {
      const item = document.createElement('div');
      item.className = 'log-item';

      const title = log.problemTitle || 'LeetCode Problem';
      const diff = log.feltDifficulty || 'Medium';
      const stars = '★'.repeat(log.confidence || 3) + '☆'.repeat(5 - (log.confidence || 3));

      item.innerHTML = `
        <div class="log-title" title="${escapeHtml(title)}">${escapeHtml(title)}</div>
        <div class="log-meta">
          <span class="log-stars" title="${log.confidence || 3}/5 Confidence">${stars}</span>
          <span class="log-diff log-diff-${diff}">${diff}</span>
        </div>
      `;

      recentLogsList.appendChild(item);
    });
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Open web dashboard
  openAppBtn.addEventListener('click', () => {
    chrome.tabs.create({ url: currentAppUrl });
  });

  // Test reflection modal on current active tab
  testModalBtn.addEventListener('click', () => {
    testModalBtn.disabled = true;
    testModalBtn.innerHTML = `<span>Triggering...</span>`;

    chrome.runtime.sendMessage(
      {
        type: 'TRIGGER_TEST_MODAL',
        problem: {
          title: '3Sum (Demo Trigger)',
          slug: '3sum',
          url: 'https://leetcode.com/problems/3sum/',
          difficulty: 'Medium',
        },
      },
      (res) => {
        setTimeout(() => {
          testModalBtn.disabled = false;
          testModalBtn.innerHTML = `
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
            <span>Test Log Dialogue</span>
          `;
          if (res && res.success) {
            window.close(); // Close popup so user interacts with the dialogue on the webpage
          } else {
            alert('To test on the page, make sure you are currently on a LeetCode problem tab (or reload the page after installing).');
          }
        }, 300);
      }
    );
  });
});

