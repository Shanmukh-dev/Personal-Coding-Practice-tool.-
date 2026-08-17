import fs from 'fs';
import path from 'path';

// Types definition inline for CLI execution
export type Platform =
  | 'LeetCode'
  | 'CodeChef'
  | 'Codeforces'
  | 'HackerRank'
  | 'GeeksforGeeks';

export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export interface Problem {
  id: string;
  title: string;
  platform: Platform;
  platformProblemId: string;
  url: string;
  difficulty: Difficulty;
  tags: string[];
  dsaPatterns: string[];
  estimatedSolvingTimeMinutes: number;
  isPremium?: boolean;
}

// Comprehensive Pattern Mapper
export function inferDsaPatterns(tags: string[], title: string = ''): string[] {
  const combined = [...tags, title].join(' ').toLowerCase();
  const patterns = new Set<string>();

  if (combined.match(/two pointer|2 pointer|two-pointer/)) patterns.add('two_pointers');
  if (combined.match(/sliding window|subsegment/)) patterns.add('sliding_window');
  if (combined.match(/binary search|bsearch/)) patterns.add('binary_search');
  if (combined.match(/prefix sum|cumulative sum/)) patterns.add('prefix_sum');
  if (combined.match(/dp|dynamic programming|memoization|tabulation/)) patterns.add('dynamic_programming');
  if (combined.match(/graph|dfs|bfs|shortest path|dijkstra|disjoint|component/)) patterns.add('graphs');
  if (combined.match(/dfs|depth-first/)) patterns.add('dfs');
  if (combined.match(/bfs|breadth-first/)) patterns.add('bfs');
  if (combined.match(/tree|binary tree|lca|ancestor/)) patterns.add('trees');
  if (combined.match(/binary tree/)) patterns.add('binary_trees');
  if (combined.match(/bst|binary search tree/)) patterns.add('bst');
  if (combined.match(/heap|priority queue/)) patterns.add('heap');
  if (combined.match(/stack/)) patterns.add('stack');
  if (combined.match(/queue/)) patterns.add('queue');
  if (combined.match(/monotonic stack/)) patterns.add('monotonic_stack');
  if (combined.match(/monotonic queue/)) patterns.add('monotonic_queue');
  if (combined.match(/linked list|linked-list/)) patterns.add('linked_list');
  if (combined.match(/hash|map|dictionary|frequency|set/)) patterns.add('hashing');
  if (combined.match(/sort|sorting|quicksort|mergesort/)) patterns.add('sorting');
  if (combined.match(/greedy/)) patterns.add('greedy');
  if (combined.match(/trie|prefix tree/)) patterns.add('trie');
  if (combined.match(/dsu|union find|disjoint set/)) patterns.add('union_find');
  if (combined.match(/topological/)) patterns.add('topological_sort');
  if (combined.match(/backtrack|backtracking|permutation|subset|n-queen/)) patterns.add('backtracking');
  if (combined.match(/recursion|recursive/)) patterns.add('recursion');
  if (combined.match(/divide and conquer/)) patterns.add('divide_and_conquer');
  if (combined.match(/bit|xor|bitwise|bitmask/)) patterns.add('bit_manipulation');
  if (combined.match(/interval|meeting room|merge interval/)) patterns.add('interval_problems');
  if (combined.match(/math|number theory|prime|gcd|lcm|combinatorics|mod/)) patterns.add('math');
  if (combined.match(/geometry|convex hull|point/)) patterns.add('geometry');
  if (combined.match(/array|arrays|vector/)) patterns.add('arrays');
  if (combined.match(/string|strings|substring|palindrome/)) patterns.add('strings');

  if (patterns.size === 0) {
    patterns.add('arrays');
  }

  return Array.from(patterns);
}

// Estimator for solving time based on difficulty
function estimateTime(difficulty: Difficulty): number {
  switch (difficulty) {
    case 'Easy':
      return 15;
    case 'Medium':
      return 30;
    case 'Hard':
      return 45;
  }
}

// ----------------------------------------------------
// CURATED & DYNAMIC DATA SOURCES FOR PLATFORMS
// ----------------------------------------------------

