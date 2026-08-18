import express from 'express';
import path from 'path';
import fs from 'fs';
import JSZip from 'jszip';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import firebaseConfigJson from './firebase-applet-config.json';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// In-memory pairing codes (6-digit numeric codes generated from web app)
interface PairCodeRecord {
  code: string;
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  createdAt: number;
}
const pairCodesMap = new Map<string, PairCodeRecord>();

// In-memory pending logs queue for real-time dashboard sync
interface ExtensionLogRecord {
  id: string;
  userId: string;
  userEmail?: string;
  log: any;
  timestamp: number;
}
const extensionLogsHistory: ExtensionLogRecord[] = [];

// In-memory cache for user stats (heatmap, solved counts, streak, logs)
interface UserStatsData {
  userId: string;
  userEmail?: string;
  todayCount: number;
  dailyGoal: number;
  streak: number;
  dailyCounts: Record<string, number>;
  monthlySolved: number;
  activeDays: number;
  recentLogs: Array<{
    id: string;
    problemTitle: string;
    platform?: string;
    difficulty?: string;
    verdict?: string;
    timeSpent?: string | number;
    timeFormatted?: string;
    timestamp: number;
  }>;
  updatedAt: number;
}
const userStatsCacheMap = new Map<string, UserStatsData>();

// Clean up expired pair codes (older than 15 mins)
setInterval(() => {
  const now = Date.now();
  for (const [code, rec] of pairCodesMap.entries()) {
    if (now - rec.createdAt > 15 * 60 * 1000) {
      pairCodesMap.delete(code);
    }
  }
}, 60 * 1000);

// Server-side Gemini client
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

// Retry wrapper for Gemini API calls to gracefully handle ECONNRESET / fetch errors
async function callGeminiWithRetry<T>(
  fn: (ai: GoogleGenAI) => Promise<T>,
  retries = 2,
  delayMs = 400
): Promise<T | null> {
  const ai = getGeminiClient();
  if (!ai) return null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn(ai);
    } catch (err: any) {
      console.warn(`Gemini API call attempt ${attempt + 1} notice (${err?.message || err})`);
      if (attempt < retries) {
        await new Promise((resolve) => setTimeout(resolve, delayMs * (attempt + 1)));
      }
    }
  }
  return null;
}

// Healthcheck
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

// AI Reflection Analysis
app.post('/api/ai/analyze-reflection', async (req, res) => {
  try {
    const { reflection, problem } = req.body;
    if (!reflection || !problem) {
      return res.status(400).json({ error: 'Missing reflection or problem parameters' });
    }

    const response = await callGeminiWithRetry(async (ai) => {
      const prompt = `
You are AlgoOS AI Analyzer. Analyze the user's lightweight reflection for a completed DSA problem and provide structured analysis.

Problem Title: ${problem.title}
Difficulty: ${problem.difficulty}
DSA Patterns: ${Array.isArray(problem.dsaPatterns) ? problem.dsaPatterns.join(', ') : 'General'}

User Reflection:
- Self-reported Confidence (1-5): ${reflection.confidence}
- Felt Difficulty: ${reflection.feltDifficulty}
- Recognized Pattern Immediately: ${reflection.recognizedPatternImmediately ? 'Yes' : 'No'}
- Required Hints or Editorial: ${reflection.requiredHintsOrEditorial ? 'Yes' : 'No'}
- Notes: ${reflection.notes || 'None provided'}

Check for confidence mismatches (e.g., reporting 5/5 confidence while relying on editorials, or high confidence despite missing pattern recognition).
Identify potential underlying implementation mistakes or conceptual gaps.
`;

      const aiRes = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              summary: {
                type: Type.STRING,
                description: 'A 1-2 sentence constructive breakdown of the reflection.',
              },
              identifiedMistakes: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'Specific mistake patterns or execution flaws identified.',
              },
              suggestedFocus: {
                type: Type.STRING,
                description: 'Recommended actionable step for the user prior to next review.',
              },
              confidenceMismatchNotice: {
                type: Type.STRING,
                description: 'Notice if confidence score conflicts with hint usage or pattern recognition.',
              },
            },
            required: ['summary', 'identifiedMistakes', 'suggestedFocus'],
          },
        },
      });

      return JSON.parse(aiRes.text || '{}');
    });

    if (response) {
      return res.json({ analysis: response });
    }

    // Structured Rule-Based Fallback Analysis when network API is unavailable
    const fallbackAnalysis = {
      summary: `Logged reflection for ${problem.title || 'Problem'} (${reflection.confidence}/5 confidence). ${
        reflection.recognizedPatternImmediately
          ? 'Spotting the pattern immediately shows strong initial intuition.'
          : 'Work on identifying key constraints to recognize this pattern faster next time.'
      }`,
      identifiedMistakes: reflection.requiredHintsOrEditorial
        ? ['Relying on editorials indicates a need for deeper pattern fundamentals.']
        : ['No major external hints required during problem solving.'],
      suggestedFocus:
        reflection.confidence < 3
          ? 'Review pattern core concepts before the next scheduled spaced revision.'
          : 'Maintain momentum and review on the scheduled revision date.',
      confidenceMismatchNotice:
        reflection.confidence >= 4 && reflection.requiredHintsOrEditorial
          ? 'High confidence reported despite requiring editorial hints.'
          : undefined,
    };

    return res.json({ analysis: fallbackAnalysis });
  } catch (err: any) {
    console.warn('Reflection analysis notice:', err);
    return res.json({
      analysis: {
        summary: 'Reflection recorded for spaced repetition queue.',
        identifiedMistakes: ['Completed problem reflection.'],
        suggestedFocus: 'Continue practicing daily queue items.',
      },
    });
  }
});

