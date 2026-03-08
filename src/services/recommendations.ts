// ────────────────────────────────────────────────────────────────
//  AI Coach — Problem Recommendation Engine
//  Curated problem sets for every major CP topic.
//  Primary: LeetCode  /  Secondary: Codeforces
// ────────────────────────────────────────────────────────────────

export interface RecommendedProblem {
    name: string;
    platform: "leetcode" | "codeforces";
    difficulty: "easy" | "medium" | "hard";
    url: string;
    tags: string[];
}

export interface TopicRecommendation {
    topic: string;
    recommendedProblems: RecommendedProblem[];
}

// ──────────────────────────────────────────────
//  Curated dataset (topics → problems)
// ──────────────────────────────────────────────
const CURATED: Record<string, RecommendedProblem[]> = {
    "arrays": [
        { name: "Two Sum", platform: "leetcode", difficulty: "easy", url: "https://leetcode.com/problems/two-sum/", tags: ["hash map", "array"] },
        { name: "Best Time to Buy and Sell Stock", platform: "leetcode", difficulty: "easy", url: "https://leetcode.com/problems/best-time-to-buy-and-sell-stock/", tags: ["array", "greedy"] },
        { name: "Product of Array Except Self", platform: "leetcode", difficulty: "medium", url: "https://leetcode.com/problems/product-of-array-except-self/", tags: ["array", "prefix sum"] },
        { name: "Maximum Subarray", platform: "leetcode", difficulty: "medium", url: "https://leetcode.com/problems/maximum-subarray/", tags: ["array", "dp", "kadane"] },
        { name: "Rotate Array", platform: "leetcode", difficulty: "medium", url: "https://leetcode.com/problems/rotate-array/", tags: ["array"] },
    ],
    "strings": [
        { name: "Valid Anagram", platform: "leetcode", difficulty: "easy", url: "https://leetcode.com/problems/valid-anagram/", tags: ["string", "hash map"] },
        { name: "Longest Substring Without Repeating Characters", platform: "leetcode", difficulty: "medium", url: "https://leetcode.com/problems/longest-substring-without-repeating-characters/", tags: ["string", "sliding window"] },
        { name: "Group Anagrams", platform: "leetcode", difficulty: "medium", url: "https://leetcode.com/problems/group-anagrams/", tags: ["string", "hash map"] },
        { name: "Minimum Window Substring", platform: "leetcode", difficulty: "hard", url: "https://leetcode.com/problems/minimum-window-substring/", tags: ["string", "sliding window"] },
        { name: "Palindromic Substrings", platform: "leetcode", difficulty: "medium", url: "https://leetcode.com/problems/palindromic-substrings/", tags: ["string", "dp"] },
    ],
    "dynamic programming": [
        { name: "Climbing Stairs", platform: "leetcode", difficulty: "easy", url: "https://leetcode.com/problems/climbing-stairs/", tags: ["dp", "fibonacci"] },
        { name: "House Robber", platform: "leetcode", difficulty: "medium", url: "https://leetcode.com/problems/house-robber/", tags: ["dp"] },
        { name: "Coin Change", platform: "leetcode", difficulty: "medium", url: "https://leetcode.com/problems/coin-change/", tags: ["dp", "bfs"] },
        { name: "Longest Increasing Subsequence", platform: "leetcode", difficulty: "medium", url: "https://leetcode.com/problems/longest-increasing-subsequence/", tags: ["dp", "binary search"] },
        { name: "Edit Distance", platform: "leetcode", difficulty: "hard", url: "https://leetcode.com/problems/edit-distance/", tags: ["dp", "string"] },
        { name: "Knapsack (Codeforces)", platform: "codeforces", difficulty: "medium", url: "https://codeforces.com/problemset/problem/799/G", tags: ["dp", "knapsack"] },
    ],
    "graphs": [
        { name: "Number of Islands", platform: "leetcode", difficulty: "medium", url: "https://leetcode.com/problems/number-of-islands/", tags: ["bfs", "dfs", "graph"] },
        { name: "Clone Graph", platform: "leetcode", difficulty: "medium", url: "https://leetcode.com/problems/clone-graph/", tags: ["bfs", "dfs", "graph"] },
        { name: "Course Schedule", platform: "leetcode", difficulty: "medium", url: "https://leetcode.com/problems/course-schedule/", tags: ["graph", "topological sort"] },
        { name: "Network Delay Time", platform: "leetcode", difficulty: "medium", url: "https://leetcode.com/problems/network-delay-time/", tags: ["graph", "dijkstra"] },
        { name: "Word Ladder", platform: "leetcode", difficulty: "hard", url: "https://leetcode.com/problems/word-ladder/", tags: ["bfs", "graph"] },
        { name: "Roads in HackerLand (CF)", platform: "codeforces", difficulty: "hard", url: "https://codeforces.com/problemset/problem/343/E", tags: ["graph", "mst"] },
    ],
    "trees": [
        { name: "Maximum Depth of Binary Tree", platform: "leetcode", difficulty: "easy", url: "https://leetcode.com/problems/maximum-depth-of-binary-tree/", tags: ["tree", "dfs"] },
        { name: "Lowest Common Ancestor of a Binary Tree", platform: "leetcode", difficulty: "medium", url: "https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-tree/", tags: ["tree", "dfs"] },
        { name: "Binary Tree Level Order Traversal", platform: "leetcode", difficulty: "medium", url: "https://leetcode.com/problems/binary-tree-level-order-traversal/", tags: ["tree", "bfs"] },
        { name: "Serialize and Deserialize Binary Tree", platform: "leetcode", difficulty: "hard", url: "https://leetcode.com/problems/serialize-and-deserialize-binary-tree/", tags: ["tree", "design"] },
        { name: "Diameter of Binary Tree", platform: "leetcode", difficulty: "easy", url: "https://leetcode.com/problems/diameter-of-binary-tree/", tags: ["tree", "dfs"] },
    ],
    "binary search": [
        { name: "Binary Search", platform: "leetcode", difficulty: "easy", url: "https://leetcode.com/problems/binary-search/", tags: ["binary search"] },
        { name: "Find Minimum in Rotated Sorted Array", platform: "leetcode", difficulty: "medium", url: "https://leetcode.com/problems/find-minimum-in-rotated-sorted-array/", tags: ["binary search"] },
        { name: "Koko Eating Bananas", platform: "leetcode", difficulty: "medium", url: "https://leetcode.com/problems/koko-eating-bananas/", tags: ["binary search", "greedy"] },
        { name: "Median of Two Sorted Arrays", platform: "leetcode", difficulty: "hard", url: "https://leetcode.com/problems/median-of-two-sorted-arrays/", tags: ["binary search", "array"] },
        { name: "Search in Rotated Sorted Array", platform: "leetcode", difficulty: "medium", url: "https://leetcode.com/problems/search-in-rotated-sorted-array/", tags: ["binary search"] },
    ],
    "sorting": [
        { name: "Sort Colors", platform: "leetcode", difficulty: "medium", url: "https://leetcode.com/problems/sort-colors/", tags: ["sorting", "two pointers"] },
        { name: "Merge Intervals", platform: "leetcode", difficulty: "medium", url: "https://leetcode.com/problems/merge-intervals/", tags: ["sorting", "array"] },
        { name: "Largest Number", platform: "leetcode", difficulty: "medium", url: "https://leetcode.com/problems/largest-number/", tags: ["sorting", "string"] },
        { name: "Meeting Rooms II", platform: "leetcode", difficulty: "medium", url: "https://leetcode.com/problems/meeting-rooms-ii/", tags: ["sorting", "heap"] },
        { name: "K Closest Points to Origin", platform: "leetcode", difficulty: "medium", url: "https://leetcode.com/problems/k-closest-points-to-origin/", tags: ["sorting", "heap"] },
    ],
    "two pointers": [
        { name: "Valid Palindrome", platform: "leetcode", difficulty: "easy", url: "https://leetcode.com/problems/valid-palindrome/", tags: ["two pointers", "string"] },
        { name: "3Sum", platform: "leetcode", difficulty: "medium", url: "https://leetcode.com/problems/3sum/", tags: ["two pointers", "sorting"] },
        { name: "Container With Most Water", platform: "leetcode", difficulty: "medium", url: "https://leetcode.com/problems/container-with-most-water/", tags: ["two pointers", "greedy"] },
        { name: "Trapping Rain Water", platform: "leetcode", difficulty: "hard", url: "https://leetcode.com/problems/trapping-rain-water/", tags: ["two pointers", "stack"] },
        { name: "Remove Duplicates from Sorted Array", platform: "leetcode", difficulty: "easy", url: "https://leetcode.com/problems/remove-duplicates-from-sorted-array/", tags: ["two pointers", "array"] },
    ],
    "sliding window": [
        { name: "Longest Subarray of 1s After Deleting One Element", platform: "leetcode", difficulty: "medium", url: "https://leetcode.com/problems/longest-subarray-of-1s-after-deleting-one-element/", tags: ["sliding window"] },
        { name: "Maximum Average Subarray I", platform: "leetcode", difficulty: "easy", url: "https://leetcode.com/problems/maximum-average-subarray-i/", tags: ["sliding window"] },
        { name: "Permutation in String", platform: "leetcode", difficulty: "medium", url: "https://leetcode.com/problems/permutation-in-string/", tags: ["sliding window", "hash map"] },
        { name: "Fruit Into Baskets", platform: "leetcode", difficulty: "medium", url: "https://leetcode.com/problems/fruit-into-baskets/", tags: ["sliding window"] },
        { name: "Sliding Window Maximum", platform: "leetcode", difficulty: "hard", url: "https://leetcode.com/problems/sliding-window-maximum/", tags: ["sliding window", "deque"] },
    ],
    "greedy": [
        { name: "Jump Game", platform: "leetcode", difficulty: "medium", url: "https://leetcode.com/problems/jump-game/", tags: ["greedy"] },
        { name: "Gas Station", platform: "leetcode", difficulty: "medium", url: "https://leetcode.com/problems/gas-station/", tags: ["greedy"] },
        { name: "Candy", platform: "leetcode", difficulty: "hard", url: "https://leetcode.com/problems/candy/", tags: ["greedy"] },
        { name: "Task Scheduler", platform: "leetcode", difficulty: "medium", url: "https://leetcode.com/problems/task-scheduler/", tags: ["greedy", "heap"] },
        { name: "Partition Labels", platform: "leetcode", difficulty: "medium", url: "https://leetcode.com/problems/partition-labels/", tags: ["greedy", "string"] },
    ],
    "backtracking": [
        { name: "Subsets", platform: "leetcode", difficulty: "medium", url: "https://leetcode.com/problems/subsets/", tags: ["backtracking"] },
        { name: "Permutations", platform: "leetcode", difficulty: "medium", url: "https://leetcode.com/problems/permutations/", tags: ["backtracking"] },
        { name: "Combination Sum", platform: "leetcode", difficulty: "medium", url: "https://leetcode.com/problems/combination-sum/", tags: ["backtracking"] },
        { name: "N-Queens", platform: "leetcode", difficulty: "hard", url: "https://leetcode.com/problems/n-queens/", tags: ["backtracking"] },
        { name: "Word Search", platform: "leetcode", difficulty: "medium", url: "https://leetcode.com/problems/word-search/", tags: ["backtracking", "dfs"] },
    ],
    "bit manipulation": [
        { name: "Number of 1 Bits", platform: "leetcode", difficulty: "easy", url: "https://leetcode.com/problems/number-of-1-bits/", tags: ["bit manipulation"] },
        { name: "Single Number", platform: "leetcode", difficulty: "easy", url: "https://leetcode.com/problems/single-number/", tags: ["bit manipulation"] },
        { name: "Counting Bits", platform: "leetcode", difficulty: "easy", url: "https://leetcode.com/problems/counting-bits/", tags: ["bit manipulation", "dp"] },
        { name: "Reverse Bits", platform: "leetcode", difficulty: "easy", url: "https://leetcode.com/problems/reverse-bits/", tags: ["bit manipulation"] },
        { name: "Sum of Two Integers", platform: "leetcode", difficulty: "medium", url: "https://leetcode.com/problems/sum-of-two-integers/", tags: ["bit manipulation"] },
    ],
    "math": [
        { name: "Palindrome Number", platform: "leetcode", difficulty: "easy", url: "https://leetcode.com/problems/palindrome-number/", tags: ["math"] },
        { name: "Power of Two", platform: "leetcode", difficulty: "easy", url: "https://leetcode.com/problems/power-of-two/", tags: ["math", "bit manipulation"] },
        { name: "Happy Number", platform: "leetcode", difficulty: "easy", url: "https://leetcode.com/problems/happy-number/", tags: ["math", "hash set"] },
        { name: "Sieve of Eratosthenes — Count Primes", platform: "leetcode", difficulty: "medium", url: "https://leetcode.com/problems/count-primes/", tags: ["math"] },
        { name: "Pow(x, n)", platform: "leetcode", difficulty: "medium", url: "https://leetcode.com/problems/powx-n/", tags: ["math", "binary search"] },
    ],
    "heaps": [
        { name: "Kth Largest Element in an Array", platform: "leetcode", difficulty: "medium", url: "https://leetcode.com/problems/kth-largest-element-in-an-array/", tags: ["heap", "sorting"] },
        { name: "Top K Frequent Elements", platform: "leetcode", difficulty: "medium", url: "https://leetcode.com/problems/top-k-frequent-elements/", tags: ["heap", "hash map"] },
        { name: "Find Median from Data Stream", platform: "leetcode", difficulty: "hard", url: "https://leetcode.com/problems/find-median-from-data-stream/", tags: ["heap", "design"] },
        { name: "Merge K Sorted Lists", platform: "leetcode", difficulty: "hard", url: "https://leetcode.com/problems/merge-k-sorted-lists/", tags: ["heap", "linked list"] },
        { name: "Last Stone Weight", platform: "leetcode", difficulty: "easy", url: "https://leetcode.com/problems/last-stone-weight/", tags: ["heap"] },
    ],
    "stack": [
        { name: "Valid Parentheses", platform: "leetcode", difficulty: "easy", url: "https://leetcode.com/problems/valid-parentheses/", tags: ["stack", "string"] },
        { name: "Min Stack", platform: "leetcode", difficulty: "medium", url: "https://leetcode.com/problems/min-stack/", tags: ["stack", "design"] },
        { name: "Daily Temperatures", platform: "leetcode", difficulty: "medium", url: "https://leetcode.com/problems/daily-temperatures/", tags: ["stack", "monotone stack"] },
        { name: "Largest Rectangle in Histogram", platform: "leetcode", difficulty: "hard", url: "https://leetcode.com/problems/largest-rectangle-in-histogram/", tags: ["stack", "monotone stack"] },
        { name: "Evaluate Reverse Polish Notation", platform: "leetcode", difficulty: "medium", url: "https://leetcode.com/problems/evaluate-reverse-polish-notation/", tags: ["stack"] },
    ],
    "linked list": [
        { name: "Reverse Linked List", platform: "leetcode", difficulty: "easy", url: "https://leetcode.com/problems/reverse-linked-list/", tags: ["linked list"] },
        { name: "Detect Cycle in a Linked List", platform: "leetcode", difficulty: "easy", url: "https://leetcode.com/problems/linked-list-cycle/", tags: ["linked list", "two pointers"] },
        { name: "Merge Two Sorted Lists", platform: "leetcode", difficulty: "easy", url: "https://leetcode.com/problems/merge-two-sorted-lists/", tags: ["linked list"] },
        { name: "LRU Cache", platform: "leetcode", difficulty: "medium", url: "https://leetcode.com/problems/lru-cache/", tags: ["linked list", "design"] },
        { name: "Copy List with Random Pointer", platform: "leetcode", difficulty: "medium", url: "https://leetcode.com/problems/copy-list-with-random-pointer/", tags: ["linked list", "hash map"] },
    ],
};

