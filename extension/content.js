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
  let lastHandledSubmissionKey = '';
  let lastTriggerTime = 0;

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

  // Trigger submission modal after checking settings & fetching history
  function triggerSubmissionModal(problemDetails) {
    if (!isExtensionContextValid()) return;
    const now = Date.now();
    // Debounce triggers (min 4 seconds apart)
    if (now - lastTriggerTime < 4000) return;
    if (isModalOpen) return;

    try {
      chrome.runtime.sendMessage({ type: 'GET_STATUS' }, (statusRes) => {
        if (chrome.runtime.lastError || !isExtensionContextValid()) {
          return;
        }

        if (statusRes && statusRes.enabled === false) {
          console.log('[Omega Extension] Tracking is currently toggled OFF in extension.');
          return;
        }

        // Check if user has previously solved/logged this problem (determines First vs Revision log format)
        try {
          chrome.runtime.sendMessage(
            {
              type: 'GET_PROBLEM_HISTORY',
              slug: problemDetails.slug,
              title: problemDetails.title,
              url: problemDetails.url,
              platform: problemDetails.platform,
            },
            (historyRes) => {
              if (!isExtensionContextValid()) return;
              lastTriggerTime = Date.now();
              const history = historyRes || { hasPrevious: false, isRevision: false, previousLog: null };
              renderModal(problemDetails, history);
            }
          );
        } catch (e) {}
      });
    } catch (err) {
      console.log('[Omega Extension] Trigger notice:', err.message);
    }
  }

  // --- 1. LeetCode Submissions Observer ---
  function observeLeetCodeSubmissions() {
    if (!isLeetCode) return;

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
              const details = getProblemDetails();
              const uniqueKey = `leetcode-${details.slug}-${Math.floor(Date.now() / 15000)}`;

              if (lastHandledSubmissionKey !== uniqueKey) {
                lastHandledSubmissionKey = uniqueKey;
                console.log('[Omega] Detected LeetCode Accepted Submission (All Testcases Passed):', details);
                triggerSubmissionModal(details);
              }
            }
          }
        }
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });
  }

  // --- 2. GeeksforGeeks Submissions Observer ---
  function observeGFGSubmissions() {
    if (!isGFG) return;

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
            const details = getProblemDetails();
            const uniqueKey = `gfg-${details.slug}-${Math.floor(Date.now() / 15000)}`;

            if (lastHandledSubmissionKey !== uniqueKey) {
              lastHandledSubmissionKey = uniqueKey;
              console.log('[Omega] Detected GeeksforGeeks Successful Submission (All Testcases Passed):', details);
              triggerSubmissionModal(details);
            }
          }
        }
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });
  }

  // --- 3. Codeforces Submissions Observer ---
  function observeCodeforcesSubmissions() {
    if (!isCodeforces) return;

    // Check status table or submission result banners
    const checkVerdictElements = () => {
      if (isModalOpen) return;

      const verdictElements = document.querySelectorAll(
        'span.verdict-accepted, span.verdict-green, td.status-verdict-cell span, td.status-cell span'
      );

      for (const el of verdictElements) {
        const text = (el.innerText || el.textContent || '').trim();

        // Must be strictly Accepted
        if (text === 'Accepted' || el.classList.contains('verdict-accepted')) {
          // Check if this row was recent or current user submission
          const row = el.closest('tr');
          const details = getProblemDetails();

          // If on status/submission page, attempt to read problem title from the row
          if (row) {
            const probLink = row.querySelector('td[data-problemid] a, a[href*="/problem/"]');
            if (probLink && probLink.textContent) {
              details.title = probLink.textContent.trim();
              const m = (probLink.getAttribute('href') || '').match(/\/problem(?:set)?\/(?:problem\/)?(\d+)\/([A-Za-z0-9]+)/);
              if (m) {
                details.slug = `cf-${m[1]}-${m[2]}`;
              }
            }
          }

          const uniqueKey = `codeforces-${details.slug}-${Math.floor(Date.now() / 15000)}`;
          if (lastHandledSubmissionKey !== uniqueKey) {
            lastHandledSubmissionKey = uniqueKey;
            console.log('[Omega] Detected Codeforces Accepted Submission (All Testcases Passed):', details);
            triggerSubmissionModal(details);
            break;
          }
        }
      }
    };

    const observer = new MutationObserver(() => {
      checkVerdictElements();
    });

    observer.observe(document.body, { childList: true, subtree: true });
    // Also run periodic check on submission result table
    setInterval(checkVerdictElements, 2500);
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

      // Send to background service worker
      try {
        if (isExtensionContextValid()) {
          chrome.runtime.sendMessage({ type: 'RECORD_LOG', log: reflectionLog }, (res) => {
            // Show success celebration inside modal box
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
              // Cleanup modal
              window.removeEventListener('keydown', trapHandler, true);
              overlay.remove();
              document.body.style.overflow = originalBodyOverflow;
              document.documentElement.style.overflow = originalHtmlOverflow;
              isModalOpen = false;
            }, 1100);
          });
        }
      } catch (err) {
        // Fallback cleanup
        window.removeEventListener('keydown', trapHandler, true);
        overlay.remove();
        document.body.style.overflow = originalBodyOverflow;
        document.documentElement.style.overflow = originalHtmlOverflow;
        isModalOpen = false;
      }
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
