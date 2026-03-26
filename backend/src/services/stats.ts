import { Contest } from "@/types/contest";

export interface UserStats {
    totalSolved: number;
    contestRating: number;
    contestCount: number;
    platform: 'leetcode' | 'codeforces' | 'codechef';
    easySolved?: number;
    mediumSolved?: number;
    hardSolved?: number;
    ratingHistory?: { date: string; rating: number }[];
    topicStats?: { name: string; count: number }[];
}

export async function fetchLeetCodeStats(username: string): Promise<UserStats> {
    if (!username) return { totalSolved: 0, contestRating: 0, contestCount: 0, platform: 'leetcode' };
    try {
        const response = await fetch("https://leetcode.com/graphql", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "User-Agent": "Mozilla/5.0",
            },
            body: JSON.stringify({
                query: `
                    query userStats($username: String!) {
                        matchedUser(username: $username) {
                            submitStats {
                                acSubmissionNum {
                                    difficulty
                                    count
                                }
                            }
                            tagProblemCounts {
                                advanced {
                                    tagName
                                    problemsSolved
                                }
                                intermediate {
                                    tagName
                                    problemsSolved
                                }
                                fundamental {
                                    tagName
                                    problemsSolved
                                }
                            }
                        }
                        userContestRanking(username: $username) {
                            attendedContestsCount
                            rating
                        }
                        userContestRankingHistory(username: $username) {
                            contest {
                                startTime
                            }
                            rating
                        }
                    }
                `,
                variables: { username }
            }),
            next: { revalidate: 3600 }
        });

        const data = await response.json();
        const stats = data.data;

        const subs = stats?.matchedUser?.submitStats?.acSubmissionNum || [];
        const totalSolved = subs.find((s: any) => s.difficulty === "All")?.count || 0;
        const easySolved = subs.find((s: any) => s.difficulty === "Easy")?.count || 0;
        const mediumSolved = subs.find((s: any) => s.difficulty === "Medium")?.count || 0;
        const hardSolved = subs.find((s: any) => s.difficulty === "Hard")?.count || 0;

        const contestRating = Math.round(stats?.userContestRanking?.rating || 0);
        const contestCount = stats?.userContestRanking?.attendedContestsCount || 0;

        // Process Rating History
        const ratingHistory = stats?.userContestRankingHistory?.map((h: any) => ({
            date: new Date(h.contest.startTime * 1000).toISOString().split('T')[0],
            rating: Math.round(h.rating)
        })).filter((h: any) => h.rating > 0) || [];

        // Process Topics (Flatten categories)
        const tags = stats?.matchedUser?.tagProblemCounts;
        let topicStats: { name: string; count: number }[] = [];
        if (tags) {
            const allTags = [
                ...(tags.fundamental || []),
                ...(tags.intermediate || []),
                ...(tags.advanced || [])
            ];
            topicStats = allTags.map((t: any) => ({
                name: t.tagName,
                count: t.problemsSolved
            })).sort((a: any, b: any) => b.count - a.count).slice(0, 10);
        }

        return {
            totalSolved,
            contestRating,
            contestCount,
            platform: 'leetcode',
            easySolved,
            mediumSolved,
            hardSolved,
            ratingHistory,
            topicStats
        };
    } catch (e) {
        console.error("LC Stats Error", e);
        return { totalSolved: 0, contestRating: 0, contestCount: 0, platform: 'leetcode' };
    }
}

export async function fetchCodeForcesStats(username: string): Promise<UserStats> {
    if (!username) return { totalSolved: 0, contestRating: 0, contestCount: 0, platform: 'codeforces' };
    try {
        const [userInfoRes, userRatingRes, userStatusRes] = await Promise.all([
            fetch(`https://codeforces.com/api/user.info?handles=${username}`),
            fetch(`https://codeforces.com/api/user.rating?handle=${username}`),
            fetch(`https://codeforces.com/api/user.status?handle=${username}&from=1&count=2000`)
        ]);

        const userInfo = await userInfoRes.json();
        const userRating = await userRatingRes.json();
        const userStatus = await userStatusRes.json();

        const rating = userInfo.status === "OK" ? (userInfo.result[0]?.rating || 0) : 0;
        const contests = userRating.status === "OK" ? userRating.result.length : 0;

        // Rating History
        const ratingHistory = userRating.status === "OK"
            ? userRating.result.map((r: any) => ({
                date: new Date(r.ratingUpdateTimeSeconds * 1000).toISOString().split('T')[0],
                rating: r.newRating
            }))
            : [];

        // Count unique solved problems and tags
        let solved = 0;
        let easy = 0, med = 0, hard = 0;
        const tagCounts = new Map<string, number>();

        if (userStatus.status === "OK") {
            const uniqueProblems = new Set();
            userStatus.result.forEach((sub: any) => {
                if (sub.verdict === "OK") {
                    const id = `${sub.problem.contestId}${sub.problem.index}`;
                    if (!uniqueProblems.has(id)) {
                        uniqueProblems.add(id);

                        // Difficulty count
                        const index = sub.problem.index.charAt(0);
                        if (['A', 'B'].includes(index)) easy++;
                        else if (['C', 'D'].includes(index)) med++;
                        else hard++;

                        // Tag count
                        if (sub.problem.tags && Array.isArray(sub.problem.tags)) {
                            sub.problem.tags.forEach((tag: string) => {
                                tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
                            });
                        }
                    }
                }
            });
            solved = uniqueProblems.size;
        }

        const topicStats = Array.from(tagCounts.entries())
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);

        return {
            totalSolved: solved,
            contestRating: rating,
            contestCount: contests,
            platform: 'codeforces',
            easySolved: easy,
            mediumSolved: med,
            hardSolved: hard,
            ratingHistory,
            topicStats
        };
    } catch (e) {
        console.error("CF Stats Error", e);
        return { totalSolved: 0, contestRating: 0, contestCount: 0, platform: 'codeforces' };
    }
}