// Fallback for unknown topics
const GENERAL_PROBLEMS: RecommendedProblem[] = [
    { name: "Two Sum", platform: "leetcode", difficulty: "easy", url: "https://leetcode.com/problems/two-sum/", tags: ["array"] },
    { name: "Valid Parentheses", platform: "leetcode", difficulty: "easy", url: "https://leetcode.com/problems/valid-parentheses/", tags: ["stack"] },
    { name: "Maximum Subarray", platform: "leetcode", difficulty: "medium", url: "https://leetcode.com/problems/maximum-subarray/", tags: ["dp"] },
];

// ──────────────────────────────────────────────
//  Public API
// ──────────────────────────────────────────────
export function getRecommendations(topics: string[]): TopicRecommendation[] {
    return topics.map((topic) => {
        const key = topic.toLowerCase();
        let problems: RecommendedProblem[] | undefined = CURATED[key];

        if (!problems) {
            // Fuzzy match: check if any curated key is a substring of the topic or vice versa
            for (const k of Object.keys(CURATED)) {
                if (key.includes(k) || k.includes(key)) {
                    problems = CURATED[k];
                    break;
                }
            }
        }

        // If still no problems found, map a deterministic fallback subset
        const fallback = GENERAL_PROBLEMS.slice(0, 3);

        return {
            topic,
            recommendedProblems: (problems ?? fallback).slice(0, 5),
        };
    });
}
