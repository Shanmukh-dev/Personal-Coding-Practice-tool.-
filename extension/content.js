// Omega Content Script - LeetCode Submission Detector & Unavoidable Practice Logger

(function () {
  'use strict';

  // Prevent multiple injections
  if (window.__OMEGA_INJECTED__) return;
  window.__OMEGA_INJECTED__ = true;

  console.log('[Omega Extension] Content script active on LeetCode.');

  let isModalOpen = false;
  let lastHandledSubmissionKey = '';
  let lastTriggerTime = 0;

  // Extract problem metadata from LeetCode page
  function getProblemDetails() {
    const pathname = window.location.pathname;
    const match = pathname.match(/\/problems\/([^\/]+)/);
    const slug = match ? match[1] : 'unknown-problem';

    // Format readable title from slug
    let title = slug
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    // Try finding exact title from LeetCode DOM
    const titleEl = document.querySelector(
      'div[class*="text-title-large"], a[class*="text-title-large"], h1, [data-cy="question-title"]'
    );
    if (titleEl && titleEl.textContent && titleEl.textContent.trim()) {
      title = titleEl.textContent.trim();
    }

    // Detect difficulty if available on page
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
      url: window.location.href,
      difficulty,
    };
  }

  // Check if extension is enabled before showing modal
  function triggerSubmissionModal(problemDetails) {
    const now = Date.now();
    // Debounce triggers (min 5 seconds apart)
    if (now - lastTriggerTime < 5000) return;
    if (isModalOpen) return;

    chrome.runtime.sendMessage({ type: 'GET_STATUS' }, (res) => {
      if (chrome.runtime.lastError) {
        console.warn('[Omega] Background service unreachable:', chrome.runtime.lastError);
        renderModal(problemDetails);
        return;
      }

      if (res && res.enabled === false) {
        console.log('[Omega Extension] Tracking is currently toggled OFF in extension.');
        return;
      }

      lastTriggerTime = now;
      renderModal(problemDetails);
    });
  }

  // Watch for submission result in the DOM
  function observeLeetCodeSubmissions() {
    const observer = new MutationObserver((mutations) => {
      if (isModalOpen) return;

      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (node.nodeType !== Node.ELEMENT_NODE) continue;
          const el = node;

          // Check if newly added element or its text contains "Accepted"
          const text = el.textContent || '';
          if (
            (text.includes('Accepted') && (text.includes('Runtime') || text.includes('Beats') || text.includes('Memory') || text.includes('Details'))) ||
            el.matches?.('[data-e2e-locator="submission-result"]') ||
            el.querySelector?.('[data-e2e-locator="submission-result"]') ||
            el.matches?.('.text-green-s, [class*="text-green"]') ||
            el.querySelector?.('.text-green-s, [class*="text-green"]')
          ) {
            // Confirm it represents an Accepted submission
            const fullResultText = el.innerText || el.textContent || '';
            if (/Accepted/i.test(fullResultText)) {
              const details = getProblemDetails();
              const uniqueKey = `${details.slug}-${Math.floor(Date.now() / 10000)}`;

              if (lastHandledSubmissionKey !== uniqueKey) {
                lastHandledSubmissionKey = uniqueKey;
                console.log('[Omega] Detected LeetCode Accepted Submission:', details);
                triggerSubmissionModal(details);
              }
            }
          }
        }
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  // Intercept submit button click to prepare detection
  function listenForSubmitAction() {
    document.addEventListener('click', (e) => {
      const target = e.target;
      if (!target) return;
      const btn = target.closest('button, [role="button"]');
      if (btn && (btn.innerText.includes('Submit') || btn.getAttribute('data-e2e-locator') === 'console-submit-button')) {
        console.log('[Omega] Submit action initiated on LeetCode.');
      }
    }, true);
  }

  // Render the unavoidable practice log modal
  function renderModal(problem) {
    if (document.getElementById('omega-extension-modal-overlay')) return;
    isModalOpen = true;

    // Lock page scrolling
    const originalBodyOverflow = document.body.style.overflow;
    const originalHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    // State for modal
    let confidence = 4;
    let feltDifficulty = problem.difficulty || 'Medium';
    let recognizedPattern = true;
    let requiredHints = false;

    const confidenceLabels = {
      1: '1/5 - Very Uncertain',
      2: '2/5 - Shaky / Hesitant',
      3: '3/5 - Fair Understanding',
      4: '4/5 - Confident & Clear',
      5: '5/5 - Completely Mastered',
    };

    const overlay = document.createElement('div');
    overlay.id = 'omega-extension-modal-overlay';

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
                <span>Omega Adaptive OS • Live Sync</span>
              </div>
              <h2 id="omega-title" class="omega-header-title">Log Practice Reflection</h2>
            </div>
          </div>
          <div class="omega-lock-badge" title="Reflection is mandatory to build retention and schedule spaced revision">
            🔒 Required Log
          </div>
        </div>

        <!-- Scrollable Form Body -->
        <div class="omega-modal-body">
          <!-- Problem banner -->
          <div class="omega-problem-card">
            <div style="min-width: 0;">
              <div class="omega-problem-title" title="${escapeHtml(problem.title)}">${escapeHtml(problem.title)}</div>
              <div class="omega-problem-meta">LeetCode Submission Detected • Just Now</div>
            </div>
            <span class="omega-diff-badge omega-diff-${problem.difficulty || 'Medium'}">
              ${problem.difficulty || 'Medium'}
            </span>
          </div>

          <!-- 1. Confidence Rating -->
          <div class="omega-section">
            <div class="omega-label">
              <span>1. Intuition & Confidence:</span>
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
              <span>2. Felt Difficulty:</span>
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
              <span>3. Pattern Recognition:</span>
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
              <span>4. Key Insight & Edge Cases (Optional):</span>
            </div>
            <textarea id="omega-notes-input" class="omega-textarea" placeholder="e.g. Edge case when array length is 0, off-by-one pointer condition..."></textarea>
          </div>
        </div>

        <!-- Footer -->
        <div class="omega-modal-footer">
          <button type="button" id="omega-submit-btn" class="omega-submit-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            <span>Save Reflection & Continue Practice</span>
          </button>
          <p class="omega-notice-text">
            Reflection is locked to enforce retention and schedule spaced repetition.
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

    // Submit handler
    submitBtn.addEventListener('click', async () => {
      submitBtn.disabled = true;
      submitBtn.innerHTML = `<span>Saving & Updating Heatmap...</span>`;

      const reflectionLog = {
        id: `ext-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        problemTitle: problem.title,
        problemSlug: problem.slug,
        problemUrl: problem.url,
        feltDifficulty: feltDifficulty,
        confidence: confidence,
        recognizedPatternImmediately: recognizedPattern,
        requiredHintsOrEditorial: requiredHints,
        notes: (notesInput.value || '').trim(),
        timestamp: Date.now(),
        source: 'extension',
      };

      // Send to background service worker
      chrome.runtime.sendMessage({ type: 'RECORD_LOG', log: reflectionLog }, (res) => {
        // Show success celebration inside modal box
        modalBox.innerHTML = `
          <div class="omega-success-view">
            <div class="omega-success-icon">✓</div>
            <h3 class="omega-success-title">Reflection Saved & Logged</h3>
            <p class="omega-success-sub">
              Great job! Problem added to your daily progress & spaced revision schedule.
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

  // Handle messages from background/popup
  chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.type === 'SHOW_LOG_MODAL_MANUAL') {
      const details = msg.problem || getProblemDetails();
      renderModal(details);
      sendResponse({ success: true });
    }
  });

  // Start observing
  observeLeetCodeSubmissions();
  listenForSubmitAction();
})();
