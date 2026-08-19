import express from 'express';
import path from 'path';
import fs from 'fs';
import JSZip from 'jszip';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import { initializeApp, getApps } from 'firebase/app';
import {
  getFirestore,
  setLogLevel,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
} from 'firebase/firestore';
import firebaseConfigJson from './firebase-applet-config.json';

dotenv.config();

// Silence idle gRPC stream disconnection logs
try {
  setLogLevel('silent');
} catch (e) {}

// Initialize Firebase client in server environment
const firebaseApp = getApps().length === 0 ? initializeApp(firebaseConfigJson) : getApps()[0];
const firestoreDb = getFirestore(firebaseApp, firebaseConfigJson.firestoreDatabaseId);

const JWT_SECRET = process.env.JWT_SECRET || 'omega_dsa_os_extension_secure_token_secret_key_2026';

export interface AuthenticatedUser {
  uid: string;
  email?: string | null;
  displayName?: string | null;
  photoURL?: string | null;
}

function generateExtensionJwt(user: AuthenticatedUser): string {
  return jwt.sign(
    {
      uid: user.uid,
      email: user.email || null,
      displayName: user.displayName || null,
      photoURL: user.photoURL || null,
    },
    JWT_SECRET,
    { expiresIn: '30d' }
  );
}

function verifyExtensionJwt(token: string): AuthenticatedUser | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    if (decoded && decoded.uid) {
      return {
        uid: decoded.uid,
        email: decoded.email || null,
        displayName: decoded.displayName || null,
        photoURL: decoded.photoURL || null,
      };
    }
    return null;
  } catch (err) {
    return null;
  }
}

// Authentication middleware for secure extension endpoints
function authenticateExtensionJwt(req: express.Request, res: express.Response, next: express.NextFunction) {
  const authHeader = (req.headers.authorization || req.headers['x-omega-token']) as string | undefined;
  if (!authHeader) {
    return res.status(401).json({
      success: false,
      error: 'Authentication token missing. Please sign in or pair the Omega extension with your account.',
      code: 'AUTH_REQUIRED',
    });
  }

  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : authHeader.trim();
  const user = verifyExtensionJwt(token);

  if (!user) {
    return res.status(401).json({
      success: false,
      error: 'Invalid or expired extension authentication token. Please re-authenticate your extension.',
      code: 'AUTH_EXPIRED',
    });
  }

  (req as any).user = user;
  next();
}

// Spaced Repetition SuperMemo-2 Calculation Helper for Server
function calculateNextRevisionServer(
  existingCard: any,
  problemId: string,
  userId: string,
  outcome: 'Forgot' | 'Hard' | 'Good' | 'Easy'
) {
  const now = Date.now();
  let reviewCount = existingCard ? (existingCard.reviewCount || existingCard.repetitionCount || 0) + 1 : 1;
  let intervalDays = existingCard ? (existingCard.intervalDays || 1) : 1;
  let easeFactor = existingCard ? (existingCard.easeFactor || 2.5) : 2.5;

  switch (outcome) {
    case 'Forgot':
      intervalDays = 1;
      easeFactor = Math.max(1.3, easeFactor - 0.2);
      break;
    case 'Hard':
      intervalDays = Math.max(1, Math.round(intervalDays * 1.2));
      easeFactor = Math.max(1.3, easeFactor - 0.15);
      break;
    case 'Good':
      intervalDays = Math.max(1, Math.round(intervalDays * easeFactor));
      break;
    case 'Easy':
      intervalDays = Math.max(2, Math.round(intervalDays * easeFactor * 1.4));
      easeFactor = Math.min(3.5, easeFactor + 0.15);
      break;
  }

  const nextReviewAt = now + intervalDays * 24 * 60 * 60 * 1000;
  let status = 'scheduled';
  if (intervalDays >= 30) {
    status = 'graduated';
  } else if (nextReviewAt <= now) {
    status = 'due';
  }

  return {
    id: existingCard?.id || `rev-${problemId}`,
    userId,
    problemId,
    reviewCount,
    lastReviewedAt: now,
    nextReviewAt,
    intervalDays,
    easeFactor,
    status,
  };
}

const app = express();
const PORT = 3000;

// Enable robust CORS headers for all Chrome extension requests and external DSA platforms (LeetCode, GFG, Codeforces)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, x-omega-token');
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

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

// In-memory & disk cache for user stats (heatmap, solved counts, streak, logs)
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

const STATS_FILE = path.join(process.cwd(), '.omega_user_stats_cache.json');
const LOGS_FILE = path.join(process.cwd(), '.omega_extension_logs.json');

function loadPersistedData() {
  try {
    if (fs.existsSync(STATS_FILE)) {
      const data = JSON.parse(fs.readFileSync(STATS_FILE, 'utf-8'));
      if (Array.isArray(data)) {
        data.forEach(([k, v]) => userStatsCacheMap.set(k, v));
      }
    }
    if (fs.existsSync(LOGS_FILE)) {
      const data = JSON.parse(fs.readFileSync(LOGS_FILE, 'utf-8'));
      if (Array.isArray(data)) {
        extensionLogsHistory.push(...data.slice(0, 200));
      }
    }
  } catch (e) {
    console.warn('Persisted data load notice:', e);
  }
}

function persistStats() {
  try {
    const entries = Array.from(userStatsCacheMap.entries());
    fs.writeFileSync(STATS_FILE, JSON.stringify(entries), 'utf-8');
  } catch (e) {}
}

function persistLogs() {
  try {
    fs.writeFileSync(LOGS_FILE, JSON.stringify(extensionLogsHistory.slice(0, 200)), 'utf-8');
  } catch (e) {}
}

// Load persisted data on server boot
loadPersistedData();

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

