import { Problem } from '../types';
import { mergeStriverSheetIntoCatalog } from './striverCatalogData';

const BASE_DEFAULT_PROBLEM_CATALOG: Problem[] = [
  {
    "id": "leetcode-1",
    "title": "Two Sum",
    "platform": "LeetCode",
    "platformProblemId": "1",
    "url": "https://leetcode.com/problems/two-sum/",
    "difficulty": "Easy",
    "tags": [
      "Array",
      "Hash Table"
    ],
    "dsaPatterns": [
      "hashing",
      "arrays"
    ],
    "estimatedSolvingTimeMinutes": 15,
    "isPremium": false
  },
  {
    "id": "leetcode-2",
    "title": "Add Two Numbers",
    "platform": "LeetCode",
    "platformProblemId": "2",
    "url": "https://leetcode.com/problems/add-two-numbers/",
    "difficulty": "Medium",
    "tags": [
      "Linked List",
      "Math",
      "Recursion"
    ],
    "dsaPatterns": [
      "linked_list",
      "recursion",
      "math"
    ],
    "estimatedSolvingTimeMinutes": 30,
    "isPremium": false
  },
  {
    "id": "leetcode-3",
    "title": "Longest Substring Without Repeating Characters",
    "platform": "LeetCode",
    "platformProblemId": "3",
    "url": "https://leetcode.com/problems/longest-substring-without-repeating-characters/",
    "difficulty": "Medium",
    "tags": [
      "Hash Table",
      "String",
      "Sliding Window"
    ],
    "dsaPatterns": [
      "sliding_window",
      "bst",
      "hashing",
      "strings"
    ],
    "estimatedSolvingTimeMinutes": 30,
    "isPremium": false
  },
  {
    "id": "leetcode-4",
    "title": "Median of Two Sorted Arrays",
    "platform": "LeetCode",
    "platformProblemId": "4",
    "url": "https://leetcode.com/problems/median-of-two-sorted-arrays/",
    "difficulty": "Hard",
    "tags": [
      "Array",
      "Binary Search",
      "Divide and Conquer"
    ],
    "dsaPatterns": [
      "binary_search",
      "sorting",
      "divide_and_conquer",
      "arrays"
    ],
    "estimatedSolvingTimeMinutes": 45,
    "isPremium": false
  },
  {
    "id": "leetcode-5",
    "title": "Longest Palindromic Substring",
    "platform": "LeetCode",
    "platformProblemId": "5",
    "url": "https://leetcode.com/problems/longest-palindromic-substring/",
    "difficulty": "Medium",
    "tags": [
      "String",
      "Dynamic Programming"
    ],
    "dsaPatterns": [
      "dynamic_programming",
      "bst",
      "strings"
    ],
    "estimatedSolvingTimeMinutes": 30,
    "isPremium": false
  },
  {
    "id": "leetcode-11",
    "title": "Container With Most Water",
    "platform": "LeetCode",
    "platformProblemId": "11",
    "url": "https://leetcode.com/problems/container-with-most-water/",
    "difficulty": "Medium",
    "tags": [
      "Array",
      "Two Pointers",
      "Greedy"
    ],
    "dsaPatterns": [
      "two_pointers",
      "greedy",
      "geometry",
      "arrays"
    ],
    "estimatedSolvingTimeMinutes": 30,
    "isPremium": false
  },
  {
    "id": "leetcode-15",
    "title": "3Sum",
    "platform": "LeetCode",
    "platformProblemId": "15",
    "url": "https://leetcode.com/problems/3sum/",
    "difficulty": "Medium",
    "tags": [
      "Array",
      "Two Pointers",
      "Sorting"
    ],
    "dsaPatterns": [
      "two_pointers",
      "sorting",
      "geometry",
      "arrays"
    ],
    "estimatedSolvingTimeMinutes": 30,
    "isPremium": false
  },
  {
    "id": "leetcode-17",
    "title": "Letter Combinations of a Phone Number",
    "platform": "LeetCode",
    "platformProblemId": "17",
    "url": "https://leetcode.com/problems/letter-combinations-of-a-phone-number/",
    "difficulty": "Medium",
    "tags": [
      "Hash Table",
      "String",
      "Backtracking"
    ],
    "dsaPatterns": [
      "hashing",
      "backtracking",
      "strings"
    ],
    "estimatedSolvingTimeMinutes": 30,
    "isPremium": false
  },
  {
    "id": "leetcode-20",
    "title": "Valid Parentheses",
    "platform": "LeetCode",
    "platformProblemId": "20",
    "url": "https://leetcode.com/problems/valid-parentheses/",
    "difficulty": "Easy",
    "tags": [
      "String",
      "Stack"
    ],
    "dsaPatterns": [
      "stack",
      "strings"
    ],
    "estimatedSolvingTimeMinutes": 15,
    "isPremium": false
  },
  {
    "id": "leetcode-21",
    "title": "Merge Two Sorted Lists",
    "platform": "LeetCode",
    "platformProblemId": "21",
    "url": "https://leetcode.com/problems/merge-two-sorted-lists/",
    "difficulty": "Easy",
    "tags": [
      "Linked List",
      "Recursion"
    ],
    "dsaPatterns": [
      "linked_list",
      "sorting",
      "recursion"
    ],
    "estimatedSolvingTimeMinutes": 15,
    "isPremium": false
  },
  {
    "id": "leetcode-23",
    "title": "Merge k Sorted Lists",
    "platform": "LeetCode",
    "platformProblemId": "23",
    "url": "https://leetcode.com/problems/merge-k-sorted-lists/",
    "difficulty": "Hard",
    "tags": [
      "Linked List",
      "Divide and Conquer",
      "Heap / Priority Queue"
    ],
    "dsaPatterns": [
      "heap",
      "queue",
      "linked_list",
      "sorting",
      "divide_and_conquer"
    ],
    "estimatedSolvingTimeMinutes": 45,
    "isPremium": false
  },
  {
    "id": "leetcode-31",
    "title": "Next Permutation",
    "platform": "LeetCode",
    "platformProblemId": "31",
    "url": "https://leetcode.com/problems/next-permutation/",
    "difficulty": "Medium",
    "tags": [
      "Array",
      "Two Pointers"
    ],
    "dsaPatterns": [
      "two_pointers",
      "backtracking",
      "geometry",
      "arrays"
    ],
    "estimatedSolvingTimeMinutes": 30,
    "isPremium": false
  },
  {
    "id": "leetcode-33",
    "title": "Search in Rotated Sorted Array",
    "platform": "LeetCode",
    "platformProblemId": "33",
    "url": "https://leetcode.com/problems/search-in-rotated-sorted-array/",
    "difficulty": "Medium",
    "tags": [
      "Array",
      "Binary Search"
    ],
    "dsaPatterns": [
      "binary_search",
      "sorting",
      "arrays"
    ],
    "estimatedSolvingTimeMinutes": 30,
    "isPremium": false
  },
  {
    "id": "leetcode-39",
    "title": "Combination Sum",
    "platform": "LeetCode",
    "platformProblemId": "39",
    "url": "https://leetcode.com/problems/combination-sum/",
    "difficulty": "Medium",
    "tags": [
      "Array",
      "Backtracking"
    ],
    "dsaPatterns": [
      "backtracking",
      "arrays"
    ],
    "estimatedSolvingTimeMinutes": 30,
    "isPremium": false
  },
  {
    "id": "leetcode-42",
    "title": "Trapping Rain Water",
    "platform": "LeetCode",
    "platformProblemId": "42",
    "url": "https://leetcode.com/problems/trapping-rain-water/",
    "difficulty": "Hard",
    "tags": [
      "Array",
      "Two Pointers",
      "Dynamic Programming",
      "Monotonic Stack"
    ],
    "dsaPatterns": [
      "two_pointers",
      "dynamic_programming",
      "stack",
      "monotonic_stack",
      "geometry",
      "arrays"
    ],
    "estimatedSolvingTimeMinutes": 45,
    "isPremium": false
  },
  {
    "id": "leetcode-46",
    "title": "Permutations",
    "platform": "LeetCode",
    "platformProblemId": "46",
    "url": "https://leetcode.com/problems/permutations/",
    "difficulty": "Medium",
    "tags": [
      "Array",
      "Backtracking"
    ],
    "dsaPatterns": [
      "backtracking",
      "arrays"
    ],
    "estimatedSolvingTimeMinutes": 30,
    "isPremium": false
  },
  {
    "id": "leetcode-48",
    "title": "Rotate Image",
    "platform": "LeetCode",
    "platformProblemId": "48",
    "url": "https://leetcode.com/problems/rotate-image/",
    "difficulty": "Medium",
    "tags": [
      "Array",
      "Math",
      "Matrix"
    ],
    "dsaPatterns": [
      "math",
      "arrays"
    ],
    "estimatedSolvingTimeMinutes": 30,
    "isPremium": false
  },
  {
    "id": "leetcode-49",
    "title": "Group Anagrams",
    "platform": "LeetCode",
    "platformProblemId": "49",
    "url": "https://leetcode.com/problems/group-anagrams/",
    "difficulty": "Medium",
    "tags": [
      "Array",
      "Hash Table",
      "String",
      "Sorting"
    ],
    "dsaPatterns": [
      "hashing",
      "sorting",
      "arrays",
      "strings"
    ],
    "estimatedSolvingTimeMinutes": 30,
    "isPremium": false
  },
  {
    "id": "leetcode-51",
    "title": "N-Queens",
    "platform": "LeetCode",
    "platformProblemId": "51",
    "url": "https://leetcode.com/problems/n-queens/",
    "difficulty": "Hard",
    "tags": [
      "Array",
      "Backtracking"
    ],
    "dsaPatterns": [
      "backtracking",
      "arrays"
    ],
    "estimatedSolvingTimeMinutes": 45,
    "isPremium": false
  },
  {
    "id": "leetcode-53",
    "title": "Maximum Subarray",
    "platform": "LeetCode",
    "platformProblemId": "53",
    "url": "https://leetcode.com/problems/maximum-subarray/",
    "difficulty": "Medium",
    "tags": [
      "Array",
      "Divide and Conquer",
      "Dynamic Programming"
    ],
    "dsaPatterns": [
      "dynamic_programming",
      "divide_and_conquer",
      "arrays"
    ],
    "estimatedSolvingTimeMinutes": 30,
    "isPremium": false
  },
  {
    "id": "leetcode-55",
    "title": "Jump Game",
    "platform": "LeetCode",
    "platformProblemId": "55",
    "url": "https://leetcode.com/problems/jump-game/",
    "difficulty": "Medium",
    "tags": [
      "Array",
      "Dynamic Programming",
      "Greedy"
    ],
    "dsaPatterns": [
      "dynamic_programming",
      "greedy",
      "arrays"
    ],
    "estimatedSolvingTimeMinutes": 30,
    "isPremium": false
  },
  {
    "id": "leetcode-56",
    "title": "Merge Intervals",
    "platform": "LeetCode",
    "platformProblemId": "56",
    "url": "https://leetcode.com/problems/merge-intervals/",
    "difficulty": "Medium",
    "tags": [
      "Array",
      "Sorting"
    ],
    "dsaPatterns": [
      "sorting",
      "interval_problems",
      "arrays"
    ],
    "estimatedSolvingTimeMinutes": 30,
    "isPremium": false
  },
  {
    "id": "leetcode-62",
    "title": "Unique Paths",
    "platform": "LeetCode",
    "platformProblemId": "62",
    "url": "https://leetcode.com/problems/unique-paths/",
    "difficulty": "Medium",
    "tags": [
      "Math",
      "Dynamic Programming",
      "Combinatorics"
    ],
    "dsaPatterns": [
      "dynamic_programming",
      "math"
    ],
    "estimatedSolvingTimeMinutes": 30,
    "isPremium": false
  },
  {
    "id": "leetcode-70",
    "title": "Climbing Stairs",
    "platform": "LeetCode",
    "platformProblemId": "70",
    "url": "https://leetcode.com/problems/climbing-stairs/",
    "difficulty": "Easy",
    "tags": [
      "Math",
      "Dynamic Programming",
      "Memoization"
    ],
    "dsaPatterns": [
      "dynamic_programming",
      "math"
    ],
    "estimatedSolvingTimeMinutes": 15,
    "isPremium": false
  },
  {
    "id": "leetcode-72",
    "title": "Edit Distance",
    "platform": "LeetCode",
    "platformProblemId": "72",
    "url": "https://leetcode.com/problems/edit-distance/",
    "difficulty": "Hard",
    "tags": [
      "String",
      "Dynamic Programming"
    ],
    "dsaPatterns": [
      "dynamic_programming",
      "strings"
    ],
    "estimatedSolvingTimeMinutes": 45,
    "isPremium": false
  },
  {
    "id": "leetcode-75",
    "title": "Sort Colors",
    "platform": "LeetCode",
    "platformProblemId": "75",
    "url": "https://leetcode.com/problems/sort-colors/",
    "difficulty": "Medium",
    "tags": [
      "Array",
      "Two Pointers",
      "Sorting"
    ],
    "dsaPatterns": [
      "two_pointers",
      "sorting",
      "geometry",
      "arrays"
    ],
    "estimatedSolvingTimeMinutes": 30,
    "isPremium": false
  },
  {
    "id": "leetcode-76",
    "title": "Minimum Window Substring",
    "platform": "LeetCode",
    "platformProblemId": "76",
    "url": "https://leetcode.com/problems/minimum-window-substring/",
    "difficulty": "Hard",
    "tags": [
      "Hash Table",
      "String",
      "Sliding Window"
    ],
    "dsaPatterns": [
      "sliding_window",
      "bst",
      "hashing",
      "strings"
    ],
    "estimatedSolvingTimeMinutes": 45,
    "isPremium": false
  },
  {
    "id": "leetcode-78",
    "title": "Subsets",
    "platform": "LeetCode",
    "platformProblemId": "78",
    "url": "https://leetcode.com/problems/subsets/",
    "difficulty": "Medium",
    "tags": [
      "Array",
      "Backtracking",
      "Bit Manipulation"
    ],
    "dsaPatterns": [
      "hashing",
      "backtracking",
      "bit_manipulation",
      "arrays"
    ],
    "estimatedSolvingTimeMinutes": 30,
    "isPremium": false
  },
  {
    "id": "leetcode-79",
    "title": "Word Search",
    "platform": "LeetCode",
    "platformProblemId": "79",
    "url": "https://leetcode.com/problems/word-search/",
    "difficulty": "Medium",
    "tags": [
      "Array",
      "Backtracking",
      "Matrix"
    ],
    "dsaPatterns": [
      "backtracking",
      "arrays"
    ],
    "estimatedSolvingTimeMinutes": 30,
    "isPremium": false
  },
  {
    "id": "leetcode-84",
    "title": "Largest Rectangle in Histogram",
    "platform": "LeetCode",
    "platformProblemId": "84",
    "url": "https://leetcode.com/problems/largest-rectangle-in-histogram/",
    "difficulty": "Hard",
    "tags": [
      "Array",
      "Stack",
      "Monotonic Stack"
    ],
    "dsaPatterns": [
      "stack",
      "monotonic_stack",
      "arrays"
    ],
    "estimatedSolvingTimeMinutes": 45,
    "isPremium": false
  },
  {
    "id": "leetcode-98",
    "title": "Validate Binary Search Tree",
    "platform": "LeetCode",
    "platformProblemId": "98",
    "url": "https://leetcode.com/problems/validate-binary-search-tree/",
    "difficulty": "Medium",
    "tags": [
      "Tree",
      "Depth-First Search",
      "Binary Search Tree",
      "Binary Tree"
    ],
    "dsaPatterns": [
      "binary_search",
      "dfs",
      "trees",
      "binary_trees",
      "bst"
    ],
    "estimatedSolvingTimeMinutes": 30,
    "isPremium": false
  },
  {
    "id": "leetcode-102",
    "title": "Binary Tree Level Order Traversal",
    "platform": "LeetCode",
    "platformProblemId": "102",
    "url": "https://leetcode.com/problems/binary-tree-level-order-traversal/",
    "difficulty": "Medium",
    "tags": [
      "Tree",
      "Breadth-First Search",
      "Binary Tree"
    ],
    "dsaPatterns": [
      "bfs",
      "trees",
      "binary_trees"
    ],
    "estimatedSolvingTimeMinutes": 30,
    "isPremium": false
  },
  {
    "id": "leetcode-104",
    "title": "Maximum Depth of Binary Tree",
    "platform": "LeetCode",
    "platformProblemId": "104",
    "url": "https://leetcode.com/problems/maximum-depth-of-binary-tree/",
    "difficulty": "Easy",
    "tags": [
      "Tree",
      "Depth-First Search",
      "Breadth-First Search",
      "Binary Tree"
    ],
    "dsaPatterns": [
      "dfs",
      "bfs",
      "trees",
      "binary_trees"
    ],
    "estimatedSolvingTimeMinutes": 15,
    "isPremium": false
  },
  {
    "id": "leetcode-105",
    "title": "Construct Binary Tree from Preorder and Inorder Traversal",
    "platform": "LeetCode",
    "platformProblemId": "105",
    "url": "https://leetcode.com/problems/construct-binary-tree-from-preorder-and-inorder-traversal/",
    "difficulty": "Medium",
    "tags": [
      "Array",
      "Hash Table",
      "Divide and Conquer",
      "Tree",
      "Binary Tree"
    ],
    "dsaPatterns": [
      "trees",
      "binary_trees",
      "hashing",
      "divide_and_conquer",
      "arrays"
    ],
    "estimatedSolvingTimeMinutes": 30,
    "isPremium": false
  },
  {
    "id": "leetcode-121",
    "title": "Best Time to Buy and Sell Stock",
    "platform": "LeetCode",
    "platformProblemId": "121",
    "url": "https://leetcode.com/problems/best-time-to-buy-and-sell-stock/",
    "difficulty": "Easy",
    "tags": [
      "Array",
      "Dynamic Programming"
    ],
    "dsaPatterns": [
      "dynamic_programming",
      "arrays"
    ],
    "estimatedSolvingTimeMinutes": 15,
    "isPremium": false
  },
  {
    "id": "leetcode-124",
    "title": "Binary Tree Maximum Path Sum",
    "platform": "LeetCode",
    "platformProblemId": "124",
    "url": "https://leetcode.com/problems/binary-tree-maximum-path-sum/",
    "difficulty": "Hard",
    "tags": [
      "Dynamic Programming",
      "Tree",
      "Depth-First Search",
      "Binary Tree"
    ],
    "dsaPatterns": [
      "dynamic_programming",
      "dfs",
      "trees",
      "binary_trees"
    ],
    "estimatedSolvingTimeMinutes": 45,
    "isPremium": false
  },
  {
    "id": "leetcode-139",
    "title": "Word Break",
    "platform": "LeetCode",
    "platformProblemId": "139",
    "url": "https://leetcode.com/problems/word-break/",
    "difficulty": "Medium",
    "tags": [
      "Hash Table",
      "String",
      "Dynamic Programming",
      "Trie"
    ],
    "dsaPatterns": [
      "dynamic_programming",
      "hashing",
      "trie",
      "strings"
    ],
    "estimatedSolvingTimeMinutes": 30,
    "isPremium": false
  },
  {
    "id": "leetcode-141",
    "title": "Linked List Cycle",
    "platform": "LeetCode",
    "platformProblemId": "141",
    "url": "https://leetcode.com/problems/linked-list-cycle/",
    "difficulty": "Easy",
    "tags": [
      "Hash Table",
      "Linked List",
      "Two Pointers"
    ],
    "dsaPatterns": [
      "two_pointers",
      "linked_list",
      "hashing",
      "geometry"
    ],
    "estimatedSolvingTimeMinutes": 15,
    "isPremium": false
  },
  {
    "id": "leetcode-146",
    "title": "LRU Cache",
    "platform": "LeetCode",
    "platformProblemId": "146",
    "url": "https://leetcode.com/problems/lru-cache/",
    "difficulty": "Medium",
    "tags": [
      "Hash Table",
      "Linked List",
      "Design",
      "Doubly-Linked List"
    ],
    "dsaPatterns": [
      "linked_list",
      "hashing"
    ],
    "estimatedSolvingTimeMinutes": 30,
    "isPremium": false
  },
  {
    "id": "leetcode-155",
    "title": "Min Stack",
    "platform": "LeetCode",
    "platformProblemId": "155",
    "url": "https://leetcode.com/problems/min-stack/",
    "difficulty": "Medium",
    "tags": [
      "Stack",
      "Design"
    ],
    "dsaPatterns": [
      "stack"
    ],
    "estimatedSolvingTimeMinutes": 30,
    "isPremium": false
  },
  {
    "id": "leetcode-200",
    "title": "Number of Islands",
    "platform": "LeetCode",
    "platformProblemId": "200",
    "url": "https://leetcode.com/problems/number-of-islands/",
    "difficulty": "Medium",
    "tags": [
      "Array",
      "Depth-First Search",
      "Breadth-First Search",
      "Union Find",
      "Matrix"
    ],
    "dsaPatterns": [
      "dfs",
      "bfs",
      "union_find",
      "arrays"
    ],
    "estimatedSolvingTimeMinutes": 30,
    "isPremium": false
  },
  {
    "id": "leetcode-206",
    "title": "Reverse Linked List",
    "platform": "LeetCode",
    "platformProblemId": "206",
    "url": "https://leetcode.com/problems/reverse-linked-list/",
    "difficulty": "Easy",
    "tags": [
      "Linked List",
      "Recursion"
    ],
    "dsaPatterns": [
      "linked_list",
      "recursion"
    ],
    "estimatedSolvingTimeMinutes": 15,
    "isPremium": false
  },
  {
    "id": "leetcode-207",
    "title": "Course Schedule",
    "platform": "LeetCode",
    "platformProblemId": "207",
    "url": "https://leetcode.com/problems/course-schedule/",
    "difficulty": "Medium",
    "tags": [
      "Depth-First Search",
      "Breadth-First Search",
      "Graph",
      "Topological Sort"
    ],
    "dsaPatterns": [
      "graphs",
      "dfs",
      "bfs",
      "sorting",
      "topological_sort"
    ],
    "estimatedSolvingTimeMinutes": 30,
    "isPremium": false
  },
  {
    "id": "leetcode-208",
    "title": "Implement Trie (Prefix Tree)",
    "platform": "LeetCode",
    "platformProblemId": "208",
    "url": "https://leetcode.com/problems/implement-trie-prefix-tree/",
    "difficulty": "Medium",
    "tags": [
      "Hash Table",
      "String",
      "Design",
      "Trie"
    ],
    "dsaPatterns": [
      "trees",
      "hashing",
      "trie",
      "strings"
    ],
    "estimatedSolvingTimeMinutes": 30,
    "isPremium": false
  },
  {
    "id": "leetcode-198",
    "title": "House Robber",
    "platform": "LeetCode",
    "platformProblemId": "198",
    "url": "https://leetcode.com/problems/house-robber/",
    "difficulty": "Medium",
    "tags": [
      "Array",
      "Dynamic Programming"
    ],
    "dsaPatterns": [
      "dynamic_programming",
      "arrays"
    ],
    "estimatedSolvingTimeMinutes": 30,
    "isPremium": false
  },
  {
    "id": "leetcode-215",
    "title": "Kth Largest Element in an Array",
    "platform": "LeetCode",
    "platformProblemId": "215",
    "url": "https://leetcode.com/problems/kth-largest-element-in-an-array/",
    "difficulty": "Medium",
    "tags": [
      "Array",
      "Divide and Conquer",
      "Sorting",
      "Heap / Priority Queue",
      "Quickselect"
    ],
    "dsaPatterns": [
      "heap",
      "queue",
      "sorting",
      "divide_and_conquer",
      "arrays"
    ],
    "estimatedSolvingTimeMinutes": 30,
    "isPremium": false
  },
  {
    "id": "leetcode-236",
    "title": "Lowest Common Ancestor of a Binary Tree",
    "platform": "LeetCode",
    "platformProblemId": "236",
    "url": "https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-tree/",
    "difficulty": "Medium",
    "tags": [
      "Tree",
      "Depth-First Search",
      "Binary Tree"
    ],
    "dsaPatterns": [
      "dfs",
      "trees",
      "binary_trees"
    ],
    "estimatedSolvingTimeMinutes": 30,
    "isPremium": false
  },
  {
    "id": "leetcode-238",
    "title": "Product of Array Except Self",
    "platform": "LeetCode",
    "platformProblemId": "238",
    "url": "https://leetcode.com/problems/product-of-array-except-self/",
    "difficulty": "Medium",
    "tags": [
      "Array",
      "Prefix Sum"
    ],
    "dsaPatterns": [
      "prefix_sum",
      "arrays"
    ],
    "estimatedSolvingTimeMinutes": 30,
    "isPremium": false
  },
  {
    "id": "leetcode-253",
    "title": "Meeting Rooms II",
    "platform": "LeetCode",
    "platformProblemId": "253",
    "url": "https://leetcode.com/problems/meeting-rooms-ii/",
    "difficulty": "Medium",
    "tags": [
      "Array",
      "Two Pointers",
      "Greedy",
      "Sorting",
      "Heap / Priority Queue"
    ],
    "dsaPatterns": [
      "two_pointers",
      "heap",
      "queue",
      "sorting",
      "greedy",
      "interval_problems",
      "geometry",
      "arrays"
    ],
    "estimatedSolvingTimeMinutes": 30,
    "isPremium": false
  },
  {
    "id": "leetcode-295",
    "title": "Find Median from Data Stream",
    "platform": "LeetCode",
    "platformProblemId": "295",
    "url": "https://leetcode.com/problems/find-median-from-data-stream/",
    "difficulty": "Hard",
    "tags": [
      "Two Pointers",
      "Design",
      "Sorting",
      "Heap / Priority Queue",
      "Data Stream"
    ],
    "dsaPatterns": [
      "two_pointers",
      "heap",
      "queue",
      "sorting",
      "geometry"
    ],
    "estimatedSolvingTimeMinutes": 45,
    "isPremium": false
  },
  {
    "id": "leetcode-300",
    "title": "Longest Increasing Subsequence",
    "platform": "LeetCode",
    "platformProblemId": "300",
    "url": "https://leetcode.com/problems/longest-increasing-subsequence/",
    "difficulty": "Medium",
    "tags": [
      "Array",
      "Binary Search",
      "Dynamic Programming"
    ],
    "dsaPatterns": [
      "binary_search",
      "dynamic_programming",
      "arrays"
    ],
    "estimatedSolvingTimeMinutes": 30,
    "isPremium": false
  },
  {
    "id": "leetcode-322",
    "title": "Coin Change",
    "platform": "LeetCode",
    "platformProblemId": "322",
    "url": "https://leetcode.com/problems/coin-change/",
    "difficulty": "Medium",
    "tags": [
      "Array",
      "Dynamic Programming",
      "Breadth-First Search"
    ],
    "dsaPatterns": [
      "dynamic_programming",
      "bfs",
      "arrays"
    ],
    "estimatedSolvingTimeMinutes": 30,
    "isPremium": false
  },
  {
    "id": "leetcode-347",
    "title": "Top K Frequent Elements",
    "platform": "LeetCode",
    "platformProblemId": "347",
    "url": "https://leetcode.com/problems/top-k-frequent-elements/",
    "difficulty": "Medium",
    "tags": [
      "Array",
      "Hash Table",
      "Divide and Conquer",
      "Sorting",
      "Heap / Priority Queue",
      "Bucket Sort"
    ],
    "dsaPatterns": [
      "heap",
      "queue",
      "hashing",
      "sorting",
      "divide_and_conquer",
      "arrays"
    ],
    "estimatedSolvingTimeMinutes": 30,
    "isPremium": false
  },
  {
    "id": "leetcode-417",
    "title": "Pacific Atlantic Water Flow",
    "platform": "LeetCode",
    "platformProblemId": "417",
    "url": "https://leetcode.com/problems/pacific-atlantic-water-flow/",
    "difficulty": "Medium",
    "tags": [
      "Array",
      "Depth-First Search",
      "Breadth-First Search",
      "Matrix"
    ],
    "dsaPatterns": [
      "dfs",
      "bfs",
      "arrays"
    ],
    "estimatedSolvingTimeMinutes": 30,
    "isPremium": false
  },
  {
    "id": "leetcode-494",
    "title": "Target Sum",
    "platform": "LeetCode",
    "platformProblemId": "494",
    "url": "https://leetcode.com/problems/target-sum/",
    "difficulty": "Medium",
    "tags": [
      "Array",
      "Dynamic Programming",
      "Backtracking"
    ],
    "dsaPatterns": [
      "dynamic_programming",
      "backtracking",
      "arrays"
    ],
    "estimatedSolvingTimeMinutes": 30,
    "isPremium": false
  },
  {
    "id": "leetcode-739",
    "title": "Daily Temperatures",
    "platform": "LeetCode",
    "platformProblemId": "739",
    "url": "https://leetcode.com/problems/daily-temperatures/",
    "difficulty": "Medium",
    "tags": [
      "Array",
      "Stack",
      "Monotonic Stack"
    ],
    "dsaPatterns": [
      "stack",
      "monotonic_stack",
      "arrays"
    ],
    "estimatedSolvingTimeMinutes": 30,
    "isPremium": false
  },
  {
    "id": "leetcode-560",
    "title": "Subarray Sum Equals K",
    "platform": "LeetCode",
    "platformProblemId": "560",
    "url": "https://leetcode.com/problems/subarray-sum-equals-k/",
    "difficulty": "Medium",
    "tags": [
      "Array",
      "Hash Table",
      "Prefix Sum"
    ],
    "dsaPatterns": [
      "prefix_sum",
      "hashing",
      "arrays"
    ],
    "estimatedSolvingTimeMinutes": 30,
    "isPremium": false
  },
  {
    "id": "leetcode-704",
    "title": "Binary Search",
    "platform": "LeetCode",
    "platformProblemId": "704",
    "url": "https://leetcode.com/problems/binary-search/",
    "difficulty": "Easy",
    "tags": [
      "Array",
      "Binary Search"
    ],
    "dsaPatterns": [
      "binary_search",
      "arrays"
    ],
    "estimatedSolvingTimeMinutes": 15,
    "isPremium": false
  },
  {
    "id": "leetcode-787",
    "title": "Cheapest Flights Within K Stops",
    "platform": "LeetCode",
    "platformProblemId": "787",
    "url": "https://leetcode.com/problems/cheapest-flights-within-k-stops/",
    "difficulty": "Medium",
    "tags": [
      "Dynamic Programming",
      "Depth-First Search",
      "Breadth-First Search",
      "Graph",
      "Heap"
    ],
    "dsaPatterns": [
      "dynamic_programming",
      "graphs",
      "dfs",
      "bfs",
      "heap"
    ],
    "estimatedSolvingTimeMinutes": 30,
    "isPremium": false
  },
  {
    "id": "hackerrank-solve-me-first",
    "title": "Solve Me First",
    "platform": "HackerRank",
    "platformProblemId": "solve-me-first",
    "url": "https://www.hackerrank.com/challenges/solve-me-first/problem",
    "difficulty": "Easy",
    "tags": [
      "warmup",
      "math"
    ],
    "dsaPatterns": [
      "math"
    ],
    "estimatedSolvingTimeMinutes": 15,
    "isPremium": false
  },
  {
    "id": "hackerrank-simple-array-sum",
    "title": "Simple Array Sum",
    "platform": "HackerRank",
    "platformProblemId": "simple-array-sum",
    "url": "https://www.hackerrank.com/challenges/simple-array-sum/problem",
    "difficulty": "Easy",
    "tags": [
      "arrays",
      "warmup"
    ],
    "dsaPatterns": [
      "arrays"
    ],
    "estimatedSolvingTimeMinutes": 15,
    "isPremium": false
  },
  {
    "id": "hackerrank-compare-the-triplets",
    "title": "Compare the Triplets",
    "platform": "HackerRank",
    "platformProblemId": "compare-the-triplets",
    "url": "https://www.hackerrank.com/challenges/compare-the-triplets/problem",
    "difficulty": "Easy",
    "tags": [
      "arrays",
      "implementation"
    ],
    "dsaPatterns": [
      "arrays"
    ],
    "estimatedSolvingTimeMinutes": 15,
    "isPremium": false
  },
  {
    "id": "hackerrank-a-very-big-sum",
    "title": "A Very Big Sum",
    "platform": "HackerRank",
    "platformProblemId": "a-very-big-sum",
    "url": "https://www.hackerrank.com/challenges/a-very-big-sum/problem",
    "difficulty": "Easy",
    "tags": [
      "warmup",
      "math"
    ],
    "dsaPatterns": [
      "math"
    ],
    "estimatedSolvingTimeMinutes": 15,
    "isPremium": false
  },
  {
    "id": "hackerrank-diagonal-difference",
    "title": "Diagonal Difference",
    "platform": "HackerRank",
    "platformProblemId": "diagonal-difference",
    "url": "https://www.hackerrank.com/challenges/diagonal-difference/problem",
    "difficulty": "Easy",
    "tags": [
      "arrays",
      "matrix"
    ],
    "dsaPatterns": [
      "arrays"
    ],
    "estimatedSolvingTimeMinutes": 15,
    "isPremium": false
  },
  {
    "id": "hackerrank-plus-minus",
    "title": "Plus Minus",
    "platform": "HackerRank",
    "platformProblemId": "plus-minus",
    "url": "https://www.hackerrank.com/challenges/plus-minus/problem",
    "difficulty": "Easy",
    "tags": [
      "warmup",
      "arrays"
    ],
    "dsaPatterns": [
      "arrays"
    ],
    "estimatedSolvingTimeMinutes": 15,
    "isPremium": false
  },
  {
    "id": "hackerrank-staircase",
    "title": "Staircase",
    "platform": "HackerRank",
    "platformProblemId": "staircase",
    "url": "https://www.hackerrank.com/challenges/staircase/problem",
    "difficulty": "Easy",
    "tags": [
      "warmup",
      "strings"
    ],
    "dsaPatterns": [
      "strings"
    ],
    "estimatedSolvingTimeMinutes": 15,
    "isPremium": false
  },
  {
    "id": "hackerrank-mini-max-sum",
    "title": "Mini-Max Sum",
    "platform": "HackerRank",
    "platformProblemId": "mini-max-sum",
    "url": "https://www.hackerrank.com/challenges/mini-max-sum/problem",
    "difficulty": "Easy",
    "tags": [
      "warmup",
      "sorting"
    ],
    "dsaPatterns": [
      "sorting"
    ],
    "estimatedSolvingTimeMinutes": 15,
    "isPremium": false
  },
  {
    "id": "hackerrank-birthday-cake-candles",
    "title": "Birthday Cake Candles",
    "platform": "HackerRank",
    "platformProblemId": "birthday-cake-candles",
    "url": "https://www.hackerrank.com/challenges/birthday-cake-candles/problem",
    "difficulty": "Easy",
    "tags": [
      "warmup",
      "arrays"
    ],
    "dsaPatterns": [
      "arrays"
    ],
    "estimatedSolvingTimeMinutes": 15,
    "isPremium": false
  },
  {
    "id": "hackerrank-time-conversion",
    "title": "Time Conversion",
    "platform": "HackerRank",
    "platformProblemId": "time-conversion",
    "url": "https://www.hackerrank.com/challenges/time-conversion/problem",
    "difficulty": "Easy",
    "tags": [
      "strings",
      "warmup"
    ],
    "dsaPatterns": [
      "strings"
    ],
    "estimatedSolvingTimeMinutes": 15,
    "isPremium": false
  },
  {
    "id": "hackerrank-grading",
    "title": "Grading Students",
    "platform": "HackerRank",
    "platformProblemId": "grading",
    "url": "https://www.hackerrank.com/challenges/grading/problem",
    "difficulty": "Easy",
    "tags": [
      "implementation",
      "math"
    ],
    "dsaPatterns": [
      "math"
    ],
    "estimatedSolvingTimeMinutes": 15,
    "isPremium": false
  },
  {
    "id": "hackerrank-apple-and-orange",
    "title": "Apple and Orange",
    "platform": "HackerRank",
    "platformProblemId": "apple-and-orange",
    "url": "https://www.hackerrank.com/challenges/apple-and-orange/problem",
    "difficulty": "Easy",
    "tags": [
      "implementation"
    ],
    "dsaPatterns": [
      "arrays"
    ],
    "estimatedSolvingTimeMinutes": 15,
    "isPremium": false
  },
  {
    "id": "hackerrank-the-birthday-bar",
    "title": "Subarray Division",
    "platform": "HackerRank",
    "platformProblemId": "the-birthday-bar",
    "url": "https://www.hackerrank.com/challenges/the-birthday-bar/problem",
    "difficulty": "Easy",
    "tags": [
      "sliding window",
      "arrays"
    ],
    "dsaPatterns": [
      "sliding_window",
      "arrays"
    ],
    "estimatedSolvingTimeMinutes": 15,
    "isPremium": false
  },
  {
    "id": "hackerrank-divisible-sum-pairs",
    "title": "Divisible Sum Pairs",
    "platform": "HackerRank",
    "platformProblemId": "divisible-sum-pairs",
    "url": "https://www.hackerrank.com/challenges/divisible-sum-pairs/problem",
    "difficulty": "Easy",
    "tags": [
      "arrays",
      "math"
    ],
    "dsaPatterns": [
      "math",
      "arrays"
    ],
    "estimatedSolvingTimeMinutes": 15,
    "isPremium": false
  },
  {
    "id": "hackerrank-sherlock-and-anagrams",
    "title": "Sherlock and Anagrams",
    "platform": "HackerRank",
    "platformProblemId": "sherlock-and-anagrams",
    "url": "https://www.hackerrank.com/challenges/sherlock-and-anagrams/problem",
    "difficulty": "Medium",
    "tags": [
      "dictionaries",
      "hashmaps",
      "strings"
    ],
    "dsaPatterns": [
      "hashing",
      "strings"
    ],
    "estimatedSolvingTimeMinutes": 30,
    "isPremium": false
  },
  {
    "id": "hackerrank-crush",
    "title": "Array Manipulation",
    "platform": "HackerRank",
    "platformProblemId": "crush",
    "url": "https://www.hackerrank.com/challenges/crush/problem",
    "difficulty": "Hard",
    "tags": [
      "prefix sum",
      "arrays"
    ],
    "dsaPatterns": [
      "prefix_sum",
      "arrays"
    ],
    "estimatedSolvingTimeMinutes": 45,
    "isPremium": false
  },
  {
    "id": "hackerrank-contacts",
    "title": "Contacts",
    "platform": "HackerRank",
    "platformProblemId": "contacts",
    "url": "https://www.hackerrank.com/challenges/contacts/problem",
    "difficulty": "Medium",
    "tags": [
      "trie",
      "data structures"
    ],
    "dsaPatterns": [
      "trie"
    ],
    "estimatedSolvingTimeMinutes": 30,
    "isPremium": false
  },
  {
    "id": "hackerrank-swap-nodes-algo",
    "title": "Swap Nodes [Algo]",
    "platform": "HackerRank",
    "platformProblemId": "swap-nodes-algo",
    "url": "https://www.hackerrank.com/challenges/swap-nodes-algo/problem",
    "difficulty": "Medium",
    "tags": [
      "trees",
      "bfs",
      "dfs"
    ],
    "dsaPatterns": [
      "graphs",
      "dfs",
      "bfs",
      "trees"
    ],
    "estimatedSolvingTimeMinutes": 30,
    "isPremium": false
  },
  {
    "id": "hackerrank-ctci-merge-sort",
    "title": "Merge Sort: Counting Inversions",
    "platform": "HackerRank",
    "platformProblemId": "ctci-merge-sort",
    "url": "https://www.hackerrank.com/challenges/ctci-merge-sort/problem",
    "difficulty": "Hard",
    "tags": [
      "divide and conquer",
      "sorting"
    ],
    "dsaPatterns": [
      "sorting",
      "divide_and_conquer"
    ],
    "estimatedSolvingTimeMinutes": 45,
    "isPremium": false
  },
  {
    "id": "hackerrank-recursive-digit-sum",
    "title": "Recursive Digit Sum",
    "platform": "HackerRank",
    "platformProblemId": "recursive-digit-sum",
    "url": "https://www.hackerrank.com/challenges/recursive-digit-sum/problem",
    "difficulty": "Medium",
    "tags": [
      "recursion",
      "math"
    ],
    "dsaPatterns": [
      "recursion",
      "math"
    ],
    "estimatedSolvingTimeMinutes": 30,
    "isPremium": false
  },
  {
    "id": "codechef-brainspeed",
    "title": "Chef and Brain Speed",
    "platform": "CodeChef",
    "platformProblemId": "BRAINSPEED",
    "url": "https://www.codechef.com/problems/BRAINSPEED",
    "difficulty": "Easy",
    "tags": [
      "basic math"
    ],
    "dsaPatterns": [
      "math"
    ],
    "estimatedSolvingTimeMinutes": 15,
    "isPremium": false
  },
  {
    "id": "codechef-ezspeak",
    "title": "Easy Pronunciation",
    "platform": "CodeChef",
    "platformProblemId": "EZSPEAK",
    "url": "https://www.codechef.com/problems/EZSPEAK",
    "difficulty": "Easy",
    "tags": [
      "strings",
      "arrays"
    ],
    "dsaPatterns": [
      "arrays",
      "strings"
    ],
    "estimatedSolvingTimeMinutes": 15,
    "isPremium": false
  },
  {
    "id": "codechef-fctrl2",
    "title": "Small Factorials",
    "platform": "CodeChef",
    "platformProblemId": "FCTRL2",
    "url": "https://www.codechef.com/problems/FCTRL2",
    "difficulty": "Easy",
    "tags": [
      "math",
      "big integer"
    ],
    "dsaPatterns": [
      "math"
    ],
    "estimatedSolvingTimeMinutes": 15,
    "isPremium": false
  },
  {
    "id": "codechef-conflip",
    "title": "Coin Flip",
    "platform": "CodeChef",
    "platformProblemId": "CONFLIP",
    "url": "https://www.codechef.com/problems/CONFLIP",
    "difficulty": "Easy",
    "tags": [
      "math",
      "greedy"
    ],
    "dsaPatterns": [
      "greedy",
      "math"
    ],
    "estimatedSolvingTimeMinutes": 15,
    "isPremium": false
  },
  {
    "id": "codechef-reverse",
    "title": "Chef and Reversing",
    "platform": "CodeChef",
    "platformProblemId": "REVERSE",
    "url": "https://www.codechef.com/problems/REVERSE",
    "difficulty": "Medium",
    "tags": [
      "graphs",
      "bfs",
      "shortest path"
    ],
    "dsaPatterns": [
      "graphs",
      "bfs"
    ],
    "estimatedSolvingTimeMinutes": 30,
    "isPremium": false
  },
  {
    "id": "codechef-hs08test",
    "title": "Atm",
    "platform": "CodeChef",
    "platformProblemId": "HS08TEST",
    "url": "https://www.codechef.com/problems/HS08TEST",
    "difficulty": "Easy",
    "tags": [
      "basic math"
    ],
    "dsaPatterns": [
      "math"
    ],
    "estimatedSolvingTimeMinutes": 15,
    "isPremium": false
  },
  {
    "id": "codechef-intest",
    "title": "Enormous Input Test",
    "platform": "CodeChef",
    "platformProblemId": "INTEST",
    "url": "https://www.codechef.com/problems/INTEST",
    "difficulty": "Easy",
    "tags": [
      "io",
      "basic math"
    ],
    "dsaPatterns": [
      "math"
    ],
    "estimatedSolvingTimeMinutes": 15,
    "isPremium": false
  },
  {
    "id": "codechef-tsort",
    "title": "Turbo Sort",
    "platform": "CodeChef",
    "platformProblemId": "TSORT",
    "url": "https://www.codechef.com/problems/TSORT",
    "difficulty": "Easy",
    "tags": [
      "sorting"
    ],
    "dsaPatterns": [
      "sorting"
    ],
    "estimatedSolvingTimeMinutes": 15,
    "isPremium": false
  },
  {
    "id": "codechef-lapin",
    "title": "Lapindromes",
    "platform": "CodeChef",
    "platformProblemId": "LAPIN",
    "url": "https://www.codechef.com/problems/LAPIN",
    "difficulty": "Easy",
    "tags": [
      "strings",
      "hashing"
    ],
    "dsaPatterns": [
      "hashing",
      "strings"
    ],
    "estimatedSolvingTimeMinutes": 15,
    "isPremium": false
  },
  {
    "id": "codechef-johny",
    "title": "Uncle Johny",
    "platform": "CodeChef",
    "platformProblemId": "JOHNY",
    "url": "https://www.codechef.com/problems/JOHNY",
    "difficulty": "Easy",
    "tags": [
      "sorting",
      "binary search"
    ],
    "dsaPatterns": [
      "binary_search",
      "sorting"
    ],
    "estimatedSolvingTimeMinutes": 15,
    "isPremium": false
  },
  {
    "id": "codechef-carvans",
    "title": "Carvans",
    "platform": "CodeChef",
    "platformProblemId": "CARVANS",
    "url": "https://www.codechef.com/problems/CARVANS",
    "difficulty": "Easy",
    "tags": [
      "arrays",
      "greedy"
    ],
    "dsaPatterns": [
      "greedy",
      "arrays"
    ],
    "estimatedSolvingTimeMinutes": 15,
    "isPremium": false
  },
  {
    "id": "codechef-subinc",
    "title": "Count Subarrays",
    "platform": "CodeChef",
    "platformProblemId": "SUBINC",
    "url": "https://www.codechef.com/problems/SUBINC",
    "difficulty": "Easy",
    "tags": [
      "dynamic programming",
      "arrays"
    ],
    "dsaPatterns": [
      "dynamic_programming",
      "arrays"
    ],
    "estimatedSolvingTimeMinutes": 15,
    "isPremium": false
  },
  {
    "id": "codechef-cstock",
    "title": "Chef and Stock Prices",
    "platform": "CodeChef",
    "platformProblemId": "CSTOCK",
    "url": "https://www.codechef.com/problems/CSTOCK",
    "difficulty": "Easy",
    "tags": [
      "math"
    ],
    "dsaPatterns": [
      "math"
    ],
    "estimatedSolvingTimeMinutes": 15,
    "isPremium": false
  },
  {
    "id": "codechef-firesc",
    "title": "Fire Escape Routes",
    "platform": "CodeChef",
    "platformProblemId": "FIRESC",
    "url": "https://www.codechef.com/problems/FIRESC",
    "difficulty": "Medium",
    "tags": [
      "graphs",
      "dfs",
      "union find"
    ],
    "dsaPatterns": [
      "graphs",
      "dfs",
      "union_find"
    ],
    "estimatedSolvingTimeMinutes": 30,
    "isPremium": false
  },
  {
    "id": "codechef-shknum",
    "title": "Sheokand and Number",
    "platform": "CodeChef",
    "platformProblemId": "SHKNUM",
    "url": "https://www.codechef.com/problems/SHKNUM",
    "difficulty": "Medium",
    "tags": [
      "bit manipulation",
      "math"
    ],
    "dsaPatterns": [
      "bit_manipulation",
      "math"
    ],
    "estimatedSolvingTimeMinutes": 30,
    "isPremium": false
  },
  {
    "id": "geeksforgeeks-gfg-subarray-with-given-sum",
    "title": "Subarray with Given Sum",
    "platform": "GeeksforGeeks",
    "platformProblemId": "gfg-subarray-with-given-sum",
    "url": "https://www.geeksforgeeks.org/problems/subarray-with-given-sum-1587115621/1",
    "difficulty": "Easy",
    "tags": [
      "arrays",
      "sliding window",
      "two pointers"
    ],
    "dsaPatterns": [
      "two_pointers",
      "sliding_window",
      "geometry",
      "arrays"
    ],
    "estimatedSolvingTimeMinutes": 15,
    "isPremium": false
  },
  {
    "id": "geeksforgeeks-gfg-missing-number-in-array",
    "title": "Missing Number in Array",
    "platform": "GeeksforGeeks",
    "platformProblemId": "gfg-missing-number-in-array",
    "url": "https://www.geeksforgeeks.org/problems/missing-number-in-array1416/1",
    "difficulty": "Easy",
    "tags": [
      "arrays",
      "math",
      "bit manipulation"
    ],
    "dsaPatterns": [
      "bit_manipulation",
      "math",
      "arrays"
    ],
    "estimatedSolvingTimeMinutes": 15,
    "isPremium": false
  },
  {
    "id": "geeksforgeeks-gfg-kadanes-algorithm",
    "title": "Kadane's Algorithm",
    "platform": "GeeksforGeeks",
    "platformProblemId": "gfg-kadanes-algorithm",
    "url": "https://www.geeksforgeeks.org/problems/kadanes-algorithm-1587115620/1",
    "difficulty": "Medium",
    "tags": [
      "arrays",
      "dynamic programming"
    ],
    "dsaPatterns": [
      "dynamic_programming",
      "arrays"
    ],
    "estimatedSolvingTimeMinutes": 30,
    "isPremium": false
  },
  {
    "id": "geeksforgeeks-gfg-parenthesis-checker",
    "title": "Parenthesis Checker",
    "platform": "GeeksforGeeks",
    "platformProblemId": "gfg-parenthesis-checker",
    "url": "https://www.geeksforgeeks.org/problems/parenthesis-checker2744/1",
    "difficulty": "Easy",
    "tags": [
      "stack",
      "strings"
    ],
    "dsaPatterns": [
      "stack",
      "strings"
    ],
    "estimatedSolvingTimeMinutes": 15,
    "isPremium": false
  },
  {
    "id": "geeksforgeeks-gfg-detect-loop-in-linked-list",
    "title": "Detect Loop in Linked List",
    "platform": "GeeksforGeeks",
    "platformProblemId": "gfg-detect-loop-in-linked-list",
    "url": "https://www.geeksforgeeks.org/problems/detect-loop-in-linked-list/1",
    "difficulty": "Easy",
    "tags": [
      "linked list",
      "two pointers"
    ],
    "dsaPatterns": [
      "two_pointers",
      "linked_list",
      "geometry"
    ],
    "estimatedSolvingTimeMinutes": 15,
    "isPremium": false
  },
  {
    "id": "geeksforgeeks-gfg-topological-sort",
    "title": "Topological Sort",
    "platform": "GeeksforGeeks",
    "platformProblemId": "gfg-topological-sort",
    "url": "https://www.geeksforgeeks.org/problems/topological-sort/1",
    "difficulty": "Medium",
    "tags": [
      "graphs",
      "dfs",
      "bfs"
    ],
    "dsaPatterns": [
      "graphs",
      "dfs",
      "bfs",
      "sorting",
      "topological_sort"
    ],
    "estimatedSolvingTimeMinutes": 30,
    "isPremium": false
  },
  {
    "id": "geeksforgeeks-gfg-0-1-knapsack-problem",
    "title": "0 - 1 Knapsack Problem",
    "platform": "GeeksforGeeks",
    "platformProblemId": "gfg-0-1-knapsack-problem",
    "url": "https://www.geeksforgeeks.org/problems/0-1-knapsack-problem0917/1",
    "difficulty": "Medium",
    "tags": [
      "dynamic programming"
    ],
    "dsaPatterns": [
      "dynamic_programming"
    ],
    "estimatedSolvingTimeMinutes": 30,
    "isPremium": false
  },
  {
    "id": "geeksforgeeks-gfg-kth-smallest-element",
    "title": "Kth Smallest Element",
    "platform": "GeeksforGeeks",
    "platformProblemId": "gfg-kth-smallest-element",
    "url": "https://www.geeksforgeeks.org/problems/kth-smallest-element5635/1",
    "difficulty": "Medium",
    "tags": [
      "heap",
      "sorting",
      "arrays"
    ],
    "dsaPatterns": [
      "heap",
      "sorting",
      "arrays"
    ],
    "estimatedSolvingTimeMinutes": 30,
    "isPremium": false
  },
  {
    "id": "geeksforgeeks-gfg-level-order-traversal",
    "title": "Level Order Traversal",
    "platform": "GeeksforGeeks",
    "platformProblemId": "gfg-level-order-traversal",
    "url": "https://www.geeksforgeeks.org/problems/level-order-traversal/1",
    "difficulty": "Easy",
    "tags": [
      "trees",
      "bfs"
    ],
    "dsaPatterns": [
      "graphs",
      "bfs",
      "trees"
    ],
    "estimatedSolvingTimeMinutes": 15,
    "isPremium": false
  },
  {
    "id": "geeksforgeeks-gfg-minimum-platforms",
    "title": "Minimum Platforms",
    "platform": "GeeksforGeeks",
    "platformProblemId": "gfg-minimum-platforms",
    "url": "https://www.geeksforgeeks.org/problems/minimum-platforms-1587115620/1",
    "difficulty": "Medium",
    "tags": [
      "sorting",
      "greedy",
      "arrays"
    ],
    "dsaPatterns": [
      "sorting",
      "greedy",
      "arrays"
    ],
    "estimatedSolvingTimeMinutes": 30,
    "isPremium": false
  },
  {
    "id": "geeksforgeeks-gfg-word-break",
    "title": "Word Break",
    "platform": "GeeksforGeeks",
    "platformProblemId": "gfg-word-break",
    "url": "https://www.geeksforgeeks.org/problems/word-break1352/1",
    "difficulty": "Medium",
    "tags": [
      "trie",
      "dynamic programming",
      "strings"
    ],
    "dsaPatterns": [
      "dynamic_programming",
      "trie",
      "strings"
    ],
    "estimatedSolvingTimeMinutes": 30,
    "isPremium": false
  },
  {
    "id": "geeksforgeeks-gfg-dijkstra-algorithm",
    "title": "Dijkstra Algorithm",
    "platform": "GeeksforGeeks",
    "platformProblemId": "gfg-dijkstra-algorithm",
    "url": "https://www.geeksforgeeks.org/problems/implementing-dijkstra-set-1-adjacency-matrix/1",
    "difficulty": "Medium",
    "tags": [
      "graphs",
      "heap",
      "greedy"
    ],
    "dsaPatterns": [
      "graphs",
      "heap",
      "greedy"
    ],
    "estimatedSolvingTimeMinutes": 30,
    "isPremium": false
  },
  {
    "id": "geeksforgeeks-gfg-disjoint-set-union-find",
    "title": "Disjoint Set (Union-Find)",
    "platform": "GeeksforGeeks",
    "platformProblemId": "gfg-disjoint-set-union-find",
    "url": "https://www.geeksforgeeks.org/problems/disjoint-set-union-find/1",
    "difficulty": "Easy",
    "tags": [
      "graphs",
      "union find"
    ],
    "dsaPatterns": [
      "graphs",
      "hashing",
      "union_find"
    ],
    "estimatedSolvingTimeMinutes": 15,
    "isPremium": false
  },
  {
    "id": "geeksforgeeks-gfg-longest-common-subsequence",
    "title": "Longest Common Subsequence",
    "platform": "GeeksforGeeks",
    "platformProblemId": "gfg-longest-common-subsequence",
    "url": "https://www.geeksforgeeks.org/problems/longest-common-subsequence-1587115620/1",
    "difficulty": "Medium",
    "tags": [
      "dynamic programming",
      "strings"
    ],
    "dsaPatterns": [
      "dynamic_programming",
      "strings"
    ],
    "estimatedSolvingTimeMinutes": 30,
    "isPremium": false
  },
  {
    "id": "geeksforgeeks-gfg-median-of-bst",
    "title": "Median of BST",
    "platform": "GeeksforGeeks",
    "platformProblemId": "gfg-median-of-bst",
    "url": "https://www.geeksforgeeks.org/problems/median-of-bst/1",
    "difficulty": "Easy",
    "tags": [
      "bst",
      "trees"
    ],
    "dsaPatterns": [
      "trees",
      "bst"
    ],
    "estimatedSolvingTimeMinutes": 15,
    "isPremium": false
  },
  {
    "id": "codeforces-2250b",
    "title": "String Construction",
    "platform": "Codeforces",
    "platformProblemId": "2250B",
    "url": "https://codeforces.com/problemset/problem/2250/B",
    "difficulty": "Easy",
    "tags": [
      "constructive algorithms"
    ],
    "dsaPatterns": [
      "strings"
    ],
    "estimatedSolvingTimeMinutes": 15,
    "isPremium": false
  },
  {
    "id": "codeforces-2250a",
    "title": "Threshold Movement",
    "platform": "Codeforces",
    "platformProblemId": "2250A",
    "url": "https://codeforces.com/problemset/problem/2250/A",
    "difficulty": "Easy",
    "tags": [
      "brute force",
      "implementation",
      "math"
    ],
    "dsaPatterns": [
      "math"
    ],
    "estimatedSolvingTimeMinutes": 15,
    "isPremium": false
  },
  {
    "id": "codeforces-2249f",
    "title": "Even Simple Path",
    "platform": "Codeforces",
    "platformProblemId": "2249F",
    "url": "https://codeforces.com/problemset/problem/2249/F",
    "difficulty": "Medium",
    "tags": [
      "constructive algorithms",
      "graphs",
      "shortest paths"
    ],
    "dsaPatterns": [
      "graphs"
    ],
    "estimatedSolvingTimeMinutes": 30,
    "isPremium": false
  },
  {
    "id": "codeforces-2249e2",
    "title": "String (Hard Version)",
    "platform": "Codeforces",
    "platformProblemId": "2249E2",
    "url": "https://codeforces.com/problemset/problem/2249/E2",
    "difficulty": "Medium",
    "tags": [
      "divide and conquer",
      "implementation",
      "strings"
    ],
    "dsaPatterns": [
      "divide_and_conquer",
      "strings"
    ],
    "estimatedSolvingTimeMinutes": 30,
    "isPremium": false
  },
  {
    "id": "codeforces-2249e1",
    "title": "String (Easy Version)",
    "platform": "Codeforces",
    "platformProblemId": "2249E1",
    "url": "https://codeforces.com/problemset/problem/2249/E1",
    "difficulty": "Medium",
    "tags": [
      "divide and conquer",
      "implementation",
      "strings"
    ],
    "dsaPatterns": [
      "divide_and_conquer",
      "strings"
    ],
    "estimatedSolvingTimeMinutes": 30,
    "isPremium": false
  },
  {
    "id": "codeforces-2249d",
    "title": "Xor Permutation Matrix",
    "platform": "Codeforces",
    "platformProblemId": "2249D",
    "url": "https://codeforces.com/problemset/problem/2249/D",
    "difficulty": "Medium",
    "tags": [
      "bitmasks",
      "constructive algorithms",
      "math"
    ],
    "dsaPatterns": [
      "backtracking",
      "bit_manipulation",
      "math"
    ],
    "estimatedSolvingTimeMinutes": 30,
    "isPremium": false
  },
  {
    "id": "codeforces-2249c",
    "title": "Double-Rift Dial",
    "platform": "Codeforces",
    "platformProblemId": "2249C",
    "url": "https://codeforces.com/problemset/problem/2249/C",
    "difficulty": "Medium",
    "tags": [
      "data structures",
      "dfs and similar",
      "dsu",
      "implementation",
      "two pointers"
    ],
    "dsaPatterns": [
      "two_pointers",
      "graphs",
      "dfs",
      "union_find",
      "geometry"
    ],
    "estimatedSolvingTimeMinutes": 30,
    "isPremium": false
  },
  {
    "id": "codeforces-2249b",
    "title": "Permutation Cuts",
    "platform": "Codeforces",
    "platformProblemId": "2249B",
    "url": "https://codeforces.com/problemset/problem/2249/B",
    "difficulty": "Easy",
    "tags": [
      "combinatorics",
      "implementation",
      "math"
    ],
    "dsaPatterns": [
      "backtracking",
      "math"
    ],
    "estimatedSolvingTimeMinutes": 15,
    "isPremium": false
  },
  {
    "id": "codeforces-2249a",
    "title": "Rank Subsequence",
    "platform": "Codeforces",
    "platformProblemId": "2249A",
    "url": "https://codeforces.com/problemset/problem/2249/A",
    "difficulty": "Easy",
    "tags": [
      "brute force",
      "greedy",
      "implementation"
    ],
    "dsaPatterns": [
      "greedy"
    ],
    "estimatedSolvingTimeMinutes": 15,
    "isPremium": false
  },
  {
    "id": "codeforces-2248g",
    "title": "No Balance Left",
    "platform": "Codeforces",
    "platformProblemId": "2248G",
    "url": "https://codeforces.com/problemset/problem/2248/G",
    "difficulty": "Medium",
    "tags": [
      "dp",
      "math"
    ],
    "dsaPatterns": [
      "dynamic_programming",
      "math"
    ],
    "estimatedSolvingTimeMinutes": 30,
    "isPremium": false
  },
  {
    "id": "codeforces-2248f",
    "title": "Matrix Elimination",
    "platform": "Codeforces",
    "platformProblemId": "2248F",
    "url": "https://codeforces.com/problemset/problem/2248/F",
    "difficulty": "Medium",
    "tags": [
      "binary search",
      "math"
    ],
    "dsaPatterns": [
      "binary_search",
      "math"
    ],
    "estimatedSolvingTimeMinutes": 30,
    "isPremium": false
  },
  {
    "id": "codeforces-2248e",
    "title": "Excuse for Breaks",
    "platform": "Codeforces",
    "platformProblemId": "2248E",
    "url": "https://codeforces.com/problemset/problem/2248/E",
    "difficulty": "Medium",
    "tags": [
      "binary search",
      "brute force",
      "greedy",
      "math",
      "two pointers"
    ],
    "dsaPatterns": [
      "two_pointers",
      "binary_search",
      "greedy",
      "math",
      "geometry"
    ],
    "estimatedSolvingTimeMinutes": 30,
    "isPremium": false
  },
  {
    "id": "codeforces-2248d",
    "title": "Good Pair Queries",
    "platform": "Codeforces",
    "platformProblemId": "2248D",
    "url": "https://codeforces.com/problemset/problem/2248/D",
    "difficulty": "Medium",
    "tags": [
      "constructive algorithms",
      "greedy"
    ],
    "dsaPatterns": [
      "greedy"
    ],
    "estimatedSolvingTimeMinutes": 30,
    "isPremium": false
  },
  {
    "id": "codeforces-2248c",
    "title": "Maximize the Score",
    "platform": "Codeforces",
    "platformProblemId": "2248C",
    "url": "https://codeforces.com/problemset/problem/2248/C",
    "difficulty": "Medium",
    "tags": [
      "dp",
      "greedy"
    ],
    "dsaPatterns": [
      "dynamic_programming",
      "greedy"
    ],
    "estimatedSolvingTimeMinutes": 30,
    "isPremium": false
  },
  {
    "id": "codeforces-2248b",
    "title": "Merge to Match",
    "platform": "Codeforces",
    "platformProblemId": "2248B",
    "url": "https://codeforces.com/problemset/problem/2248/B",
    "difficulty": "Easy",
    "tags": [
      "greedy",
      "sortings"
    ],
    "dsaPatterns": [
      "sorting",
      "greedy"
    ],
    "estimatedSolvingTimeMinutes": 15,
    "isPremium": false
  },
  {
    "id": "codeforces-2248a",
    "title": "You Delete, I Delete",
    "platform": "Codeforces",
    "platformProblemId": "2248A",
    "url": "https://codeforces.com/problemset/problem/2248/A",
    "difficulty": "Easy",
    "tags": [
      "greedy"
    ],
    "dsaPatterns": [
      "greedy"
    ],
    "estimatedSolvingTimeMinutes": 15,
    "isPremium": false
  },
  {
    "id": "codeforces-2247f",
    "title": "Paths on a Grid",
    "platform": "Codeforces",
    "platformProblemId": "2247F",
    "url": "https://codeforces.com/problemset/problem/2247/F",
    "difficulty": "Medium",
    "tags": [
      "data structures",
      "dp",
      "hashing"
    ],
    "dsaPatterns": [
      "dynamic_programming",
      "hashing"
    ],
    "estimatedSolvingTimeMinutes": 30,
    "isPremium": false
  },
  {
    "id": "codeforces-2247e",
    "title": "Build a Tree",
    "platform": "Codeforces",
    "platformProblemId": "2247E",
    "url": "https://codeforces.com/problemset/problem/2247/E",
    "difficulty": "Medium",
    "tags": [
      "constructive algorithms",
      "trees",
      "two pointers"
    ],
    "dsaPatterns": [
      "two_pointers",
      "trees",
      "geometry"
    ],
    "estimatedSolvingTimeMinutes": 30,
    "isPremium": false
  },
  {
    "id": "codeforces-2247d2",
    "title": "XOR Sorting (Hard Version)",
    "platform": "Codeforces",
    "platformProblemId": "2247D2",
    "url": "https://codeforces.com/problemset/problem/2247/D2",
    "difficulty": "Medium",
    "tags": [
      "bitmasks",
      "data structures",
      "greedy"
    ],
    "dsaPatterns": [
      "sorting",
      "greedy",
      "bit_manipulation"
    ],
    "estimatedSolvingTimeMinutes": 30,
    "isPremium": false
  },
  {
    "id": "codeforces-2247d1",
    "title": "XOR Sorting (Easy Version)",
    "platform": "Codeforces",
    "platformProblemId": "2247D1",
    "url": "https://codeforces.com/problemset/problem/2247/D1",
    "difficulty": "Medium",
    "tags": [
      "bitmasks",
      "greedy"
    ],
    "dsaPatterns": [
      "sorting",
      "greedy",
      "bit_manipulation"
    ],
    "estimatedSolvingTimeMinutes": 30,
    "isPremium": false
  },
  {
    "id": "codeforces-2247c",
    "title": "Inversion of a Subsequence",
    "platform": "Codeforces",
    "platformProblemId": "2247C",
    "url": "https://codeforces.com/problemset/problem/2247/C",
    "difficulty": "Medium",
    "tags": [
      "greedy",
      "math"
    ],
    "dsaPatterns": [
      "greedy",
      "math"
    ],
    "estimatedSolvingTimeMinutes": 30,
    "isPremium": false
  },
  {
    "id": "codeforces-2247b",
    "title": "Yet Another Constructive",
    "platform": "Codeforces",
    "platformProblemId": "2247B",
    "url": "https://codeforces.com/problemset/problem/2247/B",
    "difficulty": "Easy",
    "tags": [
      "constructive algorithms"
    ],
    "dsaPatterns": [
      "arrays"
    ],
    "estimatedSolvingTimeMinutes": 15,
    "isPremium": false
  },
  {
    "id": "codeforces-2247a",
    "title": "Zero Sum",
    "platform": "Codeforces",
    "platformProblemId": "2247A",
    "url": "https://codeforces.com/problemset/problem/2247/A",
    "difficulty": "Easy",
    "tags": [
      "constructive algorithms",
      "dp",
      "number theory"
    ],
    "dsaPatterns": [
      "dynamic_programming",
      "math"
    ],
    "estimatedSolvingTimeMinutes": 15,
    "isPremium": false
  },
  {
    "id": "codeforces-2246f",
    "title": "Whoname and Unsorted Array",
    "platform": "Codeforces",
    "platformProblemId": "2246F",
    "url": "https://codeforces.com/problemset/problem/2246/F",
    "difficulty": "Medium",
    "tags": [
      "constructive algorithms"
    ],
    "dsaPatterns": [
      "sorting",
      "arrays"
    ],
    "estimatedSolvingTimeMinutes": 30,
    "isPremium": false
  },
  {
    "id": "codeforces-2246e",
    "title": "lce4113 and Security Game",
    "platform": "Codeforces",
    "platformProblemId": "2246E",
    "url": "https://codeforces.com/problemset/problem/2246/E",
    "difficulty": "Medium",
    "tags": [
      "bitmasks",
      "interactive",
      "math",
      "probabilities"
    ],
    "dsaPatterns": [
      "bit_manipulation",
      "math"
    ],
    "estimatedSolvingTimeMinutes": 30,
    "isPremium": false
  },
  {
    "id": "codeforces-2246d",
    "title": "diss_quack and Array Game",
    "platform": "Codeforces",
    "platformProblemId": "2246D",
    "url": "https://codeforces.com/problemset/problem/2246/D",
    "difficulty": "Medium",
    "tags": [
      "bitmasks",
      "brute force",
      "games",
      "greedy"
    ],
    "dsaPatterns": [
      "greedy",
      "bit_manipulation",
      "arrays"
    ],
    "estimatedSolvingTimeMinutes": 30,
    "isPremium": false
  },
  {
    "id": "codeforces-2246c",
    "title": "0mar and Alternating Sums",
    "platform": "Codeforces",
    "platformProblemId": "2246C",
    "url": "https://codeforces.com/problemset/problem/2246/C",
    "difficulty": "Medium",
    "tags": [
      "combinatorics",
      "dp",
      "math"
    ],
    "dsaPatterns": [
      "dynamic_programming",
      "math"
    ],
    "estimatedSolvingTimeMinutes": 30,
    "isPremium": false
  },
  {
    "id": "codeforces-2246b",
    "title": "ezraft and Array",
    "platform": "Codeforces",
    "platformProblemId": "2246B",
    "url": "https://codeforces.com/problemset/problem/2246/B",
    "difficulty": "Easy",
    "tags": [
      "constructive algorithms",
      "number theory"
    ],
    "dsaPatterns": [
      "math",
      "arrays"
    ],
    "estimatedSolvingTimeMinutes": 15,
    "isPremium": false
  },
  {
    "id": "codeforces-2246a",
    "title": "farmpiggie and Subset Sum",
    "platform": "Codeforces",
    "platformProblemId": "2246A",
    "url": "https://codeforces.com/problemset/problem/2246/A",
    "difficulty": "Easy",
    "tags": [
      "constructive algorithms"
    ],
    "dsaPatterns": [
      "hashing",
      "backtracking"
    ],
    "estimatedSolvingTimeMinutes": 15,
    "isPremium": false
  },
  {
    "id": "codeforces-2245h",
    "title": "Connect Connect See",
    "platform": "Codeforces",
    "platformProblemId": "2245H",
    "url": "https://codeforces.com/problemset/problem/2245/H",
    "difficulty": "Medium",
    "tags": [
      "brute force",
      "data structures"
    ],
    "dsaPatterns": [
      "arrays"
    ],
    "estimatedSolvingTimeMinutes": 30,
    "isPremium": false
  },
  {
    "id": "codeforces-2245g",
    "title": "NPC Challenge",
    "platform": "Codeforces",
    "platformProblemId": "2245G",
    "url": "https://codeforces.com/problemset/problem/2245/G",
    "difficulty": "Medium",
    "tags": [
      "divide and conquer",
      "interactive"
    ],
    "dsaPatterns": [
      "divide_and_conquer"
    ],
    "estimatedSolvingTimeMinutes": 30,
    "isPremium": false
  },
  {
    "id": "codeforces-2245f",
    "title": "Familiar?",
    "platform": "Codeforces",
    "platformProblemId": "2245F",
    "url": "https://codeforces.com/problemset/problem/2245/F",
    "difficulty": "Medium",
    "tags": [
      "brute force",
      "combinatorics",
      "dp"
    ],
    "dsaPatterns": [
      "dynamic_programming",
      "math"
    ],
    "estimatedSolvingTimeMinutes": 30,
    "isPremium": false
  },
  {
    "id": "codeforces-2245e",
    "title": "Tom and Jerry",
    "platform": "Codeforces",
    "platformProblemId": "2245E",
    "url": "https://codeforces.com/problemset/problem/2245/E",
    "difficulty": "Medium",
    "tags": [
      "dfs and similar",
      "dsu",
      "games",
      "trees"
    ],
    "dsaPatterns": [
      "graphs",
      "dfs",
      "trees",
      "union_find"
    ],
    "estimatedSolvingTimeMinutes": 30,
    "isPremium": false
  },
  {
    "id": "codeforces-2245d2",
    "title": "Construct an Array (Hard Version)",
    "platform": "Codeforces",
    "platformProblemId": "2245D2",
    "url": "https://codeforces.com/problemset/problem/2245/D2",
    "difficulty": "Medium",
    "tags": [
      "2-sat",
      "constructive algorithms",
      "dfs and similar",
      "graphs",
      "implementation"
    ],
    "dsaPatterns": [
      "graphs",
      "dfs",
      "arrays"
    ],
    "estimatedSolvingTimeMinutes": 30,
    "isPremium": false
  },
  {
    "id": "codeforces-2245d1",
    "title": "Construct an Array (Easy Version)",
    "platform": "Codeforces",
    "platformProblemId": "2245D1",
    "url": "https://codeforces.com/problemset/problem/2245/D1",
    "difficulty": "Medium",
    "tags": [
      "dfs and similar",
      "implementation",
      "sortings"
    ],
    "dsaPatterns": [
      "graphs",
      "dfs",
      "sorting",
      "arrays"
    ],
    "estimatedSolvingTimeMinutes": 30,
    "isPremium": false
  },
  {
    "id": "codeforces-2245c",
    "title": "MEXOR",
    "platform": "Codeforces",
    "platformProblemId": "2245C",
    "url": "https://codeforces.com/problemset/problem/2245/C",
    "difficulty": "Medium",
    "tags": [
      "bitmasks",
      "constructive algorithms",
      "math"
    ],
    "dsaPatterns": [
      "bit_manipulation",
      "math"
    ],
    "estimatedSolvingTimeMinutes": 30,
    "isPremium": false
  },
  {
    "id": "codeforces-2245b",
    "title": "Delete and Concatenate",
    "platform": "Codeforces",
    "platformProblemId": "2245B",
    "url": "https://codeforces.com/problemset/problem/2245/B",
    "difficulty": "Easy",
    "tags": [
      "greedy"
    ],
    "dsaPatterns": [
      "greedy"
    ],
    "estimatedSolvingTimeMinutes": 15,
    "isPremium": false
  },
  {
    "id": "codeforces-2245a",
    "title": "Who Watches the Watchpig?",
    "platform": "Codeforces",
    "platformProblemId": "2245A",
    "url": "https://codeforces.com/problemset/problem/2245/A",
    "difficulty": "Easy",
    "tags": [
      "greedy"
    ],
    "dsaPatterns": [
      "greedy"
    ],
    "estimatedSolvingTimeMinutes": 15,
    "isPremium": false
  },
  {
    "id": "codeforces-2244g",
    "title": "Yura and Deadlines",
    "platform": "Codeforces",
    "platformProblemId": "2244G",
    "url": "https://codeforces.com/problemset/problem/2244/G",
    "difficulty": "Medium",
    "tags": [
      "data structures",
      "dp"
    ],
    "dsaPatterns": [
      "dynamic_programming"
    ],
    "estimatedSolvingTimeMinutes": 30,
    "isPremium": false
  },
  {
    "id": "codeforces-2244f",
    "title": "Anya Loves Trees!",
    "platform": "Codeforces",
    "platformProblemId": "2244F",
    "url": "https://codeforces.com/problemset/problem/2244/F",
    "difficulty": "Medium",
    "tags": [
      "dfs and similar",
      "dp",
      "greedy",
      "trees"
    ],
    "dsaPatterns": [
      "dynamic_programming",
      "graphs",
      "dfs",
      "trees",
      "greedy"
    ],
    "estimatedSolvingTimeMinutes": 30,
    "isPremium": false
  },
  {
    "id": "codeforces-2244e",
    "title": "Masha and the Garland",
    "platform": "Codeforces",
    "platformProblemId": "2244E",
    "url": "https://codeforces.com/problemset/problem/2244/E",
    "difficulty": "Medium",
    "tags": [
      "data structures",
      "dp",
      "greedy",
      "implementation",
      "math",
      "number theory",
      "strings"
    ],
    "dsaPatterns": [
      "dynamic_programming",
      "greedy",
      "math",
      "strings"
    ],
    "estimatedSolvingTimeMinutes": 30,
    "isPremium": false
  },
  {
    "id": "codeforces-2244d",
    "title": "Yaroslav and Productivity",
    "platform": "Codeforces",
    "platformProblemId": "2244D",
    "url": "https://codeforces.com/problemset/problem/2244/D",
    "difficulty": "Medium",
    "tags": [
      "constructive algorithms",
      "dp",
      "greedy",
      "math",
      "number theory"
    ],
    "dsaPatterns": [
      "dynamic_programming",
      "greedy",
      "math"
    ],
    "estimatedSolvingTimeMinutes": 30,
    "isPremium": false
  },
  {
    "id": "codeforces-2244c",
    "title": "Stepan and Permutation",
    "platform": "Codeforces",
    "platformProblemId": "2244C",
    "url": "https://codeforces.com/problemset/problem/2244/C",
    "difficulty": "Medium",
    "tags": [
      "constructive algorithms",
      "dfs and similar",
      "dsu",
      "greedy",
      "math",
      "number theory",
      "sortings"
    ],
    "dsaPatterns": [
      "graphs",
      "dfs",
      "sorting",
      "greedy",
      "union_find",
      "backtracking",
      "math"
    ],
    "estimatedSolvingTimeMinutes": 30,
    "isPremium": false
  },
  {
    "id": "codeforces-2244b",
    "title": "Nikita and Books",
    "platform": "Codeforces",
    "platformProblemId": "2244B",
    "url": "https://codeforces.com/problemset/problem/2244/B",
    "difficulty": "Easy",
    "tags": [
      "greedy",
      "math",
      "sortings"
    ],
    "dsaPatterns": [
      "sorting",
      "greedy",
      "math"
    ],
    "estimatedSolvingTimeMinutes": 15,
    "isPremium": false
  },
  {
    "id": "codeforces-2244a",
    "title": "Iskander and Drawings",
    "platform": "Codeforces",
    "platformProblemId": "2244A",
    "url": "https://codeforces.com/problemset/problem/2244/A",
    "difficulty": "Easy",
    "tags": [
      "dp",
      "games",
      "greedy",
      "strings"
    ],
    "dsaPatterns": [
      "dynamic_programming",
      "greedy",
      "strings"
    ],
    "estimatedSolvingTimeMinutes": 15,
    "isPremium": false
  },
  {
    "id": "codeforces-2242f",
    "title": "Summer Vacation",
    "platform": "Codeforces",
    "platformProblemId": "2242F",
    "url": "https://codeforces.com/problemset/problem/2242/F",
    "difficulty": "Hard",
    "tags": [
      "data structures",
      "dp",
      "probabilities",
      "trees"
    ],
    "dsaPatterns": [
      "dynamic_programming",
      "trees"
    ],
    "estimatedSolvingTimeMinutes": 45,
    "isPremium": false
  },
  {
    "id": "codeforces-2242e",
    "title": "Product of Closures",
    "platform": "Codeforces",
    "platformProblemId": "2242E",
    "url": "https://codeforces.com/problemset/problem/2242/E",
    "difficulty": "Hard",
    "tags": [
      "bitmasks",
      "brute force",
      "constructive algorithms",
      "greedy",
      "implementation",
      "math",
      "number theory"
    ],
    "dsaPatterns": [
      "greedy",
      "bit_manipulation",
      "math"
    ],
    "estimatedSolvingTimeMinutes": 45,
    "isPremium": false
  },
  {
    "id": "codeforces-2242d",
    "title": "Two Digit Strings",
    "platform": "Codeforces",
    "platformProblemId": "2242D",
    "url": "https://codeforces.com/problemset/problem/2242/D",
    "difficulty": "Medium",
    "tags": [
      "dp",
      "strings"
    ],
    "dsaPatterns": [
      "dynamic_programming",
      "strings"
    ],
    "estimatedSolvingTimeMinutes": 30,
    "isPremium": false
  },
  {
    "id": "codeforces-2242c",
    "title": "Unstable Elements",
    "platform": "Codeforces",
    "platformProblemId": "2242C",
    "url": "https://codeforces.com/problemset/problem/2242/C",
    "difficulty": "Medium",
    "tags": [
      "brute force",
      "data structures",
      "implementation",
      "sortings",
      "two pointers"
    ],
    "dsaPatterns": [
      "two_pointers",
      "sorting",
      "geometry"
    ],
    "estimatedSolvingTimeMinutes": 30,
    "isPremium": false
  },
  {
    "id": "codeforces-2242b",
    "title": "Predominant Frequency Division",
    "platform": "Codeforces",
    "platformProblemId": "2242B",
    "url": "https://codeforces.com/problemset/problem/2242/B",
    "difficulty": "Easy",
    "tags": [
      "data structures",
      "greedy",
      "implementation",
      "math"
    ],
    "dsaPatterns": [
      "hashing",
      "greedy",
      "math"
    ],
    "estimatedSolvingTimeMinutes": 15,
    "isPremium": false
  },
  {
    "id": "codeforces-2242a",
    "title": "Bigrams",
    "platform": "Codeforces",
    "platformProblemId": "2242A",
    "url": "https://codeforces.com/problemset/problem/2242/A",
    "difficulty": "Easy",
    "tags": [
      "sortings",
      "strings"
    ],
    "dsaPatterns": [
      "sorting",
      "strings"
    ],
    "estimatedSolvingTimeMinutes": 15,
    "isPremium": false
  },
  {
    "id": "codeforces-2241g",
    "title": "Summmon",
    "platform": "Codeforces",
    "platformProblemId": "2241G",
    "url": "https://codeforces.com/problemset/problem/2241/G",
    "difficulty": "Hard",
    "tags": [
      "binary search",
      "data structures",
      "greedy",
      "implementation",
      "math",
      "number theory"
    ],
    "dsaPatterns": [
      "binary_search",
      "greedy",
      "math"
    ],
    "estimatedSolvingTimeMinutes": 45,
    "isPremium": false
  },
  {
    "id": "codeforces-2241f",
    "title": "A Bit Odd",
    "platform": "Codeforces",
    "platformProblemId": "2241F",
    "url": "https://codeforces.com/problemset/problem/2241/F",
    "difficulty": "Medium",
    "tags": [
      "data structures",
      "games",
      "greedy",
      "math"
    ],
    "dsaPatterns": [
      "greedy",
      "bit_manipulation",
      "math"
    ],
    "estimatedSolvingTimeMinutes": 30,
    "isPremium": false
  },
  {
    "id": "codeforces-2241e",
    "title": "Fair and Square",
    "platform": "Codeforces",
    "platformProblemId": "2241E",
    "url": "https://codeforces.com/problemset/problem/2241/E",
    "difficulty": "Medium",
    "tags": [
      "combinatorics",
      "dp",
      "graphs",
      "math",
      "number theory",
      "trees"
    ],
    "dsaPatterns": [
      "dynamic_programming",
      "graphs",
      "trees",
      "math"
    ],
    "estimatedSolvingTimeMinutes": 30,
    "isPremium": false
  },
  {
    "id": "codeforces-2241d",
    "title": "An Alternative Way",
    "platform": "Codeforces",
    "platformProblemId": "2241D",
    "url": "https://codeforces.com/problemset/problem/2241/D",
    "difficulty": "Easy",
    "tags": [
      "dp",
      "greedy",
      "math"
    ],
    "dsaPatterns": [
      "dynamic_programming",
      "greedy",
      "math"
    ],
    "estimatedSolvingTimeMinutes": 15,
    "isPremium": false
  },
  {
    "id": "codeforces-2241c",
    "title": "RemovevomeR",
    "platform": "Codeforces",
    "platformProblemId": "2241C",
    "url": "https://codeforces.com/problemset/problem/2241/C",
    "difficulty": "Easy",
    "tags": [
      "greedy"
    ],
    "dsaPatterns": [
      "greedy"
    ],
    "estimatedSolvingTimeMinutes": 15,
    "isPremium": false
  },
  {
    "id": "codeforces-2241b",
    "title": "Good times Good times",
    "platform": "Codeforces",
    "platformProblemId": "2241B",
    "url": "https://codeforces.com/problemset/problem/2241/B",
    "difficulty": "Easy",
    "tags": [
      "constructive algorithms",
      "dfs and similar",
      "math"
    ],
    "dsaPatterns": [
      "graphs",
      "dfs",
      "math"
    ],
    "estimatedSolvingTimeMinutes": 15,
    "isPremium": false
  },
  {
    "id": "codeforces-2241a",
    "title": "Divide and Conquer",
    "platform": "Codeforces",
    "platformProblemId": "2241A",
    "url": "https://codeforces.com/problemset/problem/2241/A",
    "difficulty": "Easy",
    "tags": [
      "greedy",
      "math",
      "number theory"
    ],
    "dsaPatterns": [
      "greedy",
      "divide_and_conquer",
      "math"
    ],
    "estimatedSolvingTimeMinutes": 15,
    "isPremium": false
  },
  {
    "id": "codeforces-2240b",
    "title": "AI Finds Nothing Here",
    "platform": "Codeforces",
    "platformProblemId": "2240B",
    "url": "https://codeforces.com/problemset/problem/2240/B",
    "difficulty": "Easy",
    "tags": [
      "combinatorics",
      "math"
    ],
    "dsaPatterns": [
      "math"
    ],
    "estimatedSolvingTimeMinutes": 15,
    "isPremium": false
  },
  {
    "id": "codeforces-2240a",
    "title": "Another Popcount Problem",
    "platform": "Codeforces",
    "platformProblemId": "2240A",
    "url": "https://codeforces.com/problemset/problem/2240/A",
    "difficulty": "Easy",
    "tags": [
      "greedy"
    ],
    "dsaPatterns": [
      "greedy"
    ],
    "estimatedSolvingTimeMinutes": 15,
    "isPremium": false
  },
  {
    "id": "codeforces-2239f",
    "title": "Colorful Works",
    "platform": "Codeforces",
    "platformProblemId": "2239F",
    "url": "https://codeforces.com/problemset/problem/2239/F",
    "difficulty": "Hard",
    "tags": [
      "dp",
      "fft",
      "games",
      "implementation"
    ],
    "dsaPatterns": [
      "dynamic_programming"
    ],
    "estimatedSolvingTimeMinutes": 45,
    "isPremium": false
  },
  {
    "id": "codeforces-2239e",
    "title": "The end of this world,",
    "platform": "Codeforces",
    "platformProblemId": "2239E",
    "url": "https://codeforces.com/problemset/problem/2239/E",
    "difficulty": "Hard",
    "tags": [
      "data structures",
      "divide and conquer",
      "dsu",
      "graphs"
    ],
    "dsaPatterns": [
      "graphs",
      "union_find",
      "divide_and_conquer"
    ],
    "estimatedSolvingTimeMinutes": 45,
    "isPremium": false
  },
  {
    "id": "codeforces-2239d",
    "title": "Hunting the Beast",
    "platform": "Codeforces",
    "platformProblemId": "2239D",
    "url": "https://codeforces.com/problemset/problem/2239/D",
    "difficulty": "Hard",
    "tags": [
      "combinatorics",
      "dp",
      "graphs",
      "math"
    ],
    "dsaPatterns": [
      "dynamic_programming",
      "graphs",
      "math"
    ],
    "estimatedSolvingTimeMinutes": 45,
    "isPremium": false
  },
  {
    "id": "codeforces-2239c",
    "title": "Revival",
    "platform": "Codeforces",
    "platformProblemId": "2239C",
    "url": "https://codeforces.com/problemset/problem/2239/C",
    "difficulty": "Hard",
    "tags": [
      "binary search",
      "data structures",
      "math",
      "two pointers"
    ],
    "dsaPatterns": [
      "two_pointers",
      "binary_search",
      "math",
      "geometry"
    ],
    "estimatedSolvingTimeMinutes": 45,
    "isPremium": false
  },
  {
    "id": "codeforces-2239b",
    "title": "Decidophobia",
    "platform": "Codeforces",
    "platformProblemId": "2239B",
    "url": "https://codeforces.com/problemset/problem/2239/B",
    "difficulty": "Medium",
    "tags": [
      "greedy",
      "math",
      "sortings",
      "two pointers"
    ],
    "dsaPatterns": [
      "two_pointers",
      "sorting",
      "greedy",
      "math",
      "geometry"
    ],
    "estimatedSolvingTimeMinutes": 30,
    "isPremium": false
  },
  {
    "id": "codeforces-2239a",
    "title": "Nim Game Is XOR Game",
    "platform": "Codeforces",
    "platformProblemId": "2239A",
    "url": "https://codeforces.com/problemset/problem/2239/A",
    "difficulty": "Medium",
    "tags": [
      "constructive algorithms",
      "games",
      "greedy",
      "math"
    ],
    "dsaPatterns": [
      "greedy",
      "bit_manipulation",
      "math"
    ],
    "estimatedSolvingTimeMinutes": 30,
    "isPremium": false
  },
  {
    "id": "codeforces-2238f",
    "title": "Infinite Work",
    "platform": "Codeforces",
    "platformProblemId": "2238F",
    "url": "https://codeforces.com/problemset/problem/2238/F",
    "difficulty": "Hard",
    "tags": [
      "combinatorics",
      "graphs",
      "greedy",
      "math",
      "trees"
    ],
    "dsaPatterns": [
      "graphs",
      "trees",
      "greedy",
      "math"
    ],
    "estimatedSolvingTimeMinutes": 45,
    "isPremium": false
  },
  {
    "id": "codeforces-2238e",
    "title": "Cake Trial",
    "platform": "Codeforces",
    "platformProblemId": "2238E",
    "url": "https://codeforces.com/problemset/problem/2238/E",
    "difficulty": "Hard",
    "tags": [
      "dp",
      "greedy"
    ],
    "dsaPatterns": [
      "dynamic_programming",
      "greedy"
    ],
    "estimatedSolvingTimeMinutes": 45,
    "isPremium": false
  },
  {
    "id": "codeforces-2238d",
    "title": "Storming Arasaka",
    "platform": "Codeforces",
    "platformProblemId": "2238D",
    "url": "https://codeforces.com/problemset/problem/2238/D",
    "difficulty": "Medium",
    "tags": [
      "greedy",
      "math",
      "number theory"
    ],
    "dsaPatterns": [
      "greedy",
      "math"
    ],
    "estimatedSolvingTimeMinutes": 30,
    "isPremium": false
  },
  {
    "id": "codeforces-2238c",
    "title": "Village Guilds",
    "platform": "Codeforces",
    "platformProblemId": "2238C",
    "url": "https://codeforces.com/problemset/problem/2238/C",
    "difficulty": "Medium",
    "tags": [
      "dfs and similar",
      "dp",
      "trees"
    ],
    "dsaPatterns": [
      "dynamic_programming",
      "graphs",
      "dfs",
      "trees"
    ],
    "estimatedSolvingTimeMinutes": 30,
    "isPremium": false
  },
  {
    "id": "codeforces-2238b",
    "title": "Crimson Triples",
    "platform": "Codeforces",
    "platformProblemId": "2238B",
    "url": "https://codeforces.com/problemset/problem/2238/B",
    "difficulty": "Easy",
    "tags": [
      "dp",
      "math",
      "number theory"
    ],
    "dsaPatterns": [
      "dynamic_programming",
      "math"
    ],
    "estimatedSolvingTimeMinutes": 15,
    "isPremium": false
  },
  {
    "id": "codeforces-2238a",
    "title": "Another Puzzle from Papyrus",
    "platform": "Codeforces",
    "platformProblemId": "2238A",
    "url": "https://codeforces.com/problemset/problem/2238/A",
    "difficulty": "Easy",
    "tags": [
      "greedy",
      "math",
      "sortings"
    ],
    "dsaPatterns": [
      "sorting",
      "greedy",
      "math"
    ],
    "estimatedSolvingTimeMinutes": 15,
    "isPremium": false
  },
  {
    "id": "codeforces-2237i2",
    "title": "DBFS Order (Hard Version)",
    "platform": "Codeforces",
    "platformProblemId": "2237I2",
    "url": "https://codeforces.com/problemset/problem/2237/I2",
    "difficulty": "Hard",
    "tags": [
      "dp",
      "trees"
    ],
    "dsaPatterns": [
      "dynamic_programming",
      "graphs",
      "bfs",
      "trees"
    ],
    "estimatedSolvingTimeMinutes": 45,
    "isPremium": false
  },
  {
    "id": "codeforces-2237i1",
    "title": "DBFS Order (Easy Version)",
    "platform": "Codeforces",
    "platformProblemId": "2237I1",
    "url": "https://codeforces.com/problemset/problem/2237/I1",
    "difficulty": "Hard",
    "tags": [
      "dp",
      "trees"
    ],
    "dsaPatterns": [
      "dynamic_programming",
      "graphs",
      "bfs",
      "trees"
    ],
    "estimatedSolvingTimeMinutes": 45,
    "isPremium": false
  },
  {
    "id": "codeforces-2237h",
    "title": "Slime and Queries",
    "platform": "Codeforces",
    "platformProblemId": "2237H",
    "url": "https://codeforces.com/problemset/problem/2237/H",
    "difficulty": "Hard",
    "tags": [
      "data structures",
      "greedy",
      "trees"
    ],
    "dsaPatterns": [
      "trees",
      "greedy"
    ],
    "estimatedSolvingTimeMinutes": 45,
    "isPremium": false
  },
  {
    "id": "codeforces-2237g",
    "title": "Send GCDs",
    "platform": "Codeforces",
    "platformProblemId": "2237G",
    "url": "https://codeforces.com/problemset/problem/2237/G",
    "difficulty": "Hard",
    "tags": [
      "communication",
      "constructive algorithms",
      "interactive",
      "math",
      "number theory"
    ],
    "dsaPatterns": [
      "math"
    ],
    "estimatedSolvingTimeMinutes": 45,
    "isPremium": false
  },
  {
    "id": "codeforces-2237f",
    "title": "Paint the Array",
    "platform": "Codeforces",
    "platformProblemId": "2237F",
    "url": "https://codeforces.com/problemset/problem/2237/F",
    "difficulty": "Hard",
    "tags": [
      "data structures",
      "dp",
      "greedy"
    ],
    "dsaPatterns": [
      "dynamic_programming",
      "greedy",
      "arrays"
    ],
    "estimatedSolvingTimeMinutes": 45,
    "isPremium": false
  },
  {
    "id": "codeforces-2237e",
    "title": "Permutation Commutation",
    "platform": "Codeforces",
    "platformProblemId": "2237E",
    "url": "https://codeforces.com/problemset/problem/2237/E",
    "difficulty": "Hard",
    "tags": [
      "data structures",
      "graphs",
      "greedy"
    ],
    "dsaPatterns": [
      "graphs",
      "greedy",
      "backtracking"
    ],
    "estimatedSolvingTimeMinutes": 45,
    "isPremium": false
  },
  {
    "id": "codeforces-2237d",
    "title": "Fullmetal Bitchemist",
    "platform": "Codeforces",
    "platformProblemId": "2237D",
    "url": "https://codeforces.com/problemset/problem/2237/D",
    "difficulty": "Medium",
    "tags": [
      "constructive algorithms",
      "greedy",
      "math"
    ],
    "dsaPatterns": [
      "greedy",
      "bit_manipulation",
      "math"
    ],
    "estimatedSolvingTimeMinutes": 30,
    "isPremium": false
  },
  {
    "id": "codeforces-2237c",
    "title": "Duck Surplus",
    "platform": "Codeforces",
    "platformProblemId": "2237C",
    "url": "https://codeforces.com/problemset/problem/2237/C",
    "difficulty": "Easy",
    "tags": [
      "binary search",
      "greedy"
    ],
    "dsaPatterns": [
      "binary_search",
      "greedy"
    ],
    "estimatedSolvingTimeMinutes": 15,
    "isPremium": false
  },
  {
    "id": "codeforces-2237b",
    "title": "Annoying the Ghost",
    "platform": "Codeforces",
    "platformProblemId": "2237B",
    "url": "https://codeforces.com/problemset/problem/2237/B",
    "difficulty": "Easy",
    "tags": [
      "brute force",
      "greedy"
    ],
    "dsaPatterns": [
      "greedy"
    ],
    "estimatedSolvingTimeMinutes": 15,
    "isPremium": false
  },
  {
    "id": "codeforces-2237a",
    "title": "Destroying Towers",
    "platform": "Codeforces",
    "platformProblemId": "2237A",
    "url": "https://codeforces.com/problemset/problem/2237/A",
    "difficulty": "Easy",
    "tags": [
      "games",
      "greedy",
      "schedules"
    ],
    "dsaPatterns": [
      "greedy"
    ],
    "estimatedSolvingTimeMinutes": 15,
    "isPremium": false
  },
  {
    "id": "codeforces-2236g",
    "title": "Criterion in Burlandia",
    "platform": "Codeforces",
    "platformProblemId": "2236G",
    "url": "https://codeforces.com/problemset/problem/2236/G",
    "difficulty": "Hard",
    "tags": [
      "binary search",
      "bitmasks",
      "brute force",
      "data structures",
      "dfs and similar",
      "divide and conquer",
      "implementation",
      "trees",
      "two pointers"
    ],
    "dsaPatterns": [
      "two_pointers",
      "binary_search",
      "graphs",
      "dfs",
      "trees",
      "divide_and_conquer",
      "bit_manipulation",
      "geometry"
    ],
    "estimatedSolvingTimeMinutes": 45,
    "isPremium": false
  },
  {
    "id": "codeforces-2236f2",
    "title": "Elections in Saransk (hard version)",
    "platform": "Codeforces",
    "platformProblemId": "2236F2",
    "url": "https://codeforces.com/problemset/problem/2236/F2",
    "difficulty": "Hard",
    "tags": [
      "combinatorics",
      "dp",
      "math",
      "number theory"
    ],
    "dsaPatterns": [
      "dynamic_programming",
      "math"
    ],
    "estimatedSolvingTimeMinutes": 45,
    "isPremium": false
  },
  {
    "id": "codeforces-2236f1",
    "title": "Elections in Saransk (easy version)",
    "platform": "Codeforces",
    "platformProblemId": "2236F1",
    "url": "https://codeforces.com/problemset/problem/2236/F1",
    "difficulty": "Medium",
    "tags": [
      "number theory"
    ],
    "dsaPatterns": [
      "math"
    ],
    "estimatedSolvingTimeMinutes": 30,
    "isPremium": false
  },
  {
    "id": "codeforces-2236e",
    "title": "Friendly Gifts",
    "platform": "Codeforces",
    "platformProblemId": "2236E",
    "url": "https://codeforces.com/problemset/problem/2236/E",
    "difficulty": "Medium",
    "tags": [
      "brute force",
      "dp"
    ],
    "dsaPatterns": [
      "dynamic_programming"
    ],
    "estimatedSolvingTimeMinutes": 30,
    "isPremium": false
  },
  {
    "id": "codeforces-2236d",
    "title": "Brand New Tatar TV Show",
    "platform": "Codeforces",
    "platformProblemId": "2236D",
    "url": "https://codeforces.com/problemset/problem/2236/D",
    "difficulty": "Medium",
    "tags": [
      "binary search",
      "constructive algorithms",
      "dp",
      "games",
      "math"
    ],
    "dsaPatterns": [
      "binary_search",
      "dynamic_programming",
      "math"
    ],
    "estimatedSolvingTimeMinutes": 30,
    "isPremium": false
  },
  {
    "id": "codeforces-2236c",
    "title": "Omsk Programmers",
    "platform": "Codeforces",
    "platformProblemId": "2236C",
    "url": "https://codeforces.com/problemset/problem/2236/C",
    "difficulty": "Easy",
    "tags": [
      "brute force",
      "greedy",
      "math"
    ],
    "dsaPatterns": [
      "greedy",
      "math"
    ],
    "estimatedSolvingTimeMinutes": 15,
    "isPremium": false
  },
  {
    "id": "codeforces-2236b",
    "title": "Tatar TV Show",
    "platform": "Codeforces",
    "platformProblemId": "2236B",
    "url": "https://codeforces.com/problemset/problem/2236/B",
    "difficulty": "Easy",
    "tags": [
      "greedy",
      "math",
      "strings"
    ],
    "dsaPatterns": [
      "greedy",
      "math",
      "strings"
    ],
    "estimatedSolvingTimeMinutes": 15,
    "isPremium": false
  },
  {
    "id": "codeforces-2236a",
    "title": "Games on the Train",
    "platform": "Codeforces",
    "platformProblemId": "2236A",
    "url": "https://codeforces.com/problemset/problem/2236/A",
    "difficulty": "Easy",
    "tags": [
      "greedy",
      "math"
    ],
    "dsaPatterns": [
      "greedy",
      "math"
    ],
    "estimatedSolvingTimeMinutes": 15,
    "isPremium": false
  },
  {
    "id": "codeforces-2234g",
    "title": "Stripe, Token and Two Players",
    "platform": "Codeforces",
    "platformProblemId": "2234G",
    "url": "https://codeforces.com/problemset/problem/2234/G",
    "difficulty": "Hard",
    "tags": [
      "data structures",
      "dp",
      "games"
    ],
    "dsaPatterns": [
      "dynamic_programming"
    ],
    "estimatedSolvingTimeMinutes": 45,
    "isPremium": false
  },
  {
    "id": "codeforces-2234f",
    "title": "Vessels, Heights and Two Versions (Hard Version)",
    "platform": "Codeforces",
    "platformProblemId": "2234F",
    "url": "https://codeforces.com/problemset/problem/2234/F",
    "difficulty": "Hard",
    "tags": [
      "data structures",
      "dfs and similar",
      "dsu",
      "greedy",
      "implementation",
      "two pointers"
    ],
    "dsaPatterns": [
      "two_pointers",
      "graphs",
      "dfs",
      "greedy",
      "union_find",
      "geometry"
    ],
    "estimatedSolvingTimeMinutes": 45,
    "isPremium": false
  },
  {
    "id": "codeforces-2234e",
    "title": "Vlad, Misha and Two Arrays",
    "platform": "Codeforces",
    "platformProblemId": "2234E",
    "url": "https://codeforces.com/problemset/problem/2234/E",
    "difficulty": "Hard",
    "tags": [
      "brute force",
      "combinatorics",
      "dfs and similar",
      "divide and conquer",
      "math"
    ],
    "dsaPatterns": [
      "graphs",
      "dfs",
      "divide_and_conquer",
      "math",
      "arrays"
    ],
    "estimatedSolvingTimeMinutes": 45,
    "isPremium": false
  },
  {
    "id": "codeforces-2234d",
    "title": "XOR, Expression and Two Binary Numbers",
    "platform": "Codeforces",
    "platformProblemId": "2234D",
    "url": "https://codeforces.com/problemset/problem/2234/D",
    "difficulty": "Medium",
    "tags": [
      "bitmasks",
      "divide and conquer",
      "dp",
      "math",
      "number theory"
    ],
    "dsaPatterns": [
      "dynamic_programming",
      "divide_and_conquer",
      "bit_manipulation",
      "math"
    ],
    "estimatedSolvingTimeMinutes": 30,
    "isPremium": false
  },
  {
    "id": "codeforces-2234c",
    "title": "Vessels, Heights and Two Versions (Easy Version)",
    "platform": "Codeforces",
    "platformProblemId": "2234C",
    "url": "https://codeforces.com/problemset/problem/2234/C",
    "difficulty": "Easy",
    "tags": [
      "dfs and similar",
      "dsu",
      "greedy",
      "implementation",
      "two pointers"
    ],
    "dsaPatterns": [
      "two_pointers",
      "graphs",
      "dfs",
      "greedy",
      "union_find",
      "geometry"
    ],
    "estimatedSolvingTimeMinutes": 15,
    "isPremium": false
  },
  {
    "id": "codeforces-2234b",
    "title": "Palindrome, Twelve and Two Terms",
    "platform": "Codeforces",
    "platformProblemId": "2234B",
    "url": "https://codeforces.com/problemset/problem/2234/B",
    "difficulty": "Easy",
    "tags": [
      "brute force",
      "constructive algorithms",
      "math"
    ],
    "dsaPatterns": [
      "math",
      "strings"
    ],
    "estimatedSolvingTimeMinutes": 15,
    "isPremium": false
  },
  {
    "id": "codeforces-2234a",
    "title": "Euclid, Sequence and Two Numbers",
    "platform": "Codeforces",
    "platformProblemId": "2234A",
    "url": "https://codeforces.com/problemset/problem/2234/A",
    "difficulty": "Easy",
    "tags": [
      "math",
      "number theory",
      "sortings"
    ],
    "dsaPatterns": [
      "sorting",
      "math"
    ],
    "estimatedSolvingTimeMinutes": 15,
    "isPremium": false
  },
  {
    "id": "codeforces-2233f",
    "title": "Shortest GCD Paths",
    "platform": "Codeforces",
    "platformProblemId": "2233F",
    "url": "https://codeforces.com/problemset/problem/2233/F",
    "difficulty": "Hard",
    "tags": [
      "dp",
      "graphs",
      "math",
      "number theory",
      "shortest paths"
    ],
    "dsaPatterns": [
      "dynamic_programming",
      "graphs",
      "math"
    ],
    "estimatedSolvingTimeMinutes": 45,
    "isPremium": false
  },
  {
    "id": "codeforces-2233e2",
    "title": "Permutation Transmission (Difficult Version)",
    "platform": "Codeforces",
    "platformProblemId": "2233E2",
    "url": "https://codeforces.com/problemset/problem/2233/E2",
    "difficulty": "Hard",
    "tags": [
      "bitmasks",
      "combinatorics",
      "sortings"
    ],
    "dsaPatterns": [
      "sorting",
      "backtracking",
      "bit_manipulation",
      "math"
    ],
    "estimatedSolvingTimeMinutes": 45,
    "isPremium": false
  },
  {
    "id": "codeforces-2233e1",
    "title": "Permutation Transmission (Easy Version)",
    "platform": "Codeforces",
    "platformProblemId": "2233E1",
    "url": "https://codeforces.com/problemset/problem/2233/E1",
    "difficulty": "Hard",
    "tags": [
      "bitmasks",
      "combinatorics",
      "sortings"
    ],
    "dsaPatterns": [
      "sorting",
      "backtracking",
      "bit_manipulation",
      "math"
    ],
    "estimatedSolvingTimeMinutes": 45,
    "isPremium": false
  },
  {
    "id": "codeforces-2233d",
    "title": "Goods on the Shelf",
    "platform": "Codeforces",
    "platformProblemId": "2233D",
    "url": "https://codeforces.com/problemset/problem/2233/D",
    "difficulty": "Hard",
    "tags": [
      "brute force",
      "data structures",
      "implementation",
      "two pointers"
    ],
    "dsaPatterns": [
      "two_pointers",
      "geometry"
    ],
    "estimatedSolvingTimeMinutes": 45,
    "isPremium": false
  },
  {
    "id": "codeforces-2233c",
    "title": "Cost of a Bracket Sequence",
    "platform": "Codeforces",
    "platformProblemId": "2233C",
    "url": "https://codeforces.com/problemset/problem/2233/C",
    "difficulty": "Medium",
    "tags": [
      "brute force",
      "dp",
      "greedy"
    ],
    "dsaPatterns": [
      "dynamic_programming",
      "greedy"
    ],
    "estimatedSolvingTimeMinutes": 30,
    "isPremium": false
  },
  {
    "id": "codeforces-2233b",
    "title": "Different Distances",
    "platform": "Codeforces",
    "platformProblemId": "2233B",
    "url": "https://codeforces.com/problemset/problem/2233/B",
    "difficulty": "Easy",
    "tags": [
      "constructive algorithms"
    ],
    "dsaPatterns": [
      "arrays"
    ],
    "estimatedSolvingTimeMinutes": 15,
    "isPremium": false
  },
  {
    "id": "codeforces-2233a",
    "title": "AI Project Development",
    "platform": "Codeforces",
    "platformProblemId": "2233A",
    "url": "https://codeforces.com/problemset/problem/2233/A",
    "difficulty": "Easy",
    "tags": [
      "brute force",
      "math"
    ],
    "dsaPatterns": [
      "math"
    ],
    "estimatedSolvingTimeMinutes": 15,
    "isPremium": false
  },
  {
    "id": "codeforces-2232f",
    "title": "The Cake Is a Lie",
    "platform": "Codeforces",
    "platformProblemId": "2232F",
    "url": "https://codeforces.com/problemset/problem/2232/F",
    "difficulty": "Hard",
    "tags": [
      "greedy",
      "math",
      "number theory"
    ],
    "dsaPatterns": [
      "greedy",
      "math"
    ],
    "estimatedSolvingTimeMinutes": 45,
    "isPremium": false
  },
  {
    "id": "codeforces-2232e",
    "title": "Snaking Arrangement",
    "platform": "Codeforces",
    "platformProblemId": "2232E",
    "url": "https://codeforces.com/problemset/problem/2232/E",
    "difficulty": "Hard",
    "tags": [
      "combinatorics",
      "constructive algorithms"
    ],
    "dsaPatterns": [
      "math"
    ],
    "estimatedSolvingTimeMinutes": 45,
    "isPremium": false
  },
  {
    "id": "codeforces-2232d",
    "title": "Magical Tiered Cake",
    "platform": "Codeforces",
    "platformProblemId": "2232D",
    "url": "https://codeforces.com/problemset/problem/2232/D",
    "difficulty": "Hard",
    "tags": [
      "constructive algorithms",
      "dfs and similar",
      "dp",
      "greedy"
    ],
    "dsaPatterns": [
      "dynamic_programming",
      "graphs",
      "dfs",
      "greedy"
    ],
    "estimatedSolvingTimeMinutes": 45,
    "isPremium": false
  },
  {
    "id": "codeforces-2232c2",
    "title": "Seating Arrangement (Hard Version)",
    "platform": "Codeforces",
    "platformProblemId": "2232C2",
    "url": "https://codeforces.com/problemset/problem/2232/C2",
    "difficulty": "Medium",
    "tags": [
      "binary search",
      "greedy",
      "math",
      "two pointers"
    ],
    "dsaPatterns": [
      "two_pointers",
      "binary_search",
      "greedy",
      "math",
      "geometry"
    ],
    "estimatedSolvingTimeMinutes": 30,
    "isPremium": false
  },
  {
    "id": "codeforces-2232c1",
    "title": "Seating Arrangement (Easy Version)",
    "platform": "Codeforces",
    "platformProblemId": "2232C1",
    "url": "https://codeforces.com/problemset/problem/2232/C1",
    "difficulty": "Medium",
    "tags": [
      "binary search",
      "dp",
      "greedy",
      "two pointers"
    ],
    "dsaPatterns": [
      "two_pointers",
      "binary_search",
      "dynamic_programming",
      "greedy",
      "geometry"
    ],
    "estimatedSolvingTimeMinutes": 30,
    "isPremium": false
  },
  {
    "id": "codeforces-2232b",
    "title": "Cake Leveling",
    "platform": "Codeforces",
    "platformProblemId": "2232B",
    "url": "https://codeforces.com/problemset/problem/2232/B",
    "difficulty": "Easy",
    "tags": [
      "binary search",
      "greedy",
      "math"
    ],
    "dsaPatterns": [
      "binary_search",
      "greedy",
      "math"
    ],
    "estimatedSolvingTimeMinutes": 15,
    "isPremium": false
  },
  {
    "id": "codeforces-2232a",
    "title": "Convergence",
    "platform": "Codeforces",
    "platformProblemId": "2232A",
    "url": "https://codeforces.com/problemset/problem/2232/A",
    "difficulty": "Easy",
    "tags": [
      "greedy",
      "sortings"
    ],
    "dsaPatterns": [
      "sorting",
      "greedy"
    ],
    "estimatedSolvingTimeMinutes": 15,
    "isPremium": false
  },
  {
    "id": "codeforces-2231f",
    "title": "Quadratic Jumps",
    "platform": "Codeforces",
    "platformProblemId": "2231F",
    "url": "https://codeforces.com/problemset/problem/2231/F",
    "difficulty": "Hard",
    "tags": [
      "brute force",
      "constructive algorithms",
      "greedy",
      "math",
      "number theory"
    ],
    "dsaPatterns": [
      "greedy",
      "math"
    ],
    "estimatedSolvingTimeMinutes": 45,
    "isPremium": false
  },
  {
    "id": "codeforces-2231e",
    "title": "Graph Cutting",
    "platform": "Codeforces",
    "platformProblemId": "2231E",
    "url": "https://codeforces.com/problemset/problem/2231/E",
    "difficulty": "Hard",
    "tags": [
      "dfs and similar",
      "dp",
      "math",
      "trees"
    ],
    "dsaPatterns": [
      "dynamic_programming",
      "graphs",
      "dfs",
      "trees",
      "math"
    ],
    "estimatedSolvingTimeMinutes": 45,
    "isPremium": false
  },
  {
    "id": "codeforces-2231d",
    "title": "Maximum Prefix Sums",
    "platform": "Codeforces",
    "platformProblemId": "2231D",
    "url": "https://codeforces.com/problemset/problem/2231/D",
    "difficulty": "Hard",
    "tags": [
      "constructive algorithms",
      "greedy",
      "implementation",
      "two pointers"
    ],
    "dsaPatterns": [
      "two_pointers",
      "prefix_sum",
      "greedy",
      "geometry"
    ],
    "estimatedSolvingTimeMinutes": 45,
    "isPremium": false
  },
  {
    "id": "codeforces-2231c",
    "title": "Chipmunk Theo and Equality",
    "platform": "Codeforces",
    "platformProblemId": "2231C",
    "url": "https://codeforces.com/problemset/problem/2231/C",
    "difficulty": "Medium",
    "tags": [
      "implementation",
      "sortings"
    ],
    "dsaPatterns": [
      "sorting"
    ],
    "estimatedSolvingTimeMinutes": 30,
    "isPremium": false
  },
  {
    "id": "codeforces-2231b",
    "title": "Another Sorting Problem",
    "platform": "Codeforces",
    "platformProblemId": "2231B",
    "url": "https://codeforces.com/problemset/problem/2231/B",
    "difficulty": "Easy",
    "tags": [
      "constructive algorithms"
    ],
    "dsaPatterns": [
      "sorting"
    ],
    "estimatedSolvingTimeMinutes": 15,
    "isPremium": false
  },
  {
    "id": "codeforces-2231a",
    "title": "Construct an Array",
    "platform": "Codeforces",
    "platformProblemId": "2231A",
    "url": "https://codeforces.com/problemset/problem/2231/A",
    "difficulty": "Easy",
    "tags": [
      "constructive algorithms"
    ],
    "dsaPatterns": [
      "arrays"
    ],
    "estimatedSolvingTimeMinutes": 15,
    "isPremium": false
  },
  {
    "id": "codeforces-2230f",
    "title": "Game on Growing Tree",
    "platform": "Codeforces",
    "platformProblemId": "2230F",
    "url": "https://codeforces.com/problemset/problem/2230/F",
    "difficulty": "Hard",
    "tags": [
      "binary search",
      "dfs and similar",
      "divide and conquer",
      "dp",
      "games",
      "implementation",
      "trees"
    ],
    "dsaPatterns": [
      "binary_search",
      "dynamic_programming",
      "graphs",
      "dfs",
      "trees",
      "divide_and_conquer"
    ],
    "estimatedSolvingTimeMinutes": 45,
    "isPremium": false
  },
  {
    "id": "codeforces-2230e",
    "title": "Minimum Influence",
    "platform": "Codeforces",
    "platformProblemId": "2230E",
    "url": "https://codeforces.com/problemset/problem/2230/E",
    "difficulty": "Hard",
    "tags": [
      "binary search",
      "data structures",
      "greedy",
      "implementation",
      "math",
      "sortings",
      "two pointers"
    ],
    "dsaPatterns": [
      "two_pointers",
      "binary_search",
      "sorting",
      "greedy",
      "math",
      "geometry"
    ],
    "estimatedSolvingTimeMinutes": 45,
    "isPremium": false
  },
  {
    "id": "codeforces-2230d",
    "title": "Good Schedule",
    "platform": "Codeforces",
    "platformProblemId": "2230D",
    "url": "https://codeforces.com/problemset/problem/2230/D",
    "difficulty": "Medium",
    "tags": [
      "dp",
      "greedy"
    ],
    "dsaPatterns": [
      "dynamic_programming",
      "greedy"
    ],
    "estimatedSolvingTimeMinutes": 30,
    "isPremium": false
  },
  {
    "id": "codeforces-2230c",
    "title": "Arrange the Numbers in a Circle",
    "platform": "Codeforces",
    "platformProblemId": "2230C",
    "url": "https://codeforces.com/problemset/problem/2230/C",
    "difficulty": "Medium",
    "tags": [
      "constructive algorithms",
      "implementation",
      "math"
    ],
    "dsaPatterns": [
      "math"
    ],
    "estimatedSolvingTimeMinutes": 30,
    "isPremium": false
  },
  {
    "id": "codeforces-2230b",
    "title": "Digit String",
    "platform": "Codeforces",
    "platformProblemId": "2230B",
    "url": "https://codeforces.com/problemset/problem/2230/B",
    "difficulty": "Easy",
    "tags": [
      "greedy",
      "implementation",
      "math"
    ],
    "dsaPatterns": [
      "greedy",
      "math",
      "strings"
    ],
    "estimatedSolvingTimeMinutes": 15,
    "isPremium": false
  },
  {
    "id": "codeforces-2230a",
    "title": "Optimal Purchase",
    "platform": "Codeforces",
    "platformProblemId": "2230A",
    "url": "https://codeforces.com/problemset/problem/2230/A",
    "difficulty": "Easy",
    "tags": [
      "implementation",
      "math"
    ],
    "dsaPatterns": [
      "math"
    ],
    "estimatedSolvingTimeMinutes": 15,
    "isPremium": false
  },
  {
    "id": "codeforces-2229i",
    "title": "The Endians",
    "platform": "Codeforces",
    "platformProblemId": "2229I",
    "url": "https://codeforces.com/problemset/problem/2229/I",
    "difficulty": "Hard",
    "tags": [
      "dp",
      "trees"
    ],
    "dsaPatterns": [
      "dynamic_programming",
      "trees"
    ],
    "estimatedSolvingTimeMinutes": 45,
    "isPremium": false
  },
  {
    "id": "codeforces-2229h",
    "title": "Wowee Binary String",
    "platform": "Codeforces",
    "platformProblemId": "2229H",
    "url": "https://codeforces.com/problemset/problem/2229/H",
    "difficulty": "Hard",
    "tags": [
      "combinatorics",
      "dp",
      "strings"
    ],
    "dsaPatterns": [
      "dynamic_programming",
      "math",
      "strings"
    ],
    "estimatedSolvingTimeMinutes": 45,
    "isPremium": false
  },
  {
    "id": "codeforces-2229g",
    "title": "Roadworks",
    "platform": "Codeforces",
    "platformProblemId": "2229G",
    "url": "https://codeforces.com/problemset/problem/2229/G",
    "difficulty": "Hard",
    "tags": [
      "binary search",
      "data structures",
      "dp",
      "greedy",
      "two pointers"
    ],
    "dsaPatterns": [
      "two_pointers",
      "binary_search",
      "dynamic_programming",
      "greedy",
      "geometry"
    ],
    "estimatedSolvingTimeMinutes": 45,
    "isPremium": false
  },
  {
    "id": "codeforces-2229f",
    "title": "Load Unbalancing",
    "platform": "Codeforces",
    "platformProblemId": "2229F",
    "url": "https://codeforces.com/problemset/problem/2229/F",
    "difficulty": "Hard",
    "tags": [
      "binary search",
      "bitmasks",
      "dp",
      "greedy"
    ],
    "dsaPatterns": [
      "binary_search",
      "dynamic_programming",
      "greedy",
      "bit_manipulation"
    ],
    "estimatedSolvingTimeMinutes": 45,
    "isPremium": false
  },
  {
    "id": "codeforces-2229e",
    "title": "Deconstruction Tree",
    "platform": "Codeforces",
    "platformProblemId": "2229E",
    "url": "https://codeforces.com/problemset/problem/2229/E",
    "difficulty": "Hard",
    "tags": [
      "combinatorics",
      "data structures",
      "dp",
      "graphs",
      "trees"
    ],
    "dsaPatterns": [
      "dynamic_programming",
      "graphs",
      "trees",
      "math"
    ],
    "estimatedSolvingTimeMinutes": 45,
    "isPremium": false
  },
  {
    "id": "codeforces-2229d",
    "title": "Me When Median Problem",
    "platform": "Codeforces",
    "platformProblemId": "2229D",
    "url": "https://codeforces.com/problemset/problem/2229/D",
    "difficulty": "Medium",
    "tags": [
      "binary search",
      "greedy"
    ],
    "dsaPatterns": [
      "binary_search",
      "greedy"
    ],
    "estimatedSolvingTimeMinutes": 30,
    "isPremium": false
  },
  {
    "id": "codeforces-2229c2",
    "title": "We Be Flipping (Hard Version)",
    "platform": "Codeforces",
    "platformProblemId": "2229C2",
    "url": "https://codeforces.com/problemset/problem/2229/C2",
    "difficulty": "Medium",
    "tags": [
      "constructive algorithms",
      "dp",
      "greedy"
    ],
    "dsaPatterns": [
      "dynamic_programming",
      "greedy"
    ],
    "estimatedSolvingTimeMinutes": 30,
    "isPremium": false
  },
  {
    "id": "codeforces-2229c1",
    "title": "We Be Flipping (Easy Version)",
    "platform": "Codeforces",
    "platformProblemId": "2229C1",
    "url": "https://codeforces.com/problemset/problem/2229/C1",
    "difficulty": "Easy",
    "tags": [
      "constructive algorithms",
      "greedy"
    ],
    "dsaPatterns": [
      "greedy"
    ],
    "estimatedSolvingTimeMinutes": 15,
    "isPremium": false
  },
  {
    "id": "codeforces-2229b",
    "title": "Absolute Cinema",
    "platform": "Codeforces",
    "platformProblemId": "2229B",
    "url": "https://codeforces.com/problemset/problem/2229/B",
    "difficulty": "Easy",
    "tags": [
      "greedy",
      "math"
    ],
    "dsaPatterns": [
      "greedy",
      "math"
    ],
    "estimatedSolvingTimeMinutes": 15,
    "isPremium": false
  },
  {
    "id": "codeforces-2229a",
    "title": "Slimes on a Line",
    "platform": "Codeforces",
    "platformProblemId": "2229A",
    "url": "https://codeforces.com/problemset/problem/2229/A",
    "difficulty": "Easy",
    "tags": [
      "brute force",
      "greedy",
      "math"
    ],
    "dsaPatterns": [
      "greedy",
      "math"
    ],
    "estimatedSolvingTimeMinutes": 15,
    "isPremium": false
  },
  {
    "id": "codeforces-2228f",
    "title": "Momoyo and the Network",
    "platform": "Codeforces",
    "platformProblemId": "2228F",
    "url": "https://codeforces.com/problemset/problem/2228/F",
    "difficulty": "Hard",
    "tags": [
      "binary search",
      "dfs and similar",
      "divide and conquer",
      "dp",
      "trees"
    ],
    "dsaPatterns": [
      "binary_search",
      "dynamic_programming",
      "graphs",
      "dfs",
      "trees",
      "divide_and_conquer"
    ],
    "estimatedSolvingTimeMinutes": 45,
    "isPremium": false
  },
  {
    "id": "codeforces-2228e2",
    "title": "Amanojaku and Sequence (Hard Version)",
    "platform": "Codeforces",
    "platformProblemId": "2228E2",
    "url": "https://codeforces.com/problemset/problem/2228/E2",
    "difficulty": "Hard",
    "tags": [
      "combinatorics",
      "data structures",
      "implementation",
      "math"
    ],
    "dsaPatterns": [
      "math"
    ],
    "estimatedSolvingTimeMinutes": 45,
    "isPremium": false
  },
  {
    "id": "codeforces-2228e1",
    "title": "Amanojaku and Sequence (Easy Version)",
    "platform": "Codeforces",
    "platformProblemId": "2228E1",
    "url": "https://codeforces.com/problemset/problem/2228/E1",
    "difficulty": "Hard",
    "tags": [
      "combinatorics",
      "math"
    ],
    "dsaPatterns": [
      "math"
    ],
    "estimatedSolvingTimeMinutes": 45,
    "isPremium": false
  },
  {
    "id": "codeforces-2228d",
    "title": "Sanae, Cross and Color",
    "platform": "Codeforces",
    "platformProblemId": "2228D",
    "url": "https://codeforces.com/problemset/problem/2228/D",
    "difficulty": "Hard",
    "tags": [
      "binary search",
      "data structures",
      "implementation"
    ],
    "dsaPatterns": [
      "binary_search"
    ],
    "estimatedSolvingTimeMinutes": 45,
    "isPremium": false
  },
  {
    "id": "codeforces-2228c2",
    "title": "Cirno and Number (Hard Version)",
    "platform": "Codeforces",
    "platformProblemId": "2228C2",
    "url": "https://codeforces.com/problemset/problem/2228/C2",
    "difficulty": "Medium",
    "tags": [
      "binary search",
      "dfs and similar",
      "dp",
      "greedy",
      "implementation"
    ],
    "dsaPatterns": [
      "binary_search",
      "dynamic_programming",
      "graphs",
      "dfs",
      "greedy"
    ],
    "estimatedSolvingTimeMinutes": 30,
    "isPremium": false
  },
  {
    "id": "codeforces-2228c1",
    "title": "Cirno and Number (Easy Version)",
    "platform": "Codeforces",
    "platformProblemId": "2228C1",
    "url": "https://codeforces.com/problemset/problem/2228/C1",
    "difficulty": "Medium",
    "tags": [
      "binary search",
      "brute force",
      "dp",
      "greedy",
      "implementation"
    ],
    "dsaPatterns": [
      "binary_search",
      "dynamic_programming",
      "greedy"
    ],
    "estimatedSolvingTimeMinutes": 30,
    "isPremium": false
  },
  {
    "id": "codeforces-2228b",
    "title": "Remilia Plays Soku",
    "platform": "Codeforces",
    "platformProblemId": "2228B",
    "url": "https://codeforces.com/problemset/problem/2228/B",
    "difficulty": "Easy",
    "tags": [
      "games",
      "implementation"
    ],
    "dsaPatterns": [
      "arrays"
    ],
    "estimatedSolvingTimeMinutes": 15,
    "isPremium": false
  },
  {
    "id": "codeforces-2228a",
    "title": "Marisa Steals Reimu's Takeout",
    "platform": "Codeforces",
    "platformProblemId": "2228A",
    "url": "https://codeforces.com/problemset/problem/2228/A",
    "difficulty": "Easy",
    "tags": [
      "greedy",
      "implementation"
    ],
    "dsaPatterns": [
      "greedy"
    ],
    "estimatedSolvingTimeMinutes": 15,
    "isPremium": false
  },
  {
    "id": "codeforces-2227h",
    "title": "Fallen Leaves",
    "platform": "Codeforces",
    "platformProblemId": "2227H",
    "url": "https://codeforces.com/problemset/problem/2227/H",
    "difficulty": "Hard",
    "tags": [
      "dfs and similar",
      "dp",
      "trees"
    ],
    "dsaPatterns": [
      "dynamic_programming",
      "graphs",
      "dfs",
      "trees"
    ],
    "estimatedSolvingTimeMinutes": 45,
    "isPremium": false
  },
  {
    "id": "codeforces-2227g",
    "title": "Drowning",
    "platform": "Codeforces",
    "platformProblemId": "2227G",
    "url": "https://codeforces.com/problemset/problem/2227/G",
    "difficulty": "Hard",
    "tags": [
      "binary search",
      "data structures",
      "math"
    ],
    "dsaPatterns": [
      "binary_search",
      "math"
    ],
    "estimatedSolvingTimeMinutes": 45,
    "isPremium": false
  },
  {
    "id": "codeforces-2227f",
    "title": "It Just Keeps Going Sideways",
    "platform": "Codeforces",
    "platformProblemId": "2227F",
    "url": "https://codeforces.com/problemset/problem/2227/F",
    "difficulty": "Medium",
    "tags": [
      "binary search",
      "data structures",
      "dp",
      "greedy",
      "math"
    ],
    "dsaPatterns": [
      "binary_search",
      "dynamic_programming",
      "greedy",
      "math"
    ],
    "estimatedSolvingTimeMinutes": 30,
    "isPremium": false
  },
  {
    "id": "codeforces-2227e",
    "title": "It All Went Sideways",
    "platform": "Codeforces",
    "platformProblemId": "2227E",
    "url": "https://codeforces.com/problemset/problem/2227/E",
    "difficulty": "Medium",
    "tags": [
      "binary search",
      "data structures",
      "dp",
      "greedy"
    ],
    "dsaPatterns": [
      "binary_search",
      "dynamic_programming",
      "greedy"
    ],
    "estimatedSolvingTimeMinutes": 30,
    "isPremium": false
  },
  {
    "id": "codeforces-2227d",
    "title": "Palindromex",
    "platform": "Codeforces",
    "platformProblemId": "2227D",
    "url": "https://codeforces.com/problemset/problem/2227/D",
    "difficulty": "Easy",
    "tags": [
      "binary search",
      "brute force",
      "constructive algorithms",
      "data structures",
      "greedy",
      "implementation",
      "two pointers"
    ],
    "dsaPatterns": [
      "two_pointers",
      "binary_search",
      "greedy",
      "geometry",
      "strings"
    ],
    "estimatedSolvingTimeMinutes": 15,
    "isPremium": false
  },
  {
    "id": "codeforces-2227c",
    "title": "Snowfall",
    "platform": "Codeforces",
    "platformProblemId": "2227C",
    "url": "https://codeforces.com/problemset/problem/2227/C",
    "difficulty": "Easy",
    "tags": [
      "constructive algorithms",
      "math"
    ],
    "dsaPatterns": [
      "math"
    ],
    "estimatedSolvingTimeMinutes": 15,
    "isPremium": false
  },
  {
    "id": "codeforces-2227b",
    "title": "Party Monster",
    "platform": "Codeforces",
    "platformProblemId": "2227B",
    "url": "https://codeforces.com/problemset/problem/2227/B",
    "difficulty": "Easy",
    "tags": [
      "greedy"
    ],
    "dsaPatterns": [
      "greedy"
    ],
    "estimatedSolvingTimeMinutes": 15,
    "isPremium": false
  },
  {
    "id": "codeforces-2227a",
    "title": "Koshary",
    "platform": "Codeforces",
    "platformProblemId": "2227A",
    "url": "https://codeforces.com/problemset/problem/2227/A",
    "difficulty": "Easy",
    "tags": [
      "implementation",
      "math"
    ],
    "dsaPatterns": [
      "math"
    ],
    "estimatedSolvingTimeMinutes": 15,
    "isPremium": false
  },
  {
    "id": "codeforces-2226g",
    "title": "Stop Spot",
    "platform": "Codeforces",
    "platformProblemId": "2226G",
    "url": "https://codeforces.com/problemset/problem/2226/G",
    "difficulty": "Hard",
    "tags": [
      "implementation",
      "strings",
      "trees"
    ],
    "dsaPatterns": [
      "trees",
      "strings"
    ],
    "estimatedSolvingTimeMinutes": 45,
    "isPremium": false
  }
];

export const DEFAULT_PROBLEM_CATALOG: Problem[] = mergeStriverSheetIntoCatalog(BASE_DEFAULT_PROBLEM_CATALOG);
