import { NextResponse } from "next/server";
import { searchProfiles, upsertProfile } from "@/services/search/database";
import { fetchLeetCodeUserProfile, searchLeetCodeUsers } from "@/services/search/leetcode";
import { IndexedProfile } from "@/types/user";
import fs from "fs";
import path from "path";

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
        let discoveredUsers = await searchLeetCodeUsers(query);

        // Fallback: If search returns nothing (API issues), try exact match
        if (discoveredUsers.length === 0) {
            const exactMatch = await fetchLeetCodeUserProfile(query);
            if (exactMatch) {
                discoveredUsers = [exactMatch];
            }
        }

        // 2. Map discovered users to the required format
        const discoveredResults = discoveredUsers.map(u => ({
            username: u.username,
            realName: u.realName || u.username,
            avatar: u.avatar,
            platform: 'leetcode',
            rating: u.rating || 0,
            ranking: u.ranking || 'N/A'
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

        // 4. Merge with local DB and JSON Data for "Deep Search"
        let combinedUsers = discoveredResults;

        // A. Local JSON Search (from CSV)
        try {
            const jsonPath = path.join(process.cwd(), 'src/data/seeded_users.json');
            if (fs.existsSync(jsonPath)) {
                const fileContent = fs.readFileSync(jsonPath, 'utf-8');
                const seededUsers = JSON.parse(fileContent);
                const queryLower = query.toLowerCase();
                const matchedSeeded = seededUsers
                    .filter((u: any) => u.username.toLowerCase().includes(queryLower))
                    .slice(0, 50); // limit local matches

                // Add unique local matches
                const existingNames = new Set(combinedUsers.map(u => u.username));
                matchedSeeded.forEach((u: any) => {
                    if (!existingNames.has(u.username)) {
                        combinedUsers.push(u);
                        existingNames.add(u.username);
                    }
                });
            }
        } catch (e) {
            console.error("Local JSON search error", e);
        }

        // B. Database Search
        try {
            const localUsers = await searchProfiles(query, 100);
            if (localUsers.length > 0) {
                const existingNames = new Set(combinedUsers.map(u => u.username));
                localUsers.forEach(u => {
                    if (u.username && !existingNames.has(u.username)) {
                        combinedUsers.push(u);
                        existingNames.add(u.username);
                    }
                });
            }
        } catch (dbError) {
            // DB down, ignore
        }

        // 5. Paginate the combined results
        // Sort by relevance (exact match first, then rating/etc) or keep discovery/seeded order?
        // Let's sort by rating for seeded users mostly.
        combinedUsers.sort((a, b) => (b.rating || 0) - (a.rating || 0));

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