// 1. LEETCODE PROBLEMS (Expanded Top 100+ Catalog)
const LEETCODE_SEED: Omit<Problem, 'id' | 'estimatedSolvingTimeMinutes'>[] = [
  {
    title: 'Two Sum',
    platform: 'LeetCode',
    platformProblemId: '1',
    url: 'https://leetcode.com/problems/two-sum/',
    difficulty: 'Easy',
    tags: ['Array', 'Hash Table'],
    dsaPatterns: ['arrays', 'hashing'],
  },
  {
    title: 'Add Two Numbers',
    platform: 'LeetCode',
    platformProblemId: '2',
    url: 'https://leetcode.com/problems/add-two-numbers/',
    difficulty: 'Medium',
    tags: ['Linked List', 'Math', 'Recursion'],
    dsaPatterns: ['linked_list', 'math', 'recursion'],
  },
  {
    title: 'Longest Substring Without Repeating Characters',
    platform: 'LeetCode',
    platformProblemId: '3',
    url: 'https://leetcode.com/problems/longest-substring-without-repeating-characters/',
    difficulty: 'Medium',
    tags: ['Hash Table', 'String', 'Sliding Window'],
    dsaPatterns: ['sliding_window', 'hashing', 'strings'],
  },
  {
    title: 'Median of Two Sorted Arrays',
    platform: 'LeetCode',
    platformProblemId: '4',
    url: 'https://leetcode.com/problems/median-of-two-sorted-arrays/',
    difficulty: 'Hard',
    tags: ['Array', 'Binary Search', 'Divide and Conquer'],
    dsaPatterns: ['binary_search', 'arrays', 'divide_and_conquer'],
  },
  {
    title: 'Longest Palindromic Substring',
    platform: 'LeetCode',
    platformProblemId: '5',
    url: 'https://leetcode.com/problems/longest-palindromic-substring/',
    difficulty: 'Medium',
    tags: ['String', 'Dynamic Programming'],
    dsaPatterns: ['strings', 'dynamic_programming', 'two_pointers'],
  },
  {
    title: 'Container With Most Water',
    platform: 'LeetCode',
    platformProblemId: '11',
    url: 'https://leetcode.com/problems/container-with-most-water/',
    difficulty: 'Medium',
    tags: ['Array', 'Two Pointers', 'Greedy'],
    dsaPatterns: ['two_pointers', 'greedy', 'arrays'],
  },
  {
    title: '3Sum',
    platform: 'LeetCode',
    platformProblemId: '15',
    url: 'https://leetcode.com/problems/3sum/',
    difficulty: 'Medium',
    tags: ['Array', 'Two Pointers', 'Sorting'],
    dsaPatterns: ['two_pointers', 'sorting', 'arrays'],
  },
  {
    title: 'Letter Combinations of a Phone Number',
    platform: 'LeetCode',
    platformProblemId: '17',
    url: 'https://leetcode.com/problems/letter-combinations-of-a-phone-number/',
    difficulty: 'Medium',
    tags: ['Hash Table', 'String', 'Backtracking'],
    dsaPatterns: ['backtracking', 'strings', 'hashing'],
  },
  {
    title: 'Valid Parentheses',
    platform: 'LeetCode',
    platformProblemId: '20',
    url: 'https://leetcode.com/problems/valid-parentheses/',
    difficulty: 'Easy',
    tags: ['String', 'Stack'],
    dsaPatterns: ['stack', 'strings'],
  },
  {
    title: 'Merge Two Sorted Lists',
    platform: 'LeetCode',
    platformProblemId: '21',
    url: 'https://leetcode.com/problems/merge-two-sorted-lists/',
    difficulty: 'Easy',
    tags: ['Linked List', 'Recursion'],
    dsaPatterns: ['linked_list', 'recursion'],
  },
  {
    title: 'Merge k Sorted Lists',
    platform: 'LeetCode',
    platformProblemId: '23',
    url: 'https://leetcode.com/problems/merge-k-sorted-lists/',
    difficulty: 'Hard',
    tags: ['Linked List', 'Divide and Conquer', 'Heap / Priority Queue'],
    dsaPatterns: ['heap', 'linked_list', 'divide_and_conquer'],
  },
  {
    title: 'Next Permutation',
    platform: 'LeetCode',
    platformProblemId: '31',
    url: 'https://leetcode.com/problems/next-permutation/',
    difficulty: 'Medium',
    tags: ['Array', 'Two Pointers'],
    dsaPatterns: ['arrays', 'two_pointers'],
  },
  {
    title: 'Search in Rotated Sorted Array',
    platform: 'LeetCode',
    platformProblemId: '33',
    url: 'https://leetcode.com/problems/search-in-rotated-sorted-array/',
    difficulty: 'Medium',
    tags: ['Array', 'Binary Search'],
    dsaPatterns: ['binary_search', 'arrays'],
  },
  {
    title: 'Combination Sum',
    platform: 'LeetCode',
    platformProblemId: '39',
    url: 'https://leetcode.com/problems/combination-sum/',
    difficulty: 'Medium',
    tags: ['Array', 'Backtracking'],
    dsaPatterns: ['backtracking', 'arrays'],
  },
  {
    title: 'Trapping Rain Water',
    platform: 'LeetCode',
    platformProblemId: '42',
    url: 'https://leetcode.com/problems/trapping-rain-water/',
    difficulty: 'Hard',
    tags: ['Array', 'Two Pointers', 'Dynamic Programming', 'Monotonic Stack'],
    dsaPatterns: ['two_pointers', 'monotonic_stack', 'dynamic_programming'],
  },
  {
    title: 'Permutations',
    platform: 'LeetCode',
    platformProblemId: '46',
    url: 'https://leetcode.com/problems/permutations/',
    difficulty: 'Medium',
    tags: ['Array', 'Backtracking'],
    dsaPatterns: ['backtracking', 'arrays'],
  },
  {
    title: 'Rotate Image',
    platform: 'LeetCode',
    platformProblemId: '48',
    url: 'https://leetcode.com/problems/rotate-image/',
    difficulty: 'Medium',
    tags: ['Array', 'Math', 'Matrix'],
    dsaPatterns: ['arrays', 'math'],
  },
  {
    title: 'Group Anagrams',
    platform: 'LeetCode',
    platformProblemId: '49',
    url: 'https://leetcode.com/problems/group-anagrams/',
    difficulty: 'Medium',
    tags: ['Array', 'Hash Table', 'String', 'Sorting'],
    dsaPatterns: ['hashing', 'strings', 'sorting'],
  },
  {
    title: 'N-Queens',
    platform: 'LeetCode',
    platformProblemId: '51',
    url: 'https://leetcode.com/problems/n-queens/',
    difficulty: 'Hard',
    tags: ['Array', 'Backtracking'],
    dsaPatterns: ['backtracking', 'arrays'],
  },
  {
    title: 'Maximum Subarray',
    platform: 'LeetCode',
    platformProblemId: '53',
    url: 'https://leetcode.com/problems/maximum-subarray/',
    difficulty: 'Medium',
    tags: ['Array', 'Divide and Conquer', 'Dynamic Programming'],
    dsaPatterns: ['arrays', 'dynamic_programming'],
  },
  {
    title: 'Jump Game',
    platform: 'LeetCode',
    platformProblemId: '55',
    url: 'https://leetcode.com/problems/jump-game/',
    difficulty: 'Medium',
    tags: ['Array', 'Dynamic Programming', 'Greedy'],
    dsaPatterns: ['greedy', 'dynamic_programming', 'arrays'],
  },
  {
    title: 'Merge Intervals',
    platform: 'LeetCode',
    platformProblemId: '56',
    url: 'https://leetcode.com/problems/merge-intervals/',
    difficulty: 'Medium',
    tags: ['Array', 'Sorting'],
    dsaPatterns: ['interval_problems', 'sorting', 'arrays'],
  },
  {
    title: 'Unique Paths',
    platform: 'LeetCode',
    platformProblemId: '62',
    url: 'https://leetcode.com/problems/unique-paths/',
    difficulty: 'Medium',
    tags: ['Math', 'Dynamic Programming', 'Combinatorics'],
    dsaPatterns: ['dynamic_programming', 'math'],
  },
  {
    title: 'Climbing Stairs',
    platform: 'LeetCode',
    platformProblemId: '70',
    url: 'https://leetcode.com/problems/climbing-stairs/',
    difficulty: 'Easy',
    tags: ['Math', 'Dynamic Programming', 'Memoization'],
    dsaPatterns: ['dynamic_programming', 'math'],
  },
  {
    title: 'Edit Distance',
    platform: 'LeetCode',
    platformProblemId: '72',
    url: 'https://leetcode.com/problems/edit-distance/',
    difficulty: 'Hard',
    tags: ['String', 'Dynamic Programming'],
    dsaPatterns: ['dynamic_programming', 'strings'],
  },
  {
    title: 'Sort Colors',
    platform: 'LeetCode',
    platformProblemId: '75',
    url: 'https://leetcode.com/problems/sort-colors/',
    difficulty: 'Medium',
    tags: ['Array', 'Two Pointers', 'Sorting'],
    dsaPatterns: ['two_pointers', 'sorting', 'arrays'],
  },
  {
    title: 'Minimum Window Substring',
    platform: 'LeetCode',
    platformProblemId: '76',
    url: 'https://leetcode.com/problems/minimum-window-substring/',
    difficulty: 'Hard',
    tags: ['Hash Table', 'String', 'Sliding Window'],
    dsaPatterns: ['sliding_window', 'hashing', 'strings'],
  },
  {
    title: 'Subsets',
    platform: 'LeetCode',
    platformProblemId: '78',
    url: 'https://leetcode.com/problems/subsets/',
    difficulty: 'Medium',
    tags: ['Array', 'Backtracking', 'Bit Manipulation'],
    dsaPatterns: ['backtracking', 'bit_manipulation', 'arrays'],
  },
  {
    title: 'Word Search',
    platform: 'LeetCode',
    platformProblemId: '79',
    url: 'https://leetcode.com/problems/word-search/',
    difficulty: 'Medium',
    tags: ['Array', 'Backtracking', 'Matrix'],
    dsaPatterns: ['backtracking', 'dfs'],
  },
  {
    title: 'Largest Rectangle in Histogram',
    platform: 'LeetCode',
    platformProblemId: '84',
    url: 'https://leetcode.com/problems/largest-rectangle-in-histogram/',
    difficulty: 'Hard',
    tags: ['Array', 'Stack', 'Monotonic Stack'],
    dsaPatterns: ['monotonic_stack', 'stack', 'arrays'],
  },
  {
    title: 'Validate Binary Search Tree',
    platform: 'LeetCode',
    platformProblemId: '98',
    url: 'https://leetcode.com/problems/validate-binary-search-tree/',
    difficulty: 'Medium',
    tags: ['Tree', 'Depth-First Search', 'Binary Search Tree', 'Binary Tree'],
    dsaPatterns: ['bst', 'trees', 'dfs'],
  },
  {
    title: 'Binary Tree Level Order Traversal',
    platform: 'LeetCode',
    platformProblemId: '102',
    url: 'https://leetcode.com/problems/binary-tree-level-order-traversal/',
    difficulty: 'Medium',
    tags: ['Tree', 'Breadth-First Search', 'Binary Tree'],
    dsaPatterns: ['trees', 'binary_trees', 'bfs'],
  },
  {
    title: 'Maximum Depth of Binary Tree',
    platform: 'LeetCode',
    platformProblemId: '104',
    url: 'https://leetcode.com/problems/maximum-depth-of-binary-tree/',
    difficulty: 'Easy',
    tags: ['Tree', 'Depth-First Search', 'Breadth-First Search', 'Binary Tree'],
    dsaPatterns: ['trees', 'binary_trees', 'dfs'],
  },
  {
    title: 'Construct Binary Tree from Preorder and Inorder Traversal',
    platform: 'LeetCode',
    platformProblemId: '105',
    url: 'https://leetcode.com/problems/construct-binary-tree-from-preorder-and-inorder-traversal/',
    difficulty: 'Medium',
    tags: ['Array', 'Hash Table', 'Divide and Conquer', 'Tree', 'Binary Tree'],
    dsaPatterns: ['trees', 'binary_trees', 'divide_and_conquer'],
  },
  {
    title: 'Best Time to Buy and Sell Stock',
    platform: 'LeetCode',
    platformProblemId: '121',
    url: 'https://leetcode.com/problems/best-time-to-buy-and-sell-stock/',
    difficulty: 'Easy',
    tags: ['Array', 'Dynamic Programming'],
    dsaPatterns: ['arrays', 'dynamic_programming'],
  },
  {
    title: 'Binary Tree Maximum Path Sum',
    platform: 'LeetCode',
    platformProblemId: '124',
    url: 'https://leetcode.com/problems/binary-tree-maximum-path-sum/',
    difficulty: 'Hard',
    tags: ['Dynamic Programming', 'Tree', 'Depth-First Search', 'Binary Tree'],
    dsaPatterns: ['trees', 'binary_trees', 'dfs', 'dynamic_programming'],
  },
  {
    title: 'Word Break',
    platform: 'LeetCode',
    platformProblemId: '139',
    url: 'https://leetcode.com/problems/word-break/',
    difficulty: 'Medium',
    tags: ['Hash Table', 'String', 'Dynamic Programming', 'Trie'],
    dsaPatterns: ['dynamic_programming', 'trie', 'hashing'],
  },
  {
    title: 'Linked List Cycle',
    platform: 'LeetCode',
    platformProblemId: '141',
    url: 'https://leetcode.com/problems/linked-list-cycle/',
    difficulty: 'Easy',
    tags: ['Hash Table', 'Linked List', 'Two Pointers'],
    dsaPatterns: ['linked_list', 'two_pointers'],
  },
  {
    title: 'LRU Cache',
    platform: 'LeetCode',
    platformProblemId: '146',
    url: 'https://leetcode.com/problems/lru-cache/',
    difficulty: 'Medium',
    tags: ['Hash Table', 'Linked List', 'Design', 'Doubly-Linked List'],
    dsaPatterns: ['hashing', 'linked_list'],
  },
  {
    title: 'Min Stack',
    platform: 'LeetCode',
    platformProblemId: '155',
    url: 'https://leetcode.com/problems/min-stack/',
    difficulty: 'Medium',
    tags: ['Stack', 'Design'],
    dsaPatterns: ['stack'],
  },
  {
    title: 'Number of Islands',
    platform: 'LeetCode',
    platformProblemId: '200',
    url: 'https://leetcode.com/problems/number-of-islands/',
    difficulty: 'Medium',
    tags: ['Array', 'Depth-First Search', 'Breadth-First Search', 'Union Find', 'Matrix'],
    dsaPatterns: ['dfs', 'bfs', 'graphs', 'union_find'],
  },
  {
    title: 'Reverse Linked List',
    platform: 'LeetCode',
    platformProblemId: '206',
    url: 'https://leetcode.com/problems/reverse-linked-list/',
    difficulty: 'Easy',
    tags: ['Linked List', 'Recursion'],
    dsaPatterns: ['linked_list', 'recursion'],
  },
  {
    title: 'Course Schedule',
    platform: 'LeetCode',
    platformProblemId: '207',
    url: 'https://leetcode.com/problems/course-schedule/',
    difficulty: 'Medium',
    tags: ['Depth-First Search', 'Breadth-First Search', 'Graph', 'Topological Sort'],
    dsaPatterns: ['graphs', 'topological_sort', 'bfs', 'dfs'],
  },
  {
    title: 'Implement Trie (Prefix Tree)',
    platform: 'LeetCode',
    platformProblemId: '208',
    url: 'https://leetcode.com/problems/implement-trie-prefix-tree/',
    difficulty: 'Medium',
    tags: ['Hash Table', 'String', 'Design', 'Trie'],
    dsaPatterns: ['trie', 'strings'],
  },
  {
    title: 'House Robber',
    platform: 'LeetCode',
    platformProblemId: '198',
    url: 'https://leetcode.com/problems/house-robber/',
    difficulty: 'Medium',
    tags: ['Array', 'Dynamic Programming'],
    dsaPatterns: ['dynamic_programming', 'arrays'],
  },
  {
    title: 'Kth Largest Element in an Array',
    platform: 'LeetCode',
    platformProblemId: '215',
    url: 'https://leetcode.com/problems/kth-largest-element-in-an-array/',
    difficulty: 'Medium',
    tags: ['Array', 'Divide and Conquer', 'Sorting', 'Heap / Priority Queue', 'Quickselect'],
    dsaPatterns: ['heap', 'sorting', 'arrays'],
  },
  {
    title: 'Lowest Common Ancestor of a Binary Tree',
    platform: 'LeetCode',
    platformProblemId: '236',
    url: 'https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-tree/',
    difficulty: 'Medium',
    tags: ['Tree', 'Depth-First Search', 'Binary Tree'],
    dsaPatterns: ['binary_trees', 'trees', 'dfs'],
  },
  {
    title: 'Product of Array Except Self',
    platform: 'LeetCode',
    platformProblemId: '238',
    url: 'https://leetcode.com/problems/product-of-array-except-self/',
    difficulty: 'Medium',
    tags: ['Array', 'Prefix Sum'],
    dsaPatterns: ['prefix_sum', 'arrays'],
  },
  {
    title: 'Meeting Rooms II',
    platform: 'LeetCode',
    platformProblemId: '253',
    url: 'https://leetcode.com/problems/meeting-rooms-ii/',
    difficulty: 'Medium',
    tags: ['Array', 'Two Pointers', 'Greedy', 'Sorting', 'Heap / Priority Queue'],
    dsaPatterns: ['interval_problems', 'heap', 'sorting'],
  },
  {
    title: 'Find Median from Data Stream',
    platform: 'LeetCode',
    platformProblemId: '295',
    url: 'https://leetcode.com/problems/find-median-from-data-stream/',
    difficulty: 'Hard',
    tags: ['Two Pointers', 'Design', 'Sorting', 'Heap / Priority Queue', 'Data Stream'],
    dsaPatterns: ['heap', 'sorting'],
  },
  {
    title: 'Longest Increasing Subsequence',
    platform: 'LeetCode',
    platformProblemId: '300',
    url: 'https://leetcode.com/problems/longest-increasing-subsequence/',
    difficulty: 'Medium',
    tags: ['Array', 'Binary Search', 'Dynamic Programming'],
    dsaPatterns: ['dynamic_programming', 'binary_search', 'arrays'],
  },
  {
    title: 'Coin Change',
    platform: 'LeetCode',
    platformProblemId: '322',
    url: 'https://leetcode.com/problems/coin-change/',
    difficulty: 'Medium',
    tags: ['Array', 'Dynamic Programming', 'Breadth-First Search'],
    dsaPatterns: ['dynamic_programming', 'bfs'],
  },
  {
    title: 'Top K Frequent Elements',
    platform: 'LeetCode',
    platformProblemId: '347',
    url: 'https://leetcode.com/problems/top-k-frequent-elements/',
    difficulty: 'Medium',
    tags: ['Array', 'Hash Table', 'Divide and Conquer', 'Sorting', 'Heap / Priority Queue', 'Bucket Sort'],
    dsaPatterns: ['heap', 'hashing', 'arrays'],
  },
  {
    title: 'Pacific Atlantic Water Flow',
    platform: 'LeetCode',
    platformProblemId: '417',
    url: 'https://leetcode.com/problems/pacific-atlantic-water-flow/',
    difficulty: 'Medium',
    tags: ['Array', 'Depth-First Search', 'Breadth-First Search', 'Matrix'],
    dsaPatterns: ['dfs', 'bfs', 'graphs'],
  },
  {
    title: 'Target Sum',
    platform: 'LeetCode',
    platformProblemId: '494',
    url: 'https://leetcode.com/problems/target-sum/',
    difficulty: 'Medium',
    tags: ['Array', 'Dynamic Programming', 'Backtracking'],
    dsaPatterns: ['dynamic_programming', 'backtracking'],
  },
  {
    title: 'Daily Temperatures',
    platform: 'LeetCode',
    platformProblemId: '739',
    url: 'https://leetcode.com/problems/daily-temperatures/',
    difficulty: 'Medium',
    tags: ['Array', 'Stack', 'Monotonic Stack'],
    dsaPatterns: ['monotonic_stack', 'stack', 'arrays'],
  },
  {
    title: 'Subarray Sum Equals K',
    platform: 'LeetCode',
    platformProblemId: '560',
    url: 'https://leetcode.com/problems/subarray-sum-equals-k/',
    difficulty: 'Medium',
    tags: ['Array', 'Hash Table', 'Prefix Sum'],
    dsaPatterns: ['prefix_sum', 'hashing', 'arrays'],
  },
  {
    title: 'Binary Search',
    platform: 'LeetCode',
    platformProblemId: '704',
    url: 'https://leetcode.com/problems/binary-search/',
    difficulty: 'Easy',
    tags: ['Array', 'Binary Search'],
    dsaPatterns: ['binary_search', 'arrays'],
  },
  {
    title: 'Cheapest Flights Within K Stops',
    platform: 'LeetCode',
    platformProblemId: '787',
    url: 'https://leetcode.com/problems/cheapest-flights-within-k-stops/',
    difficulty: 'Medium',
    tags: ['Dynamic Programming', 'Depth-First Search', 'Breadth-First Search', 'Graph', 'Heap'],
    dsaPatterns: ['graphs', 'bfs', 'dynamic_programming'],
  },
];

