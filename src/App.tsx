/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import {
  auth,
  onAuthStateChanged,
  firebaseSignOut,
  FirebaseUser,
} from './lib/firebase';
import {
  UserProfile,
  PlatformConnection,
  Problem,
  Reflection,
  SolvingRecord,
  RevisionCard,
  DailyQueueItem,
  PatternMastery,
  MistakeEntry,
  LearningMemory,
  AICoachMessage,
  UserGamification,
  Platform,
  ReviewOutcome,
} from './types';
import { getLocalDateKey } from './utils/dateUtils';
import {
  getUserProfile,
  setUserProfile,
  getPlatformConnections,
  setPlatformConnection,
  getGlobalProblemCatalog,
  saveGlobalProblem,
  getDailyQueue,
  saveDailyQueueItem,
  updateDailyQueueItemStatus,
  updateDailyQueueItemDate,
  deleteDailyQueueItem,
  getRevisionCards,
  saveRevisionCard,
  getReflections,
  saveReflection,
  getSolvingRecords,
  saveSolvingRecord,
  getPatternMasteries,
  savePatternMastery,
  getMistakes,
  saveMistake,
  getLearningMemories,
  saveLearningMemory,
  getAICoachMessages,
  saveAICoachMessage,
  getUserGamification,
  setUserGamification,
} from './services/dbService';
import { generateDailyQueue } from './services/recommendationEngine';
import { calculateNextRevision, intelligentAutoRescheduleOverdueCards } from './services/revisionEngine';
import { updateGamificationProgress } from './services/gamificationService';
import { computePatternTaxonomy } from './services/taxonomyEngine';

import { Sidebar } from './components/Sidebar';
import { AuthModal } from './components/AuthModal';
import { OnboardingModal } from './components/OnboardingModal';
import { Dashboard } from './components/Dashboard';
import { DailyQueueView } from './components/DailyQueueView';
import { CalendarView } from './components/CalendarView';
import { RevisionView } from './components/RevisionView';
import { ReflectionModal } from './components/ReflectionModal';
import { ProblemCatalogView } from './components/ProblemCatalogView';
import { PlatformConnectorsView } from './components/PlatformConnectorsView';
import { PatternMasteryView } from './components/PatternMasteryView';
import { LearningMemoryView } from './components/LearningMemoryView';
import { MistakeJournalView } from './components/MistakeJournalView';
import { AICoachView } from './components/AICoachView';
import { GamificationView } from './components/GamificationView';
import { ProfileView } from './components/ProfileView';
import { SettingsView } from './components/SettingsView';
import { OnboardingAuthScreen } from './components/OnboardingAuthScreen';
import { ThemeProvider, ThemeMode } from './context/ThemeContext';

