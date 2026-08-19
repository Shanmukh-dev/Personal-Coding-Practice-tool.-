// Omega In-Page Submissions Interceptor (Runs in Main World)
// Intercepts LeetCode, GeeksforGeeks, and Codeforces API responses to reliably verify "Accepted" verdicts.

(function () {
  'use strict';

  if (window.__OMEGA_INJECTED_INTERCEPTOR__) return;
  window.__OMEGA_INJECTED_INTERCEPTOR__ = true;

  function notifySubmissionResult(result) {
    try {
      window.postMessage(
        {
          type: 'OMEGA_INTERCEPTED_SUBMISSION',
          ...result,
          timestamp: Date.now(),
        },
        '*'
      );
    } catch (e) {
      console.warn('[Omega Interceptor] PostMessage error:', e);
    }
  }

  // Helper to safely parse JSON
  function tryParseJson(text) {
    try {
      return JSON.parse(text);
    } catch (e) {
      return null;
    }
  }

  // --- 1. Hook window.fetch ---
  const originalFetch = window.fetch;
  window.fetch = async function (...args) {
    const response = await originalFetch.apply(this, args);

    try {
      const url = typeof args[0] === 'string' ? args[0] : args[0]?.url || '';
      
      // Clone response to read JSON without consuming stream for caller
      const clone = response.clone();
      clone.text().then((text) => {
        const data = tryParseJson(text);
        if (!data) return;

        // A. LeetCode Submissions Check API
        // Format: /submissions/detail/<id>/check/ or similar
        if (url.includes('/submissions/detail/') && url.includes('/check/')) {
          if (data.state === 'SUCCESS') {
            const statusMsg = data.status_msg || '';
            const isAccepted = statusMsg === 'Accepted' || (data.total_correct > 0 && data.total_correct === data.total_testcases);
            const submissionId = data.submission_id || url.match(/\/submissions\/detail\/(\d+)/)?.[1] || '';

            if (isAccepted) {
              notifySubmissionResult({
                platform: 'LeetCode',
                verdict: 'Accepted',
                submissionId: String(submissionId),
                statusRuntime: data.status_runtime || data.status_memory || '',
                rawStatus: statusMsg,
                success: true,
              });
            } else {
              notifySubmissionResult({
                platform: 'LeetCode',
                verdict: statusMsg || 'Failed',
                submissionId: String(submissionId),
                success: false,
              });
            }
          }
        }

        // B. LeetCode GraphQL Submissions API
        if (url.includes('/graphql')) {
          // Check for submissionDetails or submitQuestion responses
          const submissionDetails = data.data?.submissionDetails;
          if (submissionDetails) {
            const statusDisplay = submissionDetails.statusDisplay || '';
            const isAccepted = statusDisplay === 'Accepted';
            const submissionId = submissionDetails.id || '';

            if (isAccepted) {
              notifySubmissionResult({
                platform: 'LeetCode',
                verdict: 'Accepted',
                submissionId: String(submissionId),
                statusRuntime: submissionDetails.runtimeDisplay || submissionDetails.memoryDisplay || '',
                rawStatus: statusDisplay,
                success: true,
              });
            } else if (statusDisplay && statusDisplay !== 'Pending' && statusDisplay !== 'Judging') {
              notifySubmissionResult({
                platform: 'LeetCode',
                verdict: statusDisplay,
                submissionId: String(submissionId),
                success: false,
              });
            }
          }
        }

        // C. GeeksforGeeks Submissions & Evaluation API
        if (url.includes('geeksforgeeks.org') && (url.includes('/submit') || url.includes('/problems/') || url.includes('/solution/'))) {
          if (data.is_correct === true || data.status === 'SUCCESS' || data.verdict === 'Accepted' || data.isSolved === true) {
            notifySubmissionResult({
              platform: 'GeeksforGeeks',
              verdict: 'Accepted',
              submissionId: String(data.submission_id || data.id || Date.now()),
              success: true,
            });
          } else if (data.is_correct === false || data.verdict === 'Wrong Answer' || data.verdict === 'Compilation Error') {
            notifySubmissionResult({
              platform: 'GeeksforGeeks',
              verdict: data.verdict || 'Failed',
              submissionId: String(data.submission_id || data.id || ''),
              success: false,
            });
          }
        }
      }).catch(() => {});
    } catch (err) {
      // Non-blocking
    }

    return response;
  };

  // --- 2. Hook window.XMLHttpRequest ---
  const originalOpen = XMLHttpRequest.prototype.open;
  const originalSend = XMLHttpRequest.prototype.send;

  XMLHttpRequest.prototype.open = function (method, url, ...rest) {
    this._omegaUrl = typeof url === 'string' ? url : '';
    return originalOpen.apply(this, [method, url, ...rest]);
  };

  XMLHttpRequest.prototype.send = function (...args) {
    this.addEventListener('load', function () {
      try {
        const url = this._omegaUrl || '';
        if (!url) return;

        const data = tryParseJson(this.responseText);
        if (!data) return;

        // LeetCode XHR Check
        if (url.includes('/submissions/detail/') && url.includes('/check/')) {
          if (data.state === 'SUCCESS') {
            const statusMsg = data.status_msg || '';
            const isAccepted = statusMsg === 'Accepted' || (data.total_correct > 0 && data.total_correct === data.total_testcases);
            const submissionId = data.submission_id || url.match(/\/submissions\/detail\/(\d+)/)?.[1] || '';

            if (isAccepted) {
              notifySubmissionResult({
                platform: 'LeetCode',
                verdict: 'Accepted',
                submissionId: String(submissionId),
                statusRuntime: data.status_runtime || '',
                rawStatus: statusMsg,
                success: true,
              });
            } else {
              notifySubmissionResult({
                platform: 'LeetCode',
                verdict: statusMsg || 'Failed',
                submissionId: String(submissionId),
                success: false,
              });
            }
          }
        }
      } catch (e) {}
    });

    return originalSend.apply(this, args);
  };

  console.log('[Omega] In-page submission interceptor initialized.');
})();
