import { Problem, Platform } from '../types';

/**
 * Strips leading problem numbering, trailing platform branding, and extra whitespace
 * Example: "124. Binary Tree Maximum Path Sum - LeetCode" -> "Binary Tree Maximum Path Sum"
 */
export function cleanProblemTitle(title: string | undefined | null): string {
  if (!title || typeof title !== 'string') return '';
  let cleaned = title.trim();

  // Strip leading problem numbers like "124. ", "124 - ", "[124] ", "#124 "
  cleaned = cleaned.replace(/^\s*(?:\[|\()?#?(?:No\.?)?\s*\d+[\.\-\:\)\s\]]+\s*/i, '');

  // Strip trailing platform annotations or suffixes
  cleaned = cleaned.replace(/\s*[-–—|]\s*(LeetCode|GeeksforGeeks|GFG|Codeforces|CodeChef|HackerRank|InterviewBit|Omega).*$/i, '');
  cleaned = cleaned.replace(/\s*\(?(?:DP\s*[-–—:]?\s*\d+|practice|editorial)\)?\s*$/i, '');

  return cleaned.trim();
}

/**
 * Normalizes title for comparison (lowercase, alphanumeric characters only, stripped problem numbers)
 */
export function normalizeTitleForComparison(title: string | undefined | null): string {
  if (!title) return '';
  const cleaned = cleanProblemTitle(title);
  return cleaned
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .trim();
}

/**
 * Canonicalizes problem URLs by removing trailing slashes, submission IDs, and query params
 */
export function canonicalizeProblemUrl(rawUrl: string | undefined | null): string {
  if (!rawUrl || typeof rawUrl !== 'string') return '';
  let url = rawUrl.trim();

  // Strip query parameters and hash
  url = url.split('?')[0].split('#')[0];

  // Strip submission paths or trailing actions (e.g., /submissions/12345/, /description/, /discuss/)
  url = url.replace(/\/submissions(?:\/\d+)?(?:\/)?$/i, '');
  url = url.replace(/\/(?:description|solutions|discuss|editorial|hints|stats)(?:\/)?$/i, '');

  // Ensure trailing slash is normalized
  url = url.replace(/\/+$/, '');

  return url;
}

/**
 * Extracts platform and slug from a problem URL
 */
export function extractPlatformAndSlug(url: string): { platform: Platform; slug: string; platformProblemId: string } {
  const canonical = canonicalizeProblemUrl(url);

  if (canonical.includes('leetcode.com')) {
    const match = canonical.match(/\/problems\/([^\/]+)/i);
    const slug = match ? match[1].toLowerCase() : '';
    return {
      platform: 'LeetCode',
      slug,
      platformProblemId: slug,
    };
  }

  if (canonical.includes('geeksforgeeks.org')) {
    const match = canonical.match(/\/problems\/([^\/]+)/i);
    const rawSlug = match ? match[1].toLowerCase() : '';
    // Strip trailing GFG hash/numbers e.g. kadanes-algorithm-1587115620
    const cleanSlug = rawSlug.replace(/-\d+(?:\/\d+)?$/, '');
    return {
      platform: 'GeeksforGeeks',
      slug: cleanSlug,
      platformProblemId: cleanSlug,
    };
  }

  if (canonical.includes('codeforces.com')) {
    const match = canonical.match(/\/problem(?:set)?\/(?:problem\/)?(\d+)\/([A-Za-z0-9]+)/i) ||
                  canonical.match(/\/contest\/(\d+)\/problem\/([A-Za-z0-9]+)/i);
    const slug = match ? `cf-${match[1]}-${match[2]}`.toLowerCase() : 'cf-problem';
    return {
      platform: 'Codeforces',
      slug,
      platformProblemId: match ? `${match[1]}${match[2]}` : slug,
    };
  }

  if (canonical.includes('codechef.com')) {
    const match = canonical.match(/\/problems\/([^\/]+)/i);
    const slug = match ? match[1].toLowerCase() : '';
    return {
      platform: 'CodeChef',
      slug,
      platformProblemId: slug.toUpperCase(),
    };
  }

  if (canonical.includes('hackerrank.com')) {
    const match = canonical.match(/\/challenges\/([^\/]+)/i);
    const slug = match ? match[1].toLowerCase() : '';
    return {
      platform: 'HackerRank',
      slug,
      platformProblemId: slug,
    };
  }

  return {
    platform: 'LeetCode',
    slug: (canonical.split('/').pop() || 'problem').toLowerCase(),
    platformProblemId: (canonical.split('/').pop() || 'problem').toLowerCase(),
  };
}

/**
 * Common known aliases across LeetCode, Striver A2Z DSA Sheet, and GeeksforGeeks
 */
const KNOWN_TITLE_ALIASES: Record<string, string[]> = {
  'binarytreemaximumpathsum': ['maximumpathsum', 'binarytreemaxpathsum', 'maxpathsum'],
  'maximumpathsum': ['binarytreemaximumpathsum', 'binarytreemaxpathsum', 'maxpathsum'],
  'kadanesalgorithm': ['maximumsubarraysum', 'maximumsubarray', 'kadanesalgorithm1587115620'],
  'missingnumberinarray': ['missingnumber', 'missingnumber1416'],
  'subarraywithgivensum': ['subarraywithgivensum1587115621', 'longestsubarraywithgivensum'],
  'minstack': ['implementminstack'],
  'topologicalsort': ['topologicalsortorkahnsalgorithm'],
  'longestincreasingsubsequence': ['longestincreasingsubsequencedp43', 'printlongestincreasingsubsequence'],
  'uniquepaths': ['griduniquepathsdpongridsdp8'],
  'coinchange2': ['coinchange2dp22', 'coinchangeii'],
};

/**
 * Smart matching algorithm to compare problem against catalog (both regular and Striver list)
 */
export function findMatchingProblem(
  query: {
    id?: string;
    title?: string;
    slug?: string;
    url?: string;
    platform?: string;
    platformProblemId?: string;
  },
  catalog: Problem[]
): Problem | null {
  if (!catalog || catalog.length === 0) return null;

  // 0. Match by exact ID
  if (query.id) {
    const idMatch = catalog.find((p) => p.id === query.id);
    if (idMatch) return idMatch;
  }

  const rawTitle = query.title || '';
  const cleanTitle = cleanProblemTitle(rawTitle);
  const normTitle = normalizeTitleForComparison(rawTitle);

  const rawUrl = query.url || '';
  const canonicalUrl = canonicalizeProblemUrl(rawUrl);

  const rawSlug = (query.slug || '').toLowerCase().trim();
  const slugFromUrl = rawUrl ? extractPlatformAndSlug(rawUrl).slug : '';
  const effectiveSlug = rawSlug || slugFromUrl;

  const platformLower = (query.platform || '').toLowerCase().trim();

  // 1. Match by Exact / Canonical URL
  if (canonicalUrl) {
    const urlMatch = catalog.find((p) => {
      if (!p.url) return false;
      const pCanon = canonicalizeProblemUrl(p.url);
      if (pCanon === canonicalUrl) return true;
      // If one url is substring of other (e.g. /problems/binary-tree-maximum-path-sum)
      if (
        pCanon &&
        canonicalUrl &&
        (pCanon.includes('/problems/') && canonicalUrl.includes('/problems/'))
      ) {
        const pSlug = extractPlatformAndSlug(pCanon).slug;
        const qSlug = extractPlatformAndSlug(canonicalUrl).slug;
        if (pSlug && qSlug && pSlug === qSlug) return true;
      }
      return false;
    });
    if (urlMatch) return urlMatch;
  }

  // 2. Match by exact ID or platformProblemId
  if (effectiveSlug) {
    const idMatch = catalog.find((p) => {
      const pId = p.id.toLowerCase();
      const pPlatformId = (p.platformProblemId || '').toLowerCase();
      if (pId === effectiveSlug || pPlatformId === effectiveSlug) return true;
      if (pId === `leetcode-${effectiveSlug}` || pId === `geeksforgeeks-${effectiveSlug}`) return true;
      if (pId === `prob-${effectiveSlug}` || pId === `prob-ext-${effectiveSlug}`) return true;
      return false;
    });
    if (idMatch) return idMatch;
  }

  // 3. Match by Normalized Title
  if (normTitle) {
    const titleMatch = catalog.find((p) => {
      const pNorm = normalizeTitleForComparison(p.title);
      if (pNorm === normTitle) return true;
      return false;
    });
    if (titleMatch) return titleMatch;
  }

  // 4. Match by Known Title Aliases
  if (normTitle) {
    const aliases = KNOWN_TITLE_ALIASES[normTitle] || [];
    for (const alias of aliases) {
      const aliasMatch = catalog.find((p) => normalizeTitleForComparison(p.title) === alias);
      if (aliasMatch) return aliasMatch;
    }
  }

  // 5. Match by Word Tokens (e.g. "Binary Tree Maximum Path Sum" matching "Binary Tree Maximum Path Sum" or "Maximum Path Sum" under same category)
  if (cleanTitle) {
    const titleWords = cleanTitle.toLowerCase().split(/\s+/).filter((w) => w.length > 2);
    if (titleWords.length >= 2) {
      const tokenMatch = catalog.find((p) => {
        if (platformLower && p.platform && p.platform.toLowerCase() !== platformLower) return false;
        const pClean = cleanProblemTitle(p.title).toLowerCase();
        const pWords = pClean.split(/\s+/).filter((w) => w.length > 2);
        if (pWords.length === 0) return false;

        // Check if all words of one title exist in the other
        const allQueryInP = titleWords.every((w) => pWords.includes(w));
        const allPInQuery = pWords.every((w) => titleWords.includes(w));
        if (allQueryInP || allPInQuery) return true;

        return false;
      });
      if (tokenMatch) return tokenMatch;
    }
  }

  return null;
}
