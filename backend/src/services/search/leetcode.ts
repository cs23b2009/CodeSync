import { IndexedProfile } from "@/types/user";

const LEETCODE_GRAPHQL_URL = "https://leetcode.com/graphql";

export async function fetchLeetCodeUserProfile(username: string): Promise<Partial<IndexedProfile> | null> {
  const query = `
    query userPublicProfile($username: String!) {
      matchedUser(username: $username) {
        username
        profile {
          realName
          userAvatar
          ranking
          aboutMe
          websites
          skillTags
        }
      }
      userContestRanking(username: $username) {
        rating
        globalRanking
        totalParticipants
        topPercentage
      }
    }
  `;

  try {
    const response = await fetch(LEETCODE_GRAPHQL_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
      body: JSON.stringify({
        query,
        variables: { username },
      }),
    });

    if (!response.ok) {
      throw new Error(`LeetCode API responded with status: ${response.status}`);
    }

    const result = await response.json();
    const user = result.data?.matchedUser;
    const ranking = result.data?.userContestRanking;

    if (!user) return null;

    return {
      username: user.username,
      realName: user.profile.realName || user.username,
      avatar: user.profile.userAvatar,
      platform: 'leetcode',
      rating: Math.round(ranking?.rating || 0),
      ranking: user.profile.ranking || 'N/A',
      lastUpdatedAt: new Date(),
    };
  } catch (error) {
    console.error(`Error fetching LeetCode profile for ${username}:`, error);
    return null;
  }
}

export async function searchLeetCodeUsers(query: string): Promise<Partial<IndexedProfile>[]> {
  const searchQuery = `
    query userSearchList($searchKeyword: String!) {
      userSearchList(searchKeyword: $searchKeyword) {
        users {
          username
          realName
          userAvatar
        }
      }
    }
  `;

  try {
    const response = await fetch(LEETCODE_GRAPHQL_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Referer": "https://leetcode.com/",
      },
      body: JSON.stringify({
        query: searchQuery,
        variables: { searchKeyword: query },
      }),
    });

    if (!response.ok) {
      throw new Error(`LeetCode API responded with status: ${response.status}`);
    }

    const result = await response.json();
    const searchResults = result.data?.userSearchList?.users || [];

    return searchResults.map((u: any) => ({
      username: u.username,
      realName: u.realName || u.username,
      avatar: u.userAvatar,
      platform: 'leetcode' as const,
    }));
  } catch (error) {
    console.error(`Error in LeetCode user discovery for ${query}:`, error);
    return [];
  }
}
