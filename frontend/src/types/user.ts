export interface IndexedProfile {
  username: string;
  realName: string;
  avatar: string;
  platform: 'leetcode' | 'codeforces' | 'codechef';
  rating: number;
  ranking: string | number;
  lastUpdatedAt: Date;
}

export interface SearchQuery {
  q: string;
}