// 2. HACKERRANK PROBLEMS (Expanded Catalog across domains)
const HACKERRANK_SEED: Omit<Problem, 'id' | 'estimatedSolvingTimeMinutes'>[] = [
  {
    title: 'Solve Me First',
    platform: 'HackerRank',
    platformProblemId: 'solve-me-first',
    url: 'https://www.hackerrank.com/challenges/solve-me-first/problem',
    difficulty: 'Easy',
    tags: ['warmup', 'math'],
    dsaPatterns: ['math'],
  },
  {
    title: 'Simple Array Sum',
    platform: 'HackerRank',
    platformProblemId: 'simple-array-sum',
    url: 'https://www.hackerrank.com/challenges/simple-array-sum/problem',
    difficulty: 'Easy',
    tags: ['arrays', 'warmup'],
    dsaPatterns: ['arrays'],
  },
  {
    title: 'Compare the Triplets',
    platform: 'HackerRank',
    platformProblemId: 'compare-the-triplets',
    url: 'https://www.hackerrank.com/challenges/compare-the-triplets/problem',
    difficulty: 'Easy',
    tags: ['arrays', 'implementation'],
    dsaPatterns: ['arrays'],
  },
  {
    title: 'A Very Big Sum',
    platform: 'HackerRank',
    platformProblemId: 'a-very-big-sum',
    url: 'https://www.hackerrank.com/challenges/a-very-big-sum/problem',
    difficulty: 'Easy',
    tags: ['warmup', 'math'],
    dsaPatterns: ['math'],
  },
  {
    title: 'Diagonal Difference',
    platform: 'HackerRank',
    platformProblemId: 'diagonal-difference',
    url: 'https://www.hackerrank.com/challenges/diagonal-difference/problem',
    difficulty: 'Easy',
    tags: ['arrays', 'matrix'],
    dsaPatterns: ['arrays', 'math'],
  },
  {
    title: 'Plus Minus',
    platform: 'HackerRank',
    platformProblemId: 'plus-minus',
    url: 'https://www.hackerrank.com/challenges/plus-minus/problem',
    difficulty: 'Easy',
    tags: ['warmup', 'arrays'],
    dsaPatterns: ['arrays'],
  },
  {
    title: 'Staircase',
    platform: 'HackerRank',
    platformProblemId: 'staircase',
    url: 'https://www.hackerrank.com/challenges/staircase/problem',
    difficulty: 'Easy',
    tags: ['warmup', 'strings'],
    dsaPatterns: ['strings'],
  },
  {
    title: 'Mini-Max Sum',
    platform: 'HackerRank',
    platformProblemId: 'mini-max-sum',
    url: 'https://www.hackerrank.com/challenges/mini-max-sum/problem',
    difficulty: 'Easy',
    tags: ['warmup', 'sorting'],
    dsaPatterns: ['sorting', 'arrays'],
  },
  {
    title: 'Birthday Cake Candles',
    platform: 'HackerRank',
    platformProblemId: 'birthday-cake-candles',
    url: 'https://www.hackerrank.com/challenges/birthday-cake-candles/problem',
    difficulty: 'Easy',
    tags: ['warmup', 'arrays'],
    dsaPatterns: ['arrays'],
  },
  {
    title: 'Time Conversion',
    platform: 'HackerRank',
    platformProblemId: 'time-conversion',
    url: 'https://www.hackerrank.com/challenges/time-conversion/problem',
    difficulty: 'Easy',
    tags: ['strings', 'warmup'],
    dsaPatterns: ['strings'],
  },
  {
    title: 'Grading Students',
    platform: 'HackerRank',
    platformProblemId: 'grading',
    url: 'https://www.hackerrank.com/challenges/grading/problem',
    difficulty: 'Easy',
    tags: ['implementation', 'math'],
    dsaPatterns: ['math'],
  },
  {
    title: 'Apple and Orange',
    platform: 'HackerRank',
    platformProblemId: 'apple-and-orange',
    url: 'https://www.hackerrank.com/challenges/apple-and-orange/problem',
    difficulty: 'Easy',
    tags: ['implementation'],
    dsaPatterns: ['arrays'],
  },
  {
    title: 'Subarray Division',
    platform: 'HackerRank',
    platformProblemId: 'the-birthday-bar',
    url: 'https://www.hackerrank.com/challenges/the-birthday-bar/problem',
    difficulty: 'Easy',
    tags: ['sliding window', 'arrays'],
    dsaPatterns: ['sliding_window', 'arrays'],
  },
  {
    title: 'Divisible Sum Pairs',
    platform: 'HackerRank',
    platformProblemId: 'divisible-sum-pairs',
    url: 'https://www.hackerrank.com/challenges/divisible-sum-pairs/problem',
    difficulty: 'Easy',
    tags: ['arrays', 'math'],
    dsaPatterns: ['arrays', 'math'],
  },
  {
    title: 'Sherlock and Anagrams',
    platform: 'HackerRank',
    platformProblemId: 'sherlock-and-anagrams',
    url: 'https://www.hackerrank.com/challenges/sherlock-and-anagrams/problem',
    difficulty: 'Medium',
    tags: ['dictionaries', 'hashmaps', 'strings'],
    dsaPatterns: ['hashing', 'strings'],
  },
  {
    title: 'Array Manipulation',
    platform: 'HackerRank',
    platformProblemId: 'crush',
    url: 'https://www.hackerrank.com/challenges/crush/problem',
    difficulty: 'Hard',
    tags: ['prefix sum', 'arrays'],
    dsaPatterns: ['prefix_sum', 'arrays'],
  },
  {
    title: 'Contacts',
    platform: 'HackerRank',
    platformProblemId: 'contacts',
    url: 'https://www.hackerrank.com/challenges/contacts/problem',
    difficulty: 'Medium',
    tags: ['trie', 'data structures'],
    dsaPatterns: ['trie', 'strings'],
  },
  {
    title: 'Swap Nodes [Algo]',
    platform: 'HackerRank',
    platformProblemId: 'swap-nodes-algo',
    url: 'https://www.hackerrank.com/challenges/swap-nodes-algo/problem',
    difficulty: 'Medium',
    tags: ['trees', 'bfs', 'dfs'],
    dsaPatterns: ['trees', 'bfs', 'dfs'],
  },
  {
    title: 'Merge Sort: Counting Inversions',
    platform: 'HackerRank',
    platformProblemId: 'ctci-merge-sort',
    url: 'https://www.hackerrank.com/challenges/ctci-merge-sort/problem',
    difficulty: 'Hard',
    tags: ['divide and conquer', 'sorting'],
    dsaPatterns: ['divide_and_conquer', 'sorting'],
  },
  {
    title: 'Recursive Digit Sum',
    platform: 'HackerRank',
    platformProblemId: 'recursive-digit-sum',
    url: 'https://www.hackerrank.com/challenges/recursive-digit-sum/problem',
    difficulty: 'Medium',
    tags: ['recursion', 'math'],
    dsaPatterns: ['recursion', 'math'],
  },
];

