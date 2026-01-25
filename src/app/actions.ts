"use server";

import {
    fetchLeetCodeActivity,
    fetchCodeForcesActivity,
    fetchCodeChefActivity,
    mergeActivities,
    ActivitySubmission
} from "@/services/activity";
import { fetchLeetCodeStats, fetchCodeForcesStats, fetchCodeChefStats, UserStats } from "@/services/stats";

export async function getUserActivity(
    leetcodeUsername: string,
    codeforcesUsername: string,
    codechefUsername: string
): Promise<ActivitySubmission[]> {
    const [leetcode, codeforces, codechef] = await Promise.all([
        fetchLeetCodeActivity(leetcodeUsername),
        fetchCodeForcesActivity(codeforcesUsername),
        fetchCodeChefActivity(codechefUsername),
    ]);

    return mergeActivities(leetcode, codeforces, codechef);
}

export async function getCumulativeStats(
    leetcodeUsername: string,
    codeforcesUsername: string,
    codechefUsername: string
): Promise<{
    totalSolved: number;
    totalContests: number;
    maxRating: number;
    details: UserStats[];
    easySolved: number;
    mediumSolved: number;
    hardSolved: number;
    ratingHistory: { date: string; rating: number; platform: string }[];
    topicStats: { name: string; count: number }[];
}> {
    const [lcStats, cfStats, ccStats] = await Promise.all([
        fetchLeetCodeStats(leetcodeUsername),
        fetchCodeForcesStats(codeforcesUsername),
        fetchCodeChefStats(codechefUsername)
    ]);

    // Merge history
    const lcHistory = (lcStats.ratingHistory || []).map(h => ({ ...h, platform: 'LeetCode' }));
    const cfHistory = (cfStats.ratingHistory || []).map(h => ({ ...h, platform: 'CodeForces' }));
    const ccHistory = (ccStats.ratingHistory || []).map(h => ({ ...h, platform: 'CodeChef' }));
    const combinedHistory = [...lcHistory, ...cfHistory, ...ccHistory].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const combinedTopics = new Map<string, number>();

    (lcStats.topicStats || []).forEach(t => combinedTopics.set(t.name, (combinedTopics.get(t.name) || 0) + t.count));
    (cfStats.topicStats || []).forEach(t => combinedTopics.set(t.name, (combinedTopics.get(t.name) || 0) + t.count));
    (ccStats.topicStats || []).forEach(t => combinedTopics.set(t.name, (combinedTopics.get(t.name) || 0) + t.count));

    const mergedTopicStats = Array.from(combinedTopics.entries())
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

    return {
        totalSolved: lcStats.totalSolved + cfStats.totalSolved + ccStats.totalSolved,
        totalContests: lcStats.contestCount + cfStats.contestCount + ccStats.contestCount,
        maxRating: Math.max(lcStats.contestRating, cfStats.contestRating, ccStats.contestRating),
        details: [lcStats, cfStats, ccStats],
        easySolved: (lcStats.easySolved || 0) + (cfStats.easySolved || 0) + (ccStats.easySolved || 0),
        mediumSolved: (lcStats.mediumSolved || 0) + (cfStats.mediumSolved || 0) + (ccStats.mediumSolved || 0),
        hardSolved: (lcStats.hardSolved || 0) + (cfStats.hardSolved || 0) + (ccStats.hardSolved || 0),
        ratingHistory: combinedHistory,
        topicStats: mergedTopicStats
    };
}
