// Omega Content Script - Multi-Platform Submission Detector & Adaptive Practice Logger
// Platforms Supported: LeetCode, GeeksforGeeks, Codeforces

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

  // Prevent multiple injections
  if (window.__OMEGA_INJECTED__) return;
  if (!isExtensionContextValid()) return;
  window.__OMEGA_INJECTED__ = true;

  const hostname = window.location.hostname;
  const isLeetCode = hostname.includes('leetcode');
  const isGFG = hostname.includes('geeksforgeeks');
  const isCodeforces = hostname.includes('codeforces');

  console.log(`[Omega Extension] Content script active on ${isLeetCode ? 'LeetCode' : isGFG ? 'GeeksforGeeks' : isCodeforces ? 'Codeforces' : hostname}.`);

  let isModalOpen = false;
  let lastTriggerTime = 0;
  let lastHandledSubmissionKey = '';
  const scriptInitTime = Date.now();

  // --- 1. Persistent Deduplication Storage (sessionStorage + chrome.storage.local) ---
  const HANDLED_STORAGE_KEY = 'omega_handled_submissions';
  const handledSubmissionsMemory = new Set();

  function loadHandledSubmissions() {
    // A. Synchronous load from sessionStorage (per-tab, persists across page reloads)
    try {
      const sessionData = sessionStorage.getItem(HANDLED_STORAGE_KEY);
      if (sessionData) {
        const parsed = JSON.parse(sessionData);
        if (Array.isArray(parsed)) {
          parsed.forEach((k) => {
            if (typeof k === 'string') handledSubmissionsMemory.add(k);
          });
        }
      }
    } catch (e) {}

    // B. Asynchronous load from chrome.storage.local (cross-tab & persistent)
    try {
      if (isExtensionContextValid() && chrome.storage?.local) {
        chrome.storage.local.get([HANDLED_STORAGE_KEY], (res) => {
          if (res && Array.isArray(res[HANDLED_STORAGE_KEY])) {
            res[HANDLED_STORAGE_KEY].forEach((item) => {
              const k = typeof item === 'string' ? item : item?.key;
              if (k) handledSubmissionsMemory.add(k);
            });
          }
        });
      }
    } catch (e) {}
  }

  function isSubmissionAlreadyHandled(key) {
    if (!key) return false;
    if (handledSubmissionsMemory.has(key)) return true;

    // Direct check in sessionStorage in case updated in another script
    try {
      const sessionData = sessionStorage.getItem(HANDLED_STORAGE_KEY);
      if (sessionData) {
        const parsed = JSON.parse(sessionData);
        if (Array.isArray(parsed) && parsed.includes(key)) {
          handledSubmissionsMemory.add(key);
          return true;
        }
      }
    } catch (e) {}

    return false;
  }

  function markSubmissionAsHandled(key) {
    if (!key) return;
    handledSubmissionsMemory.add(key);

    // Save to sessionStorage (synchronous)
    try {
      let list = [];
      const sessionData = sessionStorage.getItem(HANDLED_STORAGE_KEY);
      if (sessionData) {
        const parsed = JSON.parse(sessionData);
        if (Array.isArray(parsed)) list = parsed;
      }
      if (!list.includes(key)) {
        list.unshift(key);
        sessionStorage.setItem(HANDLED_STORAGE_KEY, JSON.stringify(list.slice(0, 100)));
      }
    } catch (e) {}

    // Save to chrome.storage.local (persistent across sessions)
    try {
      if (isExtensionContextValid() && chrome.storage?.local) {
        chrome.storage.local.get([HANDLED_STORAGE_KEY], (res) => {
          let list = res?.[HANDLED_STORAGE_KEY] || [];
          if (!Array.isArray(list)) list = [];
          const now = Date.now();
          // Filter out older than 48 hours to prevent unbounded growth
          list = list.filter((item) => {
            const ts = typeof item === 'object' && item?.ts ? item.ts : now;
            return now - ts < 48 * 3600 * 1000;
          });
          const exists = list.some((item) => (typeof item === 'string' ? item === key : item.key === key));
          if (!exists) {
            list.unshift({ key, ts: now });
            chrome.storage.local.set({ [HANDLED_STORAGE_KEY]: list.slice(0, 150) });
          }
        });
      }
    } catch (e) {}
  }

  // Initialize storage immediately
  loadHandledSubmissions();

  // Simple string hash helper to generate deterministic submission signatures
  function hashString(str) {
    let hash = 0;
    const cleanStr = String(str || '').replace(/\s+/g, ' ').trim();
    for (let i = 0; i < cleanStr.length; i++) {
      const char = cleanStr.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(36);
  }

  // --- 2. Submit Button Intent & Network Request Tracking ---
  let lastSubmitIntentTime = 0;
  let lastSubmitIntentSource = '';
  const INTENT_VALIDITY_WINDOW_MS = 120000; // 2 minutes window for test execution, judging & evaluation

  function armSubmissionIntent(source) {
    lastSubmitIntentTime = Date.now();
    lastSubmitIntentSource = source || 'button_click';
    console.log(`[Omega] Submit intent registered via [${lastSubmitIntentSource}] at ${new Date(lastSubmitIntentTime).toLocaleTimeString()}`);
  }

  function isSubmitIntentArmed() {
    if (lastSubmitIntentTime === 0) return false;
    const elapsedSinceIntent = Date.now() - lastSubmitIntentTime;
    return elapsedSinceIntent >= 0 && elapsedSinceIntent < INTENT_VALIDITY_WINDOW_MS;
  }

  function consumeSubmissionIntent() {
    lastSubmitIntentTime = 0;
    lastSubmitIntentSource = '';
  }

  // Set up listeners for submit clicks, keyboard shortcuts, forms, and network/busy states
  function setupSubmitIntentListeners() {
    // A. Click / Pointerdown listener with capturing phase
    const handlePotentialSubmitClick = (e) => {
      const target = e.target;
      if (!target || !(target instanceof Element)) return;

      const submitElement = target.closest(
        [
          'button[data-e2e-locator="console-submit-button"]',
          'button[data-cy="submit-code-btn"]',
          'button[class*="submit-btn"]',
          'button[class*="submitBtn"]',
          'button[class*="submit"]',
          '.problems_submit_button__2qR_8',
          '.problems_submit_button',
          'button.problems_submit_button__',
          '#submitProblem',
          'input[type="submit"]',
          'button[type="submit"]',
          'form.submit-form input[type="submit"]',
          '#sidebarSubmitButton',
          'button',
          'a.submit',
          '[role="button"]'
        ].join(',')
      );

      if (submitElement) {
        const text = (
          submitElement.innerText ||
          submitElement.textContent ||
          submitElement.getAttribute('aria-label') ||
          submitElement.getAttribute('title') ||
          ''
        ).trim();

        const isSubmitButton =
          /^\s*(Submit|Submit Solution|Send Solution|Submit Code|Run & Submit)\b/i.test(text) ||
          submitElement.matches(
            '[data-e2e-locator="console-submit-button"], [data-cy="submit-code-btn"], #submitProblem, input[type="submit"][value*="Submit" i]'
          );

        if (isSubmitButton) {
          armSubmissionIntent('button_click');
        }
      }
    };

    document.addEventListener('click', handlePotentialSubmitClick, true);
    document.addEventListener('pointerdown', handlePotentialSubmitClick, true);

    // B. Keyboard shortcuts: Ctrl+Enter or Cmd+Enter commonly used to submit on coding platforms
    document.addEventListener(
      'keydown',
      (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
          armSubmissionIntent('keyboard_shortcut');
        }
      },
      true
    );

    // C. Form submissions (e.g. Codeforces, GFG forms)
    document.addEventListener(
      'submit',
      () => {
        armSubmissionIntent('form_submit');
      },
      true
    );

    // D. Mutation observer on submit buttons / loading indicators (detects submission network requests in-flight)
    const monitorSubmitButtonState = () => {
      const submitButtons = document.querySelectorAll(
        'button[data-e2e-locator="console-submit-button"], button[data-cy="submit-code-btn"], button[class*="submit"], #submitProblem, input[type="submit"]'
      );
      for (const btn of submitButtons) {
        if (
          btn.getAttribute('aria-busy') === 'true' ||
          btn.getAttribute('data-state') === 'loading' ||
          btn.classList.contains('loading') ||
          btn.classList.contains('ant-btn-loading') ||
          btn.querySelector?.('.ant-btn-loading-icon, .spinner, [class*="loading"]')
        ) {
          // If button is in loading state and not during initial 1s load, submission network request is active!
          if (Date.now() - scriptInitTime > 1000) {
            armSubmissionIntent('network_request_indicator');
          }
        }
      }
    };

    try {
      const stateObserver = new MutationObserver(monitorSubmitButtonState);
      stateObserver.observe(document.documentElement || document.body, {
        attributes: true,
        attributeFilter: ['class', 'aria-busy', 'data-state', 'disabled'],
        subtree: true,
      });
    } catch (e) {}
  }

  setupSubmitIntentListeners();

  // Extract problem metadata based on the current platform
  function getProblemDetails() {
    const url = window.location.href;

    if (isLeetCode) {
      const pathname = window.location.pathname;
      const match = pathname.match(/\/problems\/([^\/]+)/);
      const slug = match ? match[1] : 'unknown-problem';

      let title = slug
        .split('-')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');

      const titleEl = document.querySelector(
        'div[class*="text-title-large"], a[class*="text-title-large"], h1, [data-cy="question-title"]'
      );
      if (titleEl && titleEl.textContent && titleEl.textContent.trim()) {
        title = titleEl.textContent.trim();
      }

      let difficulty = 'Medium';
      const easyEl = document.querySelector('.text-difficulty-easy, .text-olive, [class*="text-green"]');
      const hardEl = document.querySelector('.text-difficulty-hard, .text-pink, [class*="text-red"]');
      const medEl = document.querySelector('.text-difficulty-medium, .text-yellow, [class*="text-yellow"]');

      if (easyEl && easyEl.textContent && /easy/i.test(easyEl.textContent)) {
        difficulty = 'Easy';
      } else if (hardEl && hardEl.textContent && /hard/i.test(hardEl.textContent)) {
        difficulty = 'Hard';
      } else if (medEl && medEl.textContent && /medium/i.test(medEl.textContent)) {
        difficulty = 'Medium';
      }

      return {
        title,
        slug,
        url,
        difficulty,
        platform: 'LeetCode',
      };
    }

    if (isGFG) {
      const pathname = window.location.pathname;
      const match = pathname.match(/\/problems\/([^\/]+)/);
      const slug = match ? match[1] : 'gfg-problem';

      let title = slug
        .split('-')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');

      const titleEl = document.querySelector(
        '.problems_header_content__title, .problem-title, h1, h3.problemName, div[class*="problemTitle"], div[class*="problemName"]'
      );
      if (titleEl && titleEl.textContent && titleEl.textContent.trim()) {
        title = titleEl.textContent.trim();
      }

      let difficulty = 'Medium';
      const diffEl = document.querySelector(
        '.problems_header_content__difficulty, span[class*="difficulty"], div[class*="difficulty"]'
      );
      if (diffEl && diffEl.textContent) {
        const text = diffEl.textContent.trim();
        if (/easy|basic|school/i.test(text)) difficulty = 'Easy';
        else if (/hard/i.test(text)) difficulty = 'Hard';
        else difficulty = 'Medium';
      }

      return {
        title,
        slug,
        url,
        difficulty,
        platform: 'GeeksforGeeks',
      };
    }

    if (isCodeforces) {
      const pathname = window.location.pathname;
      // Matches /problemset/problem/158/A or /contest/158/problem/A
      const matchProblemset = pathname.match(/\/problem(?:set)?\/(?:problem\/)?(\d+)\/([A-Za-z0-9]+)/);
      let slug = matchProblemset ? `cf-${matchProblemset[1]}-${matchProblemset[2]}` : 'codeforces-problem';

      let title = 'Codeforces Problem';
      const titleEl = document.querySelector(
        '.problem-statement .header .title, .problemindexandname a, h1, .title'
      );
      if (titleEl && titleEl.textContent && titleEl.textContent.trim()) {
        title = titleEl.textContent.trim();
      } else if (matchProblemset) {
        title = `${matchProblemset[1]}${matchProblemset[2]} - Problem`;
      }

      let difficulty = 'Medium';
      // Codeforces ratings or problem index (A/B -> Easy, C/D -> Medium, E/F -> Hard)
      if (matchProblemset && matchProblemset[2]) {
        const idx = matchProblemset[2].toUpperCase();
        if (idx === 'A' || idx === 'B') difficulty = 'Easy';
        else if (idx === 'C' || idx === 'D') difficulty = 'Medium';
        else difficulty = 'Hard';
      }

      return {
        title,
        slug,
        url,
        difficulty,
        platform: 'Codeforces',
      };
    }

    return {
      title: 'Practice Problem',
      slug: 'practice-problem',
      url,
      difficulty: 'Medium',
      platform: 'LeetCode',
    };
  }

  // Safe background messaging with retries and direct storage fallbacks
  function safeSendMessage(message, onResponse, onFallback) {
    if (!isExtensionContextValid()) {
      if (typeof onFallback === 'function') onFallback();
      return;
    }

    let isHandled = false;
    const timeout = setTimeout(() => {
      if (!isHandled) {
        isHandled = true;
        if (typeof onFallback === 'function') onFallback();
      }
    }, 1200);

    try {
      chrome.runtime.sendMessage(message, (response) => {
        if (isHandled) return;
        isHandled = true;
        clearTimeout(timeout);

        if (chrome.runtime.lastError) {
          if (typeof onFallback === 'function') onFallback();
          return;
        }

        if (typeof onResponse === 'function') {
          onResponse(response);
        }
      });
    } catch (e) {
      if (!isHandled) {
        isHandled = true;
        clearTimeout(timeout);
        if (typeof onFallback === 'function') onFallback();
      }
    }
  }

  // Trigger submission modal after checking settings & fetching history
  function triggerSubmissionModal(problemDetails) {
    const now = Date.now();
    // Debounce triggers (min 4 seconds apart)
    if (now - lastTriggerTime < 4000) return;
    if (isModalOpen) return;

    const proceedWithModal = (history) => {
      lastTriggerTime = Date.now();
      renderModal(problemDetails, history || { hasPrevious: false, isRevision: false, previousLog: null });
    };

    safeSendMessage(
      { type: 'GET_STATUS' },
      (statusRes) => {
        if (statusRes && statusRes.enabled === false) {
          console.log('[Omega Extension] Tracking is currently toggled OFF in extension.');
          return;
        }

        // Check problem history for First Log vs Revision Log format
        safeSendMessage(
          {
            type: 'GET_PROBLEM_HISTORY',
            slug: problemDetails.slug,
            title: problemDetails.title,
            url: problemDetails.url,
            platform: problemDetails.platform,
          },
          (historyRes) => {
            proceedWithModal(historyRes);
          },
          () => {
            // Direct storage check fallback
            try {
              if (typeof chrome !== 'undefined' && chrome.storage?.local) {
                chrome.storage.local.get(['omega_logs'], (res) => {
                  const logs = res?.omega_logs || [];
                  const cleanSlug = (problemDetails.slug || '').toLowerCase();
                  const prev = logs.find((l) => (l.problemSlug || '').toLowerCase() === cleanSlug);
                  proceedWithModal(
                    prev
                      ? {
                          hasPrevious: true,
                          isRevision: true,
                          previousLog: prev,
                        }
                      : { hasPrevious: false, isRevision: false, previousLog: null }
                  );
                });
              } else {
                proceedWithModal(null);
              }
            } catch (e) {
              proceedWithModal(null);
            }
          }
        );
      },
      () => {
        // Direct local storage check fallback
        try {
          if (typeof chrome !== 'undefined' && chrome.storage?.local) {
            chrome.storage.local.get(['omega_enabled', 'omega_logs'], (res) => {
              if (res && res.omega_enabled === false) return;
              const logs = res?.omega_logs || [];
              const cleanSlug = (problemDetails.slug || '').toLowerCase();
              const prev = logs.find((l) => (l.problemSlug || '').toLowerCase() === cleanSlug);
              proceedWithModal(
                prev
                  ? {
                      hasPrevious: true,
                      isRevision: true,
                      previousLog: prev,
                    }
                  : { hasPrevious: false, isRevision: false, previousLog: null }
              );
            });
          } else {
            proceedWithModal(null);
          }
        } catch (e) {
          proceedWithModal(null);
        }
      }
    );
  }

  // --- 1. LeetCode Submissions Observer ---
  function observeLeetCodeSubmissions() {
    if (!isLeetCode) return;

    const checkLeetCodeSubmissions = () => {
      if (isModalOpen) return;
      if (!isSubmitIntentArmed()) return;

      // Look for result containers or accepted indicators
      const candidates = document.querySelectorAll(
        '[data-e2e-locator="submission-result"], [class*="result__"], div[class*="status__"], div[data-layout-path*="submission"], a[href*="/submissions/detail/"], .text-green-s, [class*="text-green"]'
      );

      for (const cand of candidates) {
        const parent = cand.closest('div[class*="container"], [data-e2e-locator="submission-result"], div') || cand;
        const fullResultText = parent.innerText || parent.textContent || '';

        const hasAccepted =
          /Accepted/i.test(fullResultText) &&
          (fullResultText.includes('Runtime') ||
            fullResultText.includes('Beats') ||
            fullResultText.includes('Memory') ||
            fullResultText.includes('Details') ||
            fullResultText.includes('Submission') ||
            parent.matches?.('[data-e2e-locator="submission-result"]') ||
            parent.querySelector?.('[data-e2e-locator="submission-result"]'));

        const isFailure =
          /Wrong Answer|Time Limit Exceeded|Memory Limit Exceeded|Runtime Error|Compile Error|Output Limit Exceeded/i.test(
            fullResultText
          );
        const isRunCodeOnly =
          /Run Code Result|Testcase [0-9]|Test Result/i.test(fullResultText) &&
          !/Accepted/i.test(fullResultText) &&
          !/Beats/i.test(fullResultText);

        if (hasAccepted && !isFailure && !isRunCodeOnly) {
          const details = getProblemDetails();

          let submissionId = '';
          const subLink = parent.querySelector?.('a[href*="/submissions/detail/"]') || document.querySelector('a[href*="/submissions/detail/"]');
          if (subLink) {
            const match = (subLink.getAttribute('href') || '').match(/\/submissions\/detail\/(\d+)/);
            if (match) submissionId = match[1];
          }
          if (!submissionId) {
            const urlMatch = window.location.pathname.match(/\/submissions\/(?:detail\/)?(\d+)/);
            if (urlMatch) submissionId = urlMatch[1];
          }

          const metricsHash = hashString(fullResultText.replace(/\s+/g, ' '));
          const uniqueKey = `leetcode-${details.slug}-${submissionId || metricsHash}`;

          if (isSubmissionAlreadyHandled(uniqueKey)) {
            continue;
          }

          markSubmissionAsHandled(uniqueKey);
          consumeSubmissionIntent();

          console.log('[Omega] Detected fresh LeetCode Accepted Submission (Active Check):', details);
          triggerSubmissionModal(details);
          return;
        }
      }
    };

    const observer = new MutationObserver((mutations) => {
      if (isModalOpen) return;

      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (node.nodeType !== Node.ELEMENT_NODE) continue;
          const el = node;

          // Check if newly added element or its text contains "Accepted"
          const text = el.textContent || '';
          const hasAccepted =
            text.includes('Accepted') &&
            (text.includes('Runtime') ||
              text.includes('Beats') ||
              text.includes('Memory') ||
              text.includes('Details') ||
              text.includes('Submission') ||
              text.includes('Passed') ||
              el.matches?.('[data-e2e-locator="submission-result"]') ||
              el.querySelector?.('[data-e2e-locator="submission-result"]') ||
              el.matches?.('.text-green-s, [class*="text-green"]') ||
              el.querySelector?.('.text-green-s, [class*="text-green"]'));

          if (hasAccepted) {
            const fullResultText = el.innerText || el.textContent || '';

            // Verify it is NOT an error, failure, or partial Run Code testcase
            const isFailure =
              /Wrong Answer|Time Limit Exceeded|Memory Limit Exceeded|Runtime Error|Compile Error|Output Limit Exceeded/i.test(
                fullResultText
              );
            const isRunCodeOnly =
              /Run Code Result|Testcase [0-9]|Test Result/i.test(fullResultText) &&
              !/Accepted/i.test(fullResultText) &&
              !/Beats/i.test(fullResultText);

            if (!isFailure && !isRunCodeOnly && /Accepted/i.test(fullResultText)) {
              // 1. Submit Button Intent Check: Ignore if no active submission intent was triggered
              if (!isSubmitIntentArmed()) {
                console.log(
                  '[Omega] Ignoring LeetCode "Accepted" element because no recent Submit button click or submission request occurred (e.g. page reload).'
                );
                continue;
              }

              const details = getProblemDetails();

              // Extract submission ID if present in DOM or URL
              let submissionId = '';
              const subLink = el.querySelector?.('a[href*="/submissions/detail/"]');
              if (subLink) {
                const match = (subLink.getAttribute('href') || '').match(/\/submissions\/detail\/(\d+)/);
                if (match) submissionId = match[1];
              }
              if (!submissionId) {
                const urlMatch = window.location.pathname.match(/\/submissions\/(?:detail\/)?(\d+)/);
                if (urlMatch) submissionId = urlMatch[1];
              }

              // Build persistent unique key using problem slug + submission ID or hash of result metrics
              const metricsHash = hashString(fullResultText.replace(/\s+/g, ' '));
              const uniqueKey = `leetcode-${details.slug}-${submissionId || metricsHash}`;

              // 2. Persistent Deduplication Check
              if (isSubmissionAlreadyHandled(uniqueKey)) {
                console.log(`[Omega] Submission "${uniqueKey}" was already handled. Skipping modal trigger.`);
                continue;
              }

              // Mark as handled in persistent storage and consume intent
              markSubmissionAsHandled(uniqueKey);
              consumeSubmissionIntent();

              console.log('[Omega] Detected fresh LeetCode Accepted Submission (All Testcases Passed):', details);
              triggerSubmissionModal(details);
            }
          }
        }
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });
    setInterval(checkLeetCodeSubmissions, 1000);
  }

  // --- 2. GeeksforGeeks Submissions Observer ---
  function observeGFGSubmissions() {
    if (!isGFG) return;

    const checkGFGSubmissions = () => {
      if (isModalOpen) return;
      if (!isSubmitIntentArmed()) return;

      const successElements = document.querySelectorAll(
        '.problems_header_content, [class*="problemSolved"], [class*="successBanner"], div.solvedProblem, div[class*="submission_content"]'
      );
      for (const el of successElements) {
        const text = el.innerText || el.textContent || '';
        const isGFGSuccess =
          text.includes('Problem Solved Successfully') ||
          text.includes('Correct Answer') ||
          text.includes('All Test Cases Passed') ||
          /Test Cases Passed:\s*(\d+)\s*\/\s*\1/i.test(text);
        const isGFGFailure = /Compilation Error|Wrong Answer|Time Limit Exceeded|Failed Test Cases|Runtime Error/i.test(text);

        if (isGFGSuccess && !isGFGFailure) {
          const details = getProblemDetails();
          const resultHash = hashString(text.replace(/\s+/g, ' '));
          const uniqueKey = `gfg-${details.slug}-${resultHash}`;

          if (isSubmissionAlreadyHandled(uniqueKey)) continue;

          markSubmissionAsHandled(uniqueKey);
          consumeSubmissionIntent();

          console.log('[Omega] Detected fresh GeeksforGeeks Successful Submission (Active Check):', details);
          triggerSubmissionModal(details);
          return;
        }
      }
    };

    const observer = new MutationObserver((mutations) => {
      if (isModalOpen) return;

      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (node.nodeType !== Node.ELEMENT_NODE) continue;
          const el = node;
          const text = el.innerText || el.textContent || '';

          // GFG displays: "Problem Solved Successfully", "Correct Answer", "All Test Cases Passed", or "Test Cases Passed: X / X"
          const isGFGSuccess =
            text.includes('Problem Solved Successfully') ||
            text.includes('Correct Answer') ||
            text.includes('All Test Cases Passed') ||
            /Test Cases Passed:\s*(\d+)\s*\/\s*\1/i.test(text) ||
            (text.includes('Points Scored') && text.includes('Accuracy'));

          const isGFGFailure =
            /Compilation Error|Wrong Answer|Time Limit Exceeded|Failed Test Cases|Runtime Error/i.test(
              text
            );

          if (isGFGSuccess && !isGFGFailure) {
            // 1. Submit Button Intent Check
            if (!isSubmitIntentArmed()) {
              console.log(
                '[Omega] Ignoring GeeksforGeeks success banner because no recent Submit button click occurred (e.g. page reload).'
              );
              continue;
            }

            const details = getProblemDetails();
            const resultHash = hashString(text.replace(/\s+/g, ' '));
            const uniqueKey = `gfg-${details.slug}-${resultHash}`;

            // 2. Persistent Deduplication Check
            if (isSubmissionAlreadyHandled(uniqueKey)) {
              console.log(`[Omega] GeeksforGeeks submission "${uniqueKey}" was already handled. Skipping.`);
              continue;
            }

            markSubmissionAsHandled(uniqueKey);
            consumeSubmissionIntent();

            console.log('[Omega] Detected fresh GeeksforGeeks Successful Submission:', details);
            triggerSubmissionModal(details);
          }
        }
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });
    setInterval(checkGFGSubmissions, 1000);
  }

  // --- 3. Codeforces Submissions Observer ---
  function observeCodeforcesSubmissions() {
    if (!isCodeforces) return;

    // Check status table or submission result banners
    const checkVerdictElements = () => {
      if (isModalOpen) return;

      // Only check if submit intent is armed!
      if (!isSubmitIntentArmed()) return;

      const verdictElements = document.querySelectorAll(
        'span.verdict-accepted, span.verdict-green, td.status-verdict-cell span, td.status-cell span'
      );

      for (const el of verdictElements) {
        const text = (el.innerText || el.textContent || '').trim();

        // Must be strictly Accepted
        if (text === 'Accepted' || el.classList.contains('verdict-accepted')) {
          const row = el.closest('tr');
          const details = getProblemDetails();

          // If on status/submission page, attempt to read problem title from the row
          let subId = '';
          if (row) {
            subId =
              row.getAttribute('data-submission-id') ||
              row.querySelector('td.id-cell, a[href*="/submission/"]')?.textContent?.trim() ||
              '';
            const probLink = row.querySelector('td[data-problemid] a, a[href*="/problem/"]');
            if (probLink && probLink.textContent) {
              details.title = probLink.textContent.trim();
              const m = (probLink.getAttribute('href') || '').match(
                /\/problem(?:set)?\/(?:problem\/)?(\d+)\/([A-Za-z0-9]+)/
              );
              if (m) {
                details.slug = `cf-${m[1]}-${m[2]}`;
              }
            }
          }

          const uniqueKey = `codeforces-${details.slug}-${subId || hashString(row?.textContent || text)}`;

          // Persistent Deduplication Check
          if (isSubmissionAlreadyHandled(uniqueKey)) {
            continue;
          }

          markSubmissionAsHandled(uniqueKey);
          consumeSubmissionIntent();

          console.log('[Omega] Detected fresh Codeforces Accepted Submission:', details);
          triggerSubmissionModal(details);
          break;
        }
      }
    };

    const observer = new MutationObserver(() => {
      checkVerdictElements();
    });

    observer.observe(document.body, { childList: true, subtree: true });
    // Periodic check for status updates when submit intent is armed
    setInterval(checkVerdictElements, 2000);
  }

  // Render the practice log modal (First Log format vs Revision Log format)
  function renderModal(problem, history) {
    if (document.getElementById('omega-extension-modal-overlay')) return;
    isModalOpen = true;

    // Lock page scrolling
    const originalBodyOverflow = document.body.style.overflow;
    const originalHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    const isRevision = !!(history && history.isRevision && history.previousLog);
    const prev = isRevision ? history.previousLog : null;

    // State for modal
    let confidence = isRevision ? (prev.confidence ? Math.min(5, prev.confidence + 1) : 4) : 4;
    let feltDifficulty = problem.difficulty || 'Medium';
    let recognizedPattern = true;
    let requiredHints = false;

    // Targeted Revision Questions State
    let speedImprovement = 'Slightly Faster';
    let avoidedPreviousMistakes = 'Independent Now';
    let interviewReadiness = 'Moderate Progress';

    const confidenceLabels = {
      1: '1/5 - Very Uncertain',
      2: '2/5 - Shaky / Hesitant',
      3: '3/5 - Fair Understanding',
      4: '4/5 - Confident & Clear',
      5: '5/5 - Completely Mastered',
    };

    const overlay = document.createElement('div');
    overlay.id = 'omega-extension-modal-overlay';

    // Format previous log date
    let prevDateFormatted = 'Previous Attempt';
    if (prev && prev.timestamp) {
      try {
        prevDateFormatted = new Date(prev.timestamp).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        });
      } catch (e) {
        prevDateFormatted = 'Previous Attempt';
      }
    }

    overlay.innerHTML = `
      <div id="omega-extension-modal-box" role="dialog" aria-modal="true" aria-labelledby="omega-title">
        <!-- Header -->
        <div class="omega-modal-header">
          <div class="omega-brand">
            <div class="omega-logo-badge">
              <span class="omega-logo-char">Ω</span>
            </div>
            <div class="omega-header-titles">
              <div class="omega-header-sub">
                <span class="omega-pill-pulse"></span>
                <span>${isRevision ? 'Spaced Revision Reflection' : 'Omega Practice OS • Live Sync'}</span>
              </div>
              <h2 id="omega-title" class="omega-header-title">
                ${isRevision ? 'Revision Reflection Log' : 'Problem Reflection (< 1 min)'}
              </h2>
            </div>
          </div>
          <div class="omega-lock-badge" title="Reflection builds retention and optimizes your spaced repetition interval">
            ${isRevision ? '🔁 Revision Attempt' : '🔒 Required Log'}
          </div>
        </div>

        <!-- Scrollable Form Body -->
        <div class="omega-modal-body">
          <!-- Problem metadata card -->
          <div class="omega-problem-card">
            <div style="min-width: 0; flex: 1;">
              <div class="omega-problem-title" title="${escapeHtml(problem.title)}">${escapeHtml(problem.title)}</div>
              <div class="omega-problem-meta">${problem.platform || 'Platform'} • All Testcases Passed</div>
            </div>
            <div style="display: flex; gap: 6px; align-items: center; flex-shrink: 0;">
              <span class="omega-platform-badge omega-platform-${problem.platform || 'LeetCode'}">
                ${problem.platform || 'LeetCode'}
              </span>
              <span class="omega-diff-badge omega-diff-${problem.difficulty || 'Medium'}">
                ${problem.difficulty || 'Medium'}
              </span>
            </div>
          </div>

          ${
            isRevision && prev
              ? `
            <!-- Previous Log Context Banner (Revision Format) -->
            <div class="omega-revision-banner">
              <div class="omega-revision-banner-header">
                <span class="omega-revision-banner-title">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                  Previous Log (${prevDateFormatted})
                </span>
                <span class="omega-revision-banner-meta">
                  ★ ${prev.confidence || 3}/5 Stars (${prev.feltDifficulty || 'Medium'})
                </span>
              </div>
              ${
                prev.notes
                  ? `<p class="omega-revision-quote">"${escapeHtml(prev.notes)}"</p>`
                  : `<p class="omega-revision-quote" style="color: #64748b;">No notes recorded in previous attempt.</p>`
              }
              <div class="omega-revision-diagnostics">
                <span class="omega-revision-tag">Pattern: ${prev.recognizedPatternImmediately ? 'Instant' : 'Needed Thought'}</span>
                <span class="omega-revision-tag">Hints: ${prev.requiredHintsOrEditorial ? 'Required' : 'Independent'}</span>
              </div>
            </div>

            <!-- Targeted Improvement Questions (Revision Format) -->
            <div class="omega-section" style="background: #111114; border: 1px solid #27272a; padding: 12px; border-radius: 10px; gap: 10px;">
              <div style="font-size: 11px; font-weight: 700; color: #a5b4fc; text-transform: uppercase; letter-spacing: 0.04em;">
                Improvement Since Last Attempt
              </div>
              
              <!-- Speed Improvement -->
              <div>
                <div style="font-size: 11px; color: #d4d4d8; margin-bottom: 5px;">1. Pattern Recognition & Coding Speed:</div>
                <div class="omega-grid-3" id="omega-speed-container">
                  <button type="button" class="omega-choice-btn" data-speed="Much Faster">Much Faster</button>
                  <button type="button" class="omega-choice-btn active-amber" data-speed="Slightly Faster">Slightly Faster</button>
                  <button type="button" class="omega-choice-btn" data-speed="Same / Slower">Same / Slower</button>
                </div>
              </div>

              <!-- Avoided Hints / Mistakes -->
              <div>
                <div style="font-size: 11px; color: #d4d4d8; margin-bottom: 5px;">2. Avoided Previous Hints / Bugs?</div>
                <div class="omega-grid-3" id="omega-avoid-container">
                  <button type="button" class="omega-choice-btn active-easy" data-avoid="Independent Now">Independent Now</button>
                  <button type="button" class="omega-choice-btn" data-avoid="Needed Minor Hint">Minor Hint</button>
                  <button type="button" class="omega-choice-btn" data-avoid="Required Editorial">Editorial</button>
                </div>
              </div>

              <!-- Interview Readiness Level -->
              <div>
                <div style="font-size: 11px; color: #d4d4d8; margin-bottom: 5px;">3. Interview Readiness:</div>
                <div class="omega-grid-3" id="omega-readiness-container">
                  <button type="button" class="omega-choice-btn" data-ready="Ready / Solid">Ready / Solid</button>
                  <button type="button" class="omega-choice-btn active-amber" data-ready="Moderate Progress">Moderate Progress</button>
                  <button type="button" class="omega-choice-btn" data-ready="Needs Practice">Needs Practice</button>
                </div>
              </div>
            </div>
          `
              : ''
          }

          <!-- 1. Confidence Rating -->
          <div class="omega-section">
            <div class="omega-label">
              <span>${isRevision ? 'Current Confidence Rating:' : '1. Intuition & Confidence:'}</span>
              <span id="omega-conf-text" class="omega-label-status">${confidenceLabels[confidence]}</span>
            </div>
            <div class="omega-stars-row" id="omega-stars-container">
              ${[1, 2, 3, 4, 5]
                .map(
                  (star) => `
                <button type="button" class="omega-star-btn ${star <= confidence ? 'active' : ''}" data-star="${star}" aria-label="Rate ${star} stars">
                  <svg viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                </button>
              `
                )
                .join('')}
            </div>
          </div>

          <!-- 2. Felt Difficulty -->
          <div class="omega-section">
            <div class="omega-label">
              <span>${isRevision ? 'Felt Difficulty Today:' : '2. Felt Difficulty:'}</span>
            </div>
            <div class="omega-grid-3" id="omega-diff-container">
              <button type="button" class="omega-choice-btn ${feltDifficulty === 'Easy' ? 'active-easy' : ''}" data-diff="Easy">Easy</button>
              <button type="button" class="omega-choice-btn ${feltDifficulty === 'Medium' ? 'active-medium' : ''}" data-diff="Medium">Medium</button>
              <button type="button" class="omega-choice-btn ${feltDifficulty === 'Hard' ? 'active-hard' : ''}" data-diff="Hard">Hard</button>
            </div>
          </div>

          <!-- 3. Rapid Pattern Diagnostics -->
          <div class="omega-section">
            <div class="omega-label">
              <span>${isRevision ? 'Execution Diagnostics:' : '3. Pattern Recognition:'}</span>
            </div>
            <div class="omega-grid-2" style="gap: 10px;">
              <div style="background: #09090b; border: 1px solid #27272a; padding: 10px; border-radius: 8px;">
                <div style="font-size: 11px; color: #d4d4d8; margin-bottom: 6px; font-weight: 500;">Recognized pattern immediately?</div>
                <div class="omega-grid-2" id="omega-rec-pattern">
                  <button type="button" class="omega-choice-btn ${recognizedPattern ? 'active-yes' : ''}" data-val="true">Yes</button>
                  <button type="button" class="omega-choice-btn ${!recognizedPattern ? 'active-no' : ''}" data-val="false">No</button>
                </div>
              </div>

              <div style="background: #09090b; border: 1px solid #27272a; padding: 10px; border-radius: 8px;">
                <div style="font-size: 11px; color: #d4d4d8; margin-bottom: 6px; font-weight: 500;">Required hints / editorial?</div>
                <div class="omega-grid-2" id="omega-req-hints">
                  <button type="button" class="omega-choice-btn ${requiredHints ? 'active-amber' : ''}" data-val="true">Yes</button>
                  <button type="button" class="omega-choice-btn ${!requiredHints ? 'active-yes' : ''}" data-val="false">No</button>
                </div>
              </div>
            </div>
          </div>

          <!-- 4. Key Insights / Implementation Notes -->
          <div class="omega-section">
            <div class="omega-label">
              <span>${isRevision ? 'Revision Notes & Insights (Optional):' : '4. Key Insight & Edge Cases (Optional):'}</span>
            </div>
            <textarea id="omega-notes-input" class="omega-textarea" placeholder="${isRevision ? 'What made this revision smoother? Key takeaways...' : 'e.g. Edge case when array length is 0, off-by-one pointer condition...'}"></textarea>
          </div>
        </div>

        <!-- Footer -->
        <div class="omega-modal-footer">
          <button type="button" id="omega-submit-btn" class="omega-submit-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            <span>${isRevision ? 'Save Revision Reflection' : 'Save Reflection & Continue Practice'}</span>
          </button>
          <p class="omega-notice-text">
            Reflection builds retention and auto-syncs with your Omega consistency dashboard.
          </p>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    const modalBox = document.getElementById('omega-extension-modal-box');
    const confText = document.getElementById('omega-conf-text');
    const notesInput = document.getElementById('omega-notes-input');
    const submitBtn = document.getElementById('omega-submit-btn');

    // Make dialogue UNAVOIDABLE:
    // 1. Click outside modal shakes and reminds user
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        modalBox.classList.remove('omega-shake-anim');
        void modalBox.offsetWidth; // trigger reflow
        modalBox.classList.add('omega-shake-anim');
      }
    });

    // 2. Prevent Escape key and Tab escape
    const trapHandler = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        modalBox.classList.remove('omega-shake-anim');
        void modalBox.offsetWidth;
        modalBox.classList.add('omega-shake-anim');
      }
    };
    window.addEventListener('keydown', trapHandler, true);

    // Star rating buttons
    overlay.querySelectorAll('.omega-star-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        confidence = parseInt(btn.getAttribute('data-star') || '3', 10);
        confText.textContent = confidenceLabels[confidence];
        overlay.querySelectorAll('.omega-star-btn').forEach((b) => {
          const s = parseInt(b.getAttribute('data-star') || '0', 10);
          if (s <= confidence) {
            b.classList.add('active');
          } else {
            b.classList.remove('active');
          }
        });
      });
    });

    // Difficulty buttons
    overlay.querySelectorAll('#omega-diff-container .omega-choice-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        feltDifficulty = btn.getAttribute('data-diff');
        overlay.querySelectorAll('#omega-diff-container .omega-choice-btn').forEach((b) => {
          b.className = 'omega-choice-btn';
        });
        if (feltDifficulty === 'Easy') btn.classList.add('active-easy');
        else if (feltDifficulty === 'Medium') btn.classList.add('active-medium');
        else if (feltDifficulty === 'Hard') btn.classList.add('active-hard');
      });
    });

    // Pattern Recognition buttons
    overlay.querySelectorAll('#omega-rec-pattern .omega-choice-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        recognizedPattern = btn.getAttribute('data-val') === 'true';
        overlay.querySelectorAll('#omega-rec-pattern .omega-choice-btn').forEach((b) => {
          b.className = 'omega-choice-btn';
        });
        btn.classList.add(recognizedPattern ? 'active-yes' : 'active-no');
      });
    });

    // Required Hints buttons
    overlay.querySelectorAll('#omega-req-hints .omega-choice-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        requiredHints = btn.getAttribute('data-val') === 'true';
        overlay.querySelectorAll('#omega-req-hints .omega-choice-btn').forEach((b) => {
          b.className = 'omega-choice-btn';
        });
        btn.classList.add(requiredHints ? 'active-amber' : 'active-yes');
      });
    });

    // Revision-specific improvement questions
    if (isRevision) {
      overlay.querySelectorAll('#omega-speed-container .omega-choice-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
          speedImprovement = btn.getAttribute('data-speed');
          overlay.querySelectorAll('#omega-speed-container .omega-choice-btn').forEach((b) => (b.className = 'omega-choice-btn'));
          btn.classList.add('active-amber');
        });
      });

      overlay.querySelectorAll('#omega-avoid-container .omega-choice-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
          avoidedPreviousMistakes = btn.getAttribute('data-avoid');
          overlay.querySelectorAll('#omega-avoid-container .omega-choice-btn').forEach((b) => (b.className = 'omega-choice-btn'));
          btn.classList.add('active-easy');
        });
      });

      overlay.querySelectorAll('#omega-readiness-container .omega-choice-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
          interviewReadiness = btn.getAttribute('data-ready');
          overlay.querySelectorAll('#omega-readiness-container .omega-choice-btn').forEach((b) => (b.className = 'omega-choice-btn'));
          btn.classList.add('active-amber');
        });
      });
    }

    // Submit handler
    submitBtn.addEventListener('click', async () => {
      submitBtn.disabled = true;
      submitBtn.innerHTML = `<span>Saving & Syncing Dashboard...</span>`;

      const reflectionLog = {
        id: `ext-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        problemTitle: problem.title,
        problemSlug: problem.slug,
        problemUrl: problem.url,
        platform: problem.platform || 'LeetCode',
        feltDifficulty: feltDifficulty,
        confidence: confidence,
        recognizedPatternImmediately: recognizedPattern,
        requiredHintsOrEditorial: requiredHints,
        notes: (notesInput.value || '').trim(),
        isRevision: isRevision,
        improvementAnswers: isRevision
          ? {
              speedImprovement,
              avoidedPreviousMistakes,
              interviewReadiness,
            }
          : undefined,
        timestamp: Date.now(),
        source: 'extension',
      };

      // UI celebration and cleanup
      const showSuccessAndClose = () => {
        modalBox.innerHTML = `
          <div class="omega-success-view">
            <div class="omega-success-icon">✓</div>
            <h3 class="omega-success-title">${isRevision ? 'Revision Logged Successfully' : 'Reflection Logged & Synced'}</h3>
            <p class="omega-success-sub">
              ${isRevision ? 'Revision progress updated and scheduled for next interval.' : 'Great job! Heatmap updated and spaced revision scheduled.'}
            </p>
          </div>
        `;

        setTimeout(() => {
          window.removeEventListener('keydown', trapHandler, true);
          overlay.remove();
          document.body.style.overflow = originalBodyOverflow;
          document.documentElement.style.overflow = originalHtmlOverflow;
          isModalOpen = false;
        }, 1100);
      };

      // Fallback local save function in case service worker is asleep or reloaded
      const performLocalFallbackSave = () => {
        try {
          if (typeof chrome !== 'undefined' && chrome.storage?.local) {
            chrome.storage.local.get(
              ['omega_logs', 'omega_daily_counts', 'omega_streak', 'omega_app_url', 'omega_user'],
              (res) => {
                if (!res) return;
                const user = res.omega_user || null;
                if (user) {
                  if (user.uid) reflectionLog.userId = user.uid;
                  if (user.email) reflectionLog.userEmail = user.email;
                }
                const logs = res.omega_logs || [];
                logs.unshift(reflectionLog);
                const d = new Date();
                const todayKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
                const dailyCounts = res.omega_daily_counts || {};
                dailyCounts[todayKey] = (dailyCounts[todayKey] || 0) + 1;

                chrome.storage.local.set({
                  omega_logs: logs,
                  omega_daily_counts: dailyCounts,
                  omega_streak: (res.omega_streak || 0) + (dailyCounts[todayKey] === 1 ? 1 : 0),
                });

                // Direct POST to server if online
                const appUrl = (res.omega_app_url || 'https://ais-dev-xe62wcz6ciunnsbrgansz7-15217695281.asia-east1.run.app').replace(/\/+$/, '');
                fetch(`${appUrl}/api/extension/log`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    log: reflectionLog,
                    userId: user ? user.uid : 'guest',
                    userEmail: user ? user.email : undefined,
                  }),
                }).catch(() => {});
              }
            );
          }
        } catch (e) {}
      };

      // Send to background service worker with fallback
      safeSendMessage(
        { type: 'RECORD_LOG', log: reflectionLog },
        () => {
          showSuccessAndClose();
        },
        () => {
          performLocalFallbackSave();
          showSuccessAndClose();
        }
      );
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

  // Start observing on respective platform
  observeLeetCodeSubmissions();
  observeGFGSubmissions();
  observeCodeforcesSubmissions();
})();