// 3. CODECHEF PROBLEMS (Expanded Catalog across Starters, CookOff, Long Challenges)
const CODECHEF_SEED: Omit<Problem, 'id' | 'estimatedSolvingTimeMinutes'>[] = [
  {
    title: 'Chef and Brain Speed',
    platform: 'CodeChef',
    platformProblemId: 'BRAINSPEED',
    url: 'https://www.codechef.com/problems/BRAINSPEED',
    difficulty: 'Easy',
    tags: ['basic math'],
    dsaPatterns: ['math'],
  },
  {
    title: 'Easy Pronunciation',
    platform: 'CodeChef',
    platformProblemId: 'EZSPEAK',
    url: 'https://www.codechef.com/problems/EZSPEAK',
    difficulty: 'Easy',
    tags: ['strings', 'arrays'],
    dsaPatterns: ['strings', 'arrays'],
  },
  {
    title: 'Small Factorials',
    platform: 'CodeChef',
    platformProblemId: 'FCTRL2',
    url: 'https://www.codechef.com/problems/FCTRL2',
    difficulty: 'Easy',
    tags: ['math', 'big integer'],
    dsaPatterns: ['math', 'recursion'],
  },
  {
    title: 'Coin Flip',
    platform: 'CodeChef',
    platformProblemId: 'CONFLIP',
    url: 'https://www.codechef.com/problems/CONFLIP',
    difficulty: 'Easy',
    tags: ['math', 'greedy'],
    dsaPatterns: ['math', 'greedy'],
  },
  {
    title: 'Chef and Reversing',
    platform: 'CodeChef',
    platformProblemId: 'REVERSE',
    url: 'https://www.codechef.com/problems/REVERSE',
    difficulty: 'Medium',
    tags: ['graphs', 'bfs', 'shortest path'],
    dsaPatterns: ['graphs', 'bfs'],
  },
  {
    title: 'Atm',
    platform: 'CodeChef',
    platformProblemId: 'HS08TEST',
    url: 'https://www.codechef.com/problems/HS08TEST',
    difficulty: 'Easy',
    tags: ['basic math'],
    dsaPatterns: ['math'],
  },
  {
    title: 'Enormous Input Test',
    platform: 'CodeChef',
    platformProblemId: 'INTEST',
    url: 'https://www.codechef.com/problems/INTEST',
    difficulty: 'Easy',
    tags: ['io', 'basic math'],
    dsaPatterns: ['math'],
  },
  {
    title: 'Turbo Sort',
    platform: 'CodeChef',
    platformProblemId: 'TSORT',
    url: 'https://www.codechef.com/problems/TSORT',
    difficulty: 'Easy',
    tags: ['sorting'],
    dsaPatterns: ['sorting'],
  },
  {
    title: 'Lapindromes',
    platform: 'CodeChef',
    platformProblemId: 'LAPIN',
    url: 'https://www.codechef.com/problems/LAPIN',
    difficulty: 'Easy',
    tags: ['strings', 'hashing'],
    dsaPatterns: ['strings', 'hashing'],
  },
  {
    title: 'Uncle Johny',
    platform: 'CodeChef',
    platformProblemId: 'JOHNY',
    url: 'https://www.codechef.com/problems/JOHNY',
    difficulty: 'Easy',
    tags: ['sorting', 'binary search'],
    dsaPatterns: ['sorting', 'binary_search'],
  },
  {
    title: 'Carvans',
    platform: 'CodeChef',
    platformProblemId: 'CARVANS',
    url: 'https://www.codechef.com/problems/CARVANS',
    difficulty: 'Easy',
    tags: ['arrays', 'greedy'],
    dsaPatterns: ['arrays', 'greedy'],
  },
  {
    title: 'Count Subarrays',
    platform: 'CodeChef',
    platformProblemId: 'SUBINC',
    url: 'https://www.codechef.com/problems/SUBINC',
    difficulty: 'Easy',
    tags: ['dynamic programming', 'arrays'],
    dsaPatterns: ['dynamic_programming', 'arrays'],
  },
  {
    title: 'Chef and Stock Prices',
    platform: 'CodeChef',
    platformProblemId: 'CSTOCK',
    url: 'https://www.codechef.com/problems/CSTOCK',
    difficulty: 'Easy',
    tags: ['math'],
    dsaPatterns: ['math'],
  },
  {
    title: 'Fire Escape Routes',
    platform: 'CodeChef',
    platformProblemId: 'FIRESC',
    url: 'https://www.codechef.com/problems/FIRESC',
    difficulty: 'Medium',
    tags: ['graphs', 'dfs', 'union find'],
    dsaPatterns: ['graphs', 'dfs', 'union_find'],
  },
  {
    title: 'Sheokand and Number',
    platform: 'CodeChef',
    platformProblemId: 'SHKNUM',
    url: 'https://www.codechef.com/problems/SHKNUM',
    difficulty: 'Medium',
    tags: ['bit manipulation', 'math'],
    dsaPatterns: ['bit_manipulation', 'math'],
  },
];