export async function fetchCodeChefStats(username: string): Promise<UserStats> {
    if (!username) return { totalSolved: 0, contestRating: 0, contestCount: 0, platform: 'codechef' };

    try {
        const response = await fetch(`https://www.codechef.com/users/${username}`, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
            },
            cache: "no-store"
        });

        if (!response.ok) throw new Error("CodeChef profile unreachable");

        const text = await response.text();

        // Parse History First (Most Reliable)
        const historyMatch = text.match(/(?:var\s+|window\.)?all_rating\s*=\s*(\[[\s\S]*?\]);/);

        let ratingHistory: { date: string; rating: number }[] = [];
        let contestCount = 0;
        let derivedCurrentRating = 0;

        if (historyMatch && historyMatch[1]) {
            try {
                const json = JSON.parse(historyMatch[1]);
                if (Array.isArray(json) && json.length > 0) {
                    contestCount = json.length;
                    ratingHistory = json.map((entry: any) => ({
                        date: entry.end_date ? new Date(entry.end_date).toISOString().split('T')[0] : "",
                        rating: parseInt(entry.rating)
                    })).filter(r => r.date && !isNaN(r.rating));

                    // Sort just in case
                    ratingHistory.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

                    if (ratingHistory.length > 0) {
                        derivedCurrentRating = ratingHistory[ratingHistory.length - 1].rating;
                    }
                }
            } catch (e) {
                console.error("Failed to parse CC history", e);
            }
        }

        // Ratings: Try specific regex or fallback to derived
        const ratingMatch = text.match(/<div class="rating-number">\s*(\d+)\s*<\/div>/) || text.match(/class="rating-number"[^>]*?>\s*(\d+)\s*</);
        const currentRating = ratingMatch ? parseInt(ratingMatch[1]) : derivedCurrentRating;

        // Solved Count - Try multiple patterns
        let totalSolved = 0;

        // Pattern 1: New Profile Design "Fully Solved (123)"
        // Note: CodeChef sometimes hides this or changes format
        const solvedMatch = text.match(/Fully Solved\s*\((\d+)\)/i);

        // Pattern 2: "Total Problem Solved: 123"
        const solvedMatch2 = text.match(/Total Problem Solved:\s*(\d+)/i);

        // Pattern 3: Look for the specific section content in heatmap data or sidebar
        // e.g., <h3 style="display:inline;">Problems Solved</h3> <h5>(200)</h5>
        const solvedMatch3 = text.match(/Problems Solved[^\d]*(\d+)/i);

        if (solvedMatch) totalSolved = parseInt(solvedMatch[1]);
        else if (solvedMatch2) totalSolved = parseInt(solvedMatch2[1]);
        else if (solvedMatch3) totalSolved = parseInt(solvedMatch3[1]);

        // If still 0, we might need a more aggressive search for numeric stats associated with "Solved"
        if (totalSolved === 0) {
            // Fallback: look for "Practice Problems" count if available in sidebar text
            // <p>Practice Problems: 10</p>
            // This is rarely reliable, so 0 is better than a random number.
        }

        return {
            totalSolved,
            contestRating: currentRating,
            contestCount,
            platform: 'codechef',
            easySolved: 0,
            mediumSolved: 0,
            hardSolved: 0,
            ratingHistory
        };

    } catch (e) {
        console.error("CC Stats Error", e);
        return { totalSolved: 0, contestRating: 0, contestCount: 0, platform: 'codechef' };
    }
}