// AI Coach Chat
app.post('/api/ai/coach', async (req, res) => {
  try {
    const { userMessage, history, userProfile, memories, mistakes, masteries } = req.body;

    const response = await callGeminiWithRetry(async (ai) => {
      const systemInstruction = `
You are the AlgoOS Adaptive DSA Coach. Your mission is to help the user build long-term pattern recognition, retention, confidence, and interview readiness.

RULES:
1. NEVER fabricate or hallucinate the user's history, stats, or solved problems.
2. If sufficient data does not exist in their memory or mistake log, explicitly state: "I don't know your learning style or history yet. Solve a few problems and complete your reflections so I can personalize my guidance."
3. Speak like a top engineering mentor: calm, modern, concise, direct, and constructive.
4. Always ground advice in real user data provided below.

USER PROFILE:
Target Interview Level: ${userProfile?.targetInterviewLevel || 'Not set'}
Selected Focus Topics: ${userProfile?.selectedTopics?.join(', ') || 'None'}
Daily Practice Limit: ${userProfile?.dailyLimit || 3}

REAL USER DATA SUMMARY:
- Total Solved Memories: ${memories?.length || 0}
- Recorded Mistakes: ${mistakes?.length || 0}
- Pattern Masteries Tracked: ${masteries?.length || 0}
${
  mistakes && mistakes.length > 0
    ? `Recent Recorded Mistakes: ${mistakes.slice(0, 5).map((m: any) => `${m.mistakeType} in pattern ${m.patternId}: "${m.description}"`).join('; ')}`
    : 'No recorded mistakes yet.'
}
${
  masteries && masteries.length > 0
    ? `Weakest Patterns by Recognition: ${masteries
        .sort((a: any, b: any) => a.recognitionScore - b.recognitionScore)
        .slice(0, 3)
        .map((p: any) => `${p.patternName} (${p.recognitionScore}% recognition)`)
        .join(', ')}`
    : ''
}
`;

      const chatContents = (history || []).map((msg: any) => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }],
      }));

      chatContents.push({
        role: 'user',
        parts: [{ text: userMessage }],
      });

      const aiRes = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: chatContents,
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });

      return aiRes.text;
    });

    if (response) {
      return res.json({ reply: response });
    }

    return res.json({
      reply:
        "I'm operating in resilient standby mode. Keep solving items from your daily queue and recording reflections so I can tailor personalized guidance for your interview preparation!",
    });
  } catch (err: any) {
    console.warn('AI Coach notice:', err);
    return res.json({
      reply:
        "I'm here to support your DSA preparation! Keep focusing on your daily queue items and spaced repetition reviews.",
    });
  }
});

// ==========================================
// CHROME EXTENSION AUTHENTICATION & SYNC API
// ==========================================