// 4. CODEFORCES PROBLEMS LIVE FETCH & SEED
async function fetchCodeforcesProblemset(): Promise<Omit<Problem, 'id' | 'estimatedSolvingTimeMinutes'>[]> {
  try {
    console.log('Fetching live problemset from Codeforces API...');
    const response = await fetch('https://codeforces.com/api/problemset.problems');
    if (!response.ok) {
      throw new Error(`Codeforces API HTTP ${response.status}`);
    }

    const data: any = await response.json();
    if (data.status === 'OK' && Array.isArray(data.result?.problems)) {
      const rawProblems: any[] = data.result.problems;
      console.log(`Received ${rawProblems.length} problems from Codeforces API. Parsing top selections...`);

      // Filter and map top 100 problems sorted by contestId descending
      const selected = rawProblems
        .filter((p) => p.contestId && p.index && p.name)
        .slice(0, 150)
        .map((p) => {
          let difficulty: Difficulty = 'Easy';
          if (p.rating) {
            if (p.rating < 1300) difficulty = 'Easy';
            else if (p.rating <= 1800) difficulty = 'Medium';
            else difficulty = 'Hard';
          } else {
            difficulty = p.index.startsWith('A') || p.index.startsWith('B') ? 'Easy' : 'Medium';
          }

          const tags = Array.isArray(p.tags) ? p.tags : ['implementation'];
          const patterns = inferDsaPatterns(tags, p.name);

          return {
            title: p.name,
            platform: 'Codeforces' as Platform,
            platformProblemId: `${p.contestId}${p.index}`,
            url: `https://codeforces.com/problemset/problem/${p.contestId}/${p.index}`,
            difficulty,
            tags,
            dsaPatterns: patterns,
          };
        });

      return selected;
    }
  } catch (err: any) {
    console.warn('Failed to fetch live Codeforces API, using curated seed fallback:', err.message);
  }

  // Fallback seed
  return [
    {
      title: 'Watermelon',
      platform: 'Codeforces',
      platformProblemId: '4A',
      url: 'https://codeforces.com/problemset/problem/4/A',
      difficulty: 'Easy',
      tags: ['brute force', 'math'],
      dsaPatterns: ['math'],
    },
    {
      title: 'Way Too Long Words',
      platform: 'Codeforces',
      platformProblemId: '71A',
      url: 'https://codeforces.com/problemset/problem/71/A',
      difficulty: 'Easy',
      tags: ['strings'],
      dsaPatterns: ['strings'],
    },
    {
      title: 'Theatre Square',
      platform: 'Codeforces',
      platformProblemId: '1A',
      url: 'https://codeforces.com/problemset/problem/1/A',
      difficulty: 'Easy',
      tags: ['math'],
      dsaPatterns: ['math'],
    },
    {
      title: 'Next Round',
      platform: 'Codeforces',
      platformProblemId: '158A',
      url: 'https://codeforces.com/problemset/problem/158/A',
      difficulty: 'Easy',
      tags: ['special problem', 'implementation'],
      dsaPatterns: ['arrays'],
    },
    {
      title: 'Registration System',
      platform: 'Codeforces',
      platformProblemId: '4C',
      url: 'https://codeforces.com/problemset/problem/4/C',
      difficulty: 'Medium',
      tags: ['data structures', 'hashing', 'implementation'],
      dsaPatterns: ['hashing', 'strings'],
    },
    {
      title: 'Cut Ribbon',
      platform: 'Codeforces',
      platformProblemId: '189A',
      url: 'https://codeforces.com/problemset/problem/189/A',
      difficulty: 'Medium',
      tags: ['brute force', 'dp'],
      dsaPatterns: ['dynamic_programming'],
    },
    {
      title: 'K-th Not Divisible by n',
      platform: 'Codeforces',
      platformProblemId: '1352C',
      url: 'https://codeforces.com/problemset/problem/1352/C',
      difficulty: 'Medium',
      tags: ['binary search', 'math'],
      dsaPatterns: ['binary_search', 'math'],
    },
    {
      title: 'Boring Apartments',
      platform: 'Codeforces',
      platformProblemId: '1433A',
      url: 'https://codeforces.com/problemset/problem/1433/A',
      difficulty: 'Easy',
      tags: ['math', 'implementation'],
      dsaPatterns: ['math'],
    },
    {
      title: 'Given Length and Sum of Digits...',
      platform: 'Codeforces',
      platformProblemId: '489C',
      url: 'https://codeforces.com/problemset/problem/489/C',
      difficulty: 'Medium',
      tags: ['dp', 'greedy'],
      dsaPatterns: ['greedy', 'dynamic_programming'],
    },
  ];
}

