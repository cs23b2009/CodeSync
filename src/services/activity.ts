import { format, fromUnixTime } from "date-fns";

export interface ActivitySubmission {
    date: string; // YYYY-MM-DD
    count: number;
    level: number; // 0-4
}

interface LeetCodeResponse {
    data: {
        matchedUser: {
            submissionCalendar: string;
        } | null;
    };
}

interface CodeForcesSubmission {
    creationTimeSeconds: number;
    verdict: string;
    // other fields omitted
}

interface CodeForcesResponse {
    status: string;
    result: CodeForcesSubmission[];
}

export async function fetchLeetCodeActivity(username: string): Promise<Record<string, number>> {
    if (!username) return {};
    try {
        const response = await fetch("https://leetcode.com/graphql", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "User-Agent":
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
            },
            body: JSON.stringify({
                query: `
          query userProfileCalendar($username: String!, $year: Int) {
            matchedUser(username: $username) {
              submissionCalendar
            }
          }
        `,
                variables: { username },
            }),
            cache: "no-store",
        });

        if (!response.ok) {
            console.error("LeetCode response not ok", response.status);
            return {};
        }

        const data = (await response.json()) as LeetCodeResponse;
        const calendarJson = data.data?.matchedUser?.submissionCalendar;

        if (!calendarJson) return {};

        const calendar = JSON.parse(calendarJson);
        const result: Record<string, number> = {};

        for (const [timestamp, count] of Object.entries(calendar)) {
            const date = format(fromUnixTime(parseInt(timestamp)), "yyyy-MM-dd");
            result[date] = (result[date] || 0) + (count as number);
        }

        return result;
    } catch (e) {
        console.error("LeetCode fetch error:", e);
        return {};
    }
}

export async function fetchCodeForcesActivity(username: string): Promise<Record<string, number>> {
    if (!username) return {};
    try {
        const response = await fetch(
            `https://codeforces.com/api/user.status?handle=${username}`,
            { cache: "no-store" }
        );
        if (!response.ok) {
            console.error("CodeForces response not ok", response.status);
            return {};
        }

        const data = (await response.json()) as CodeForcesResponse;
        if (data.status !== "OK") return {};

        const result: Record<string, number> = {};

        for (const sub of data.result) {
            if (sub.verdict === "OK") {
                const date = format(fromUnixTime(sub.creationTimeSeconds), "yyyy-MM-dd");
                result[date] = (result[date] || 0) + 1;
            }
        }

        return result;
    } catch (e) {
        console.error("CodeForces fetch error", e);
        return {};
    }
}

export async function fetchCodeChefActivity(username: string): Promise<Record<string, number>> {
    if (!username) return {};
    try {
        // Attempt to fetch user profile HTML
        const response = await fetch(`https://www.codechef.com/users/${username}`, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
            },
            cache: "no-store" // avoid stale cache
        });

        if (!response.ok) {
            console.error("CodeChef profile response not ok", response.status);
            return {};
        }

        const text = await response.text();

        // CodeChef stores heatmap data in a script variable points
        // Look for: var points = [...]; 
        // Or similar.
        // Actually, looking at source, it is often:
        // window.heatmapData = [...]
        // or just inside scripts.
        // Regex to find the JSON array containing date and value
        // Pattern: { "date": "2023-01-25", "value": 1 }
        // Simple heuristic: find a large array of objects with date/value.

        // Regex to find the JSON array containing date and value
        let data;
        const match = text.match(/points\s*=\s*(\[[\s\S]*?\]);/);

        if (match && match[1]) {
            try {
                data = JSON.parse(match[1]);
            } catch (err) {
                console.error("Failed to parse CodeChef points JSON", err);
            }
        }

        // Fallback: Use Contest History if Heatmap is unavailable
        if (!data || !Array.isArray(data)) {
            const historyMatch = text.match(/(?:var\s+|window\.)?all_rating\s*=\s*(\[[\s\S]*?\]);/);
            if (historyMatch && historyMatch[1]) {
                try {
                    const history = JSON.parse(historyMatch[1]);
                    data = history.map((h: any) => ({
                        date: h.end_date ? new Date(h.end_date).toISOString().split('T')[0] : "",
                        value: 1 // Count contest as 1 activity
                    })).filter((d: any) => d.date);
                } catch (e) {
                    // ignore
                }
            }
        }

        const result: Record<string, number> = {};
        if (Array.isArray(data)) {
            data.forEach((item: any) => {
                if (item.date && item.value) {
                    result[item.date] = item.value;
                }
            });
        }

        return result;

    } catch (e) {
        console.error("CodeChef fetch error:", e);
        return {};
    }
}

export function mergeActivities(
    leetcode: Record<string, number>,
    codeforces: Record<string, number>,
    codechef: Record<string, number>
): ActivitySubmission[] {
    const allDates = new Set([
        ...Object.keys(leetcode),
        ...Object.keys(codeforces),
        ...Object.keys(codechef),
    ]);
    const result: ActivitySubmission[] = [];

    allDates.forEach((date) => {
        const count =
            (leetcode[date] || 0) + (codeforces[date] || 0) + (codechef[date] || 0);

        // Calculate level (0-4)
        // Adjust these thresholds as needed
        let level = 0;
        if (count === 0) level = 0;
        else if (count <= 1) level = 1;
        else if (count <= 3) level = 2;
        else if (count <= 6) level = 3;
        else level = 4;

        result.push({ date, count, level });
    });

    return result.sort((a, b) => a.date.localeCompare(b.date));
}