export default function App() {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfileState] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isGuestEntered, setIsGuestEntered] = useState<boolean>(false);

  // Firestore Data State
  const [connections, setConnections] = useState<PlatformConnection[]>([]);
  const [catalog, setCatalog] = useState<Problem[]>([]);
  const [dailyQueue, setDailyQueue] = useState<DailyQueueItem[]>([]);
  const [revisionCards, setRevisionCards] = useState<RevisionCard[]>([]);
  const [reflections, setReflections] = useState<Reflection[]>([]);
  const [solvingRecords, setSolvingRecords] = useState<SolvingRecord[]>([]);
  const [patternMasteries, setPatternMasteries] = useState<PatternMastery[]>([]);
  const [mistakes, setMistakes] = useState<MistakeEntry[]>([]);
  const [memories, setMemories] = useState<LearningMemory[]>([]);
  const [coachMessages, setCoachMessages] = useState<AICoachMessage[]>([]);
  const [gamification, setGamification] = useState<UserGamification | null>(null);

  // Modals & UI Layout
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState<boolean>(false);
  const [reflectionProblem, setReflectionProblem] = useState<Problem | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);

  // Sync catalog globally on mount
  useEffect(() => {
    getGlobalProblemCatalog().then((list) => setCatalog(list));
  }, []);

  // Listen to Auth State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        setIsGuestEntered(true);
        await loadUserData(user.uid, user.email, user.displayName, user.photoURL);
      } else {
        // Clear authenticated state
        setConnections([]);
        setDailyQueue([]);
        setRevisionCards([]);
        setReflections([]);
        setSolvingRecords([]);
        setPatternMasteries([]);
        setMistakes([]);
        setMemories([]);
        setCoachMessages([]);
        setGamification(null);

        // Load or initialize guest profile
        const savedGuest = localStorage.getItem('algo_os_guest_profile');
        if (savedGuest) {
          try {
            const parsed = JSON.parse(savedGuest);
            setUserProfileState(parsed);
          } catch {
            initGuestProfile();
          }
        } else {
          initGuestProfile();
        }
      }
    });
    return () => unsubscribe();
  }, []);

  const initGuestProfile = () => {
    const newGuest: UserProfile = {
      uid: 'guest',
      email: null,
      displayName: 'Guest Engineer',
      photoURL: null,
      dailyLimit: 3,
      targetInterviewLevel: 'Junior',
      selectedTopics: ['arrays', 'two_pointers', 'sliding_window', 'binary_search', 'hashmap', 'dfs', 'dynamic_programming'],
      onboardingCompleted: false,
      createdAt: Date.now(),
    };
    setUserProfileState(newGuest);
  };

  const loadUserData = async (
    uid: string,
    email: string | null,
    displayName: string | null,
    photoURL?: string | null
  ) => {
    try {
      let profile = await getUserProfile(uid);
      if (!profile) {
        profile = {
          uid,
          email,
          displayName,
          photoURL: photoURL || null,
          dailyLimit: 3,
          targetInterviewLevel: 'Junior',
          selectedTopics: ['arrays', 'two_pointers', 'binary_search', 'hashmap', 'dfs'],
          onboardingCompleted: false,
          createdAt: Date.now(),
        };
        await setUserProfile(profile);
      } else if (photoURL && !profile.photoURL) {
        profile.photoURL = photoURL;
        await setUserProfile(profile);
      }
      setUserProfileState(profile);

      // Prompt onboarding if new profile
      if (!profile.onboardingCompleted) {
        setIsOnboardingOpen(true);
      }

      // Load sub-collections
      const [conns, dq, revs, refs, solv, mast, mist, mems, msgs, gami] =
        await Promise.all([
          getPlatformConnections(uid),
          getDailyQueue(uid),
          getRevisionCards(uid),
          getReflections(uid),
          getSolvingRecords(uid),
          getPatternMasteries(uid),
          getMistakes(uid),
          getLearningMemories(uid),
          getAICoachMessages(uid),
          getUserGamification(uid),
        ]);

      setConnections(conns);
      setDailyQueue(dq);
      setRevisionCards(revs);
      setReflections(refs);
      setSolvingRecords(solv);
      setMistakes(mist);
      setMemories(mems);
      setCoachMessages(msgs);
      setGamification(gami);

      // Generate or update daily queue for today
      const todayKey = getLocalDateKey();
      const catList = await getGlobalProblemCatalog();
      setCatalog(catList);

      // Compute & sync Pattern Taxonomy based on user logs from knowledge memory
      const computedTaxonomy = computePatternTaxonomy({
        solvingRecords: solv,
        reflections: refs,
        memories: mems,
        mistakes: mist,
        catalog: catList,
      });

      setPatternMasteries(computedTaxonomy);
      if (currentUser?.uid && currentUser.uid !== 'guest') {
        for (const mastery of computedTaxonomy) {
          await savePatternMastery(uid, mastery);
        }
      }

      const generated = generateDailyQueue(
        todayKey,
        profile,
        catList,
        dq,
        revs,
        solv,
        computedTaxonomy.length > 0 ? computedTaxonomy : mast,
        refs
      );

      // Persist new queue items
      for (const item of generated) {
        await saveDailyQueueItem(uid, item);
      }
      setDailyQueue(generated);
    } catch (err) {
      console.warn('Notice loading user data from Firestore:', err);
      // Ensure catalog is populated if database load encountered temporary error
      const fallbackCat = await getGlobalProblemCatalog();
      setCatalog(fallbackCat);
    }
  };

  // Sign out
  const handleSignOut = async () => {
    await firebaseSignOut(auth);
    setIsGuestEntered(false);
  };

  // Save Onboarding Profile (supports logged-in & guest users)
  const handleSaveOnboarding = async (updated: Partial<UserProfile>) => {
    const baseProfile: UserProfile = userProfile || {
      uid: currentUser?.uid || 'guest',
      email: currentUser?.email || null,
      displayName: currentUser?.displayName || 'Guest Engineer',
      photoURL: null,
      dailyLimit: 3,
      targetInterviewLevel: 'Junior',
      selectedTopics: ['arrays', 'two_pointers', 'sliding_window', 'binary_search'],
      onboardingCompleted: true,
      createdAt: Date.now(),
    };

    const newProfile: UserProfile = {
      ...baseProfile,
      ...updated,
      onboardingCompleted: true,
    };

    setUserProfileState(newProfile);

    if (currentUser) {
      await setUserProfile(newProfile);
    } else {
      localStorage.setItem('algo_os_guest_profile', JSON.stringify(newProfile));
    }

    // Regenerate daily queue with updated limits & selected topics
    const todayKey = getLocalDateKey();
    const catList = catalog.length > 0 ? catalog : await getGlobalProblemCatalog();
    setCatalog(catList);

    const generated = generateDailyQueue(
      todayKey,
      newProfile,
      catList,
      dailyQueue,
      revisionCards,
      solvingRecords,
      patternMasteries,
      reflections
    );

    if (currentUser) {
      for (const item of generated) {
        await saveDailyQueueItem(currentUser.uid, item);
      }
    }
    setDailyQueue(generated);
    setIsOnboardingOpen(false);
  };

  // Solve problem link
  const handleSolveProblem = (problem: Problem) => {
    window.open(problem.url, '_blank', 'noopener,noreferrer');
  };

  // Add Problem by URL endpoint
  const handleAddProblemUrl = async (url: string) => {
    const res = await fetch('/api/platform/fetch-problem', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    });

    if (!res.ok) {
      throw new Error('Failed to parse problem URL');
    }

    const data = await res.json();
    if (data.problem) {
      const p: Problem = data.problem;
      await saveGlobalProblem(p);
      const updatedCatalog = [...catalog.filter((x) => x.id !== p.id), p];
      setCatalog(updatedCatalog);
    }
  };

  // Auto-Populate Catalog from LeetCode, HackerRank, CodeChef, Codeforces
  const handlePopulateCatalog = async () => {
    const res = await fetch('/api/catalog/populate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!res.ok) {
      throw new Error('Failed to auto-populate problem catalog');
    }

    const data = await res.json();
    if (Array.isArray(data.catalog)) {
      setCatalog(data.catalog);
      if (currentUser) {
        for (const p of data.catalog) {
          await saveGlobalProblem(p);
        }
      }
    }
  };

  // Submit Reflection and log problem completion
  const handleSubmitReflection = async (data: {
    confidence: number;
    feltDifficulty: 'Easy' | 'Medium' | 'Hard';
    recognizedPatternImmediately: boolean;
    requiredHintsOrEditorial: boolean;
    notes: string;
  }) => {
    if (!reflectionProblem) return;

    const uid = currentUser?.uid || 'guest';

    // Call server AI reflection analysis
    let aiAnalysis = undefined;
    try {
      const aiRes = await fetch('/api/ai/analyze-reflection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reflection: data, problem: reflectionProblem }),
      });
      if (aiRes.ok) {
        const aiData = await aiRes.json();
        aiAnalysis = aiData.analysis;
      }
    } catch (e) {
      console.warn('AI reflection analysis failed:', e);
    }

    // Create reflection doc
    const refId = `ref-${Date.now()}`;
    const newReflection: Reflection = {
      id: refId,
      userId: uid,
      problemId: reflectionProblem.id,
      timestamp: Date.now(),
      confidence: data.confidence,
      feltDifficulty: data.feltDifficulty,
      recognizedPatternImmediately: data.recognizedPatternImmediately,
      requiredHintsOrEditorial: data.requiredHintsOrEditorial,
      notes: data.notes,
      aiAnalysis,
    };

    if (currentUser) {
      await saveReflection(uid, newReflection);
    }
    setReflections((prev) => [newReflection, ...prev]);

    // Save Solving Record
    const newSolving: SolvingRecord = {
      id: `solv-${Date.now()}`,
      userId: uid,
      problemId: reflectionProblem.id,
      completedAt: Date.now(),
      source: 'manual',
      reflectionId: refId,
    };
    if (currentUser) {
      await saveSolvingRecord(uid, newSolving);
    }
    setSolvingRecords((prev) => [newSolving, ...prev]);

    // Update Revision Card with spaced repetition calculation
    const existingRev = revisionCards.find((c) => c.problemId === reflectionProblem.id) || null;
    let outcome: ReviewOutcome = 'Good';
    if (data.confidence >= 4 && !data.requiredHintsOrEditorial) outcome = 'Easy';
    else if (data.confidence === 3) outcome = 'Good';
    else if (data.confidence === 2) outcome = 'Hard';
    else outcome = 'Forgot';

    const nextCard = calculateNextRevision(existingRev, reflectionProblem.id, uid, outcome);
    if (currentUser) {
      await saveRevisionCard(uid, nextCard);
    }
    setRevisionCards((prev) => [...prev.filter((c) => c.id !== nextCard.id), nextCard]);

    // Automatically schedule revision on calendar for nextReviewAt date
    const targetDate = new Date(nextCard.nextReviewAt);
    const yStr = targetDate.getFullYear();
    const mStr = String(targetDate.getMonth() + 1).padStart(2, '0');
    const dStr = String(targetDate.getDate()).padStart(2, '0');
    const revDateKey = `${yStr}-${mStr}-${dStr}`;

    const revQueueItem: DailyQueueItem = {
      id: `dq-rev-${reflectionProblem.id}-${revDateKey}`,
      userId: uid,
      problemId: reflectionProblem.id,
      dateKey: revDateKey,
      status: 'pending',
      isRevision: true,
      addedAt: Date.now(),
    };

    if (currentUser) {
      await saveDailyQueueItem(uid, revQueueItem);
    }
    setDailyQueue((prev) => {
      const filtered = prev.filter(
        (i) => !(i.problemId === reflectionProblem.id && i.dateKey === revDateKey)
      );
      const updated = [...filtered, revQueueItem];
      if (!currentUser) {
        localStorage.setItem('algo_os_guest_queue', JSON.stringify(updated));
      }
      return updated;
    });

    // Update Learning Memory
    const existingMem = memories.find((m) => m.problemId === reflectionProblem.id);
    const newMem: LearningMemory = {
      problemId: reflectionProblem.id,
      userId: uid,
      firstSolvedDate: existingMem ? existingMem.firstSolvedDate : Date.now(),
      lastReviewedDate: Date.now(),
      reviewCount: existingMem ? existingMem.reviewCount + 1 : 1,
      confidenceHistory: [
        ...(existingMem?.confidenceHistory || []),
        { timestamp: Date.now(), score: data.confidence },
      ],
      reflectionHistory: [
        ...(existingMem?.reflectionHistory || []),
        newReflection,
      ],
      mistakes: existingMem?.mistakes || [],
      keyInsights: [
        ...(existingMem?.keyInsights || []),
        ...(data.notes ? [data.notes] : []),
      ],
    };
    if (currentUser) {
      await saveLearningMemory(uid, newMem);
    }
    const updatedMemories = [
      ...memories.filter((m) => m.problemId !== reflectionProblem.id),
      newMem,
    ];
    setMemories(updatedMemories);

    // Smartly analyze and update Pattern Taxonomy across all past logs & patterns
    const updatedReflections = [newReflection, ...reflections];
    const updatedSolvings = [newSolving, ...solvingRecords];

    const updatedTaxonomy = computePatternTaxonomy({
      solvingRecords: updatedSolvings,
      reflections: updatedReflections,
      memories: updatedMemories,
      mistakes,
      catalog,
    });

    setPatternMasteries(updatedTaxonomy);
    if (currentUser) {
      for (const m of updatedTaxonomy) {
        await savePatternMastery(uid, m);
      }
    }

    // Update Daily Queue Item status if present in queue
    const queueItems = dailyQueue.filter((i) => i.problemId === reflectionProblem.id);
    if (queueItems.length > 0) {
      if (currentUser) {
        for (const qItem of queueItems) {
          await updateDailyQueueItemStatus(uid, qItem.id, 'completed');
        }
      }
      const updatedQueue = dailyQueue.map((i) =>
        i.problemId === reflectionProblem.id ? { ...i, status: 'completed' as const } : i
      );
      setDailyQueue(updatedQueue);
      if (!currentUser) {
        localStorage.setItem('algo_os_guest_queue', JSON.stringify(updatedQueue));
      }
    }

    // Update Gamification
    const { nextState } = updateGamificationProgress(
      gamification,
      uid,
      {
        action: 'reflection_added',
        difficulty: reflectionProblem.difficulty,
        confidence: data.confidence,
        recognizedPatternImmediately: data.recognizedPatternImmediately,
        requiredHintsOrEditorial: data.requiredHintsOrEditorial,
        hasNotes: Boolean(data.notes && data.notes.trim().length > 5),
      }
    );
    if (currentUser) {
      await setUserGamification(uid, nextState);
    }
    setGamification(nextState);
  };

  // Revision outcome review
  const handleReviewOutcome = async (card: RevisionCard, outcome: ReviewOutcome) => {
    const uid = currentUser?.uid || 'guest';
    const now = Date.now();

    // 1. Log SolvingRecord for revision activity
    const revSolving: SolvingRecord = {
      id: `solv-rev-${now}-${Math.random().toString(36).substring(2, 6)}`,
      userId: uid,
      problemId: card.problemId,
      completedAt: now,
      source: 'revision',
    };
    if (currentUser) {
      await saveSolvingRecord(uid, revSolving);
    }
    const updatedSolvings = [revSolving, ...solvingRecords];
    setSolvingRecords(updatedSolvings);

    // Smartly analyze and update Pattern Taxonomy across all past logs & patterns
    const updatedTaxonomy = computePatternTaxonomy({
      solvingRecords: updatedSolvings,
      reflections,
      memories,
      mistakes,
      catalog,
    });
    setPatternMasteries(updatedTaxonomy);
    if (currentUser) {
      for (const m of updatedTaxonomy) {
        await savePatternMastery(uid, m);
      }
    }

    // Mark today's revision queue item as completed if it exists
    const todayStr = getLocalDateKey();
    const matchingQueueItem = dailyQueue.find(
      (i) => i.problemId === card.problemId && (i.dateKey === todayStr || i.status === 'carried_over') && i.isRevision
    );
    if (matchingQueueItem) {
      if (currentUser) {
        await updateDailyQueueItemStatus(uid, matchingQueueItem.id, 'completed');
      }
      setDailyQueue((prev) =>
        prev.map((i) => (i.id === matchingQueueItem.id ? { ...i, status: 'completed' as const } : i))
      );
    }

    // 2. Update revision card schedule
    const nextCard = calculateNextRevision(card, card.problemId, uid, outcome);
    if (currentUser) {
      await saveRevisionCard(uid, nextCard);
    }
    setRevisionCards((prev) => [...prev.filter((c) => c.id !== nextCard.id), nextCard]);

    // Automatically schedule revision on calendar for nextReviewAt date
    const targetDate = new Date(nextCard.nextReviewAt);
    const yStr = targetDate.getFullYear();
    const mStr = String(targetDate.getMonth() + 1).padStart(2, '0');
    const dStr = String(targetDate.getDate()).padStart(2, '0');
    const revDateKey = `${yStr}-${mStr}-${dStr}`;

    const revQueueItem: DailyQueueItem = {
      id: `dq-rev-${card.problemId}-${revDateKey}`,
      userId: uid,
      problemId: card.problemId,
      dateKey: revDateKey,
      status: 'pending',
      isRevision: true,
      addedAt: now,
    };

    if (currentUser) {
      await saveDailyQueueItem(uid, revQueueItem);
    }
    setDailyQueue((prev) => {
      const filtered = prev.filter(
        (i) => !(i.problemId === card.problemId && i.dateKey === revDateKey)
      );
      const updated = [...filtered, revQueueItem];
      if (!currentUser) {
        localStorage.setItem('algo_os_guest_queue', JSON.stringify(updated));
      }
      return updated;
    });

    const { nextState } = updateGamificationProgress(
      gamification,
      uid,
      {
        action: 'revision_completed',
        reviewOutcome: outcome,
        reviewCount: card.reviewCount,
      }
    );
    if (currentUser) {
      await setUserGamification(uid, nextState);
    }
    setGamification(nextState);
  };

  // Intelligent Automatic Rescheduling of Overdue Revisions
  const handleAutoRescheduleOverdue = async () => {
    const uid = currentUser?.uid || 'guest';
    const result = intelligentAutoRescheduleOverdueCards(revisionCards);

    if (result.rescheduledCount === 0) {
      return result;
    }

    // Update revision cards state and save
    setRevisionCards(result.updatedCards);
    if (currentUser) {
      for (const card of result.updatedCards) {
        await saveRevisionCard(uid, card);
      }
    } else {
      localStorage.setItem('algo_os_guest_revisions', JSON.stringify(result.updatedCards));
    }

    // Update daily queue items for rescheduled problems
    const todayStr = getLocalDateKey();
    for (const detail of result.rescheduledDetails) {
      const existingQueueItems = dailyQueue.filter(
        (i) => i.problemId === detail.problemId && (i.dateKey === todayStr || i.status === 'carried_over')
      );

      if (existingQueueItems.length > 0) {
        for (const item of existingQueueItems) {
          if (currentUser) {
            await updateDailyQueueItemDate(uid, item.id, detail.newDateKey);
          }
        }
        setDailyQueue((prev) =>
          prev.map((i) =>
            existingQueueItems.some((e) => e.id === i.id)
              ? { ...i, dateKey: detail.newDateKey, status: 'pending' as const, isRescheduled: true }
              : i
          )
        );
      } else {
        const revQueueItem: DailyQueueItem = {
          id: `dq-rev-${detail.problemId}-${detail.newDateKey}`,
          userId: uid,
          problemId: detail.problemId,
          dateKey: detail.newDateKey,
          status: 'pending',
          isRevision: true,
          isRescheduled: true,
          addedAt: Date.now(),
        };
        if (currentUser) {
          await saveDailyQueueItem(uid, revQueueItem);
        }
        setDailyQueue((prev) => {
          const filtered = prev.filter(
            (i) => !(i.problemId === detail.problemId && i.dateKey === detail.newDateKey)
          );
          const updated = [...filtered, revQueueItem];
          if (!currentUser) {
            localStorage.setItem('algo_os_guest_queue', JSON.stringify(updated));
          }
          return updated;
        });
      }
    }

    return result;
  };

  // Connect platform handle
  const handleConnectPlatform = async (platform: Platform, username: string) => {
    if (!currentUser) {
      setIsAuthOpen(true);
      return;
    }
    const uid = currentUser.uid;
    const conn: PlatformConnection = {
      platform,
      username,
      connected: true,
      lastSyncedAt: Date.now(),
      syncStatus: 'success',
    };
    await setPlatformConnection(uid, conn);
    setConnections((prev) => [...prev.filter((c) => c.platform !== platform), conn]);
  };

  // Sync platform submissions
  const handleSyncPlatform = async (platform: Platform) => {
    if (!currentUser) return;
    const uid = currentUser.uid;
    const conn = connections.find((c) => c.platform === platform);
    if (!conn) return;

    conn.syncStatus = 'syncing';
    await setPlatformConnection(uid, conn);

    setTimeout(async () => {
      conn.syncStatus = 'success';
      conn.lastSyncedAt = Date.now();
      await setPlatformConnection(uid, conn);
      setConnections((prev) => [...prev.filter((c) => c.platform !== platform), conn]);
    }, 1000);
  };

  // Simulate ProblemCompletion event from extension / userscript
  const handleSimulateCompletionEvent = async (
    platform: Platform,
    title: string,
    url: string
  ) => {
    if (!currentUser) {
      setIsAuthOpen(true);
      return;
    }
    const uid = currentUser.uid;

    // Fetch / normalize problem
    const probRes = await fetch('/api/platform/fetch-problem', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    });

    const probData = await probRes.json();
    const problem: Problem = probData.problem || {
      id: `${platform.toLowerCase()}-${Date.now()}`,
      title,
      platform,
      platformProblemId: 'event-prob',
      url,
      difficulty: 'Medium',
      tags: [platform],
      dsaPatterns: ['arrays'],
      estimatedSolvingTimeMinutes: 30,
    };

    await saveGlobalProblem(problem);
    setCatalog((prev) => [...prev.filter((p) => p.id !== problem.id), problem]);

    // Prompt user to complete lightweight reflection
    setReflectionProblem(problem);
  };

  // Add mistake entry
  const handleAddMistake = async (data: Omit<MistakeEntry, 'id' | 'timestamp'>) => {
    if (!currentUser) {
      setIsAuthOpen(true);
      return;
    }
    const uid = currentUser.uid;
    const mistake: MistakeEntry = {
      ...data,
      id: `mistake-${Date.now()}`,
      userId: uid,
      timestamp: Date.now(),
    };
    await saveMistake(uid, mistake);
    const updatedMistakes = [mistake, ...mistakes];
    setMistakes(updatedMistakes);

    // Smartly analyze and update Pattern Taxonomy across all past logs & patterns
    const updatedTaxonomy = computePatternTaxonomy({
      solvingRecords,
      reflections,
      memories,
      mistakes: updatedMistakes,
      catalog,
    });
    setPatternMasteries(updatedTaxonomy);
    if (currentUser) {
      for (const m of updatedTaxonomy) {
        await savePatternMastery(uid, m);
      }
    }

    const { nextState } = updateGamificationProgress(
      gamification,
      uid,
      { action: 'mistake_logged' }
    );
    await setUserGamification(uid, nextState);
    setGamification(nextState);
  };

  // AI Coach message
  const handleSendAICoachMessage = async (text: string) => {
    if (!currentUser) {
      setIsAuthOpen(true);
      return;
    }
    const uid = currentUser.uid;

    const userMsg: AICoachMessage = {
      id: `msg-${Date.now()}`,
      userId: uid,
      role: 'user',
      content: text,
      timestamp: Date.now(),
    };
    await saveAICoachMessage(uid, userMsg);
    setCoachMessages((prev) => [...prev, userMsg]);

    try {
      const res = await fetch('/api/ai/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userMessage: text,
          history: coachMessages,
          userProfile,
          memories,
          mistakes,
          masteries: patternMasteries,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const aiMsg: AICoachMessage = {
          id: `msg-${Date.now() + 1}`,
          userId: uid,
          role: 'assistant',
          content: data.reply || "I'm ready to assist your DSA growth.",
          timestamp: Date.now(),
        };
        await saveAICoachMessage(uid, aiMsg);
        setCoachMessages((prev) => [...prev, aiMsg]);
      }
    } catch (err) {
      console.error('Coach API call failed:', err);
    }
  };

  // Handle rescheduling a daily queue item (or batch of items)
  const handleRescheduleQueueItems = async (itemIds: string | string[], targetDateKey: string) => {
    const idsToUpdate = Array.isArray(itemIds) ? itemIds : [itemIds];
    const idSet = new Set(idsToUpdate);

    const updated = dailyQueue.map((item) => {
      if (idSet.has(item.id) || idSet.has(item.problemId)) {
        return { ...item, dateKey: targetDateKey, status: 'pending' as const };
      }
      return item;
    });
    setDailyQueue(updated);

    if (currentUser) {
      for (const item of dailyQueue) {
        if (idSet.has(item.id) || idSet.has(item.problemId)) {
          await updateDailyQueueItemDate(currentUser.uid, item.id, targetDateKey);
        }
      }
    } else {
      localStorage.setItem('algo_os_guest_queue', JSON.stringify(updated));
    }
  };

  // Handle scheduling a problem directly to a target date key
  const handleScheduleNewProblem = async (problemId: string, targetDateKey: string) => {
    const newItem: DailyQueueItem = {
      id: `dq-${targetDateKey}-${problemId}-${Date.now()}`,
      userId: currentUser?.uid || 'guest',
      problemId,
      dateKey: targetDateKey,
      status: 'pending',
      isRevision: false,
      isRescheduled: true,
      addedAt: Date.now(),
    };

    const updatedQueue = [...dailyQueue, newItem];
    setDailyQueue(updatedQueue);

    if (currentUser) {
      await saveDailyQueueItem(currentUser.uid, newItem);
    } else {
      localStorage.setItem('algo_os_guest_queue', JSON.stringify(updatedQueue));
    }
  };

  // Handle regenerating daily queue with strict topic filtering
  const handleRegenerateQueue = async () => {
    const todayKey = getLocalDateKey();
    const profile = userProfile || {
      uid: currentUser?.uid || 'guest',
      email: currentUser?.email || null,
      displayName: currentUser?.displayName || 'Guest Engineer',
      photoURL: null,
      dailyLimit: 3,
      targetInterviewLevel: 'Junior',
      selectedTopics: ['arrays', 'two_pointers', 'sliding_window', 'binary_search'],
      onboardingCompleted: true,
      createdAt: Date.now(),
    };

    // Preserve completed items OR items explicitly rescheduled to todayKey
    const preservedTodayItems = dailyQueue.filter(
      (item) => item.dateKey === todayKey && (item.status === 'completed' || item.isRescheduled)
    );

    // Items from other dates (past or future rescheduled)
    const otherDateItems = dailyQueue.filter(
      (item) => item.dateKey !== todayKey
    );

    const preservedQueue = [...otherDateItems, ...preservedTodayItems];

    // Remove pending uncompleted non-rescheduled items for today from Firestore
    const itemsToDelete = dailyQueue.filter(
      (item) => item.dateKey === todayKey && item.status !== 'completed' && !item.isRescheduled
    );
    if (currentUser) {
      for (const item of itemsToDelete) {
        await deleteDailyQueueItem(currentUser.uid, item.id);
      }
    }

    const catList = catalog.length > 0 ? catalog : await getGlobalProblemCatalog();
    setCatalog(catList);

    const generated = generateDailyQueue(
      todayKey,
      profile,
      catList,
      preservedQueue,
      revisionCards,
      solvingRecords,
      patternMasteries,
      reflections
    );

    const updatedFullQueue = [
      ...otherDateItems,
      ...generated,
    ];

    if (currentUser) {
      for (const item of generated) {
        await saveDailyQueueItem(currentUser.uid, item);
      }
    } else {
      localStorage.setItem('algo_os_guest_queue', JSON.stringify(updatedFullQueue));
    }
    setDailyQueue(updatedFullQueue);
  };

  // Handle updating selected practice topics directly from Dashboard
  const handleUpdateTopics = async (newTopics: string[]) => {
    const baseProfile = userProfile || {
      uid: currentUser?.uid || 'guest',
      email: currentUser?.email || null,
      displayName: currentUser?.displayName || 'Guest Engineer',
      photoURL: null,
      dailyLimit: 3,
      targetInterviewLevel: 'Junior' as const,
      selectedTopics: ['arrays', 'two_pointers', 'sliding_window', 'binary_search'],
      onboardingCompleted: true,
      createdAt: Date.now(),
    };

    const updatedProfile: UserProfile = {
      ...baseProfile,
      selectedTopics: newTopics,
    };
    setUserProfileState(updatedProfile);

    if (currentUser) {
      await setUserProfile(updatedProfile);
    } else {
      localStorage.setItem('algo_os_guest_profile', JSON.stringify(updatedProfile));
    }

    // Automatically regenerate queue for newly selected topics
    const todayKey = getLocalDateKey();
    const catList = catalog.length > 0 ? catalog : await getGlobalProblemCatalog();

    const otherDateItems = dailyQueue.filter((item) => item.dateKey !== todayKey);

    const preservedItems = dailyQueue.filter(
      (item) => item.status === 'completed' || item.dateKey !== todayKey
    );

    const itemsToDelete = dailyQueue.filter(
      (item) => item.status !== 'completed' && item.dateKey === todayKey
    );
    if (currentUser) {
      for (const item of itemsToDelete) {
        await deleteDailyQueueItem(currentUser.uid, item.id);
      }
    }

    const generated = generateDailyQueue(
      todayKey,
      updatedProfile,
      catList,
      preservedItems,
      revisionCards,
      solvingRecords,
      patternMasteries,
      reflections
    );

    const updatedFullQueue = [
      ...otherDateItems,
      ...generated,
    ];

    if (currentUser) {
      for (const item of generated) {
        await saveDailyQueueItem(currentUser.uid, item);
      }
    } else {
      localStorage.setItem('algo_os_guest_queue', JSON.stringify(updatedFullQueue));
    }
    setDailyQueue(updatedFullQueue);
  };

  const now = Date.now();
  const dueRevisions = revisionCards.filter(
    (c) => c.nextReviewAt <= now && c.status !== 'graduated'
  ).length;
  const completedQueueCount = dailyQueue.filter((i) => i.status === 'completed').length;
  const queueProgressText =
    dailyQueue.length > 0 ? `${completedQueueCount}/${dailyQueue.length}` : undefined;

  const handleThemeChange = async (mode: ThemeMode) => {
    localStorage.setItem('algo_os_theme', mode);
    if (userProfile) {
      const updated = { ...userProfile, theme: mode };
      setUserProfileState(updated);
      if (currentUser?.uid && currentUser.uid !== 'guest') {
        await setUserProfile(updated);
      } else {
        localStorage.setItem('algo_os_guest_profile', JSON.stringify(updated));
      }
    }
  };

  if (!currentUser && !isGuestEntered) {
    return (
      <ThemeProvider
        initialTheme={userProfile?.theme || 'system'}
        onThemeChange={handleThemeChange}
      >
        <OnboardingAuthScreen
          onAuthSuccess={async (uid, email, displayName) => {
            setIsGuestEntered(true);
            await loadUserData(uid, email, displayName);
          }}
          onContinueAsGuest={() => setIsGuestEntered(true)}
        />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider
      initialTheme={userProfile?.theme || 'system'}
      onThemeChange={handleThemeChange}
    >
      <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans antialiased selection:bg-slate-500/20 selection:text-slate-200 flex flex-col md:flex-row">
      <Sidebar
        userProfile={userProfile}
        gamification={gamification}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAuth={() => setIsAuthOpen(true)}
        onSignOut={handleSignOut}
        onOpenOnboarding={() => setIsOnboardingOpen(true)}
        dueRevisionsCount={dueRevisions}
        queueProgressText={queueProgressText}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      <div className={`flex-1 min-w-0 transition-all duration-300 ease-in-out flex flex-col min-h-screen ${
        isSidebarCollapsed ? 'md:pl-16' : 'md:pl-64'
      }`}>
        <main className="flex-1 min-w-0 pb-16">
          {activeTab === 'dashboard' && (
            <Dashboard
              userProfile={userProfile}
              dailyQueue={dailyQueue}
              revisionCards={revisionCards}
              catalog={catalog}
              patternMasteries={patternMasteries}
              gamification={gamification}
              solvingRecords={solvingRecords}
              reflections={reflections}
              onNavigateTab={setActiveTab}
              onSolveProblem={handleSolveProblem}
              onOpenOnboarding={() => setIsOnboardingOpen(true)}
              onUpdateTopics={handleUpdateTopics}
              onRegenerateQueue={handleRegenerateQueue}
              onRescheduleItem={handleRescheduleQueueItems}
              onOpenReflection={(problem) => setReflectionProblem(problem)}
            />
          )}

          {activeTab === 'daily-queue' && (
            <DailyQueueView
              userProfile={userProfile}
              dailyQueue={dailyQueue}
              catalog={catalog}
              onSolveProblem={handleSolveProblem}
              onOpenReflection={(problem) => setReflectionProblem(problem)}
              onRefreshQueue={handleRegenerateQueue}
              onRescheduleItem={handleRescheduleQueueItems}
            />
          )}

          {activeTab === 'calendar' && (
            <CalendarView
              userProfile={userProfile}
              dailyQueue={dailyQueue}
              catalog={catalog}
              revisionCards={revisionCards}
              onSolveProblem={handleSolveProblem}
              onOpenReflection={(problem) => setReflectionProblem(problem)}
              onRescheduleItem={handleRescheduleQueueItems}
              onScheduleNewProblem={handleScheduleNewProblem}
            />
          )}

          {activeTab === 'revision' && (
            <RevisionView
              revisionCards={revisionCards}
              catalog={catalog}
              reflections={reflections}
              onReviewOutcome={handleReviewOutcome}
              onAutoRescheduleOverdue={handleAutoRescheduleOverdue}
              onSolveProblem={handleSolveProblem}
              onOpenReflection={(problem) => setReflectionProblem(problem)}
            />
          )}

          {activeTab === 'catalog' && (
            <ProblemCatalogView
              catalog={catalog}
              onAddProblemUrl={handleAddProblemUrl}
              onSolveProblem={handleSolveProblem}
              onOpenReflection={(problem) => setReflectionProblem(problem)}
            />
          )}

          {activeTab === 'connectors' && (
            <PlatformConnectorsView
              userId={currentUser?.uid || ''}
              isAuthenticated={!!currentUser}
              connections={connections}
              onConnectPlatform={handleConnectPlatform}
              onSyncPlatform={handleSyncPlatform}
              onSimulateCompletionEvent={handleSimulateCompletionEvent}
              onOpenAuth={() => setIsAuthOpen(true)}
            />
          )}

          {activeTab === 'profile' && (
            <ProfileView
              userProfile={userProfile}
              connections={connections}
              gamification={gamification}
              solvedCount={solvingRecords.length}
              onSaveProfile={handleSaveOnboarding}
              onOpenAuth={() => setIsAuthOpen(true)}
              onSignOut={handleSignOut}
              onNavigateTab={setActiveTab}
              onOpenOnboarding={() => setIsOnboardingOpen(true)}
            />
          )}

          {activeTab === 'patterns' && (
            <PatternMasteryView patternMasteries={patternMasteries} />
          )}

          {activeTab === 'memory' && (
            <LearningMemoryView memories={memories} catalog={catalog} />
          )}

          {activeTab === 'mistakes' && (
            <MistakeJournalView
              mistakes={mistakes}
              catalog={catalog}
              onAddMistake={handleAddMistake}
            />
          )}

          {activeTab === 'coach' && (
            <AICoachView
              messages={coachMessages}
              userProfile={userProfile}
              memories={memories}
              mistakes={mistakes}
              masteries={patternMasteries}
              onSendMessage={handleSendAICoachMessage}
            />
          )}

          {activeTab === 'gamification' && (
            <GamificationView gamification={gamification} />
          )}

          {activeTab === 'settings' && (
            <SettingsView
              userProfile={userProfile}
              connections={connections}
              gamification={gamification}
              onSaveProfile={handleSaveOnboarding}
              onOpenAuth={() => setIsAuthOpen(true)}
              onSignOut={handleSignOut}
              onNavigateTab={setActiveTab}
              onOpenOnboarding={() => setIsOnboardingOpen(true)}
            />
          )}
        </main>
      </div>

      {/* Modals */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAuthSuccess={async (uid, email, displayName) => {
          await loadUserData(uid, email, displayName);
        }}
      />

      <OnboardingModal
        isOpen={isOnboardingOpen}
        userProfile={userProfile}
        onSave={handleSaveOnboarding}
        onClose={() => setIsOnboardingOpen(false)}
      />

      <ReflectionModal
        isOpen={!!reflectionProblem}
        problem={reflectionProblem}
        previousReflections={
          reflectionProblem
            ? reflections.filter((r) => r.problemId === reflectionProblem.id)
            : []
        }
        onClose={() => setReflectionProblem(null)}
        onSubmitReflection={handleSubmitReflection}
      />
    </div>
  </ThemeProvider>
);
}