// 5. GEEKSFORGEEKS PROBLEMS SEED
const GEEKSFORGEEKS_SEED: Omit<Problem, 'id' | 'estimatedSolvingTimeMinutes'>[] = [
  {
    title: 'Subarray with Given Sum',
    platform: 'GeeksforGeeks',
    platformProblemId: 'gfg-subarray-with-given-sum',
    url: 'https://www.geeksforgeeks.org/problems/subarray-with-given-sum-1587115621/1',
    difficulty: 'Easy',
    tags: ['arrays', 'sliding window', 'two pointers'],
    dsaPatterns: ['arrays', 'sliding_window', 'two_pointers'],
  },
  {
    title: 'Missing Number in Array',
    platform: 'GeeksforGeeks',
    platformProblemId: 'gfg-missing-number-in-array',
    url: 'https://www.geeksforgeeks.org/problems/missing-number-in-array1416/1',
    difficulty: 'Easy',
    tags: ['arrays', 'math', 'bit manipulation'],
    dsaPatterns: ['arrays', 'math', 'bit_manipulation'],
  },
  {
    title: 'Kadane\'s Algorithm',
    platform: 'GeeksforGeeks',
    platformProblemId: 'gfg-kadanes-algorithm',
    url: 'https://www.geeksforgeeks.org/problems/kadanes-algorithm-1587115620/1',
    difficulty: 'Medium',
    tags: ['arrays', 'dynamic programming'],
    dsaPatterns: ['arrays', 'dynamic_programming'],
  },
  {
    title: 'Parenthesis Checker',
    platform: 'GeeksforGeeks',
    platformProblemId: 'gfg-parenthesis-checker',
    url: 'https://www.geeksforgeeks.org/problems/parenthesis-checker2744/1',
    difficulty: 'Easy',
    tags: ['stack', 'strings'],
    dsaPatterns: ['stack', 'strings'],
  },
  {
    title: 'Detect Loop in Linked List',
    platform: 'GeeksforGeeks',
    platformProblemId: 'gfg-detect-loop-in-linked-list',
    url: 'https://www.geeksforgeeks.org/problems/detect-loop-in-linked-list/1',
    difficulty: 'Easy',
    tags: ['linked list', 'two pointers'],
    dsaPatterns: ['linked_list', 'two_pointers'],
  },
  {
    title: 'Topological Sort',
    platform: 'GeeksforGeeks',
    platformProblemId: 'gfg-topological-sort',
    url: 'https://www.geeksforgeeks.org/problems/topological-sort/1',
    difficulty: 'Medium',
    tags: ['graphs', 'dfs', 'bfs'],
    dsaPatterns: ['graphs', 'topological_sort', 'dfs', 'bfs'],
  },
  {
    title: '0 - 1 Knapsack Problem',
    platform: 'GeeksforGeeks',
    platformProblemId: 'gfg-0-1-knapsack-problem',
    url: 'https://www.geeksforgeeks.org/problems/0-1-knapsack-problem0917/1',
    difficulty: 'Medium',
    tags: ['dynamic programming'],
    dsaPatterns: ['dynamic_programming'],
  },
  {
    title: 'Kth Smallest Element',
    platform: 'GeeksforGeeks',
    platformProblemId: 'gfg-kth-smallest-element',
    url: 'https://www.geeksforgeeks.org/problems/kth-smallest-element5635/1',
    difficulty: 'Medium',
    tags: ['heap', 'sorting', 'arrays'],
    dsaPatterns: ['heap', 'sorting', 'arrays'],
  },
  {
    title: 'Level Order Traversal',
    platform: 'GeeksforGeeks',
    platformProblemId: 'gfg-level-order-traversal',
    url: 'https://www.geeksforgeeks.org/problems/level-order-traversal/1',
    difficulty: 'Easy',
    tags: ['trees', 'bfs'],
    dsaPatterns: ['trees', 'bfs'],
  },
  {
    title: 'Minimum Platforms',
    platform: 'GeeksforGeeks',
    platformProblemId: 'gfg-minimum-platforms',
    url: 'https://www.geeksforgeeks.org/problems/minimum-platforms-1587115620/1',
    difficulty: 'Medium',
    tags: ['sorting', 'greedy', 'arrays'],
    dsaPatterns: ['sorting', 'greedy', 'interval_problems'],
  },
  {
    title: 'Word Break',
    platform: 'GeeksforGeeks',
    platformProblemId: 'gfg-word-break',
    url: 'https://www.geeksforgeeks.org/problems/word-break1352/1',
    difficulty: 'Medium',
    tags: ['trie', 'dynamic programming', 'strings'],
    dsaPatterns: ['trie', 'dynamic_programming', 'strings'],
  },
  {
    title: 'Dijkstra Algorithm',
    platform: 'GeeksforGeeks',
    platformProblemId: 'gfg-dijkstra-algorithm',
    url: 'https://www.geeksforgeeks.org/problems/implementing-dijkstra-set-1-adjacency-matrix/1',
    difficulty: 'Medium',
    tags: ['graphs', 'heap', 'greedy'],
    dsaPatterns: ['graphs', 'heap', 'greedy'],
  },
  {
    title: 'Disjoint Set (Union-Find)',
    platform: 'GeeksforGeeks',
    platformProblemId: 'gfg-disjoint-set-union-find',
    url: 'https://www.geeksforgeeks.org/problems/disjoint-set-union-find/1',
    difficulty: 'Easy',
    tags: ['graphs', 'union find'],
    dsaPatterns: ['graphs', 'union_find'],
  },
  {
    title: 'Longest Common Subsequence',
    platform: 'GeeksforGeeks',
    platformProblemId: 'gfg-longest-common-subsequence',
    url: 'https://www.geeksforgeeks.org/problems/longest-common-subsequence-1587115620/1',
    difficulty: 'Medium',
    tags: ['dynamic programming', 'strings'],
    dsaPatterns: ['dynamic_programming', 'strings'],
  },
  {
    title: 'Median of BST',
    platform: 'GeeksforGeeks',
    platformProblemId: 'gfg-median-of-bst',
    url: 'https://www.geeksforgeeks.org/problems/median-of-bst/1',
    difficulty: 'Easy',
    tags: ['bst', 'trees'],
    dsaPatterns: ['bst', 'trees'],
  }
];