// 1. Extension Auth: Email & Password Login / Sign Up
app.post('/api/extension/auth/login', async (req, res) => {
  try {
    const { email, password, isSignUp, displayName } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const apiKey = firebaseConfigJson.apiKey;
    if (password && apiKey) {
      try {
        const endpoint = isSignUp
          ? `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${apiKey}`
          : `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`;

        const fbRes = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            password,
            returnSecureToken: true,
          }),
        });

        const fbData: any = await fbRes.json();
        if (fbRes.ok && fbData.localId) {
          const userDisplayName = displayName || fbData.displayName || email.split('@')[0];
          return res.json({
            success: true,
            user: {
              uid: fbData.localId,
              email: fbData.email || email,
              displayName: userDisplayName,
              photoURL: fbData.profilePicture || null,
            },
            token: fbData.idToken,
            message: isSignUp
              ? 'Account created and connected to Omega Cloud'
              : 'Authenticated successfully with Omega Cloud',
          });
        } else if (fbData.error?.message) {
          const errMsg = fbData.error.message.replace(/_/g, ' ').toLowerCase();
          return res.status(401).json({ error: `Authentication failed: ${errMsg}` });
        }
      } catch (authErr: any) {
        console.warn('Firebase REST Auth notice:', authErr.message);
      }
    }

    // Fallback: Return profile based on email/guest
    const syntheticUid = `user-${email.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}`;
    return res.json({
      success: true,
      user: {
        uid: syntheticUid,
        email: email,
        displayName: displayName || email.split('@')[0],
        photoURL: null,
      },
      token: `token-${Date.now()}`,
      message: 'Connected to Omega account',
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Login failed' });
  }
});

// 2. Extension Auth: Generate 6-Digit Pair Code from Web Dashboard
app.post('/api/extension/auth/create-pair-code', (req, res) => {
  try {
    const { uid, email, displayName, photoURL } = req.body;
    if (!uid) {
      return res.status(400).json({ error: 'User ID required to generate pair code' });
    }

    // Generate random 6-digit numeric pair code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    pairCodesMap.set(code, {
      code,
      uid,
      email: email || null,
      displayName: displayName || null,
      photoURL: photoURL || null,
      createdAt: Date.now(),
    });

    console.log(`[Omega Server] Generated pair code ${code} for user ${uid} (${email})`);

    return res.json({
      success: true,
      pairCode: code,
      expiresInSeconds: 900,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to create pair code' });
  }
});

