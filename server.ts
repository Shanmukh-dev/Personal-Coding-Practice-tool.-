import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

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
    console.log(`AlgoOS full-stack server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