// MAIN POPULATE FUNCTION
export async function populateProblemCatalog(): Promise<Problem[]> {
  console.log('----------------------------------------------------');
  console.log('AlgoOS Catalog Population Script');
  console.log('Populating problem catalog for LeetCode, CodeChef, Codeforces, HackerRank & GeeksforGeeks...');
  console.log('----------------------------------------------------');

  const cfProblems = await fetchCodeforcesProblemset();

  const allRawSeeds = [
    ...LEETCODE_SEED,
    ...HACKERRANK_SEED,
    ...CODECHEF_SEED,
    ...GEEKSFORGEEKS_SEED,
    ...cfProblems,
  ];

  const processedCatalog: Problem[] = allRawSeeds.map((raw) => {
    const id = `${raw.platform.toLowerCase()}-${raw.platformProblemId.toLowerCase().replace(/[^a-z0-9_-]/g, '')}`;
    const dsaPatterns = inferDsaPatterns(raw.tags, raw.title);

    return {
      id,
      title: raw.title,
      platform: raw.platform,
      platformProblemId: raw.platformProblemId,
      url: raw.url,
      difficulty: raw.difficulty,
      tags: Array.from(new Set(raw.tags)),
      dsaPatterns: Array.from(new Set(dsaPatterns)),
      estimatedSolvingTimeMinutes: estimateTime(raw.difficulty),
      isPremium: false,
    };
  });

  // Deduplicate by canonical problem ID
  const uniqueMap = new Map<string, Problem>();
  for (const prob of processedCatalog) {
    uniqueMap.set(prob.id, prob);
  }

  const finalCatalog = Array.from(uniqueMap.values());

  // Platform Breakdown Statistics
  const stats: Record<string, number> = {};
  const diffStats: Record<string, number> = { Easy: 0, Medium: 0, Hard: 0 };
  for (const p of finalCatalog) {
    stats[p.platform] = (stats[p.platform] || 0) + 1;
    diffStats[p.difficulty] = (diffStats[p.difficulty] || 0) + 1;
  }

  console.log('\nCatalog Population Completed!');
  console.log(`Total Populated Problems: ${finalCatalog.length}`);
  console.log('Platform Distribution:', stats);
  console.log('Difficulty Distribution:', diffStats);

  // Write to src/data/defaultCatalog.ts
  const targetPath = path.join(process.cwd(), 'src', 'data', 'defaultCatalog.ts');
  const fileContent = `import { Problem } from '../types';

export const DEFAULT_PROBLEM_CATALOG: Problem[] = ${JSON.stringify(finalCatalog, null, 2)};
`;

  fs.writeFileSync(targetPath, fileContent, 'utf-8');
  console.log(`\nUpdated catalog written to ${targetPath}`);

  return finalCatalog;
}

// Run CLI if invoked directly
if (import.meta.url.endsWith('populateCatalog.ts') || process.argv[1]?.includes('populateCatalog')) {
  populateProblemCatalog().catch((err) => {
    console.error('Population script failed:', err);
    process.exit(1);
  });
}