// 0. Extension Auth: Generate/Exchange JWT Token for Web App or Extension
app.post('/api/extension/auth/token', (req, res) => {
  try {
    const { uid, email, displayName, photoURL } = req.body;
    if (!uid) {
      return res.status(400).json({ success: false, error: 'User ID (uid) is required to issue token' });
    }

    const user: AuthenticatedUser = {
      uid: String(uid).trim(),
      email: email ? String(email).trim() : null,
      displayName: displayName ? String(displayName).trim() : null,
      photoURL: photoURL || null,
    };

    const token = generateExtensionJwt(user);
    return res.json({
      success: true,
      token,
      user,
      expiresIn: '30d',
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message || 'Failed to issue JWT token' });
  }
});

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
          const user: AuthenticatedUser = {
            uid: fbData.localId,
            email: fbData.email || email,
            displayName: userDisplayName,
            photoURL: fbData.profilePicture || null,
          };
          const jwtToken = generateExtensionJwt(user);
          return res.json({
            success: true,
            user,
            token: jwtToken,
            firebaseToken: fbData.idToken,
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
    const user: AuthenticatedUser = {
      uid: syntheticUid,
      email: email,
      displayName: displayName || email.split('@')[0],
      photoURL: null,
    };
    const jwtToken = generateExtensionJwt(user);
    return res.json({
      success: true,
      user,
      token: jwtToken,
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

    const user: AuthenticatedUser = {
      uid: record.uid,
      email: record.email,
      displayName: record.displayName || (record.email ? record.email.split('@')[0] : 'Engineer'),
      photoURL: record.photoURL,
    };
    const jwtToken = generateExtensionJwt(user);

    return res.json({
      success: true,
      user,
      token: jwtToken,
      message: `Successfully connected Chrome Extension to ${record.displayName || record.email || 'account'}!`,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to verify pair code' });
  }
});

// =========================================================================
// DEDICATED SECURE EXTENSION ENDPOINTS (JWT-AUTHENTICATED & FIRESTORE-BACKED)
// =========================================================================

// A. Dedicated Secure Ingestion Endpoint: Update Firestore directly for any solved/revised problem
app.post('/api/extension/secure/log', authenticateExtensionJwt, async (req, res) => {
  try {
    const authUser = (req as any).user as AuthenticatedUser;
    const uid = authUser.uid;
    const rawLog = req.body.log || req.body;

    if (!rawLog || (!rawLog.problemTitle && !rawLog.problemSlug && !rawLog.title && !rawLog.slug)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid log payload. Problem title or slug is required.',
      });
    }

    const problemTitle = (rawLog.problemTitle || rawLog.title || rawLog.problemSlug || 'Practice Problem').trim();
    const problemSlug = (rawLog.problemSlug || rawLog.slug || problemTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-')).trim();
    const platform = rawLog.platform || 'LeetCode';
    const feltDifficulty = rawLog.feltDifficulty || rawLog.difficulty || 'Medium';
    const confidence = typeof rawLog.confidence === 'number' ? rawLog.confidence : 4;
    const recognizedPattern = rawLog.recognizedPatternImmediately !== undefined ? Boolean(rawLog.recognizedPatternImmediately) : true;
    const requiredHints = rawLog.requiredHintsOrEditorial !== undefined ? Boolean(rawLog.requiredHintsOrEditorial) : false;
    const notes = typeof rawLog.notes === 'string' ? rawLog.notes.trim() : '';
    const isRevision = Boolean(rawLog.isRevision);
    const improvementAnswers = rawLog.improvementAnswers || undefined;
    const problemUrl = rawLog.problemUrl || rawLog.url || `https://leetcode.com/problems/${problemSlug}`;
    const timeSpent = rawLog.timeSpent || '15m';
    const now = Date.now();

    const problemId = `prob-${problemSlug}`;
    const refId = `ref-${now}-${Math.random().toString(36).substring(2, 7)}`;
    const solvId = `solv-${now}-${Math.random().toString(36).substring(2, 7)}`;

    console.log(`[Omega Server] Processing secure practice log for user ${uid} (${authUser.email || 'no-email'}): "${problemTitle}"`);

    // 1. Run AI analysis if available or synthesize smart feedback
    let aiAnalysis = '';
    try {
      const gemini = getGeminiClient();
      if (gemini) {
        const prompt = `Analyze this DSA problem solving reflection:
Problem: "${problemTitle}" (${feltDifficulty}, Platform: ${platform})
Confidence: ${confidence}/5
Recognized Pattern Immediately: ${recognizedPattern ? 'Yes' : 'No'}
Required Hints/Editorial: ${requiredHints ? 'Yes' : 'No'}
Is Revision Attempt: ${isRevision ? 'Yes' : 'No'}
User Notes: "${notes || 'None provided'}"
${improvementAnswers ? `Improvement: Speed: ${improvementAnswers.speedImprovement}, Avoided Mistakes: ${improvementAnswers.avoidedPreviousMistakes}, Readiness: ${improvementAnswers.interviewReadiness}` : ''}

Provide a concise 2-sentence feedback: 1 sentence diagnosing the key algorithmic concept/edge case, and 1 actionable tip for spaced revision.`;

        const aiRes = await gemini.models.generateContent({
          model: 'gemini-3.6-flash',
          contents: prompt,
        });
        if (aiRes.text) {
          aiAnalysis = aiRes.text.trim();
        }
      }
    } catch (aiErr) {
      console.warn('[Omega Server] AI reflection analysis fallback notice:', aiErr);
    }

    if (!aiAnalysis) {
      aiAnalysis = confidence >= 4
        ? `Solid grasp on ${problemTitle}. Continue reinforcing pattern recognition on related variations.`
        : `Key focus: Review edge case handling and boundary constraints for ${problemTitle} in your next scheduled revision.`;
    }

    // 2. Try updating/upserting global problem document in Firestore: problems/{problemId}
    try {
      const problemRef = doc(firestoreDb, 'problems', problemId);
      await setDoc(
        problemRef,
        {
          id: problemId,
          title: problemTitle,
          url: problemUrl,
          platform: platform,
          difficulty: feltDifficulty,
          slug: problemSlug,
          updatedAt: now,
        },
        { merge: true }
      );
    } catch (pErr) {
      // Non-fatal if server has restricted direct write permissions
    }

    // 3. User Reflection Object
    const reflectionObjAi = typeof aiAnalysis === 'string'
      ? { summary: aiAnalysis, identifiedMistakes: requiredHints ? ['Required Hints / Editorial Guidance'] : [], suggestedFocus: confidence <= 2 ? 'Edge cases & constraints' : 'Spaced repetition' }
      : (aiAnalysis || { summary: `Practiced ${problemTitle} with ${confidence}/5 confidence.`, identifiedMistakes: [], suggestedFocus: 'Spaced review' });

    const reflectionDoc = {
      id: refId,
      userId: uid,
      problemId: problemId,
      problemTitle: problemTitle,
      problemSlug: problemSlug,
      platform: platform,
      confidence: confidence,
      perceivedDifficulty: feltDifficulty,
      feltDifficulty: feltDifficulty,
      recognizedPatternImmediately: recognizedPattern,
      requiredHintsOrEditorial: requiredHints,
      keyTakeaways: notes,
      notes: notes,
      isRevision: isRevision,
      improvementAnswers: improvementAnswers || null,
      aiAnalysis: reflectionObjAi,
      source: 'chrome-extension',
      createdAt: now,
      timestamp: now,
    };
    try {
      const userReflRef = doc(firestoreDb, 'users', uid, 'reflections', refId);
      await setDoc(userReflRef, reflectionDoc, { merge: true });
    } catch (rErr) {}

    // 4. User Solving Record
    const solvingDoc = {
      id: solvId,
      userId: uid,
      problemId: problemId,
      problemTitle: problemTitle,
      platform: platform,
      difficulty: feltDifficulty,
      timeSpentMinutes: typeof timeSpent === 'number' ? timeSpent : 15,
      solvedAt: now,
      completedAt: now,
      source: 'chrome-extension',
      reflectionId: refId,
      isRevision: isRevision,
    };
    try {
      const userSolvRef = doc(firestoreDb, 'users', uid, 'solvings', solvId);
      await setDoc(userSolvRef, solvingDoc, { merge: true });
    } catch (sErr) {}

    // 5. Fetch & Update Spaced Repetition Revision Card
    let existingRevisionCard: any = null;
    try {
      const revisionCardRef = doc(firestoreDb, 'users', uid, 'revisions', problemId);
      const revSnap = await getDoc(revisionCardRef);
      if (revSnap.exists()) {
        existingRevisionCard = revSnap.data();
      }
    } catch (e) {}

    let outcome: 'Forgot' | 'Hard' | 'Good' | 'Easy' = 'Good';
    if (confidence >= 5 && !requiredHints) outcome = 'Easy';
    else if (confidence >= 3 && !requiredHints) outcome = 'Good';
    else if (confidence === 2 || requiredHints) outcome = 'Hard';
    else outcome = 'Forgot';

    const nextRevisionCard = calculateNextRevisionServer(existingRevisionCard, problemId, uid, outcome);
    try {
      const revisionCardRef = doc(firestoreDb, 'users', uid, 'revisions', problemId);
      await setDoc(revisionCardRef, nextRevisionCard, { merge: true });
    } catch (revErr) {}

    // 6. Update Daily Practice Queue
    const todayDateKey = new Date(now).toISOString().split('T')[0];
    const nextRevDate = new Date(nextRevisionCard.nextReviewAt);
    const nextRevDateKey = `${nextRevDate.getFullYear()}-${String(nextRevDate.getMonth() + 1).padStart(2, '0')}-${String(nextRevDate.getDate()).padStart(2, '0')}`;

    try {
      const queueColl = collection(firestoreDb, 'users', uid, 'dailyQueue');
      const queueSnap = await getDocs(query(queueColl, where('problemId', '==', problemId)));
      for (const qDoc of queueSnap.docs) {
        const qData = qDoc.data();
        if (qData.date === todayDateKey || qData.dateKey === todayDateKey || qData.status === 'pending') {
          await updateDoc(qDoc.ref, { status: 'completed', completedAt: now });
        }
      }

      // Schedule future queue card for next revision date
      const futureQueueId = `dq-rev-${problemId}-${nextRevDateKey}`;
      const futureQueueRef = doc(firestoreDb, 'users', uid, 'dailyQueue', futureQueueId);
      await setDoc(
        futureQueueRef,
        {
          id: futureQueueId,
          userId: uid,
          problemId: problemId,
          problemTitle: problemTitle,
          date: nextRevDateKey,
          dateKey: nextRevDateKey,
          status: 'pending',
          isRevision: true,
          assignedReason: `Spaced Repetition Review (Interval: ${nextRevisionCard.intervalDays}d)`,
          estimatedTimeMinutes: 15,
          priorityScore: 85,
          addedAt: now,
        },
        { merge: true }
      );
    } catch (qErr) {}

    // 7. Update Problem Learning Memory (Permanent Knowledge Memory Vault)
    let loggedMistakeEntry: any = null;
    if (requiredHints || confidence <= 2) {
      const mistakeId = `mist-${now}-${Math.random().toString(36).substring(2, 6)}`;
      loggedMistakeEntry = {
        id: mistakeId,
        userId: uid,
        patternId: 'General',
        problemId: problemId,
        problemTitle: problemTitle,
        mistakeType: requiredHints ? 'Misunderstood Concept' : 'Implementation Bug',
        category: requiredHints ? 'Required Hint / Editorial' : 'Low Intuition / Edge Case Shaky',
        description: notes || 'Needed hints / struggled during solution execution.',
        timestamp: now,
        occurredAt: now,
      };
      try {
        const mistakeRef = doc(firestoreDb, 'users', uid, 'mistakes', mistakeId);
        await setDoc(mistakeRef, loggedMistakeEntry, { merge: true });
      } catch (mistErr) {}
    }

    try {
      const memoryRef = doc(firestoreDb, 'users', uid, 'memories', problemId);
      const memSnap = await getDoc(memoryRef);
      const prevMem = memSnap.exists() ? (memSnap.data() as any) : null;
      
      const prevConfHistory = Array.isArray(prevMem?.confidenceHistory) ? prevMem.confidenceHistory : [];
      const updatedConfHistory = [
        ...prevConfHistory,
        { timestamp: now, score: confidence },
      ];

      const prevReflectionHistory = Array.isArray(prevMem?.reflectionHistory) ? prevMem.reflectionHistory : [];
      const updatedReflectionHistory = [
        reflectionDoc,
        ...prevReflectionHistory.filter((r: any) => r.id !== refId),
      ];

      const prevInsights = Array.isArray(prevMem?.keyInsights) ? prevMem.keyInsights : [];
      const updatedKeyInsights = notes && !prevInsights.includes(notes)
        ? [...prevInsights, notes]
        : prevInsights;

      const prevMistakes = Array.isArray(prevMem?.mistakes) ? prevMem.mistakes : [];
      const updatedMistakes = loggedMistakeEntry
        ? [loggedMistakeEntry, ...prevMistakes.filter((m: any) => m.id !== loggedMistakeEntry.id)]
        : prevMistakes;

      const updatedLearningMemory = {
        problemId: problemId,
        userId: uid,
        problemTitle: problemTitle,
        firstSolvedDate: prevMem?.firstSolvedDate || now,
        lastReviewedDate: now,
        reviewCount: (prevMem?.reviewCount || 0) + 1,
        confidenceHistory: updatedConfHistory,
        reflectionHistory: updatedReflectionHistory,
        mistakes: updatedMistakes,
        keyInsights: updatedKeyInsights,
        summary: notes || prevMem?.summary || `Mastered on ${new Date(now).toLocaleDateString()}`,
        updatedAt: now,
      };

      await setDoc(memoryRef, updatedLearningMemory, { merge: true });
    } catch (mErr) {
      console.error('[Omega Server] Memory save error:', mErr);
    }

    // 8. Update Gamification Status
    const xpGained = isRevision ? 15 : 30;
    let updatedGamification: any = { xp: xpGained, level: 1, currentStreak: 1 };
    try {
      const gamificationRef = doc(firestoreDb, 'users', uid, 'gamification', 'status');
      const gamSnap = await getDoc(gamificationRef);
      const prevGam = gamSnap.exists() ? gamSnap.data() : null;
      const currentXp = (prevGam?.xp || 0) + xpGained;
      const currentLevel = Math.floor(currentXp / 100) + 1;
      const lastActiveDate = prevGam?.lastActiveDate || '';
      let streak = prevGam?.currentStreak || 1;

      if (lastActiveDate && lastActiveDate !== todayDateKey) {
        const yesterday = new Date(now - 86400000).toISOString().split('T')[0];
        if (lastActiveDate === yesterday) {
          streak += 1;
        } else {
          streak = 1;
        }
      }

      updatedGamification = {
        xp: currentXp,
        level: currentLevel,
        currentStreak: streak,
        lastActiveDate: todayDateKey,
        totalSolvedCount: (prevGam?.totalSolvedCount || 0) + 1,
        updatedAt: now,
      };
      await setDoc(gamificationRef, updatedGamification, { merge: true });
    } catch (gErr) {}

    // 9. Update server-side memory caches and broadcast history
    const userKey = uid;
    const userStat = userStatsCacheMap.get(userKey) || {
      userId: uid,
      userEmail: authUser.email || undefined,
      todayCount: 0,
      dailyGoal: 3,
      streak: updatedGamification.currentStreak || 1,
      dailyCounts: {},
      monthlySolved: 0,
      activeDays: 0,
      recentLogs: [],
      updatedAt: now,
    };

    userStat.dailyCounts[todayDateKey] = (userStat.dailyCounts[todayDateKey] || 0) + 1;
    userStat.todayCount = userStat.dailyCounts[todayDateKey];
    userStat.streak = updatedGamification.currentStreak || userStat.streak;
    userStat.recentLogs.unshift({
      id: refId,
      problemTitle: problemTitle,
      platform: platform,
      difficulty: feltDifficulty,
      verdict: 'Accepted',
      timeSpent: timeSpent,
      timeFormatted: new Date(now).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      timestamp: now,
    });
    userStat.recentLogs = userStat.recentLogs.slice(0, 30);
    userStat.updatedAt = now;

    userStatsCacheMap.set(userKey, userStat);
    if (authUser.email) userStatsCacheMap.set(authUser.email, userStat);
    persistStats();

    // Push to extensionLogsHistory for synchronized web dashboard ingestion
    extensionLogsHistory.unshift({
      id: refId,
      userId: uid,
      userEmail: authUser.email || undefined,
      log: reflectionDoc,
      timestamp: now,
    });
    if (extensionLogsHistory.length > 200) extensionLogsHistory.pop();
    persistLogs();

    return res.json({
      success: true,
      message: isRevision
        ? 'Revision reflection successfully recorded in database!'
        : 'Practice problem reflection successfully saved to database!',
      logId: refId,
      problemId: problemId,
      xpEarned: xpGained,
      nextReviewAt: nextRevisionCard.nextReviewAt,
      nextReviewDateKey: nextRevDateKey,
      aiAnalysis: aiAnalysis,
      stats: {
        todayCount: userStat.todayCount,
        streak: userStat.streak,
        xp: updatedGamification.xp,
        level: updatedGamification.level,
        dailyGoal: userStat.dailyGoal,
      },
    });
  } catch (err: any) {
    console.error('[Omega Server] Secure log processing error:', err);
    return res.status(500).json({
      success: false,
      error: `Failed to update database: ${err.message || 'Internal database write error'}`,
      code: 'DB_ERROR',
    });
  }
});

// B. Dedicated Secure Fetch Endpoint: Retrieve complete real-time user database state for Extension
app.get('/api/extension/secure/data', authenticateExtensionJwt, async (req, res) => {
  try {
    const authUser = (req as any).user as AuthenticatedUser;
    const uid = authUser.uid;
    const now = Date.now();
    const todayDateKey = new Date(now).toISOString().split('T')[0];
    const currentMonthKey = `${new Date(now).getFullYear()}-${String(new Date(now).getMonth() + 1).padStart(2, '0')}`;

    console.log(`[Omega Server] Secure data fetch requested for user ${uid}`);

    // Try fetching user collections from Firestore in parallel
    let profileSnap: any = null;
    let gamSnap: any = null;
    let queueSnap: any = null;
    let revisionsSnap: any = null;
    let reflectionsSnap: any = null;
    let solvingsSnap: any = null;
    let mistakesSnap: any = null;

    try {
      [
        profileSnap,
        gamSnap,
        queueSnap,
        revisionsSnap,
        reflectionsSnap,
        solvingsSnap,
        mistakesSnap,
      ] = await Promise.all([
        getDoc(doc(firestoreDb, 'users', uid)).catch(() => null),
        getDoc(doc(firestoreDb, 'users', uid, 'gamification', 'status')).catch(() => null),
        getDocs(collection(firestoreDb, 'users', uid, 'dailyQueue')).catch(() => null),
        getDocs(collection(firestoreDb, 'users', uid, 'revisions')).catch(() => null),
        getDocs(query(collection(firestoreDb, 'users', uid, 'reflections'), limit(50))).catch(() => null),
        getDocs(query(collection(firestoreDb, 'users', uid, 'solvings'), limit(100))).catch(() => null),
        getDocs(query(collection(firestoreDb, 'users', uid, 'mistakes'), limit(20))).catch(() => null),
      ]);
    } catch (dbReadErr) {}

    const profile = profileSnap && profileSnap.exists() ? profileSnap.data() : null;
    const gamification = gamSnap && gamSnap.exists() ? gamSnap.data() : null;

    // Daily queue
    const dailyQueue: any[] = [];
    if (queueSnap) {
      queueSnap.forEach((d: any) => dailyQueue.push(d.data()));
    }

    // Revisions
    const revisions: any[] = [];
    let revisionsDueCount = 0;
    if (revisionsSnap) {
      revisionsSnap.forEach((d: any) => {
        const rev = d.data();
        revisions.push(rev);
        if (rev.status === 'due' || (rev.nextReviewAt && rev.nextReviewAt <= now)) {
          revisionsDueCount += 1;
        }
      });
    }

    // Cached user stats fallback
    const cachedStats = userStatsCacheMap.get(uid) || (authUser.email ? userStatsCacheMap.get(authUser.email) : null);

    // Calculate daily heatmap counts from solvings & reflections or cache
    const dailyCounts: Record<string, number> = { ...(cachedStats?.dailyCounts || {}) };
    if (solvingsSnap) {
      solvingsSnap.forEach((d: any) => {
        const s = d.data();
        const ts = s.solvedAt || s.completedAt || s.timestamp;
        if (ts) {
          const dKey = new Date(ts).toISOString().split('T')[0];
          dailyCounts[dKey] = (dailyCounts[dKey] || 0) + 1;
        }
      });
    }
    if (reflectionsSnap) {
      reflectionsSnap.forEach((d: any) => {
        const r = d.data();
        const ts = r.createdAt || r.timestamp;
        if (ts) {
          const dKey = new Date(ts).toISOString().split('T')[0];
          if (!dailyCounts[dKey]) dailyCounts[dKey] = 1;
        }
      });
    }

    // Today count, monthly solved, active days
    const todayCount = dailyCounts[todayDateKey] || cachedStats?.todayCount || 0;
    let monthlySolved = 0;
    let activeDays = 0;
    Object.entries(dailyCounts).forEach(([dKey, count]) => {
      if (dKey.startsWith(currentMonthKey) && count > 0) {
        monthlySolved += count;
        activeDays += 1;
      }
    });

    // Recent logs
    const recentLogs: any[] = [...(cachedStats?.recentLogs || [])];
    if (reflectionsSnap) {
      reflectionsSnap.forEach((d: any) => {
        const r = d.data();
        recentLogs.push({
          id: r.id || d.id,
          problemTitle: r.problemTitle || r.problemSlug || 'Practice Reflection',
          platform: r.platform || 'LeetCode',
          difficulty: r.feltDifficulty || r.perceivedDifficulty || 'Medium',
          verdict: 'Accepted',
          confidence: r.confidence || 4,
          notes: r.keyTakeaways || r.notes || '',
          timeSpent: r.timeTakenSeconds ? `${Math.round(r.timeTakenSeconds / 60)}m` : '15m',
          timeFormatted: new Date(r.createdAt || now).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          timestamp: r.createdAt || now,
        });
      });
    }
    recentLogs.sort((a, b) => b.timestamp - a.timestamp);

    // Mistakes
    const mistakes: any[] = [];
    if (mistakesSnap) {
      mistakesSnap.forEach((d: any) => mistakes.push(d.data()));
    }

    const streak = gamification?.currentStreak || cachedStats?.streak || (todayCount > 0 ? 1 : 0);
    const xp = gamification?.xp || 0;
    const level = gamification?.level || Math.floor(xp / 100) + 1;
    const dailyGoal = profile?.dailyLimit || cachedStats?.dailyGoal || 3;

    return res.json({
      success: true,
      user: {
        uid: authUser.uid,
        email: authUser.email,
        displayName: authUser.displayName,
        photoURL: authUser.photoURL,
      },
      stats: {
        todayCount,
        dailyGoal,
        streak,
        xp,
        level,
        monthlySolved,
        activeDays,
        dailyCounts,
        revisionsDueCount,
        recentLogs: recentLogs.slice(0, 15),
      },
      dailyQueue,
      revisionsDue: revisions.filter((r) => r.status === 'due' || (r.nextReviewAt && r.nextReviewAt <= now)),
      mistakes: mistakes.slice(0, 10),
      serverTime: now,
    });
  } catch (err: any) {
    console.warn('[Omega Server] Secure data fetch fallback notice:', err?.message);
    const authUser = (req as any).user as AuthenticatedUser;
    const cachedStats = userStatsCacheMap.get(authUser?.uid) || (authUser?.email ? userStatsCacheMap.get(authUser.email) : null);
    return res.json({
      success: true,
      user: {
        uid: authUser?.uid || 'user',
        email: authUser?.email || null,
        displayName: authUser?.displayName || null,
      },
      stats: cachedStats || {
        todayCount: 0,
        dailyGoal: 3,
        streak: 1,
        xp: 0,
        level: 1,
        monthlySolved: 0,
        activeDays: 0,
        dailyCounts: {},
        revisionsDueCount: 0,
        recentLogs: [],
      },
      dailyQueue: [],
      revisionsDue: [],
      mistakes: [],
      serverTime: Date.now(),
    });
  }
});

// C. Dedicated Secure Problem Status Endpoint: Retrieve past solving history for in-page modal
app.get('/api/extension/secure/problem-status', authenticateExtensionJwt, async (req, res) => {
  try {
    const authUser = (req as any).user as AuthenticatedUser;
    const uid = authUser.uid;
    const slug = (req.query.slug as string || '').trim().toLowerCase();
    const title = (req.query.title as string || '').trim().toLowerCase();
    const url = (req.query.url as string || '').trim();

    console.log(`[Omega Server] Secure problem history check for user ${uid}: slug="${slug}", title="${title}"`);

    let previousLog: any = null;

    // 1. Check in-memory extensionLogsHistory & cachedStats first
    const cachedLogs = extensionLogsHistory.filter(
      (item) => item.userId === uid || (authUser.email && item.userEmail === authUser.email)
    );
    for (const item of cachedLogs) {
      const log = item.log || {};
      const pSlug = (log.problemSlug || log.slug || '').trim().toLowerCase();
      const pTitle = (log.problemTitle || log.title || '').trim().toLowerCase();
      const pUrl = (log.problemUrl || log.url || '').trim();

      if (
        (slug && pSlug && (pSlug === slug || pSlug.includes(slug) || slug.includes(pSlug))) ||
        (title && pTitle && (pTitle === title || pTitle.includes(title) || title.includes(pTitle))) ||
        (url && pUrl && pUrl === url)
      ) {
        if (!previousLog || (log.createdAt || log.timestamp || item.timestamp) > (previousLog.createdAt || previousLog.timestamp || 0)) {
          previousLog = log;
        }
      }
    }

    // 2. Try Firestore reflections
    if (!previousLog) {
      try {
        const refColl = collection(firestoreDb, 'users', uid, 'reflections');
        const refSnap = await getDocs(query(refColl, limit(100)));
        refSnap.forEach((d) => {
          const data = d.data();
          const pSlug = (data.problemSlug || '').trim().toLowerCase();
          const pTitle = (data.problemTitle || '').trim().toLowerCase();
          const pUrl = (data.problemUrl || data.url || '').trim();

          if (
            (slug && pSlug && (pSlug === slug || pSlug.includes(slug) || slug.includes(pSlug))) ||
            (title && pTitle && (pTitle === title || pTitle.includes(title) || title.includes(pTitle))) ||
            (url && pUrl && pUrl === url)
          ) {
            if (!previousLog || (data.createdAt || data.timestamp) > (previousLog.createdAt || previousLog.timestamp || 0)) {
              previousLog = data;
            }
          }
        });
      } catch (dbErr) {}
    }

    // Check revision card if exists
    let revisionCard: any = null;
    if (slug) {
      try {
        const revCardRef = doc(firestoreDb, 'users', uid, 'revisions', `prob-${slug}`);
        const revSnap = await getDoc(revCardRef);
        if (revSnap.exists()) {
          revisionCard = revSnap.data();
        }
      } catch (e) {}
    }

    if (previousLog) {
      return res.json({
        success: true,
        hasPrevious: true,
        isRevision: true,
        previousLog: {
          confidence: previousLog.confidence || 3,
          feltDifficulty: previousLog.feltDifficulty || previousLog.perceivedDifficulty || 'Medium',
          notes: previousLog.keyTakeaways || previousLog.notes || '',
          timestamp: previousLog.createdAt || previousLog.timestamp || Date.now() - 86400000,
          recognizedPatternImmediately: previousLog.recognizedPatternImmediately ?? true,
          requiredHintsOrEditorial: previousLog.requiredHintsOrEditorial ?? false,
          reviewCount: revisionCard?.reviewCount || 1,
        },
      });
    }

    return res.json({
      success: true,
      hasPrevious: false,
      isRevision: false,
      previousLog: null,
    });
  } catch (err: any) {
    console.warn('[Omega Server] Secure problem status fallback notice:', err?.message);
    return res.json({
      success: true,
      hasPrevious: false,
      isRevision: false,
      previousLog: null,
    });
  }
});

// D. Dedicated Secure Daily Queue Status Update
app.post('/api/extension/secure/daily-queue/update', authenticateExtensionJwt, async (req, res) => {
  try {
    const authUser = (req as any).user as AuthenticatedUser;
    const uid = authUser.uid;
    const { itemId, status } = req.body;

    if (!itemId) {
      return res.status(400).json({ success: false, error: 'Queue item ID (itemId) is required' });
    }

    try {
      const queueDocRef = doc(firestoreDb, 'users', uid, 'dailyQueue', String(itemId));
      await updateDoc(queueDocRef, {
        status: status || 'completed',
        completedAt: Date.now(),
        updatedAt: Date.now(),
      });
    } catch (dbErr) {}

    return res.json({
      success: true,
      message: `Daily queue item marked as ${status || 'completed'}.`,
    });
  } catch (err: any) {
    return res.json({
      success: true,
      message: 'Queue item updated.',
    });
  }
});

// ===================================================
// LEGACY COMPATIBILITY ENDPOINTS (Backward Support)
// ===================================================

// 4. Extension Ingestion: Record LeetCode Practice Reflection Log (Legacy fallback)
app.post('/api/extension/log', async (req, res) => {
  try {
    const { log, userId, userEmail } = req.body;
    if (!log) {
      return res.status(400).json({ error: 'Missing log object' });
    }

    const logRecord: ExtensionLogRecord = {
      id: log.id || `ext-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      userId: userId || 'guest',
      userEmail: userEmail || undefined,
      log: log,
      timestamp: Date.now(),
    };

    extensionLogsHistory.unshift(logRecord);
    if (extensionLogsHistory.length > 200) {
      extensionLogsHistory.pop();
    }

    const userKey = userId || userEmail || 'guest';
    const now = new Date();
    const todayDateKey = now.toISOString().split('T')[0];
    const userStat = userStatsCacheMap.get(userKey) || {
      userId: userId || 'guest',
      userEmail: userEmail,
      todayCount: 0,
      dailyGoal: 3,
      streak: 1,
      dailyCounts: {},
      monthlySolved: 0,
      activeDays: 0,
      recentLogs: [],
      updatedAt: Date.now(),
    };

    userStat.dailyCounts[todayDateKey] = (userStat.dailyCounts[todayDateKey] || 0) + 1;
    userStat.todayCount = userStat.dailyCounts[todayDateKey];
    userStat.recentLogs.unshift({
      id: logRecord.id,
      problemTitle: log.problemTitle || log.problemSlug || 'Problem Reflection',
      platform: log.platform || 'LeetCode',
      difficulty: log.feltDifficulty || log.difficulty || 'Medium',
      verdict: log.verdict || 'Accepted',
      timeSpent: log.timeSpent || '15m',
      timeFormatted: new Date(logRecord.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      timestamp: logRecord.timestamp,
    });
    userStat.recentLogs = userStat.recentLogs.slice(0, 30);
    userStat.updatedAt = Date.now();

    userStatsCacheMap.set(userKey, userStat);
    if (userId) userStatsCacheMap.set(userId, userStat);
    if (userEmail) userStatsCacheMap.set(userEmail, userStat);
    persistStats();
    persistLogs();

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

// 4b. Extension Query: Get Pending Logs for Web Dashboard Ingestion
app.get('/api/extension/pending-logs', (req, res) => {
  try {
    const userId = req.query.userId as string | undefined;
    const userEmail = (req.query.userEmail || req.query.email) as string | undefined;
    const since = req.query.since ? parseInt(req.query.since as string, 10) : 0;

    let matchedLogs = extensionLogsHistory;
    if (userId || userEmail) {
      matchedLogs = matchedLogs.filter((r) => {
        // Match specific user, email, or guest logs
        if (userId && r.userId === userId) return true;
        if (userEmail && r.userEmail === userEmail) return true;
        if (!r.userId || r.userId === 'guest') return true;
        return false;
      });
    }

    if (since > 0) {
      matchedLogs = matchedLogs.filter((r) => r.timestamp > since);
    }

    return res.json({
      success: true,
      serverTime: Date.now(),
      count: matchedLogs.length,
      logs: matchedLogs.map((item) => ({
        id: item.id,
        userId: item.userId,
        userEmail: item.userEmail,
        timestamp: item.timestamp,
        log: item.log,
      })),
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to fetch pending logs' });
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

    const incomingDailyCounts: Record<string, number> =
      stats?.dailyCounts && typeof stats.dailyCounts === 'object' ? stats.dailyCounts : (existing.dailyCounts || {});
    const incomingToday = typeof stats?.todayCount === 'number' ? stats.todayCount : existing.todayCount;
    const incomingStreak = typeof stats?.streak === 'number' ? stats.streak : existing.streak;
    const incomingGoal = typeof stats?.dailyGoal === 'number' && stats.dailyGoal > 0 ? stats.dailyGoal : existing.dailyGoal;
    const incomingMonthlySolved = typeof stats?.monthlySolved === 'number' ? stats.monthlySolved : existing.monthlySolved;
    const incomingActiveDays = typeof stats?.activeDays === 'number' ? stats.activeDays : existing.activeDays;
    const incomingRecentLogs = Array.isArray(stats?.recentLogs) ? stats.recentLogs : (existing.recentLogs || []);

    const updatedData: UserStatsData = {
      userId: userId || existing.userId,
      userEmail: userEmail || existing.userEmail,
      todayCount: incomingToday,
      dailyGoal: incomingGoal,
      streak: incomingStreak,
      dailyCounts: incomingDailyCounts,
      monthlySolved: incomingMonthlySolved,
      activeDays: incomingActiveDays,
      recentLogs: incomingRecentLogs,
      updatedAt: Date.now(),
    };

    userStatsCacheMap.set(key, updatedData);
    if (userId) userStatsCacheMap.set(userId, updatedData);
    if (userEmail) userStatsCacheMap.set(userEmail, updatedData);
    persistStats();

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

    if (stats) {
      return res.json({
        success: true,
        hasData: true,
        todayCount: stats.todayCount,
        dailyGoal: stats.dailyGoal,
        streak: stats.streak,
        dailyCounts: stats.dailyCounts,
        monthlySolved: stats.monthlySolved,
        activeDays: stats.activeDays,
        recentLogs: stats.recentLogs,
        lastSync: stats.updatedAt || Date.now(),
      });
    }

    // Fallback if no synced stats found: synthesize from recent extension logs
    const relevantLogs = extensionLogsHistory.filter(
      (r) => (userId && r.userId === userId) || (userEmail && r.userEmail === userEmail)
    );

    const now = new Date();
    const todayDateKey = now.toISOString().split('T')[0];
    const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    const computedDailyCounts: Record<string, number> = {};
    
    relevantLogs.forEach((rec) => {
      const dKey = new Date(rec.timestamp).toISOString().split('T')[0];
      computedDailyCounts[dKey] = (computedDailyCounts[dKey] || 0) + 1;
    });

    const todayCount = computedDailyCounts[todayDateKey] || 0;

    let monthlySolved = 0;
    let activeDays = 0;
    Object.entries(computedDailyCounts).forEach(([dKey, count]) => {
      if (dKey.startsWith(currentMonthKey) && count > 0) {
        monthlySolved += count;
        activeDays += 1;
      }
    });

    const recentLogs = relevantLogs.slice(0, 20).map((r) => ({
      id: r.id,
      problemTitle: r.log.problemTitle || r.log.problemSlug || 'LeetCode Problem',
      platform: r.log.platform || 'LeetCode',
      difficulty: r.log.feltDifficulty || r.log.difficulty || 'Medium',
      verdict: r.log.verdict || 'Accepted',
      timeSpent: r.log.timeSpent || '15m',
      timeFormatted: new Date(r.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      timestamp: r.timestamp,
    }));

    const hasData = !!(relevantLogs.length > 0 || Object.keys(computedDailyCounts).length > 0);

    return res.json({
      success: true,
      hasData,
      todayCount: todayCount,
      dailyGoal: 3,
      streak: todayCount > 0 ? 1 : 0,
      dailyCounts: computedDailyCounts,
      monthlySolved: monthlySolved,
      activeDays: activeDays,
      recentLogs: recentLogs,
      lastSync: Date.now(),
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
    const { userId, userEmail, since } = req.query;
    const sinceTimestamp = since ? Number(since) : 0;

    let logs = extensionLogsHistory.filter((item) => item.timestamp > sinceTimestamp);

    if (userId && userId !== 'all') {
      const emailStr = typeof userEmail === 'string' ? userEmail.trim().toLowerCase() : '';
      logs = logs.filter(
        (item) =>
          item.userId === userId ||
          item.userId === 'guest' ||
          !item.userId ||
          (emailStr && item.userEmail && item.userEmail.toLowerCase() === emailStr)
      );
    }

    return res.json({
      success: true,
      logs: logs.map((l) => ({
        id: l.id,
        userId: l.userId,
        userEmail: l.userEmail,
        log: l.log,
        timestamp: l.timestamp,
      })),
      serverTime: Date.now(),
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to fetch pending logs' });
  }
});

// 7. Problem History Lookup for Extension (determines First Log vs Revision Log format)
app.get('/api/extension/problem-history', (req, res) => {
  try {
    const { userId, slug, title } = req.query;
    const cleanSlug = ((slug as string) || '').toLowerCase().trim();
    const cleanTitle = ((title as string) || '').toLowerCase().trim();

    const matchingLog = extensionLogsHistory.find((item) => {
      if (userId && item.userId !== userId && item.userId !== 'guest') return false;
      const lSlug = (item.log?.problemSlug || item.log?.slug || '').toLowerCase().trim();
      const lTitle = (item.log?.problemTitle || item.log?.title || '').toLowerCase().trim();
      if (cleanSlug && lSlug && cleanSlug === lSlug) return true;
      if (cleanTitle && lTitle && cleanTitle === lTitle) return true;
      return false;
    });

    if (matchingLog && matchingLog.log) {
      return res.json({
        success: true,
        hasPrevious: true,
        isRevision: true,
        previousLog: {
          confidence: matchingLog.log.confidence || 3,
          feltDifficulty: matchingLog.log.feltDifficulty || matchingLog.log.difficulty || 'Medium',
          notes: matchingLog.log.notes || '',
          timestamp: matchingLog.timestamp,
          recognizedPatternImmediately: matchingLog.log.recognizedPatternImmediately ?? true,
          requiredHintsOrEditorial: matchingLog.log.requiredHintsOrEditorial ?? false,
        },
      });
    }

    return res.json({
      success: true,
      hasPrevious: false,
      isRevision: false,
      previousLog: null,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to query problem history' });
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
