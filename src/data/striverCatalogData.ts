import { Problem, Difficulty, Platform } from '../types';
import { normalizeTitleForComparison, findMatchingProblem, cleanProblemTitle } from '../utils/problemMatcher';

export interface StriverRawEntry {
  topic: string;
  subTopic: string;
  problem: string;
  difficulty: string;
  platform: string;
}

export const STRIVER_RAW_DATA: StriverRawEntry[] = [
  { topic: 'Learn Important Sorting Techniques', subTopic: 'Sorting-I', problem: 'Selection Sort', difficulty: 'Easy', platform: 'GeeksforGeeks' },
  { topic: 'Learn Important Sorting Techniques', subTopic: 'Sorting-I', problem: 'Bubble Sort', difficulty: 'Easy', platform: 'GeeksforGeeks' },
  { topic: 'Learn Important Sorting Techniques', subTopic: 'Sorting-I', problem: 'Insertion Sorting', difficulty: 'Easy', platform: 'GeeksforGeeks' },
  { topic: 'Learn Important Sorting Techniques', subTopic: 'Sorting-II', problem: 'Merge Sorting', difficulty: 'Medium', platform: 'GeeksforGeeks' },
  { topic: 'Learn Important Sorting Techniques', subTopic: 'Sorting-II', problem: 'Recursive Bubble Sort', difficulty: 'Easy', platform: 'GeeksforGeeks' },
  { topic: 'Learn Important Sorting Techniques', subTopic: 'Sorting-II', problem: 'Recursive Insertion Sort', difficulty: 'Easy', platform: 'GeeksforGeeks' },
  { topic: 'Learn Important Sorting Techniques', subTopic: 'Sorting-II', problem: 'Quick Sorting', difficulty: 'Easy', platform: 'GeeksforGeeks' },
  { topic: 'Solve Problems on Arrays [Easy -> Medium -> Hard]', subTopic: 'Easy', problem: 'Largest Element', difficulty: 'Easy', platform: 'GeeksforGeeks' },
  { topic: 'Solve Problems on Arrays [Easy -> Medium -> Hard]', subTopic: 'Easy', problem: 'Second Largest Element', difficulty: 'Easy', platform: 'GeeksforGeeks' },
  { topic: 'Solve Problems on Arrays [Easy -> Medium -> Hard]', subTopic: 'Easy', problem: 'Check if the Array is Sorted II', difficulty: 'Easy', platform: 'LeetCode' },
  { topic: 'Solve Problems on Arrays [Easy -> Medium -> Hard]', subTopic: 'Easy', problem: 'Remove duplicates from Sorted array', difficulty: 'Easy', platform: 'LeetCode' },
  { topic: 'Solve Problems on Arrays [Easy -> Medium -> Hard]', subTopic: 'Easy', problem: 'Left Rotate Array by One', difficulty: 'Easy', platform: 'LeetCode' },
  { topic: 'Solve Problems on Arrays [Easy -> Medium -> Hard]', subTopic: 'Easy', problem: 'Left Rotate Array by K Places', difficulty: 'Easy', platform: 'LeetCode' },
  { topic: 'Solve Problems on Arrays [Easy -> Medium -> Hard]', subTopic: 'Easy', problem: 'Move Zeros to End', difficulty: 'Easy', platform: 'LeetCode' },
  { topic: 'Solve Problems on Arrays [Easy -> Medium -> Hard]', subTopic: 'Easy', problem: 'Linear Search', difficulty: 'Easy', platform: 'GeeksforGeeks' },
  { topic: 'Solve Problems on Arrays [Easy -> Medium -> Hard]', subTopic: 'Easy', problem: 'Union of two sorted arrays', difficulty: 'Easy', platform: 'GeeksforGeeks' },
  { topic: 'Solve Problems on Arrays [Easy -> Medium -> Hard]', subTopic: 'Easy', problem: 'Find missing number', difficulty: 'Easy', platform: 'GeeksforGeeks' },
  { topic: 'Solve Problems on Arrays [Easy -> Medium -> Hard]', subTopic: 'Easy', problem: 'Maximum Consecutive Ones', difficulty: 'Easy', platform: 'LeetCode' },
  { topic: 'Solve Problems on Arrays [Easy -> Medium -> Hard]', subTopic: 'Easy', problem: 'Find the number that appears once, and other numbers twice.', difficulty: 'Medium', platform: 'LeetCode' },
  { topic: 'Solve Problems on Arrays [Easy -> Medium -> Hard]', subTopic: 'Easy', problem: 'Longest subarray with given sum K(positives)', difficulty: 'Medium', platform: 'GeeksforGeeks' },
  { topic: 'Solve Problems on Arrays [Easy -> Medium -> Hard]', subTopic: 'Easy', problem: 'Longest subarray with sum K', difficulty: 'Medium', platform: 'GeeksforGeeks' },
  { topic: 'Solve Problems on Arrays [Easy -> Medium -> Hard]', subTopic: 'Medium', problem: 'Two Sum', difficulty: 'Easy', platform: 'LeetCode' },
  { topic: 'Solve Problems on Arrays [Easy -> Medium -> Hard]', subTopic: 'Medium', problem: "Sort an array of 0's 1's and 2's", difficulty: 'Medium', platform: 'LeetCode' },
  { topic: 'Solve Problems on Arrays [Easy -> Medium -> Hard]', subTopic: 'Medium', problem: 'Majority Element-I', difficulty: 'Easy', platform: 'LeetCode' },
  { topic: 'Solve Problems on Arrays [Easy -> Medium -> Hard]', subTopic: 'Medium', problem: "Kadane's Algorithm", difficulty: 'Medium', platform: 'LeetCode' },
  { topic: 'Solve Problems on Arrays [Easy -> Medium -> Hard]', subTopic: 'Medium', problem: 'Print subarray with maximum subarray sum (extended version of above problem)', difficulty: 'Medium', platform: 'GeeksforGeeks' },
  { topic: 'Solve Problems on Arrays [Easy -> Medium -> Hard]', subTopic: 'Medium', problem: 'Stock Buy and Sell', difficulty: 'Medium', platform: 'LeetCode' },
  { topic: 'Solve Problems on Arrays [Easy -> Medium -> Hard]', subTopic: 'Medium', problem: 'Rearrange array elements by sign', difficulty: 'Medium', platform: 'LeetCode' },
  { topic: 'Solve Problems on Arrays [Easy -> Medium -> Hard]', subTopic: 'Medium', problem: 'Next Permutation', difficulty: 'Medium', platform: 'LeetCode' },
  { topic: 'Solve Problems on Arrays [Easy -> Medium -> Hard]', subTopic: 'Medium', problem: 'Leaders in an Array', difficulty: 'Medium', platform: 'GeeksforGeeks' },
  { topic: 'Solve Problems on Arrays [Easy -> Medium -> Hard]', subTopic: 'Medium', problem: 'Longest Consecutive Sequence in an Array', difficulty: 'Medium', platform: 'LeetCode' },
  { topic: 'Solve Problems on Arrays [Easy -> Medium -> Hard]', subTopic: 'Medium', problem: 'Set Matrix Zeroes', difficulty: 'Medium', platform: 'LeetCode' },
  { topic: 'Solve Problems on Arrays [Easy -> Medium -> Hard]', subTopic: 'Medium', problem: 'Rotate matrix by 90 degrees', difficulty: 'Medium', platform: 'LeetCode' },
  { topic: 'Solve Problems on Arrays [Easy -> Medium -> Hard]', subTopic: 'Medium', problem: 'Print the matrix in spiral manner', difficulty: 'Medium', platform: 'LeetCode' },
  { topic: 'Solve Problems on Arrays [Easy -> Medium -> Hard]', subTopic: 'Medium', problem: 'Count subarrays with given sum', difficulty: 'Medium', platform: 'LeetCode' },
  { topic: 'Solve Problems on Arrays [Easy -> Medium -> Hard]', subTopic: 'Hard', problem: "Pascal's Triangle I", difficulty: 'Easy', platform: 'LeetCode' },
  { topic: 'Solve Problems on Arrays [Easy -> Medium -> Hard]', subTopic: 'Hard', problem: 'Majority Element-II', difficulty: 'Hard', platform: 'LeetCode' },
  { topic: 'Solve Problems on Arrays [Easy -> Medium -> Hard]', subTopic: 'Hard', problem: '3 Sum', difficulty: 'Medium', platform: 'LeetCode' },
  { topic: 'Solve Problems on Arrays [Easy -> Medium -> Hard]', subTopic: 'Hard', problem: '4 Sum', difficulty: 'Medium', platform: 'LeetCode' },
  { topic: 'Solve Problems on Arrays [Easy -> Medium -> Hard]', subTopic: 'Hard', problem: 'Largest Subarray with Sum 0', difficulty: 'Medium', platform: 'GeeksforGeeks' },
  { topic: 'Solve Problems on Arrays [Easy -> Medium -> Hard]', subTopic: 'Hard', problem: 'Count subarrays with given xor K', difficulty: 'Hard', platform: 'GeeksforGeeks' },
  { topic: 'Solve Problems on Arrays [Easy -> Medium -> Hard]', subTopic: 'Hard', problem: 'Merge Overlapping Subintervals', difficulty: 'Medium', platform: 'LeetCode' },
  { topic: 'Solve Problems on Arrays [Easy -> Medium -> Hard]', subTopic: 'Hard', problem: 'Merge two sorted arrays without extra space', difficulty: 'Medium', platform: 'LeetCode' },
  { topic: 'Solve Problems on Arrays [Easy -> Medium -> Hard]', subTopic: 'Hard', problem: 'Find the repeating and missing number', difficulty: 'Hard', platform: 'GeeksforGeeks' },
  { topic: 'Solve Problems on Arrays [Easy -> Medium -> Hard]', subTopic: 'Hard', problem: 'Count Inversions', difficulty: 'Hard', platform: 'GeeksforGeeks' },
  { topic: 'Solve Problems on Arrays [Easy -> Medium -> Hard]', subTopic: 'Hard', problem: 'Reverse Pairs', difficulty: 'Hard', platform: 'LeetCode' },
  { topic: 'Solve Problems on Arrays [Easy -> Medium -> Hard]', subTopic: 'Hard', problem: 'Maximum Product Subarray in an Array', difficulty: 'Hard', platform: 'LeetCode' },
  { topic: 'Binary Search [1D, 2D Arrays, Search Space]', subTopic: 'BS on 1D Arrays', problem: 'Search X in sorted array', difficulty: 'Easy', platform: 'LeetCode' },
  { topic: 'Binary Search [1D, 2D Arrays, Search Space]', subTopic: 'BS on 1D Arrays', problem: 'Lower Bound', difficulty: 'Easy', platform: 'GeeksforGeeks' },
  { topic: 'Binary Search [1D, 2D Arrays, Search Space]', subTopic: 'BS on 1D Arrays', problem: 'Upper Bound', difficulty: 'Easy', platform: 'GeeksforGeeks' },
  { topic: 'Binary Search [1D, 2D Arrays, Search Space]', subTopic: 'BS on 1D Arrays', problem: 'Search insert position', difficulty: 'Easy', platform: 'LeetCode' },
  { topic: 'Binary Search [1D, 2D Arrays, Search Space]', subTopic: 'BS on 1D Arrays', problem: 'Floor and Ceil in Sorted Array', difficulty: 'Easy', platform: 'GeeksforGeeks' },
  { topic: 'Binary Search [1D, 2D Arrays, Search Space]', subTopic: 'BS on 1D Arrays', problem: 'First and last occurrence', difficulty: 'Easy', platform: 'LeetCode' },
  { topic: 'Binary Search [1D, 2D Arrays, Search Space]', subTopic: 'BS on 1D Arrays', problem: 'Count Occurrences in a Sorted Array', difficulty: 'Easy', platform: 'GeeksforGeeks' },
  { topic: 'Binary Search [1D, 2D Arrays, Search Space]', subTopic: 'BS on 1D Arrays', problem: 'Search in rotated sorted array-I', difficulty: 'Medium', platform: 'LeetCode' },
  { topic: 'Binary Search [1D, 2D Arrays, Search Space]', subTopic: 'BS on 1D Arrays', problem: 'Search in rotated sorted array-II', difficulty: 'Medium', platform: 'LeetCode' },
  { topic: 'Binary Search [1D, 2D Arrays, Search Space]', subTopic: 'BS on 1D Arrays', problem: 'Find minimum in Rotated Sorted Array', difficulty: 'Easy', platform: 'LeetCode' },
  { topic: 'Binary Search [1D, 2D Arrays, Search Space]', subTopic: 'BS on 1D Arrays', problem: 'Find out how many times the array is rotated', difficulty: 'Easy', platform: 'GeeksforGeeks' },
  { topic: 'Binary Search [1D, 2D Arrays, Search Space]', subTopic: 'BS on 1D Arrays', problem: 'Single element in a Sorted Array', difficulty: 'Medium', platform: 'LeetCode' },
  { topic: 'Binary Search [1D, 2D Arrays, Search Space]', subTopic: 'BS on 1D Arrays', problem: 'Find peak element', difficulty: 'Medium', platform: 'LeetCode' },
  { topic: 'Binary Search [1D, 2D Arrays, Search Space]', subTopic: 'BS on Answers', problem: 'Find square root of a number', difficulty: 'Medium', platform: 'GeeksforGeeks' },
  { topic: 'Binary Search [1D, 2D Arrays, Search Space]', subTopic: 'BS on Answers', problem: 'Find Nth root of a number', difficulty: 'Medium', platform: 'GeeksforGeeks' },
  { topic: 'Binary Search [1D, 2D Arrays, Search Space]', subTopic: 'BS on Answers', problem: 'Koko eating bananas', difficulty: 'Medium', platform: 'LeetCode' },
  { topic: 'Binary Search [1D, 2D Arrays, Search Space]', subTopic: 'BS on Answers', problem: 'Minimum days to make M bouquets', difficulty: 'Medium', platform: 'LeetCode' },
  { topic: 'Binary Search [1D, 2D Arrays, Search Space]', subTopic: 'BS on Answers', problem: 'Find the smallest divisor', difficulty: 'Medium', platform: 'LeetCode' },
  { topic: 'Binary Search [1D, 2D Arrays, Search Space]', subTopic: 'BS on Answers', problem: 'Capacity to Ship Packages Within D Days', difficulty: 'Medium', platform: 'LeetCode' },
  { topic: 'Binary Search [1D, 2D Arrays, Search Space]', subTopic: 'BS on Answers', problem: 'Kth Missing Positive Number', difficulty: 'Medium', platform: 'LeetCode' },
  { topic: 'Binary Search [1D, 2D Arrays, Search Space]', subTopic: 'BS on Answers', problem: 'Aggressive Cows', difficulty: 'Hard', platform: 'GeeksforGeeks' },
  { topic: 'Binary Search [1D, 2D Arrays, Search Space]', subTopic: 'BS on Answers', problem: 'Book Allocation Problem', difficulty: 'Hard', platform: 'GeeksforGeeks' },
  { topic: 'Binary Search [1D, 2D Arrays, Search Space]', subTopic: 'BS on Answers', problem: 'Split array - largest sum', difficulty: 'Hard', platform: 'LeetCode' },
  { topic: 'Binary Search [1D, 2D Arrays, Search Space]', subTopic: 'BS on Answers', problem: "Painter's Partition", difficulty: 'Medium', platform: 'GeeksforGeeks' },
  { topic: 'Binary Search [1D, 2D Arrays, Search Space]', subTopic: 'BS on Answers', problem: 'Minimize Max Distance to Gas Station', difficulty: 'Hard', platform: 'LeetCode' },
  { topic: 'Binary Search [1D, 2D Arrays, Search Space]', subTopic: 'BS on Answers', problem: 'Median of 2 sorted arrays', difficulty: 'Hard', platform: 'LeetCode' },
  { topic: 'Binary Search [1D, 2D Arrays, Search Space]', subTopic: 'BS on Answers', problem: 'Kth element of 2 sorted arrays', difficulty: 'Medium', platform: 'GeeksforGeeks' },
  { topic: 'Binary Search [1D, 2D Arrays, Search Space]', subTopic: 'BS on 2D Arrays', problem: "Find row with maximum 1's", difficulty: 'Easy', platform: 'GeeksforGeeks' },
  { topic: 'Binary Search [1D, 2D Arrays, Search Space]', subTopic: 'BS on 2D Arrays', problem: 'Search in a 2D matrix', difficulty: 'Hard', platform: 'LeetCode' },
  { topic: 'Binary Search [1D, 2D Arrays, Search Space]', subTopic: 'BS on 2D Arrays', problem: 'Search in 2D matrix - II', difficulty: 'Hard', platform: 'LeetCode' },
  { topic: 'Binary Search [1D, 2D Arrays, Search Space]', subTopic: 'BS on 2D Arrays', problem: 'Find Peak Element - II', difficulty: 'Medium', platform: 'LeetCode' },
  { topic: 'Binary Search [1D, 2D Arrays, Search Space]', subTopic: 'BS on 2D Arrays', problem: 'Matrix Median', difficulty: 'Hard', platform: 'GeeksforGeeks' },
  { topic: 'Strings [Basic and Medium]', subTopic: 'Basic and Easy String Problems', problem: 'Remove Outermost Parentheses', difficulty: 'Medium', platform: 'LeetCode' },
  { topic: 'Strings [Basic and Medium]', subTopic: 'Basic and Easy String Problems', problem: 'Reverse words in a given string / Palindrome Check', difficulty: 'Medium', platform: 'LeetCode' },
  { topic: 'Strings [Basic and Medium]', subTopic: 'Basic and Easy String Problems', problem: 'Largest Odd Number in a String', difficulty: 'Easy', platform: 'LeetCode' },
  { topic: 'Strings [Basic and Medium]', subTopic: 'Basic and Easy String Problems', problem: 'Longest Common Prefix', difficulty: 'Easy', platform: 'LeetCode' },
  { topic: 'Strings [Basic and Medium]', subTopic: 'Basic and Easy String Problems', problem: 'Isomorphic String', difficulty: 'Easy', platform: 'LeetCode' },
  { topic: 'Strings [Basic and Medium]', subTopic: 'Basic and Easy String Problems', problem: 'Rotate String', difficulty: 'Easy', platform: 'LeetCode' },
  { topic: 'Strings [Basic and Medium]', subTopic: 'Basic and Easy String Problems', problem: 'Check if two strings are anagram of each other', difficulty: 'Easy', platform: 'LeetCode' },
  { topic: 'Strings [Basic and Medium]', subTopic: 'Medium String Problems', problem: 'Sort Characters by Frequency', difficulty: 'Easy', platform: 'LeetCode' },
  { topic: 'Strings [Basic and Medium]', subTopic: 'Medium String Problems', problem: 'Maximum Nesting Depth of the Parentheses', difficulty: 'Medium', platform: 'LeetCode' },
  { topic: 'Strings [Basic and Medium]', subTopic: 'Medium String Problems', problem: 'Roman to Integer', difficulty: 'Medium', platform: 'LeetCode' },
  { topic: 'Strings [Basic and Medium]', subTopic: 'Medium String Problems', problem: 'String to Integer (atoi)', difficulty: 'Medium', platform: 'LeetCode' },
  { topic: 'Strings [Basic and Medium]', subTopic: 'Medium String Problems', problem: 'Count Number of Substrings', difficulty: 'Easy', platform: 'GeeksforGeeks' },
  { topic: 'Strings [Basic and Medium]', subTopic: 'Medium String Problems', problem: 'Longest Palindromic Substring', difficulty: 'Medium', platform: 'LeetCode' },
  { topic: 'Strings [Basic and Medium]', subTopic: 'Medium String Problems', problem: 'Sum of Beauty of All Substrings', difficulty: 'Medium', platform: 'LeetCode' },
  { topic: 'Strings [Basic and Medium]', subTopic: 'Medium String Problems', problem: 'Reverse every word in a string', difficulty: 'Medium', platform: 'LeetCode' },
  { topic: 'Learn LinkedList [Single LL, Double LL, Medium, Hard Problems]', subTopic: 'Learn 1D LinkedList', problem: 'Introduction to Singly LinkedList', difficulty: 'Easy', platform: 'GeeksforGeeks' },
  { topic: 'Learn LinkedList [Single LL, Double LL, Medium, Hard Problems]', subTopic: 'Learn 1D LinkedList', problem: 'Insertion at the head of Linked List', difficulty: 'Easy', platform: 'GeeksforGeeks' },
  { topic: 'Learn LinkedList [Single LL, Double LL, Medium, Hard Problems]', subTopic: 'Learn 1D LinkedList', problem: 'Deletion of the head of LL', difficulty: 'Easy', platform: 'LeetCode' },
  { topic: 'Learn LinkedList [Single LL, Double LL, Medium, Hard Problems]', subTopic: 'Learn 1D LinkedList', problem: 'Find the length of the Linked List', difficulty: 'Easy', platform: 'GeeksforGeeks' },
  { topic: 'Learn LinkedList [Single LL, Double LL, Medium, Hard Problems]', subTopic: 'Learn 1D LinkedList', problem: 'Search in Linked List', difficulty: 'Medium', platform: 'GeeksforGeeks' },
  { topic: 'Learn LinkedList [Single LL, Double LL, Medium, Hard Problems]', subTopic: 'Learn Doubly LinkedList', problem: 'Introduction to Doubly LL', difficulty: 'Easy', platform: 'GeeksforGeeks' },
  { topic: 'Learn LinkedList [Single LL, Double LL, Medium, Hard Problems]', subTopic: 'Learn Doubly LinkedList', problem: 'Insert node before head in Doubly Linked List', difficulty: 'Easy', platform: 'GeeksforGeeks' },
  { topic: 'Learn LinkedList [Single LL, Double LL, Medium, Hard Problems]', subTopic: 'Learn Doubly LinkedList', problem: 'Delete head of Doubly Linked List', difficulty: 'Easy', platform: 'GeeksforGeeks' },
  { topic: 'Learn LinkedList [Single LL, Double LL, Medium, Hard Problems]', subTopic: 'Learn Doubly LinkedList', problem: 'Reverse a Doubly Linked List', difficulty: 'Medium', platform: 'GeeksforGeeks' },
  { topic: 'Learn LinkedList [Single LL, Double LL, Medium, Hard Problems]', subTopic: 'Medium Problems of LL', problem: 'Middle of a LinkedList [TortoiseHare Method]', difficulty: 'easy', platform: 'LeetCode' },
  { topic: 'Learn LinkedList [Single LL, Double LL, Medium, Hard Problems]', subTopic: 'Medium Problems of LL', problem: 'Reverse a LinkedList [Iterative]', difficulty: 'Medium', platform: 'LeetCode' },
  { topic: 'Learn LinkedList [Single LL, Double LL, Medium, Hard Problems]', subTopic: 'Medium Problems of LL', problem: 'Reverse a LL', difficulty: 'Medium', platform: 'LeetCode' },
  { topic: 'Learn LinkedList [Single LL, Double LL, Medium, Hard Problems]', subTopic: 'Medium Problems of LL', problem: 'Detect a loop in LL', difficulty: 'Medium', platform: 'LeetCode' },
  { topic: 'Learn LinkedList [Single LL, Double LL, Medium, Hard Problems]', subTopic: 'Medium Problems of LL', problem: 'Find the starting point in LL', difficulty: 'Medium', platform: 'LeetCode' },
  { topic: 'Learn LinkedList [Single LL, Double LL, Medium, Hard Problems]', subTopic: 'Medium Problems of LL', problem: 'Length of loop in LL', difficulty: 'Medium', platform: 'GeeksforGeeks' },
  { topic: 'Learn LinkedList [Single LL, Double LL, Medium, Hard Problems]', subTopic: 'Medium Problems of LL', problem: 'Check if LL is palindrome or not', difficulty: 'Medium', platform: 'LeetCode' },
  { topic: 'Learn LinkedList [Single LL, Double LL, Medium, Hard Problems]', subTopic: 'Medium Problems of LL', problem: 'Segregate odd and even nodes in Linked List', difficulty: 'Medium', platform: 'LeetCode' },
  { topic: 'Learn LinkedList [Single LL, Double LL, Medium, Hard Problems]', subTopic: 'Medium Problems of LL', problem: 'Remove Nth node from the back of the LL', difficulty: 'Medium', platform: 'LeetCode' },
  { topic: 'Learn LinkedList [Single LL, Double LL, Medium, Hard Problems]', subTopic: 'Medium Problems of LL', problem: 'Delete the middle node in LL', difficulty: 'Medium', platform: 'LeetCode' },
  { topic: 'Learn LinkedList [Single LL, Double LL, Medium, Hard Problems]', subTopic: 'Medium Problems of LL', problem: 'Sort LL', difficulty: 'Hard', platform: 'LeetCode' },
  { topic: 'Learn LinkedList [Single LL, Double LL, Medium, Hard Problems]', subTopic: 'Medium Problems of LL', problem: "Sort a Linked List of 0's 1's and 2's", difficulty: 'Medium', platform: 'GeeksforGeeks' },
  { topic: 'Learn LinkedList [Single LL, Double LL, Medium, Hard Problems]', subTopic: 'Medium Problems of LL', problem: 'Find the intersection point of Y LL', difficulty: 'Medium', platform: 'LeetCode' },
  { topic: 'Learn LinkedList [Single LL, Double LL, Medium, Hard Problems]', subTopic: 'Medium Problems of LL', problem: 'Add one to a number represented by LL', difficulty: 'Medium', platform: 'GeeksforGeeks' },
  { topic: 'Learn LinkedList [Single LL, Double LL, Medium, Hard Problems]', subTopic: 'Medium Problems of LL', problem: 'Add two numbers in Linked List', difficulty: 'Medium', platform: 'LeetCode' },
  { topic: 'Learn LinkedList [Single LL, Double LL, Medium, Hard Problems]', subTopic: 'Medium Problems of DLL', problem: 'Delete all occurrences of a key in DLL', difficulty: 'Hard', platform: 'GeeksforGeeks' },
  { topic: 'Learn LinkedList [Single LL, Double LL, Medium, Hard Problems]', subTopic: 'Medium Problems of DLL', problem: 'Find Pairs with Given Sum in Doubly Linked List', difficulty: 'Medium', platform: 'GeeksforGeeks' },
  { topic: 'Learn LinkedList [Single LL, Double LL, Medium, Hard Problems]', subTopic: 'Medium Problems of DLL', problem: 'Remove duplicates from sorted DLL', difficulty: 'hard', platform: 'GeeksforGeeks' },
  { topic: 'Learn LinkedList [Single LL, Double LL, Medium, Hard Problems]', subTopic: 'Hard Problems of LL', problem: 'Reverse LL in group of given size K', difficulty: 'Hard', platform: 'LeetCode' },
  { topic: 'Learn LinkedList [Single LL, Double LL, Medium, Hard Problems]', subTopic: 'Hard Problems of LL', problem: 'Rotate a LL', difficulty: 'Hard', platform: 'LeetCode' },
  { topic: 'Learn LinkedList [Single LL, Double LL, Medium, Hard Problems]', subTopic: 'Hard Problems of LL', problem: 'Flattening of LL', difficulty: 'Hard', platform: 'GeeksforGeeks' },
  { topic: 'Learn LinkedList [Single LL, Double LL, Medium, Hard Problems]', subTopic: 'Hard Problems of LL', problem: 'Clone a LL with random and next pointer', difficulty: 'Hard', platform: 'LeetCode' },
  { topic: 'Recursion [PatternWise]', subTopic: 'Get a Strong Hold', problem: 'Recursive Implementation of atoi()', difficulty: 'Medium', platform: 'LeetCode' },
  { topic: 'Recursion [PatternWise]', subTopic: 'Get a Strong Hold', problem: 'Pow(x, n)', difficulty: 'Easy', platform: 'LeetCode' },
  { topic: 'Recursion [PatternWise]', subTopic: 'Get a Strong Hold', problem: 'Count Good Numbers', difficulty: 'Medium', platform: 'LeetCode' },
  { topic: 'Recursion [PatternWise]', subTopic: 'Get a Strong Hold', problem: 'Sort a stack using recursion', difficulty: 'Medium', platform: 'GeeksforGeeks' },
  { topic: 'Recursion [PatternWise]', subTopic: 'Get a Strong Hold', problem: 'Reverse a Stack', difficulty: 'Medium', platform: 'GeeksforGeeks' },
  { topic: 'Recursion [PatternWise]', subTopic: 'Subsequences Pattern', problem: 'Generate Binary Strings Without Consecutive 1s', difficulty: 'Medium', platform: 'GeeksforGeeks' },
  { topic: 'Recursion [PatternWise]', subTopic: 'Subsequences Pattern', problem: 'Generate Parentheses', difficulty: 'Medium', platform: 'LeetCode' },
  { topic: 'Recursion [PatternWise]', subTopic: 'Subsequences Pattern', problem: 'Power Set', difficulty: 'Medium', platform: 'GeeksforGeeks' },
  { topic: 'Recursion [PatternWise]', subTopic: 'Subsequences Pattern', problem: 'Learn All Patterns of Subsequences (Theory)', difficulty: 'Easy', platform: 'GeeksforGeeks' },
  { topic: 'Recursion [PatternWise]', subTopic: 'Subsequences Pattern', problem: 'Count all subsequences with sum K', difficulty: 'Easy', platform: 'GeeksforGeeks' },
  { topic: 'Recursion [PatternWise]', subTopic: 'Subsequences Pattern', problem: 'Check if there exists a subsequence with sum K', difficulty: 'Easy', platform: 'GeeksforGeeks' },
  { topic: 'Recursion [PatternWise]', subTopic: 'Subsequences Pattern', problem: 'Combination Sum', difficulty: 'Medium', platform: 'LeetCode' },
  { topic: 'Recursion [PatternWise]', subTopic: 'Subsequences Pattern', problem: 'Combination Sum II', difficulty: 'Medium', platform: 'LeetCode' },
  { topic: 'Recursion [PatternWise]', subTopic: 'Subsequences Pattern', problem: 'Subsets I', difficulty: 'Medium', platform: 'GeeksforGeeks' },
  { topic: 'Recursion [PatternWise]', subTopic: 'Subsequences Pattern', problem: 'Subsets II', difficulty: 'Medium', platform: 'LeetCode' },
  { topic: 'Recursion [PatternWise]', subTopic: 'Subsequences Pattern', problem: 'Combination Sum III', difficulty: 'Medium', platform: 'LeetCode' },
  { topic: 'Recursion [PatternWise]', subTopic: 'Subsequences Pattern', problem: 'Letter Combinations of a Phone Number', difficulty: 'Hard', platform: 'LeetCode' },
  { topic: 'Recursion [PatternWise]', subTopic: 'Trying out all Combos / Hard', problem: 'Palindrome partitioning', difficulty: 'Hard', platform: 'LeetCode' },
  { topic: 'Recursion [PatternWise]', subTopic: 'Trying out all Combos / Hard', problem: 'Word Search', difficulty: 'Hard', platform: 'LeetCode' },
  { topic: 'Recursion [PatternWise]', subTopic: 'Trying out all Combos / Hard', problem: 'N Queen', difficulty: 'Hard', platform: 'LeetCode' },
  { topic: 'Recursion [PatternWise]', subTopic: 'Trying out all Combos / Hard', problem: 'Rat in a Maze', difficulty: 'Hard', platform: 'GeeksforGeeks' },
  { topic: 'Recursion [PatternWise]', subTopic: 'Trying out all Combos / Hard', problem: 'Word Break', difficulty: 'Medium', platform: 'LeetCode' },
  { topic: 'Recursion [PatternWise]', subTopic: 'Trying out all Combos / Hard', problem: 'M Coloring Problem', difficulty: 'Hard', platform: 'GeeksforGeeks' },
  { topic: 'Recursion [PatternWise]', subTopic: 'Trying out all Combos / Hard', problem: 'Sudoku Solver', difficulty: 'Hard', platform: 'LeetCode' },
  { topic: 'Recursion [PatternWise]', subTopic: 'Trying out all Combos / Hard', problem: 'Expression Add Operators', difficulty: 'Hard', platform: 'LeetCode' },
  { topic: 'Bit Manipulation [Concepts & Problems]', subTopic: 'Learn Bit Manipulation', problem: 'Introduction to Bits and Tricks', difficulty: 'Easy', platform: 'GeeksforGeeks' },
  { topic: 'Bit Manipulation [Concepts & Problems]', subTopic: 'Learn Bit Manipulation', problem: 'Check if the i-th bit is Set or Not', difficulty: 'Easy', platform: 'GeeksforGeeks' },
  { topic: 'Bit Manipulation [Concepts & Problems]', subTopic: 'Learn Bit Manipulation', problem: 'Check if a Number is Odd or Not', difficulty: 'Easy', platform: 'GeeksforGeeks' },
  { topic: 'Bit Manipulation [Concepts & Problems]', subTopic: 'Learn Bit Manipulation', problem: 'Check if a Number is Power of 2 or Not', difficulty: 'Easy', platform: 'LeetCode' },
  { topic: 'Bit Manipulation [Concepts & Problems]', subTopic: 'Learn Bit Manipulation', problem: 'Count the Number of Set Bits', difficulty: 'Easy', platform: 'GeeksforGeeks' },
  { topic: 'Bit Manipulation [Concepts & Problems]', subTopic: 'Learn Bit Manipulation', problem: 'Set/Unset the rightmost unset bit', difficulty: 'Easy', platform: 'GeeksforGeeks' },
  { topic: 'Bit Manipulation [Concepts & Problems]', subTopic: 'Learn Bit Manipulation', problem: 'Swap Two Numbers', difficulty: 'Easy', platform: 'GeeksforGeeks' },
  { topic: 'Bit Manipulation [Concepts & Problems]', subTopic: 'Learn Bit Manipulation', problem: 'Divide two numbers without multiplication and division', difficulty: 'Medium', platform: 'LeetCode' },
  { topic: 'Bit Manipulation [Concepts & Problems]', subTopic: 'Interview Problems', problem: 'Minimum Bit Flips to Convert Number', difficulty: 'Medium', platform: 'LeetCode' },
  { topic: 'Bit Manipulation [Concepts & Problems]', subTopic: 'Interview Problems', problem: 'Single Number - I', difficulty: 'Medium', platform: 'LeetCode' },
  { topic: 'Bit Manipulation [Concepts & Problems]', subTopic: 'Interview Problems', problem: 'Power Set Bit Manipulation', difficulty: 'Medium', platform: 'LeetCode' },
  { topic: 'Bit Manipulation [Concepts & Problems]', subTopic: 'Interview Problems', problem: 'XOR of numbers in a given range', difficulty: 'Medium', platform: 'GeeksforGeeks' },
  { topic: 'Bit Manipulation [Concepts & Problems]', subTopic: 'Interview Problems', problem: 'Single Number - III', difficulty: 'Medium', platform: 'LeetCode' },
  { topic: 'Bit Manipulation [Concepts & Problems]', subTopic: 'Advanced Maths', problem: 'Print Prime Factors of a Number', difficulty: 'Hard', platform: 'GeeksforGeeks' },
  { topic: 'Bit Manipulation [Concepts & Problems]', subTopic: 'Advanced Maths', problem: 'Divisors of a Number', difficulty: 'Easy', platform: 'GeeksforGeeks' },
  { topic: 'Bit Manipulation [Concepts & Problems]', subTopic: 'Advanced Maths', problem: 'Count primes in range L to R', difficulty: 'Hard', platform: 'LeetCode' },
  { topic: 'Bit Manipulation [Concepts & Problems]', subTopic: 'Advanced Maths', problem: 'Prime factorisation of a Number', difficulty: 'Hard', platform: 'GeeksforGeeks' },
  { topic: 'Bit Manipulation [Concepts & Problems]', subTopic: 'Advanced Maths', problem: 'Pow(x,n)', difficulty: 'Easy', platform: 'LeetCode' },
  { topic: 'Stack and Queues [Learning, Pre-In-Post-fix, Monotonic Stack, Implementation]', subTopic: 'Learning', problem: 'Implement Stack using Arrays', difficulty: 'Easy', platform: 'GeeksforGeeks' },
  { topic: 'Stack and Queues [Learning, Pre-In-Post-fix, Monotonic Stack, Implementation]', subTopic: 'Learning', problem: 'Implement Queue using Arrays', difficulty: 'Easy', platform: 'GeeksforGeeks' },
  { topic: 'Stack and Queues [Learning, Pre-In-Post-fix, Monotonic Stack, Implementation]', subTopic: 'Learning', problem: 'Implement Stack using Queue', difficulty: 'Easy', platform: 'LeetCode' },
  { topic: 'Stack and Queues [Learning, Pre-In-Post-fix, Monotonic Stack, Implementation]', subTopic: 'Learning', problem: 'Implement Queue using Stack', difficulty: 'Easy', platform: 'LeetCode' },
  { topic: 'Stack and Queues [Learning, Pre-In-Post-fix, Monotonic Stack, Implementation]', subTopic: 'Learning', problem: 'Implement stack using Linkedlist', difficulty: 'Easy', platform: 'GeeksforGeeks' },
  { topic: 'Stack and Queues [Learning, Pre-In-Post-fix, Monotonic Stack, Implementation]', subTopic: 'Learning', problem: 'Implement queue using Linkedlist', difficulty: 'Easy', platform: 'GeeksforGeeks' },
  { topic: 'Stack and Queues [Learning, Pre-In-Post-fix, Monotonic Stack, Implementation]', subTopic: 'Learning', problem: 'Balanced Paranthesis', difficulty: 'Easy', platform: 'LeetCode' },
  { topic: 'Stack and Queues [Learning, Pre-In-Post-fix, Monotonic Stack, Implementation]', subTopic: 'Learning', problem: 'Implement Min Stack', difficulty: 'Hard', platform: 'LeetCode' },
  { topic: 'Stack and Queues [Learning, Pre-In-Post-fix, Monotonic Stack, Implementation]', subTopic: 'Prefix, Infix, PostFix Conversion Problems', problem: 'Infix to Postfix Conversion', difficulty: 'Medium', platform: 'GeeksforGeeks' },
  { topic: 'Stack and Queues [Learning, Pre-In-Post-fix, Monotonic Stack, Implementation]', subTopic: 'Prefix, Infix, PostFix Conversion Problems', problem: 'Prefix to Infix Conversion', difficulty: 'Medium', platform: 'GeeksforGeeks' },
  { topic: 'Stack and Queues [Learning, Pre-In-Post-fix, Monotonic Stack, Implementation]', subTopic: 'Prefix, Infix, PostFix Conversion Problems', problem: 'Prefix to Postfix Conversion', difficulty: 'Medium', platform: 'GeeksforGeeks' },
  { topic: 'Stack and Queues [Learning, Pre-In-Post-fix, Monotonic Stack, Implementation]', subTopic: 'Prefix, Infix, PostFix Conversion Problems', problem: 'Postfix to Prefix Conversion', difficulty: 'Medium', platform: 'GeeksforGeeks' },
  { topic: 'Stack and Queues [Learning, Pre-In-Post-fix, Monotonic Stack, Implementation]', subTopic: 'Prefix, Infix, PostFix Conversion Problems', problem: 'Postfix to Infix Conversion', difficulty: 'Easy', platform: 'GeeksforGeeks' },
  { topic: 'Stack and Queues [Learning, Pre-In-Post-fix, Monotonic Stack, Implementation]', subTopic: 'Prefix, Infix, PostFix Conversion Problems', problem: 'Infix to Prefix Conversion', difficulty: 'Medium', platform: 'GeeksforGeeks' },
  { topic: 'Stack and Queues [Learning, Pre-In-Post-fix, Monotonic Stack, Implementation]', subTopic: 'Monotonic Stack/Queue Problems [VVV. Imp]', problem: 'Next Greater Element', difficulty: 'Medium', platform: 'LeetCode' },
  { topic: 'Stack and Queues [Learning, Pre-In-Post-fix, Monotonic Stack, Implementation]', subTopic: 'Monotonic Stack/Queue Problems [VVV. Imp]', problem: 'Next Greater Element - 2', difficulty: 'Medium', platform: 'LeetCode' },
  { topic: 'Stack and Queues [Learning, Pre-In-Post-fix, Monotonic Stack, Implementation]', subTopic: 'Monotonic Stack/Queue Problems [VVV. Imp]', problem: 'Next Smaller Element', difficulty: 'Medium', platform: 'GeeksforGeeks' },
  { topic: 'Stack and Queues [Learning, Pre-In-Post-fix, Monotonic Stack, Implementation]', subTopic: 'Monotonic Stack/Queue Problems [VVV. Imp]', problem: 'Number of Greater Elements to the Right', difficulty: 'Easy', platform: 'GeeksforGeeks' },
  { topic: 'Stack and Queues [Learning, Pre-In-Post-fix, Monotonic Stack, Implementation]', subTopic: 'Monotonic Stack/Queue Problems [VVV. Imp]', problem: 'Trapping Rainwater', difficulty: 'Hard', platform: 'LeetCode' },
  { topic: 'Stack and Queues [Learning, Pre-In-Post-fix, Monotonic Stack, Implementation]', subTopic: 'Monotonic Stack/Queue Problems [VVV. Imp]', problem: 'Sum of Subarray Minimums', difficulty: 'Medium', platform: 'LeetCode' },
  { topic: 'Stack and Queues [Learning, Pre-In-Post-fix, Monotonic Stack, Implementation]', subTopic: 'Monotonic Stack/Queue Problems [VVV. Imp]', problem: 'Asteroid Collision', difficulty: 'Medium', platform: 'LeetCode' },
  { topic: 'Stack and Queues [Learning, Pre-In-Post-fix, Monotonic Stack, Implementation]', subTopic: 'Monotonic Stack/Queue Problems [VVV. Imp]', problem: 'Sum of Subarray Ranges', difficulty: 'Medium', platform: 'LeetCode' },
  { topic: 'Stack and Queues [Learning, Pre-In-Post-fix, Monotonic Stack, Implementation]', subTopic: 'Monotonic Stack/Queue Problems [VVV. Imp]', problem: 'Remove K Digits', difficulty: 'Medium', platform: 'LeetCode' },
  { topic: 'Stack and Queues [Learning, Pre-In-Post-fix, Monotonic Stack, Implementation]', subTopic: 'Monotonic Stack/Queue Problems [VVV. Imp]', problem: 'Largest rectangle in a histogram', difficulty: 'Hard', platform: 'LeetCode' },
  { topic: 'Stack and Queues [Learning, Pre-In-Post-fix, Monotonic Stack, Implementation]', subTopic: 'Monotonic Stack/Queue Problems [VVV. Imp]', problem: 'Maximum Rectangles', difficulty: 'Hard', platform: 'LeetCode' },
  { topic: 'Stack and Queues [Learning, Pre-In-Post-fix, Monotonic Stack, Implementation]', subTopic: 'Implementation Problems', problem: 'Sliding Window Maximum', difficulty: 'Hard', platform: 'LeetCode' },
  { topic: 'Stack and Queues [Learning, Pre-In-Post-fix, Monotonic Stack, Implementation]', subTopic: 'Implementation Problems', problem: 'Stock span problem', difficulty: 'Hard', platform: 'LeetCode' },
  { topic: 'Stack and Queues [Learning, Pre-In-Post-fix, Monotonic Stack, Implementation]', subTopic: 'Implementation Problems', problem: 'Celebrity Problem', difficulty: 'Hard', platform: 'LeetCode' },
  { topic: 'Stack and Queues [Learning, Pre-In-Post-fix, Monotonic Stack, Implementation]', subTopic: 'Implementation Problems', problem: 'LRU Cache', difficulty: 'Medium', platform: 'LeetCode' },
  { topic: 'Stack and Queues [Learning, Pre-In-Post-fix, Monotonic Stack, Implementation]', subTopic: 'Implementation Problems', problem: 'LFU Cache', difficulty: 'Hard', platform: 'LeetCode' },
  { topic: 'Sliding Window & Two Pointer Combined Problems', subTopic: 'Medium Problems', problem: 'Longest Substring Without Repeating Characters', difficulty: 'Medium', platform: 'LeetCode' },
  { topic: 'Sliding Window & Two Pointer Combined Problems', subTopic: 'Medium Problems', problem: 'Max Consecutive Ones III', difficulty: 'Medium', platform: 'LeetCode' },
  { topic: 'Sliding Window & Two Pointer Combined Problems', subTopic: 'Medium Problems', problem: 'Fruit Into Baskets', difficulty: 'Medium', platform: 'LeetCode' },
  { topic: 'Sliding Window & Two Pointer Combined Problems', subTopic: 'Medium Problems', problem: 'Longest Repeating Character Replacement', difficulty: 'Hard', platform: 'LeetCode' },
  { topic: 'Sliding Window & Two Pointer Combined Problems', subTopic: 'Medium Problems', problem: 'Binary Subarrays With Sum', difficulty: 'Hard', platform: 'LeetCode' },
  { topic: 'Sliding Window & Two Pointer Combined Problems', subTopic: 'Medium Problems', problem: 'Count number of Nice subarrays', difficulty: 'Hard', platform: 'LeetCode' },
  { topic: 'Sliding Window & Two Pointer Combined Problems', subTopic: 'Medium Problems', problem: 'Number of Substrings Containing All Three Characters', difficulty: 'Hard', platform: 'LeetCode' },
  { topic: 'Sliding Window & Two Pointer Combined Problems', subTopic: 'Medium Problems', problem: 'Maximum Points You Can Obtain from Cards', difficulty: 'Medium', platform: 'LeetCode' },
  { topic: 'Sliding Window & Two Pointer Combined Problems', subTopic: 'Hard Problems', problem: 'Longest Substring With At Most K Distinct Characters', difficulty: 'Hard', platform: 'LeetCode' },
  { topic: 'Sliding Window & Two Pointer Combined Problems', subTopic: 'Hard Problems', problem: 'Subarrays with K Different Integers', difficulty: 'Medium', platform: 'LeetCode' },
  { topic: 'Sliding Window & Two Pointer Combined Problems', subTopic: 'Hard Problems', problem: 'Minimum Window Substring', difficulty: 'Hard', platform: 'LeetCode' },
  { topic: 'Sliding Window & Two Pointer Combined Problems', subTopic: 'Hard Problems', problem: 'Minimum Window Subsequence', difficulty: 'Hard', platform: 'LeetCode' },
  { topic: 'Heaps [Learning, Medium, Hard Problems]', subTopic: 'Learning', problem: 'Heaps (Theory Video)', difficulty: 'Easy', platform: 'GeeksforGeeks' },
  { topic: 'Heaps [Learning, Medium, Hard Problems]', subTopic: 'Learning', problem: 'Implement Min Heap', difficulty: 'Medium', platform: 'GeeksforGeeks' },
  { topic: 'Heaps [Learning, Medium, Hard Problems]', subTopic: 'Learning', problem: 'Check if an array represents a min heap', difficulty: 'Medium', platform: 'GeeksforGeeks' },
  { topic: 'Heaps [Learning, Medium, Hard Problems]', subTopic: 'Learning', problem: 'Convert Min Heap to Max Heap', difficulty: 'Medium', platform: 'GeeksforGeeks' },
  { topic: 'Heaps [Learning, Medium, Hard Problems]', subTopic: 'Medium Problems', problem: 'K-th Largest element in an array', difficulty: 'Medium', platform: 'LeetCode' },
  { topic: 'Heaps [Learning, Medium, Hard Problems]', subTopic: 'Medium Problems', problem: 'Kth smallest element in an array [use priority queue]', difficulty: 'Medium', platform: 'GeeksforGeeks' },
  { topic: 'Heaps [Learning, Medium, Hard Problems]', subTopic: 'Medium Problems', problem: 'Sort K sorted array', difficulty: 'Easy', platform: 'GeeksforGeeks' },
  { topic: 'Heaps [Learning, Medium, Hard Problems]', subTopic: 'Medium Problems', problem: 'Merge K sorted Lists', difficulty: 'Hard', platform: 'LeetCode' },
  { topic: 'Heaps [Learning, Medium, Hard Problems]', subTopic: 'Medium Problems', problem: 'Replace Elements by Their Rank', difficulty: 'Easy', platform: 'GeeksforGeeks' },
  { topic: 'Heaps [Learning, Medium, Hard Problems]', subTopic: 'Medium Problems', problem: 'Task Scheduler', difficulty: 'Medium', platform: 'LeetCode' },
  { topic: 'Heaps [Learning, Medium, Hard Problems]', subTopic: 'Medium Problems', problem: 'Hand of Straights', difficulty: 'Medium', platform: 'LeetCode' },
  { topic: 'Heaps [Learning, Medium, Hard Problems]', subTopic: 'Hard Problems', problem: 'Design Twitter', difficulty: 'Medium', platform: 'LeetCode' },
  { topic: 'Heaps [Learning, Medium, Hard Problems]', subTopic: 'Hard Problems', problem: 'Minimum Cost to Connect Sticks', difficulty: 'Medium', platform: 'GeeksforGeeks' },
  { topic: 'Heaps [Learning, Medium, Hard Problems]', subTopic: 'Hard Problems', problem: 'Kth largest element in a stream of running integers', difficulty: 'Hard', platform: 'LeetCode' },
  { topic: 'Heaps [Learning, Medium, Hard Problems]', subTopic: 'Hard Problems', problem: 'Maximum Sum Combination', difficulty: 'Hard', platform: 'GeeksforGeeks' },
  { topic: 'Heaps [Learning, Medium, Hard Problems]', subTopic: 'Hard Problems', problem: 'Find Median from Data Stream', difficulty: 'Hard', platform: 'LeetCode' },
  { topic: 'Heaps [Learning, Medium, Hard Problems]', subTopic: 'Hard Problems', problem: 'Top K Frequent Elements', difficulty: 'Medium', platform: 'LeetCode' },
  { topic: 'Greedy Algorithms [Easy, Medium/Hard]', subTopic: 'Easy Problems', problem: 'Assign Cookies', difficulty: 'Easy', platform: 'LeetCode' },
  { topic: 'Greedy Algorithms [Easy, Medium/Hard]', subTopic: 'Easy Problems', problem: 'Fractional Knapsack', difficulty: 'Medium', platform: 'GeeksforGeeks' },
  { topic: 'Greedy Algorithms [Easy, Medium/Hard]', subTopic: 'Easy Problems', problem: 'Lemonade Change', difficulty: 'Easy', platform: 'LeetCode' },
  { topic: 'Greedy Algorithms [Easy, Medium/Hard]', subTopic: 'Easy Problems', problem: 'Valid Paranthesis Checker', difficulty: 'Hard', platform: 'LeetCode' },
  { topic: 'Greedy Algorithms [Easy, Medium/Hard]', subTopic: 'Medium/Hard', problem: 'N meetings in one room', difficulty: 'Medium', platform: 'GeeksforGeeks' },
  { topic: 'Greedy Algorithms [Easy, Medium/Hard]', subTopic: 'Medium/Hard', problem: 'Jump Game - I', difficulty: 'Easy', platform: 'LeetCode' },
  { topic: 'Greedy Algorithms [Easy, Medium/Hard]', subTopic: 'Medium/Hard', problem: 'Jump Game II', difficulty: 'Medium', platform: 'LeetCode' },
  { topic: 'Greedy Algorithms [Easy, Medium/Hard]', subTopic: 'Medium/Hard', problem: 'Minimum number of platforms required for a railway', difficulty: 'Medium', platform: 'GeeksforGeeks' },
  { topic: 'Greedy Algorithms [Easy, Medium/Hard]', subTopic: 'Medium/Hard', problem: 'Job sequencing Problem', difficulty: 'Medium', platform: 'GeeksforGeeks' },
  { topic: 'Greedy Algorithms [Easy, Medium/Hard]', subTopic: 'Medium/Hard', problem: 'Candy', difficulty: 'Hard', platform: 'LeetCode' },
  { topic: 'Greedy Algorithms [Easy, Medium/Hard]', subTopic: 'Medium/Hard', problem: 'Shortest Job First', difficulty: 'Medium', platform: 'GeeksforGeeks' },
  { topic: 'Greedy Algorithms [Easy, Medium/Hard]', subTopic: 'Medium/Hard', problem: 'Program for Least Recently Used (LRU) Page Replacement Algorithm', difficulty: 'Medium', platform: 'GeeksforGeeks' },
  { topic: 'Greedy Algorithms [Easy, Medium/Hard]', subTopic: 'Medium/Hard', problem: 'Insert Interval', difficulty: 'Medium', platform: 'LeetCode' },
  { topic: 'Greedy Algorithms [Easy, Medium/Hard]', subTopic: 'Medium/Hard', problem: 'Merge Intervals', difficulty: 'Medium', platform: 'LeetCode' },
  { topic: 'Greedy Algorithms [Easy, Medium/Hard]', subTopic: 'Medium/Hard', problem: 'Non-overlapping Intervals', difficulty: 'Medium', platform: 'LeetCode' },
  { topic: 'Binary Trees [Traversals, Medium and Hard Problems]', subTopic: 'Traversals', problem: 'Introduction to Trees', difficulty: 'Easy', platform: 'GeeksforGeeks' },
  { topic: 'Binary Trees [Traversals, Medium and Hard Problems]', subTopic: 'Traversals', problem: 'Binary Tree Representation in Java', difficulty: 'Easy', platform: 'GeeksforGeeks' },
  { topic: 'Binary Trees [Traversals, Medium and Hard Problems]', subTopic: 'Traversals', problem: 'Pre, Post, Inorder in one traversal', difficulty: 'Easy', platform: 'GeeksforGeeks' },
  { topic: 'Binary Trees [Traversals, Medium and Hard Problems]', subTopic: 'Traversals', problem: 'Preorder Traversal', difficulty: 'Easy', platform: 'LeetCode' },
  { topic: 'Binary Trees [Traversals, Medium and Hard Problems]', subTopic: 'Traversals', problem: 'Inorder Traversal of Binary Tree', difficulty: 'Easy', platform: 'LeetCode' },
  { topic: 'Binary Trees [Traversals, Medium and Hard Problems]', subTopic: 'Traversals', problem: 'Postorder Traversal', difficulty: 'Easy', platform: 'LeetCode' },
  { topic: 'Binary Trees [Traversals, Medium and Hard Problems]', subTopic: 'Traversals', problem: 'Level Order Traversal', difficulty: 'Easy', platform: 'LeetCode' },
  { topic: 'Binary Trees [Traversals, Medium and Hard Problems]', subTopic: 'Traversals', problem: 'Iterative Preorder Traversal of Binary Tree', difficulty: 'Easy', platform: 'LeetCode' },
  { topic: 'Binary Trees [Traversals, Medium and Hard Problems]', subTopic: 'Traversals', problem: 'Iterative Inorder Traversal of Binary Tree', difficulty: 'Easy', platform: 'LeetCode' },
  { topic: 'Binary Trees [Traversals, Medium and Hard Problems]', subTopic: 'Traversals', problem: 'Post-order Traversal of Binary Tree using 2 stack', difficulty: 'Easy', platform: 'LeetCode' },
  { topic: 'Binary Trees [Traversals, Medium and Hard Problems]', subTopic: 'Traversals', problem: 'Post-order Traversal of Binary Tree using 1 stack', difficulty: 'Easy', platform: 'LeetCode' },
  { topic: 'Binary Trees [Traversals, Medium and Hard Problems]', subTopic: 'Traversals', problem: 'Preorder, Inorder, and Postorder Traversal in one Traversal', difficulty: 'Easy', platform: 'GeeksforGeeks' },
  { topic: 'Binary Trees [Traversals, Medium and Hard Problems]', subTopic: 'Medium Problems', problem: 'Maximum Depth in BT', difficulty: 'Medium', platform: 'LeetCode' },
  { topic: 'Binary Trees [Traversals, Medium and Hard Problems]', subTopic: 'Medium Problems', problem: 'Check for balanced binary tree', difficulty: 'Medium', platform: 'LeetCode' },
  { topic: 'Binary Trees [Traversals, Medium and Hard Problems]', subTopic: 'Medium Problems', problem: 'Diameter of Binary Tree', difficulty: 'Easy', platform: 'LeetCode' },
  { topic: 'Binary Trees [Traversals, Medium and Hard Problems]', subTopic: 'Medium Problems', problem: 'Binary Tree Maximum Path Sum', difficulty: 'Hard', platform: 'LeetCode' },
  { topic: 'Binary Trees [Traversals, Medium and Hard Problems]', subTopic: 'Medium Problems', problem: 'Check if two trees are identical or not', difficulty: 'Medium', platform: 'LeetCode' },
  { topic: 'Binary Trees [Traversals, Medium and Hard Problems]', subTopic: 'Medium Problems', problem: 'Zig Zag or Spiral Traversal', difficulty: 'Medium', platform: 'LeetCode' },
  { topic: 'Binary Trees [Traversals, Medium and Hard Problems]', subTopic: 'Medium Problems', problem: 'Boundary Traversal', difficulty: 'Medium', platform: 'LeetCode' },
  { topic: 'Binary Trees [Traversals, Medium and Hard Problems]', subTopic: 'Medium Problems', problem: 'Vertical Order Traversal', difficulty: 'Medium', platform: 'LeetCode' },
  { topic: 'Binary Trees [Traversals, Medium and Hard Problems]', subTopic: 'Medium Problems', problem: 'Top View of BT', difficulty: 'Medium', platform: 'GeeksforGeeks' },
  { topic: 'Binary Trees [Traversals, Medium and Hard Problems]', subTopic: 'Medium Problems', problem: 'Bottom view of BT', difficulty: 'Medium', platform: 'GeeksforGeeks' },
  { topic: 'Binary Trees [Traversals, Medium and Hard Problems]', subTopic: 'Medium Problems', problem: 'Right/Left View of Binary Tree', difficulty: 'Medium', platform: 'LeetCode' },
  { topic: 'Binary Trees [Traversals, Medium and Hard Problems]', subTopic: 'Medium Problems', problem: 'Symmetric Binary Tree', difficulty: 'Medium', platform: 'LeetCode' },
  { topic: 'Binary Trees [Traversals, Medium and Hard Problems]', subTopic: 'Hard Problems', problem: 'Print root to leaf path in BT', difficulty: 'Medium', platform: 'GeeksforGeeks' },
  { topic: 'Binary Trees [Traversals, Medium and Hard Problems]', subTopic: 'Hard Problems', problem: 'LCA in BT', difficulty: 'Hard', platform: 'LeetCode' },
  { topic: 'Binary Trees [Traversals, Medium and Hard Problems]', subTopic: 'Hard Problems', problem: 'Maximum Width of BT', difficulty: 'Medium', platform: 'LeetCode' },
  { topic: 'Binary Trees [Traversals, Medium and Hard Problems]', subTopic: 'Hard Problems', problem: 'Children Sum Property in Binary Tree', difficulty: 'Medium', platform: 'GeeksforGeeks' },
  { topic: 'Binary Trees [Traversals, Medium and Hard Problems]', subTopic: 'Hard Problems', problem: 'Print all nodes at a distance of K in BT', difficulty: 'Hard', platform: 'LeetCode' },
  { topic: 'Binary Trees [Traversals, Medium and Hard Problems]', subTopic: 'Hard Problems', problem: 'Minimum time taken to burn the BT from a given Node', difficulty: 'Hard', platform: 'GeeksforGeeks' },
  { topic: 'Binary Trees [Traversals, Medium and Hard Problems]', subTopic: 'Hard Problems', problem: 'Count total nodes in a complete BT', difficulty: 'Easy', platform: 'LeetCode' },
  { topic: 'Binary Trees [Traversals, Medium and Hard Problems]', subTopic: 'Hard Problems', problem: 'Requirements needed to construct a unique BT', difficulty: 'Medium', platform: 'GeeksforGeeks' },
  { topic: 'Binary Trees [Traversals, Medium and Hard Problems]', subTopic: 'Hard Problems', problem: 'Construct a BT from Preorder and Inorder', difficulty: 'Hard', platform: 'LeetCode' },
  { topic: 'Binary Trees [Traversals, Medium and Hard Problems]', subTopic: 'Hard Problems', problem: 'Construct the Binary Tree from Postorder and Inorder Traversal', difficulty: 'Hard', platform: 'LeetCode' },
  { topic: 'Binary Trees [Traversals, Medium and Hard Problems]', subTopic: 'Hard Problems', problem: 'Serialize and De-serialize BT', difficulty: 'Hard', platform: 'LeetCode' },
  { topic: 'Binary Trees [Traversals, Medium and Hard Problems]', subTopic: 'Hard Problems', problem: 'Morris Preorder Traversal of a Binary Tree', difficulty: 'Hard', platform: 'LeetCode' },
  { topic: 'Binary Trees [Traversals, Medium and Hard Problems]', subTopic: 'Hard Problems', problem: 'Morris Inorder Traversal of a Binary Tree', difficulty: 'Hard', platform: 'LeetCode' },
  { topic: 'Binary Trees [Traversals, Medium and Hard Problems]', subTopic: 'Hard Problems', problem: 'Flatten Binary Tree to Linked List', difficulty: 'Medium', platform: 'LeetCode' },
  { topic: 'Binary Search Trees [Concept and Problems]', subTopic: 'Concepts', problem: 'Introduction to BST', difficulty: 'Easy', platform: 'GeeksforGeeks' },
  { topic: 'Binary Search Trees [Concept and Problems]', subTopic: 'Concepts', problem: 'Search in a Binary Search Tree', difficulty: 'Easy', platform: 'LeetCode' },
  { topic: 'Binary Search Trees [Concept and Problems]', subTopic: 'Concepts', problem: 'Find Min/Max in BST', difficulty: 'Easy', platform: 'GeeksforGeeks' },
  { topic: 'Binary Search Trees [Concept and Problems]', subTopic: 'Practice Problems', problem: 'Floor and Ceil in a BST', difficulty: 'Easy', platform: 'GeeksforGeeks' },
  { topic: 'Binary Search Trees [Concept and Problems]', subTopic: 'Practice Problems', problem: 'Floor in a Binary Search Tree', difficulty: 'Easy', platform: 'GeeksforGeeks' },
  { topic: 'Binary Search Trees [Concept and Problems]', subTopic: 'Practice Problems', problem: 'Insert a given node in BST', difficulty: 'Medium', platform: 'LeetCode' },
  { topic: 'Binary Search Trees [Concept and Problems]', subTopic: 'Practice Problems', problem: 'Delete a node in BST', difficulty: 'Medium', platform: 'LeetCode' },
  { topic: 'Binary Search Trees [Concept and Problems]', subTopic: 'Practice Problems', problem: 'Kth Smallest and Largest element in BST', difficulty: 'Medium', platform: 'LeetCode' },
  { topic: 'Binary Search Trees [Concept and Problems]', subTopic: 'Practice Problems', problem: 'Check if a tree is a BST or not', difficulty: 'Medium', platform: 'LeetCode' },
  { topic: 'Binary Search Trees [Concept and Problems]', subTopic: 'Practice Problems', problem: 'LCA in BST', difficulty: 'Medium', platform: 'LeetCode' },
  { topic: 'Binary Search Trees [Concept and Problems]', subTopic: 'Practice Problems', problem: 'Construct a BST from a preorder traversal', difficulty: 'Medium', platform: 'LeetCode' },
  { topic: 'Binary Search Trees [Concept and Problems]', subTopic: 'Practice Problems', problem: 'Inorder Successor/Predecessor in BST', difficulty: 'Medium', platform: 'LeetCode' },
  { topic: 'Binary Search Trees [Concept and Problems]', subTopic: 'Practice Problems', problem: "Merge 2 BST's", difficulty: 'Hard', platform: 'LeetCode' },
  { topic: 'Binary Search Trees [Concept and Problems]', subTopic: 'Practice Problems', problem: 'Two Sum In BST | Check if there exists a pair with Sum K', difficulty: 'Hard', platform: 'LeetCode' },
  { topic: 'Binary Search Trees [Concept and Problems]', subTopic: 'Practice Problems', problem: 'Correct BST with two nodes swapped', difficulty: 'Hard', platform: 'LeetCode' },
  { topic: 'Binary Search Trees [Concept and Problems]', subTopic: 'Practice Problems', problem: 'Largest BST in Binary Tree', difficulty: 'Hard', platform: 'LeetCode' },
  { topic: 'Graphs [Concepts & Problems]', subTopic: 'Learning', problem: 'Introduction to Graph', difficulty: 'Easy', platform: 'GeeksforGeeks' },
  { topic: 'Graphs [Concepts & Problems]', subTopic: 'Learning', problem: 'Graph Representation | C++', difficulty: 'Easy', platform: 'GeeksforGeeks' },
  { topic: 'Graphs [Concepts & Problems]', subTopic: 'Learning', problem: 'Graph Representation | Java', difficulty: 'Easy', platform: 'GeeksforGeeks' },
  { topic: 'Graphs [Concepts & Problems]', subTopic: 'Learning', problem: 'Connected Components', difficulty: 'Medium', platform: 'GeeksforGeeks' },
  { topic: 'Graphs [Concepts & Problems]', subTopic: 'Learning', problem: 'Traversal Techniques', difficulty: 'Medium', platform: 'GeeksforGeeks' },
  { topic: 'Graphs [Concepts & Problems]', subTopic: 'Learning', problem: 'DFS', difficulty: 'Medium', platform: 'GeeksforGeeks' },
  { topic: 'Graphs [Concepts & Problems]', subTopic: 'Problems on BFS/DFS', problem: 'Number of provinces', difficulty: 'Medium', platform: 'LeetCode' },
  { topic: 'Graphs [Concepts & Problems]', subTopic: 'Problems on BFS/DFS', problem: 'Connected Components Problem in Matrix', difficulty: 'Medium', platform: 'GeeksforGeeks' },
  { topic: 'Graphs [Concepts & Problems]', subTopic: 'Problems on BFS/DFS', problem: 'Rotten Oranges', difficulty: 'Medium', platform: 'LeetCode' },
  { topic: 'Graphs [Concepts & Problems]', subTopic: 'Problems on BFS/DFS', problem: 'Flood fill algorithm', difficulty: 'Medium', platform: 'LeetCode' },
  { topic: 'Graphs [Concepts & Problems]', subTopic: 'Problems on BFS/DFS', problem: 'Cycle Detection in Undirected Graph (bfs)', difficulty: 'Hard', platform: 'GeeksforGeeks' },
  { topic: 'Graphs [Concepts & Problems]', subTopic: 'Problems on BFS/DFS', problem: 'Detect a cycle in an undirected graph', difficulty: 'Hard', platform: 'LeetCode' },
  { topic: 'Graphs [Concepts & Problems]', subTopic: 'Problems on BFS/DFS', problem: 'Distance of nearest cell having one', difficulty: 'Medium', platform: 'LeetCode' },
  { topic: 'Graphs [Concepts & Problems]', subTopic: 'Problems on BFS/DFS', problem: 'Surrounded Regions', difficulty: 'Medium', platform: 'LeetCode' },
  { topic: 'Graphs [Concepts & Problems]', subTopic: 'Problems on BFS/DFS', problem: 'Number of enclaves', difficulty: 'Medium', platform: 'LeetCode' },
  { topic: 'Graphs [Concepts & Problems]', subTopic: 'Problems on BFS/DFS', problem: 'Word ladder I', difficulty: 'Hard', platform: 'LeetCode' },
  { topic: 'Graphs [Concepts & Problems]', subTopic: 'Problems on BFS/DFS', problem: 'Word ladder II', difficulty: 'Hard', platform: 'LeetCode' },
  { topic: 'Graphs [Concepts & Problems]', subTopic: 'Problems on BFS/DFS', problem: 'Number of islands', difficulty: 'Medium', platform: 'LeetCode' },
  { topic: 'Graphs [Concepts & Problems]', subTopic: 'Problems on BFS/DFS', problem: 'Bipartite Graph (DFS)', difficulty: 'Hard', platform: 'LeetCode' },
  { topic: 'Graphs [Concepts & Problems]', subTopic: 'Problems on BFS/DFS', problem: 'Cycle Detection in Directed Graph (DFS)', difficulty: 'Hard', platform: 'LeetCode' },
  { topic: 'Graphs [Concepts & Problems]', subTopic: 'Topo Sort and Problems', problem: 'Topo Sort', difficulty: 'Hard', platform: 'GeeksforGeeks' },
  { topic: 'Graphs [Concepts & Problems]', subTopic: 'Topo Sort and Problems', problem: "Topological sort or Kahn's algorithm", difficulty: 'Hard', platform: 'GeeksforGeeks' },
  { topic: 'Graphs [Concepts & Problems]', subTopic: 'Topo Sort and Problems', problem: 'Detect a cycle in a directed graph', difficulty: 'Hard', platform: 'LeetCode' },
  { topic: 'Graphs [Concepts & Problems]', subTopic: 'Topo Sort and Problems', problem: 'Course Schedule I', difficulty: 'Hard', platform: 'LeetCode' },
  { topic: 'Graphs [Concepts & Problems]', subTopic: 'Topo Sort and Problems', problem: 'Course Schedule II', difficulty: 'Medium', platform: 'LeetCode' },
  { topic: 'Graphs [Concepts & Problems]', subTopic: 'Topo Sort and Problems', problem: 'Find eventual safe states', difficulty: 'Hard', platform: 'LeetCode' },
  { topic: 'Graphs [Concepts & Problems]', subTopic: 'Topo Sort and Problems', problem: 'Alien Dictionary', difficulty: 'Hard', platform: 'LeetCode' },
  { topic: 'Graphs [Concepts & Problems]', subTopic: 'Shortest Path Algorithms and Problems', problem: 'Shortest path in undirected graph with unit weights', difficulty: 'Hard', platform: 'GeeksforGeeks' },
  { topic: 'Graphs [Concepts & Problems]', subTopic: 'Shortest Path Algorithms and Problems', problem: 'Shortest path in DAG', difficulty: 'Hard', platform: 'GeeksforGeeks' },
  { topic: 'Graphs [Concepts & Problems]', subTopic: 'Shortest Path Algorithms and Problems', problem: "Djisktra's Algorithm", difficulty: 'Hard', platform: 'GeeksforGeeks' },
  { topic: 'Graphs [Concepts & Problems]', subTopic: 'Shortest Path Algorithms and Problems', problem: "Why priority Queue is used in Djisktra's Algorithm", difficulty: 'Hard', platform: 'GeeksforGeeks' },
  { topic: 'Graphs [Concepts & Problems]', subTopic: 'Shortest Path Algorithms and Problems', problem: 'Shortest Distance in a Binary Maze', difficulty: 'Hard', platform: 'LeetCode' },
  { topic: 'Graphs [Concepts & Problems]', subTopic: 'Shortest Path Algorithms and Problems', problem: 'Path with minimum effort', difficulty: 'Hard', platform: 'LeetCode' },
  { topic: 'Graphs [Concepts & Problems]', subTopic: 'Shortest Path Algorithms and Problems', problem: 'Cheapest flight within K stops', difficulty: 'Hard', platform: 'LeetCode' },
  { topic: 'Graphs [Concepts & Problems]', subTopic: 'Shortest Path Algorithms and Problems', problem: 'Network Delay Time', difficulty: 'Medium', platform: 'LeetCode' },
  { topic: 'Graphs [Concepts & Problems]', subTopic: 'Shortest Path Algorithms and Problems', problem: 'Number of ways to arrive at destination', difficulty: 'Hard', platform: 'LeetCode' },
  { topic: 'Graphs [Concepts & Problems]', subTopic: 'Shortest Path Algorithms and Problems', problem: 'Minimum multiplications to reach end', difficulty: 'Hard', platform: 'GeeksforGeeks' },
  { topic: 'Graphs [Concepts & Problems]', subTopic: 'Shortest Path Algorithms and Problems', problem: 'Bellman Ford Algorithm', difficulty: 'Hard', platform: 'GeeksforGeeks' },
  { topic: 'Graphs [Concepts & Problems]', subTopic: 'Shortest Path Algorithms and Problems', problem: 'Floyd warshall algorithm', difficulty: 'Hard', platform: 'GeeksforGeeks' },
  { topic: 'Graphs [Concepts & Problems]', subTopic: 'Shortest Path Algorithms and Problems', problem: 'Find the city with the smallest number of neighbors', difficulty: 'Hard', platform: 'LeetCode' },
  { topic: 'Graphs [Concepts & Problems]', subTopic: 'MinimumSpanningTree/Disjoint Set and Problems', problem: 'MST theory', difficulty: 'Easy', platform: 'GeeksforGeeks' },
  { topic: 'Graphs [Concepts & Problems]', subTopic: 'MinimumSpanningTree/Disjoint Set and Problems', problem: "Prim's Algorithm", difficulty: 'Hard', platform: 'GeeksforGeeks' },
  { topic: 'Graphs [Concepts & Problems]', subTopic: 'MinimumSpanningTree/Disjoint Set and Problems', problem: 'Disjoint Set', difficulty: 'Hard', platform: 'GeeksforGeeks' },
  { topic: 'Graphs [Concepts & Problems]', subTopic: 'MinimumSpanningTree/Disjoint Set and Problems', problem: 'Find the MST weight', difficulty: 'Hard', platform: 'GeeksforGeeks' },
  { topic: 'Graphs [Concepts & Problems]', subTopic: 'MinimumSpanningTree/Disjoint Set and Problems', problem: 'Number of operations to make network connected', difficulty: 'Hard', platform: 'LeetCode' },
  { topic: 'Graphs [Concepts & Problems]', subTopic: 'MinimumSpanningTree/Disjoint Set and Problems', problem: 'Most stones removed with same row or column', difficulty: 'Medium', platform: 'LeetCode' },
  { topic: 'Graphs [Concepts & Problems]', subTopic: 'MinimumSpanningTree/Disjoint Set and Problems', problem: 'Accounts merge', difficulty: 'Hard', platform: 'LeetCode' },
  { topic: 'Graphs [Concepts & Problems]', subTopic: 'MinimumSpanningTree/Disjoint Set and Problems', problem: 'Number of islands II', difficulty: 'Hard', platform: 'LeetCode' },
  { topic: 'Graphs [Concepts & Problems]', subTopic: 'MinimumSpanningTree/Disjoint Set and Problems', problem: 'Making a large island', difficulty: 'Hard', platform: 'LeetCode' },
  { topic: 'Graphs [Concepts & Problems]', subTopic: 'MinimumSpanningTree/Disjoint Set and Problems', problem: 'Swim in Rising Water', difficulty: 'Medium', platform: 'LeetCode' },
  { topic: 'Graphs [Concepts & Problems]', subTopic: 'Other Algorithms', problem: 'Bridges in graph', difficulty: 'Hard', platform: 'LeetCode' },
  { topic: 'Graphs [Concepts & Problems]', subTopic: 'Other Algorithms', problem: 'Articulation point in graph', difficulty: 'Hard', platform: 'GeeksforGeeks' },
  { topic: 'Graphs [Concepts & Problems]', subTopic: 'Other Algorithms', problem: "Kosaraju's algorithm", difficulty: 'Hard', platform: 'LeetCode' },
  { topic: 'Dynamic Programming [Patterns and Problems]', subTopic: 'Introduction to DP', problem: 'Introduction to DP', difficulty: 'Easy', platform: 'GeeksforGeeks' },
  { topic: 'Dynamic Programming [Patterns and Problems]', subTopic: '1D DP', problem: 'Climbing stairs', difficulty: 'Medium', platform: 'LeetCode' },
  { topic: 'Dynamic Programming [Patterns and Problems]', subTopic: '1D DP', problem: 'Frog Jump', difficulty: 'Medium', platform: 'GeeksforGeeks' },
  { topic: 'Dynamic Programming [Patterns and Problems]', subTopic: '1D DP', problem: 'Frog jump with K distances', difficulty: 'Medium', platform: 'GeeksforGeeks' },
  { topic: 'Dynamic Programming [Patterns and Problems]', subTopic: '1D DP', problem: 'Maximum sum of non adjacent elements', difficulty: 'Medium', platform: 'LeetCode' },
  { topic: 'Dynamic Programming [Patterns and Problems]', subTopic: '1D DP', problem: 'House robber', difficulty: 'Medium', platform: 'LeetCode' },
  { topic: 'Dynamic Programming [Patterns and Problems]', subTopic: '2D/3D DP and DP on Grids', problem: "Ninja's training", difficulty: 'Medium', platform: 'GeeksforGeeks' },
  { topic: 'Dynamic Programming [Patterns and Problems]', subTopic: '2D/3D DP and DP on Grids', problem: 'Grid Unique Paths : DP on Grids (DP8)', difficulty: 'Medium', platform: 'LeetCode' },
  { topic: 'Dynamic Programming [Patterns and Problems]', subTopic: '2D/3D DP and DP on Grids', problem: 'Unique paths II', difficulty: 'Medium', platform: 'LeetCode' },
  { topic: 'Dynamic Programming [Patterns and Problems]', subTopic: '2D/3D DP and DP on Grids', problem: 'Minimum Falling Path Sum', difficulty: 'Medium', platform: 'LeetCode' },
  { topic: 'Dynamic Programming [Patterns and Problems]', subTopic: '2D/3D DP and DP on Grids', problem: 'Triangle', difficulty: 'Medium', platform: 'LeetCode' },
  { topic: 'Dynamic Programming [Patterns and Problems]', subTopic: '2D/3D DP and DP on Grids', problem: 'Ninja and his Friends', difficulty: 'Medium', platform: 'GeeksforGeeks' },
  { topic: 'Dynamic Programming [Patterns and Problems]', subTopic: 'DP on Subsequences', problem: 'Subset sum equal to target (DP- 14)', difficulty: 'Hard', platform: 'GeeksforGeeks' },
  { topic: 'Dynamic Programming [Patterns and Problems]', subTopic: 'DP on Subsequences', problem: 'Partition equal subset sum', difficulty: 'Hard', platform: 'LeetCode' },
  { topic: 'Dynamic Programming [Patterns and Problems]', subTopic: 'DP on Subsequences', problem: 'Partition a set into two subsets with minimum absolute sum difference', difficulty: 'Hard', platform: 'LeetCode' },
  { topic: 'Dynamic Programming [Patterns and Problems]', subTopic: 'DP on Subsequences', problem: 'Count subsets with sum K', difficulty: 'Hard', platform: 'GeeksforGeeks' },
  { topic: 'Dynamic Programming [Patterns and Problems]', subTopic: 'DP on Subsequences', problem: 'Count partitions with given difference', difficulty: 'Hard', platform: 'GeeksforGeeks' },
  { topic: 'Dynamic Programming [Patterns and Problems]', subTopic: 'DP on Subsequences', problem: 'Assign Cookies', difficulty: 'Easy', platform: 'LeetCode' },
  { topic: 'Dynamic Programming [Patterns and Problems]', subTopic: 'DP on Subsequences', problem: 'Minimum Coins (DP - 20)', difficulty: 'Hard', platform: 'LeetCode' },
  { topic: 'Dynamic Programming [Patterns and Problems]', subTopic: 'DP on Subsequences', problem: 'Target sum', difficulty: 'Hard', platform: 'LeetCode' },
  { topic: 'Dynamic Programming [Patterns and Problems]', subTopic: 'DP on Subsequences', problem: 'Coin Change 2 (DP - 22)', difficulty: 'Hard', platform: 'LeetCode' },
  { topic: 'Dynamic Programming [Patterns and Problems]', subTopic: 'DP on Subsequences', problem: 'Unbounded knapsack', difficulty: 'Hard', platform: 'GeeksforGeeks' },
  { topic: 'Dynamic Programming [Patterns and Problems]', subTopic: 'DP on Subsequences', problem: 'Rod Cutting Problem | (DP - 24)', difficulty: 'Hard', platform: 'GeeksforGeeks' },
  { topic: 'Dynamic Programming [Patterns and Problems]', subTopic: 'DP on Strings', problem: 'Longest common subsequence', difficulty: 'Hard', platform: 'LeetCode' },
  { topic: 'Dynamic Programming [Patterns and Problems]', subTopic: 'DP on Strings', problem: 'Print Longest Common Subsequence | (DP - 26)', difficulty: 'hard', platform: 'GeeksforGeeks' },
  { topic: 'Dynamic Programming [Patterns and Problems]', subTopic: 'DP on Strings', problem: 'Longest common substring', difficulty: 'Hard', platform: 'GeeksforGeeks' },
  { topic: 'Dynamic Programming [Patterns and Problems]', subTopic: 'DP on Strings', problem: 'Longest palindromic subsequence', difficulty: 'Hard', platform: 'LeetCode' },
  { topic: 'Dynamic Programming [Patterns and Problems]', subTopic: 'DP on Strings', problem: 'Minimum insertions to make string palindrome | DP-29', difficulty: 'Hard', platform: 'LeetCode' },
  { topic: 'Dynamic Programming [Patterns and Problems]', subTopic: 'DP on Strings', problem: 'Minimum insertions or deletions to convert string A to B', difficulty: 'Hard', platform: 'LeetCode' },
  { topic: 'Dynamic Programming [Patterns and Problems]', subTopic: 'DP on Strings', problem: 'Shortest common supersequence', difficulty: 'Hard', platform: 'LeetCode' },
  { topic: 'Dynamic Programming [Patterns and Problems]', subTopic: 'DP on Strings', problem: 'Distinct subsequences', difficulty: 'Hard', platform: 'LeetCode' },
  { topic: 'Dynamic Programming [Patterns and Problems]', subTopic: 'DP on Strings', problem: 'Edit distance', difficulty: 'Hard', platform: 'LeetCode' },
  { topic: 'Dynamic Programming [Patterns and Problems]', subTopic: 'DP on Strings', problem: 'Wildcard matching', difficulty: 'Hard', platform: 'LeetCode' },
  { topic: 'Dynamic Programming [Patterns and Problems]', subTopic: 'DP on Stocks', problem: 'Best time to buy and sell stock', difficulty: 'Medium', platform: 'LeetCode' },
  { topic: 'Dynamic Programming [Patterns and Problems]', subTopic: 'DP on Stocks', problem: 'Best time to buy and sell stock II', difficulty: 'Medium', platform: 'LeetCode' },
  { topic: 'Dynamic Programming [Patterns and Problems]', subTopic: 'DP on Stocks', problem: 'Best time to buy and sell stock III', difficulty: 'Medium', platform: 'LeetCode' },
  { topic: 'Dynamic Programming [Patterns and Problems]', subTopic: 'DP on Stocks', problem: 'Best time to buy and sell stock IV', difficulty: 'Medium', platform: 'LeetCode' },
  { topic: 'Dynamic Programming [Patterns and Problems]', subTopic: 'DP on Stocks', problem: 'Best Time to Buy and Sell Stock with Cooldown', difficulty: 'Medium', platform: 'LeetCode' },
  { topic: 'Dynamic Programming [Patterns and Problems]', subTopic: 'DP on Stocks', problem: 'Best time to buy and sell stock with transaction fees', difficulty: 'Medium', platform: 'LeetCode' },
  { topic: 'Dynamic Programming [Patterns and Problems]', subTopic: 'DP on LIS', problem: 'Longest Increasing Subsequence', difficulty: 'Medium', platform: 'LeetCode' },
  { topic: 'Dynamic Programming [Patterns and Problems]', subTopic: 'DP on LIS', problem: 'Print Longest Increasing Subsequence', difficulty: 'Medium', platform: 'GeeksforGeeks' },
  { topic: 'Dynamic Programming [Patterns and Problems]', subTopic: 'DP on LIS', problem: 'Longest Increasing Subsequence |(DP-43)', difficulty: 'Medium', platform: 'LeetCode' },
  { topic: 'Dynamic Programming [Patterns and Problems]', subTopic: 'DP on LIS', problem: 'Largest Divisible Subset', difficulty: 'Medium', platform: 'LeetCode' },
  { topic: 'Dynamic Programming [Patterns and Problems]', subTopic: 'DP on LIS', problem: 'Longest String Chain', difficulty: 'Medium', platform: 'LeetCode' },
  { topic: 'Dynamic Programming [Patterns and Problems]', subTopic: 'DP on LIS', problem: 'Longest Bitonic Subsequence', difficulty: 'Medium', platform: 'GeeksforGeeks' },
  { topic: 'Dynamic Programming [Patterns and Problems]', subTopic: 'DP on LIS', problem: 'Number of Longest Increasing Subsequences', difficulty: 'Medium', platform: 'LeetCode' },
  { topic: 'Dynamic Programming [Patterns and Problems]', subTopic: 'MCM DP | Partition DP', problem: 'Matrix chain multiplication', difficulty: 'Hard', platform: 'GeeksforGeeks' },
  { topic: 'Dynamic Programming [Patterns and Problems]', subTopic: 'MCM DP | Partition DP', problem: 'Matrix Chain Multiplication | Bottom-Up|(DP-49)', difficulty: 'Hard', platform: 'GeeksforGeeks' },
  { topic: 'Dynamic Programming [Patterns and Problems]', subTopic: 'MCM DP | Partition DP', problem: 'Minimum cost to cut the stick', difficulty: 'Hard', platform: 'LeetCode' },
  { topic: 'Dynamic Programming [Patterns and Problems]', subTopic: 'MCM DP | Partition DP', problem: 'Burst balloons', difficulty: 'Hard', platform: 'LeetCode' },
  { topic: 'Dynamic Programming [Patterns and Problems]', subTopic: 'MCM DP | Partition DP', problem: 'Different Ways to Evaluate a Boolean Expression', difficulty: 'Medium', platform: 'LeetCode' },
  { topic: 'Dynamic Programming [Patterns and Problems]', subTopic: 'MCM DP | Partition DP', problem: 'Palindrome partitioning II', difficulty: 'Hard', platform: 'LeetCode' },
  { topic: 'Dynamic Programming [Patterns and Problems]', subTopic: 'MCM DP | Partition DP', problem: 'Partition Array for Maximum Sum', difficulty: 'Medium', platform: 'LeetCode' },
  { topic: 'Dynamic Programming [Patterns and Problems]', subTopic: 'DP on Squares', problem: "Maximum Rectangle Area with all 1's|(DP-55)", difficulty: 'Hard', platform: 'LeetCode' },
  { topic: 'Dynamic Programming [Patterns and Problems]', subTopic: 'DP on Squares', problem: 'Count Square Submatrices with All Ones|(DP-56)', difficulty: 'Easy', platform: 'LeetCode' },
  { topic: 'Tries', subTopic: 'Theory', problem: 'Trie Implementation and Operations', difficulty: 'Hard', platform: 'LeetCode' },
  { topic: 'Tries', subTopic: 'Problems', problem: 'Trie Implementation and Advanced Operations', difficulty: 'Hard', platform: 'GeeksforGeeks' },
  { topic: 'Tries', subTopic: 'Problems', problem: 'Longest Word with All Prefixes', difficulty: 'Medium', platform: 'GeeksforGeeks' },
  { topic: 'Tries', subTopic: 'Problems', problem: 'Number of distinct substrings in a string', difficulty: 'Medium', platform: 'GeeksforGeeks' },
  { topic: 'Tries', subTopic: 'Problems', problem: 'Bit PreRequisites for TRIE Problems', difficulty: 'Easy', platform: 'GeeksforGeeks' },
  { topic: 'Tries', subTopic: 'Problems', problem: 'Maximum XOR of two numbers in an array', difficulty: 'Hard', platform: 'LeetCode' },
  { topic: 'Tries', subTopic: 'Problems', problem: 'Maximum Xor with an element from an array', difficulty: 'Hard', platform: 'LeetCode' },
  { topic: 'Strings', subTopic: 'Hard Problems', problem: 'Minimum number of bracket reversals to make an expression balanced', difficulty: 'Hard', platform: 'LeetCode' },
  { topic: 'Strings', subTopic: 'Hard Problems', problem: 'Count and say', difficulty: 'Hard', platform: 'LeetCode' },
  { topic: 'Strings', subTopic: 'Hard Problems', problem: 'Hashing In Strings | Theory', difficulty: 'Easy', platform: 'GeeksforGeeks' },
  { topic: 'Strings', subTopic: 'Hard Problems', problem: 'Rabin Karp Algorithm', difficulty: 'Hard', platform: 'LeetCode' },
  { topic: 'Strings', subTopic: 'Hard Problems', problem: 'Z function', difficulty: 'Hard', platform: 'GeeksforGeeks' },
  { topic: 'Strings', subTopic: 'Hard Problems', problem: 'KMP Algorithm or LPS array', difficulty: 'Hard', platform: 'LeetCode' },
  { topic: 'Strings', subTopic: 'Hard Problems', problem: 'Shortest Palindrome', difficulty: 'Hard', platform: 'LeetCode' },
  { topic: 'Strings', subTopic: 'Hard Problems', problem: 'Longest happy prefix', difficulty: 'Hard', platform: 'LeetCode' },
  { topic: 'Strings', subTopic: 'Hard Problems', problem: 'Count Palindromic Subsequences', difficulty: 'Medium', platform: 'LeetCode' }
];

function normalizeTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .trim();
}

function normalizeDifficulty(diffStr: string): Difficulty {
  const lower = diffStr.toLowerCase().trim();
  if (lower === 'easy') return 'Easy';
  if (lower === 'medium') return 'Medium';
  if (lower === 'hard') return 'Hard';
  return 'Medium';
}

function inferPatternsFromTopic(topic: string, subTopic: string, title: string): string[] {
  const combined = `${topic} ${subTopic} ${title}`.toLowerCase();
  const patterns = new Set<string>();

  if (combined.includes('sort')) patterns.add('sorting');
  if (combined.includes('array')) patterns.add('arrays');
  if (combined.includes('binary search') || combined.includes('bs on')) patterns.add('binary_search');
  if (combined.includes('string')) patterns.add('strings');
  if (combined.includes('linked list') || combined.includes('ll')) patterns.add('linked_list');
  if (combined.includes('recursion')) patterns.add('recursion');
  if (combined.includes('bit')) patterns.add('bit_manipulation');
  if (combined.includes('stack')) patterns.add('stack');
  if (combined.includes('queue')) patterns.add('queue');
  if (combined.includes('monotonic')) patterns.add('monotonic_stack');
  if (combined.includes('sliding window') || combined.includes('two pointer')) {
    patterns.add('sliding_window');
    patterns.add('two_pointers');
  }
  if (combined.includes('heap')) patterns.add('heap');
  if (combined.includes('greedy')) patterns.add('greedy');
  if (combined.includes('tree') || combined.includes('bt')) patterns.add('trees');
  if (combined.includes('bst')) patterns.add('bst');
  if (combined.includes('graph')) patterns.add('graphs');
  if (combined.includes('dp') || combined.includes('dynamic programming')) patterns.add('dynamic_programming');
  if (combined.includes('trie')) patterns.add('trie');
  if (combined.includes('backtrack')) patterns.add('backtracking');
  if (combined.includes('subsequence') || combined.includes('subset')) patterns.add('backtracking');
  if (combined.includes('hash')) patterns.add('hashing');

  if (patterns.size === 0) patterns.add('arrays');
  return Array.from(patterns);
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export function buildStriverSheetProblem(
  raw: StriverRawEntry,
  index: number
): Problem {
  const platform = (raw.platform as Platform) || 'GeeksforGeeks';
  const difficulty = normalizeDifficulty(raw.difficulty);
  const slug = slugify(raw.problem);
  const id = `striver-${platform.toLowerCase()}-${slug || index}`;

  let url = '';
  if (platform === 'LeetCode') {
    url = `https://leetcode.com/problems/${slug}/`;
  } else if (platform === 'GeeksforGeeks') {
    url = `https://www.geeksforgeeks.org/problems/${slug}/1`;
  } else {
    url = `https://www.google.com/search?q=${encodeURIComponent(`${raw.problem} ${platform}`)}`;
  }

  const dsaPatterns = inferPatternsFromTopic(raw.topic, raw.subTopic, raw.problem);

  return {
    id,
    title: raw.problem,
    platform,
    platformProblemId: slug,
    url,
    difficulty,
    tags: [
      "Striver's AtoZ DSA Sheet",
      raw.topic,
      raw.subTopic,
    ],
    dsaPatterns,
    estimatedSolvingTimeMinutes: difficulty === 'Easy' ? 15 : difficulty === 'Medium' ? 30 : 45,
    isPremium: false,
    isStriverSheet: true,
    striverTopic: raw.topic,
    striverSubTopic: raw.subTopic,
  };
}

export function mergeStriverSheetIntoCatalog(existingCatalog: Problem[]): Problem[] {
  const catalogMap = new Map<string, Problem>();

  // Map existing catalog
  for (const prob of existingCatalog) {
    catalogMap.set(prob.id, { ...prob });
  }

  STRIVER_RAW_DATA.forEach((raw, idx) => {
    const currentCatalogList = Array.from(catalogMap.values());
    const existing = findMatchingProblem(
      {
        title: raw.problem,
        platform: raw.platform,
      },
      currentCatalogList
    );

    if (existing) {
      // Mark as striver sheet problem
      existing.isStriverSheet = true;
      existing.striverTopic = raw.topic;
      existing.striverSubTopic = raw.subTopic;
      if (!existing.tags) {
        existing.tags = [];
      }
      if (!existing.tags.includes("Striver's AtoZ DSA Sheet")) {
        existing.tags.push("Striver's AtoZ DSA Sheet");
      }
      catalogMap.set(existing.id, existing);
    } else {
      // Create new problem from Striver's sheet entry
      const newProblem = buildStriverSheetProblem(raw, idx);
      catalogMap.set(newProblem.id, newProblem);
    }
  });

  return Array.from(catalogMap.values());
}
