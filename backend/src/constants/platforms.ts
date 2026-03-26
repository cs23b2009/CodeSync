import { Platform } from '@/types/contest';

export const PLATFORM_CONFIG = {
  codeforces: {
    name: 'Codeforces',
    color: '#1f8dd6',
    bgColor: '#e3f2fd',
    textColor: '#0d47a1',
    icon: '🔥',
    baseUrl: 'https://codeforces.com',
    apiUrl: 'https://codeforces.com/api',
  },
  leetcode: {
    name: 'LeetCode',
    color: '#ffa116',
    bgColor: '#fff8e1',
    textColor: '#e65100',
    icon: '💡',
    baseUrl: 'https://leetcode.com',
    apiUrl: 'https://leetcode.com/api',
  },
  codechef: {
    name: 'CodeChef',
    color: '#5b4638',
    bgColor: '#efebe9',
    textColor: '#3e2723',
    icon: '👨‍🍳',
    baseUrl: 'https://codechef.com',
    apiUrl: 'https://codechef.com/api',
  },
  atcoder: {
    name: 'AtCoder',
    color: '#3f51b5',
    bgColor: '#e8eaf6',
    textColor: '#1a237e',
    icon: '🎯',
    baseUrl: 'https://atcoder.jp',
    apiUrl: 'https://atcoder.jp/api',
  },
  hackerrank: {
    name: 'HackerRank',
    color: '#00ea64',
    bgColor: '#e8f5e8',
    textColor: '#1b5e20',
    icon: '🚀',
    baseUrl: 'https://hackerrank.com',
    apiUrl: 'https://hackerrank.com/api',
  },
} as const;

export const CONTEST_STATUS_CONFIG = {
  upcoming: {
    label: 'Upcoming',
    color: '#2196f3',
    bgColor: '#e3f2fd',
    textColor: '#0d47a1',
  },
  ongoing: {
    label: 'Live',
    color: '#4caf50',
    bgColor: '#e8f5e8',
    textColor: '#1b5e20',
  },
  completed: {
    label: 'Ended',
    color: '#757575',
    bgColor: '#f5f5f5',
    textColor: '#424242',
  },
} as const;

export const DIFFICULTY_CONFIG = {
  beginner: {
    label: 'Beginner',
    color: '#4caf50',
    range: [800, 1200],
  },
  intermediate: {
    label: 'Intermediate',
    color: '#ff9800',
    range: [1200, 1600],
  },
  advanced: {
    label: 'Advanced',
    color: '#f44336',
    range: [1600, 2100],
  },
  expert: {
    label: 'Expert',
    color: '#9c27b0',
    range: [2100, 3000],
  },
} as const;