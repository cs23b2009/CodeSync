import { NextResponse } from "next/server";
import { searchProfiles, upsertProfile } from "@/services/search/database";
import { fetchLeetCodeUserProfile, searchLeetCodeUsers } from "@/services/search/leetcode";
import { IndexedProfile } from "@/types/user";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("limit") || "12");

    if (!query) {
        return NextResponse.json({ users: [] });
    }

    try {
        // 1. Discover potential substring matches from LeetCode directly
        const discoveredUsers = await searchLeetCodeUsers(query);

        // 2. Map discovered users to the required format
        const discoveredResults = discoveredUsers.map(u => ({
            username: u.username,
            realName: u.realName || u.username,
            avatar: u.avatar,
            platform: 'leetcode',
            rating: 0,
            ranking: 'N/A'
        })) as IndexedProfile[];

        // 3. Background Sync: Try to fetch and index top results
        // Optimization: limit discovery sync to first 15 entries
        const syncLimit = 15;
        const toProcess = discoveredUsers.slice(0, syncLimit);

        (async () => {
            for (const discovery of toProcess) {
                try {
                    if (!discovery.username) continue;
                    const fullProfile = await fetchLeetCodeUserProfile(discovery.username);
                    if (fullProfile) {
                        await upsertProfile(fullProfile as IndexedProfile);
                    }
                } catch (e) {
                    // Silently fail
                }
            }
        })();

        // 4. Merge with local DB for "Deep Search"
        // We'll search local DB with a higher limit since it has the CSV users too
        let combinedUsers = discoveredResults;
        try {
            const localUsers = await searchProfiles(query, 100); // Fetch more from local DB
            if (localUsers.length > 0) {
                const localMap = new Map(localUsers.map(u => [u.username, u]));
                const merged = [...localUsers];
                discoveredResults.forEach(u => {
                    if (u.username && !localMap.has(u.username)) {
                        merged.push(u);
                    }
                });
                combinedUsers = merged;
            }
        } catch (dbError) {
            // Log if needed
        }

        // 5. Paginate the combined results
        const totalFound = combinedUsers.length;
        const startIndex = (page - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        const paginatedUsers = combinedUsers.slice(startIndex, endIndex);

        return NextResponse.json({
            users: paginatedUsers,
            totalFound,
            page,
            totalPages: Math.ceil(totalFound / pageSize)
        });
    } catch (error) {
        console.error("[SearchAPI] Discovery failure:", error);
        return NextResponse.json({ error: "Search unavailable" }, { status: 500 });
    }
}