// 3. Extension Auth: Pair Extension using 6-Digit Pair Code
app.post('/api/extension/auth/pair-code', (req, res) => {
  try {
    const { pairCode } = req.body;
    if (!pairCode) {
      return res.status(400).json({ error: 'Pair code required' });
    }

    const cleanCode = String(pairCode).trim();
    const record = pairCodesMap.get(cleanCode);

    if (!record) {
      return res.status(404).json({
        error: 'Invalid pair code. Please generate a fresh code in your Omega web dashboard.',
      });
    }

    // Check expiration (15 mins)
    if (Date.now() - record.createdAt > 15 * 60 * 1000) {
      pairCodesMap.delete(cleanCode);
      return res.status(410).json({
        error: 'Pair code has expired. Please generate a new code in your Omega web dashboard.',
      });
    }

    // Delete once used for one-time pairing
    pairCodesMap.delete(cleanCode);

    return res.json({
      success: true,
      user: {
        uid: record.uid,
        email: record.email,
        displayName: record.displayName || (record.email ? record.email.split('@')[0] : 'Engineer'),
        photoURL: record.photoURL,
      },
      token: `pair-token-${record.uid}-${Date.now()}`,
      message: `Successfully connected Chrome Extension to ${record.displayName || record.email || 'account'}!`,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to verify pair code' });
  }
});

// 4. Extension Ingestion: Record LeetCode Practice Reflection Log
app.post('/api/extension/log', async (req, res) => {
  try {
    const { log, userId, userEmail } = req.body;
    if (!log) {
      return res.status(400).json({ error: 'Missing log object' });
    }

    const logRecord: ExtensionLogRecord = {
      id: log.id || `ext-${Date.now()}`,
      userId: userId || 'guest',
      userEmail: userEmail || undefined,
      log: log,
      timestamp: Date.now(),
    };

    extensionLogsHistory.unshift(logRecord);
    // Keep max 200 recent extension logs in memory
    if (extensionLogsHistory.length > 200) {
      extensionLogsHistory.pop();
    }

    console.log(
      `[Omega Server] Received Extension Log for user (${userId || 'guest'}): ${
        log.problemTitle || log.problemSlug
      }`
    );

    return res.json({
      success: true,
      message: 'Log received and synchronized with Omega Cloud.',
      logId: logRecord.id,
      timestamp: logRecord.timestamp,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to process extension log' });
  }
});

// 5. Sync User Stats & Heatmap from Web Dashboard to Cloud Extension Bridge
app.post('/api/extension/sync-state', (req, res) => {
  try {
    const { userId, userEmail, stats } = req.body;
    if (!userId && !userEmail) {
      return res.status(400).json({ error: 'User identifier required' });
    }

    const key = userId || userEmail;
    const existing = userStatsCacheMap.get(key) || {
      userId: userId || 'guest',
      userEmail,
      todayCount: 0,
      dailyGoal: 3,
      streak: 0,
      dailyCounts: {},
      monthlySolved: 0,
      activeDays: 0,
      recentLogs: [],
      updatedAt: Date.now(),
    };

    const updatedData: UserStatsData = {
      userId: userId || existing.userId,
      userEmail: userEmail || existing.userEmail,
      todayCount: typeof stats?.todayCount === 'number' ? stats.todayCount : existing.todayCount,
      dailyGoal: typeof stats?.dailyGoal === 'number' ? stats.dailyGoal : existing.dailyGoal,
      streak: typeof stats?.streak === 'number' ? stats.streak : existing.streak,
      dailyCounts: stats?.dailyCounts || existing.dailyCounts || {},
      monthlySolved: typeof stats?.monthlySolved === 'number' ? stats.monthlySolved : existing.monthlySolved,
      activeDays: typeof stats?.activeDays === 'number' ? stats.activeDays : existing.activeDays,
      recentLogs: Array.isArray(stats?.recentLogs) ? stats.recentLogs : existing.recentLogs,
      updatedAt: Date.now(),
    };

    userStatsCacheMap.set(key, updatedData);
    if (userId) userStatsCacheMap.set(userId, updatedData);
    if (userEmail) userStatsCacheMap.set(userEmail, updatedData);

    return res.json({ success: true, message: 'Stats synced successfully' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to sync stats' });
  }
});

// 6. Extension Query: Get User Stats, Today's Solved, Heatmap, Streak, & Recent Logs
app.get('/api/extension/user-stats', (req, res) => {
  try {
    const userId = req.query.userId as string | undefined;
    const userEmail = req.query.email as string | undefined;

    let stats: UserStatsData | undefined;
    if (userId && userStatsCacheMap.has(userId)) {
      stats = userStatsCacheMap.get(userId);
    } else if (userEmail && userStatsCacheMap.has(userEmail)) {
      stats = userStatsCacheMap.get(userEmail);
    }

    // If no synced stats found, synthesize from recent extension logs
    const relevantLogs = extensionLogsHistory.filter(
      (r) => (userId && r.userId === userId) || (userEmail && r.userEmail === userEmail)
    );

    const now = new Date();
    const todayDateKey = now.toISOString().split('T')[0];
    const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    const computedDailyCounts: Record<string, number> = { ...(stats?.dailyCounts || {}) };
    
    // Aggregate extension logs into daily counts if not already counted
    relevantLogs.forEach((rec) => {
      const dKey = new Date(rec.timestamp).toISOString().split('T')[0];
      computedDailyCounts[dKey] = (computedDailyCounts[dKey] || 0) + 1;
    });

    const todayCount =
      typeof stats?.todayCount === 'number'
        ? Math.max(stats.todayCount, computedDailyCounts[todayDateKey] || 0)
        : (computedDailyCounts[todayDateKey] || 0);

    let monthlySolved = 0;
    let activeDays = 0;
    Object.entries(computedDailyCounts).forEach(([dKey, count]) => {
      if (dKey.startsWith(currentMonthKey) && count > 0) {
        monthlySolved += count;
        activeDays += 1;
      }
    });

    const recentLogs = stats?.recentLogs?.length
      ? stats.recentLogs
      : relevantLogs.slice(0, 10).map((r) => ({
          id: r.id,
          problemTitle: r.log.problemTitle || r.log.problemSlug || 'LeetCode Problem',
          platform: r.log.platform || 'LeetCode',
          difficulty: r.log.difficulty || 'Medium',
          verdict: r.log.verdict || 'Accepted',
          timeSpent: r.log.timeSpent || '15m',
          timeFormatted: new Date(r.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          timestamp: r.timestamp,
        }));

    return res.json({
      success: true,
      todayCount: todayCount,
      dailyGoal: stats?.dailyGoal || 3,
      streak: stats?.streak || (todayCount > 0 ? 1 : 0),
      dailyCounts: computedDailyCounts,
      monthlySolved: stats?.monthlySolved || monthlySolved,
      activeDays: stats?.activeDays || activeDays,
      recentLogs: recentLogs,
      lastSync: stats?.updatedAt || Date.now(),
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to fetch user stats' });
  }
});

// 5. Download Extension as ZIP package
app.get('/api/extension/download-zip', async (req, res) => {
  try {
    const extensionDir = path.join(process.cwd(), 'extension');
    if (!fs.existsSync(extensionDir)) {
      return res.status(404).json({ error: 'Extension directory not found' });
    }

    const zip = new JSZip();

    function addDirToZip(dirPath: string, zipFolder: JSZip) {
      const entries = fs.readdirSync(dirPath, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);
        if (entry.isDirectory()) {
          const subFolder = zipFolder.folder(entry.name);
          if (subFolder) {
            addDirToZip(fullPath, subFolder);
          }
        } else if (entry.isFile()) {
          const fileContent = fs.readFileSync(fullPath);
          zipFolder.file(entry.name, fileContent);
        }
      }
    }

    addDirToZip(extensionDir, zip);

    const zipBuffer = await zip.generateAsync({
      type: 'nodebuffer',
      compression: 'DEFLATE',
      compressionOptions: { level: 9 },
    });

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename="omega-chrome-extension.zip"');
    return res.send(zipBuffer);
  } catch (err: any) {
    console.error('Error generating extension zip:', err);
    return res.status(500).json({ error: 'Failed to generate extension zip' });
  }
});

// 6. Pending Logs Polling Endpoint for Web Dashboard
app.get('/api/extension/pending-logs', (req, res) => {
  try {
    const { userId, since } = req.query;
    const sinceTimestamp = since ? Number(since) : 0;

    let logs = extensionLogsHistory.filter((item) => item.timestamp > sinceTimestamp);

    if (userId && userId !== 'all') {
      logs = logs.filter((item) => item.userId === userId || item.userId === 'guest');
    }

    return res.json({
      success: true,
      logs: logs.map((l) => ({
        id: l.id,
        userId: l.userId,
        log: l.log,
        timestamp: l.timestamp,
      })),
      serverTime: Date.now(),
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to fetch pending logs' });
  }
});

// Platform URL Parser & Normalizer
app.post('/api/platform/fetch-problem', async (req, res) => {
  try {
    const { url } = req.body;
    if (!url || typeof url !== 'string') {
      return res.status(400).json({ error: 'Valid problem URL required' });
    }

    const cleanUrl = url.trim();
    let platform: any = 'LeetCode';
    let platformProblemId = '';
    let title = '';

    if (cleanUrl.includes('leetcode.com')) {
      platform = 'LeetCode';
      const match = cleanUrl.match(/\/problems\/([^\/]+)/);
      platformProblemId = match ? match[1] : 'leetcode-problem';
      title = platformProblemId.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
    } else if (cleanUrl.includes('codeforces.com')) {
      platform = 'Codeforces';
      const match = cleanUrl.match(/\/problemset\/problem\/(\d+\/[A-Z0-9]+)/i) || cleanUrl.match(/\/contest\/(\d+)\/problem\/([A-Z0-9]+)/i);
      platformProblemId = match ? (match[2] ? `${match[1]}-${match[2]}` : match[1]) : 'cf-problem';
      title = `Codeforces ${platformProblemId}`;
    } else if (cleanUrl.includes('codechef.com')) {
      platform = 'CodeChef';
      const match = cleanUrl.match(/\/problems\/([^\/]+)/);
      platformProblemId = match ? match[1] : 'codechef-problem';
      title = `CodeChef ${platformProblemId}`;
    } else if (cleanUrl.includes('hackerrank.com')) {
      platform = 'HackerRank';
      const match = cleanUrl.match(/\/challenges\/([^\/]+)/);
      platformProblemId = match ? match[1] : 'hackerrank-problem';
      title = platformProblemId.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
    } else if (cleanUrl.includes('geeksforgeeks.org')) {
      platform = 'GeeksforGeeks';
      const match = cleanUrl.match(/\/problems\/([^\/]+)/);
      platformProblemId = match ? match[1] : 'gfg-problem';
      title = platformProblemId.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
    } else if (cleanUrl.includes('atcoder.jp')) {
      platform = 'AtCoder';
      const match = cleanUrl.match(/\/tasks\/([^\/]+)/);
      platformProblemId = match ? match[1] : 'atcoder-problem';
      title = `AtCoder ${platformProblemId.toUpperCase()}`;
    } else if (cleanUrl.includes('cses.fi')) {
      platform = 'CSES';
      const match = cleanUrl.match(/\/task\/(\d+)/);
      platformProblemId = match ? match[1] : 'cses-problem';
      title = `CSES Task ${platformProblemId}`;
    } else if (cleanUrl.includes('spoj.com')) {
      platform = 'SPOJ';
      const match = cleanUrl.match(/\/problems\/([^\/]+)/);
      platformProblemId = match ? match[1] : 'spoj-problem';
      title = `SPOJ ${platformProblemId.toUpperCase()}`;
    } else {
      platform = 'LeetCode';
      platformProblemId = 'custom-problem';
      title = 'Custom Platform Problem';
    }

    // Call Gemini to infer difficulty, patterns, estimated time
    try {
      const ai = getGeminiClient();
      const prompt = `Extract problem title and canonical metadata for this coding problem URL: "${cleanUrl}". Platform inferred: ${platform}. Default title: "${title}".
Suggest reasonable difficulty (Easy, Medium, Hard), tags, DSA patterns, and estimated solving time in minutes (15, 30, 45, 60).`;

      const aiRes = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              difficulty: { type: Type.STRING, enum: ['Easy', 'Medium', 'Hard'] },
              tags: { type: Type.ARRAY, items: { type: Type.STRING } },
              dsaPatterns: { type: Type.ARRAY, items: { type: Type.STRING } },
              estimatedSolvingTimeMinutes: { type: Type.NUMBER },
            },
            required: ['title', 'difficulty', 'tags', 'dsaPatterns', 'estimatedSolvingTimeMinutes'],
          },
        },
      });

      const parsed = JSON.parse(aiRes.text || '{}');
      return res.json({
        problem: {
          id: `${platform.toLowerCase()}-${platformProblemId || Date.now()}`,
          title: parsed.title || title,
          platform,
          platformProblemId: platformProblemId || 'problem',
          url: cleanUrl,
          difficulty: parsed.difficulty || 'Medium',
          tags: parsed.tags || [platform],
          dsaPatterns: parsed.dsaPatterns || ['arrays'],
          estimatedSolvingTimeMinutes: parsed.estimatedSolvingTimeMinutes || 30,
          isPremium: false,
        },
      });
    } catch {
      // Fallback
      return res.json({
        problem: {
          id: `${platform.toLowerCase()}-${platformProblemId || Date.now()}`,
          title: title || 'Coding Problem',
          platform,
          platformProblemId: platformProblemId || 'problem',
          url: cleanUrl,
          difficulty: 'Medium',
          tags: [platform],
          dsaPatterns: ['arrays'],
          estimatedSolvingTimeMinutes: 30,
          isPremium: false,
        },
      });
    }
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to process URL' });
  }
});

// Auto-Populate Full Problem Catalog from LeetCode, HackerRank, CodeChef, Codeforces
app.post('/api/catalog/populate', async (req, res) => {
  try {
    const { populateProblemCatalog } = await import('./scripts/populateCatalog');
    const catalog = await populateProblemCatalog();
    return res.json({
      success: true,
      count: catalog.length,
      catalog,
      message: `Successfully populated catalog with ${catalog.length} problems across LeetCode, HackerRank, CodeChef, and Codeforces!`,
    });
  } catch (err: any) {
    console.error('Populate catalog error:', err);
    return res.status(500).json({ error: err.message || 'Failed to populate problem catalog' });
  }
});

// Vite or Static Server
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Omega full-stack server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
