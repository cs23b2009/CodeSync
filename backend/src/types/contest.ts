export interface Contest {
  id: string | number;
  name: string;
  platform: Platform;
  startTime: string;
  startTimeISO: string;
  duration: string;
  status: ContestStatus;
  href: string;
  difficulty?: DifficultyLevel;
  participantCount?: number;
  tags?: string[];
  estimatedRating?: number;
}

export type Platform = 'codeforces' | 'leetcode' | 'codechef' | 'atcoder' | 'hackerrank';

export type ContestStatus = 'upcoming' | 'ongoing' | 'completed';

export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';

export interface UserPerformance {
  userId: string;
  platform: Platform;
  rating: number;
  maxRating: number;
  contestsParticipated: number;
  averageRank: number;
  lastUpdated: string;
}

export interface ContestAnalytics {
  contestId: string;
  platform: Platform;
  totalParticipants: number;
  averageRating: number;
  difficultyDistribution: Record<DifficultyLevel, number>;
  topPerformers: UserPerformance[];
}

export interface UserPreferences {
  favoritesPlatforms: Platform[];
  difficultyRange: [DifficultyLevel, DifficultyLevel];
  notificationSettings: {
    email: boolean;
    push: boolean;
    reminderTime: number; // minutes before contest
  };
  timezone: string;
}
