import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  getDocs,
  query,
  where,
  orderBy,
  deleteDoc,
  onSnapshot,
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { DEFAULT_PROBLEM_CATALOG } from '../data/defaultCatalog';
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
} from '../types';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.warn('Firestore Operation Notice: ', JSON.stringify(errInfo));
}

// User Profile
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const path = `users/${uid}`;
  try {
    const snap = await getDoc(doc(db, 'users', uid));
    if (!snap.exists()) return null;
    return snap.data() as UserProfile;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return null;
  }
}

export async function setUserProfile(profile: UserProfile): Promise<void> {
  const path = `users/${profile.uid}`;
  try {
    await setDoc(doc(db, 'users', profile.uid), profile, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// Platform Connections
export async function getPlatformConnections(uid: string): Promise<PlatformConnection[]> {
  const path = `users/${uid}/platformConnections`;
  try {
    const snap = await getDocs(collection(db, 'users', uid, 'platformConnections'));
    const list: PlatformConnection[] = [];
    snap.forEach((d) => list.push(d.data() as PlatformConnection));
    return list;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
}

export async function setPlatformConnection(
  uid: string,
  conn: PlatformConnection
): Promise<void> {
  const path = `users/${uid}/platformConnections/${conn.platform}`;
  try {
    await setDoc(doc(db, 'users', uid, 'platformConnections', conn.platform), conn, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// Unified Problem Catalog
const ALLOWED_PLATFORMS = new Set<string>([
  'LeetCode',
  'CodeChef',
  'Codeforces',
  'HackerRank',
  'GeeksforGeeks',
]);

export async function getGlobalProblemCatalog(): Promise<Problem[]> {
  const path = 'problems';
  try {
    const snap = await getDocs(collection(db, 'problems'));
    const firestoreList: Problem[] = [];
    
    // Process Firestore snapshot & delete any leftover problems from non-allowed platforms
    for (const d of snap.docs) {
      const prob = d.data() as Problem;
      if (prob.platform && ALLOWED_PLATFORMS.has(prob.platform)) {
        firestoreList.push(prob);
      } else {
        // Asynchronously delete disallowed platform problems from Firestore
        deleteDoc(doc(db, 'problems', d.id)).catch(() => {});
      }
    }

    const cleanDefaultCatalog = DEFAULT_PROBLEM_CATALOG.filter(
      (p) => p.platform && ALLOWED_PLATFORMS.has(p.platform)
    );

    const existingIds = new Set(firestoreList.map((p) => p.id));
    const missingDefaults = cleanDefaultCatalog.filter((p) => !existingIds.has(p.id));

    if (missingDefaults.length > 0) {
      // Seed missing defaults into Firestore asynchronously
      Promise.all(
        missingDefaults.map((p) =>
          setDoc(doc(db, 'problems', p.id), p, { merge: true }).catch(() => {})
        )
      );
    }

    const merged = [...firestoreList, ...missingDefaults];
    const finalCatalog = merged.filter((p) => p.platform && ALLOWED_PLATFORMS.has(p.platform));
    return finalCatalog.length > 0 ? finalCatalog : cleanDefaultCatalog;
  } catch (error) {
    console.warn('Could not load global problem catalog from Firestore, falling back to defaults:', error);
    return DEFAULT_PROBLEM_CATALOG.filter((p) => p.platform && ALLOWED_PLATFORMS.has(p.platform));
  }
}

export async function saveGlobalProblem(problem: Problem): Promise<void> {
  const path = `problems/${problem.id}`;
  try {
    await setDoc(doc(db, 'problems', problem.id), problem, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// Daily Practice Queue
export async function getDailyQueue(uid: string): Promise<DailyQueueItem[]> {
  const path = `users/${uid}/dailyQueue`;
  try {
    const snap = await getDocs(collection(db, 'users', uid, 'dailyQueue'));
    const list: DailyQueueItem[] = [];
    snap.forEach((d) => list.push(d.data() as DailyQueueItem));
    return list;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
}

export async function saveDailyQueueItem(uid: string, item: DailyQueueItem): Promise<void> {
  const path = `users/${uid}/dailyQueue/${item.id}`;
  try {
    await setDoc(doc(db, 'users', uid, 'dailyQueue', item.id), item, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function updateDailyQueueItemStatus(
  uid: string,
  itemId: string,
  status: 'pending' | 'completed' | 'carried_over'
): Promise<void> {
  const path = `users/${uid}/dailyQueue/${itemId}`;
  try {
    await updateDoc(doc(db, 'users', uid, 'dailyQueue', itemId), { status });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function updateDailyQueueItemDate(
  uid: string,
  itemId: string,
  dateKey: string
): Promise<void> {
  const path = `users/${uid}/dailyQueue/${itemId}`;
  try {
    await updateDoc(doc(db, 'users', uid, 'dailyQueue', itemId), { dateKey });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteDailyQueueItem(uid: string, itemId: string): Promise<void> {
  const path = `users/${uid}/dailyQueue/${itemId}`;
  try {
    await deleteDoc(doc(db, 'users', uid, 'dailyQueue', itemId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// Revision Engine Cards
export async function getRevisionCards(uid: string): Promise<RevisionCard[]> {
  const path = `users/${uid}/revisions`;
  try {
    const snap = await getDocs(collection(db, 'users', uid, 'revisions'));
    const list: RevisionCard[] = [];
    snap.forEach((d) => list.push(d.data() as RevisionCard));
    return list;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
}

export async function saveRevisionCard(uid: string, card: RevisionCard): Promise<void> {
  const path = `users/${uid}/revisions/${card.id}`;
  try {
    await setDoc(doc(db, 'users', uid, 'revisions', card.id), card, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// Reflections
export async function getReflections(uid: string): Promise<Reflection[]> {
  const path = `users/${uid}/reflections`;
  try {
    const snap = await getDocs(collection(db, 'users', uid, 'reflections'));
    const list: Reflection[] = [];
    snap.forEach((d) => list.push(d.data() as Reflection));
    return list;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
}

export async function saveReflection(uid: string, reflection: Reflection): Promise<void> {
  const path = `users/${uid}/reflections/${reflection.id}`;
  try {
    await setDoc(doc(db, 'users', uid, 'reflections', reflection.id), reflection, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// Solving Records
export async function getSolvingRecords(uid: string): Promise<SolvingRecord[]> {
  const path = `users/${uid}/solvings`;
  try {
    const snap = await getDocs(collection(db, 'users', uid, 'solvings'));
    const list: SolvingRecord[] = [];
    snap.forEach((d) => list.push(d.data() as SolvingRecord));
    return list;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
}

export async function saveSolvingRecord(uid: string, record: SolvingRecord): Promise<void> {
  const path = `users/${uid}/solvings/${record.id}`;
  try {
    await setDoc(doc(db, 'users', uid, 'solvings', record.id), record, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// Pattern Masteries
export async function getPatternMasteries(uid: string): Promise<PatternMastery[]> {
  const path = `users/${uid}/patternMasteries`;
  try {
    const snap = await getDocs(collection(db, 'users', uid, 'patternMasteries'));
    const list: PatternMastery[] = [];
    snap.forEach((d) => list.push(d.data() as PatternMastery));
    return list;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
}

export async function savePatternMastery(uid: string, mastery: PatternMastery): Promise<void> {
  const path = `users/${uid}/patternMasteries/${mastery.patternId}`;
  try {
    await setDoc(
      doc(db, 'users', uid, 'patternMasteries', mastery.patternId),
      mastery,
      { merge: true }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// Mistake Journal
export async function getMistakes(uid: string): Promise<MistakeEntry[]> {
  const path = `users/${uid}/mistakes`;
  try {
    const snap = await getDocs(collection(db, 'users', uid, 'mistakes'));
    const list: MistakeEntry[] = [];
    snap.forEach((d) => list.push(d.data() as MistakeEntry));
    return list;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
}

export async function saveMistake(uid: string, mistake: MistakeEntry): Promise<void> {
  const path = `users/${uid}/mistakes/${mistake.id}`;
  try {
    await setDoc(doc(db, 'users', uid, 'mistakes', mistake.id), mistake, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// Learning Memories
export async function getLearningMemories(uid: string): Promise<LearningMemory[]> {
  const path = `users/${uid}/memories`;
  try {
    const snap = await getDocs(collection(db, 'users', uid, 'memories'));
    const list: LearningMemory[] = [];
    snap.forEach((d) => list.push(d.data() as LearningMemory));
    return list;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
}

export async function saveLearningMemory(uid: string, memory: LearningMemory): Promise<void> {
  const path = `users/${uid}/memories/${memory.problemId}`;
  try {
    await setDoc(doc(db, 'users', uid, 'memories', memory.problemId), memory, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// AI Coach Messages
export async function getAICoachMessages(uid: string): Promise<AICoachMessage[]> {
  const path = `users/${uid}/coachMessages`;
  try {
    const snap = await getDocs(
      query(collection(db, 'users', uid, 'coachMessages'), orderBy('timestamp', 'asc'))
    );
    const list: AICoachMessage[] = [];
    snap.forEach((d) => list.push(d.data() as AICoachMessage));
    return list;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
}

export async function saveAICoachMessage(uid: string, msg: AICoachMessage): Promise<void> {
  const path = `users/${uid}/coachMessages/${msg.id}`;
  try {
    await setDoc(doc(db, 'users', uid, 'coachMessages', msg.id), msg, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// Gamification
export async function getUserGamification(uid: string): Promise<UserGamification | null> {
  const path = `users/${uid}/gamification/status`;
  try {
    const snap = await getDoc(doc(db, 'users', uid, 'gamification', 'status'));
    if (!snap.exists()) return null;
    return snap.data() as UserGamification;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return null;
  }
}

export async function setUserGamification(
  uid: string,
  data: UserGamification
): Promise<void> {
  const path = `users/${uid}/gamification/status`;
  try {
    await setDoc(doc(db, 'users', uid, 'gamification', 'status'), data, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

