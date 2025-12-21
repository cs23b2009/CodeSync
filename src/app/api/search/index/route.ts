import { NextResponse } from "next/server";
import { fetchLeetCodeUserProfile } from "@/services/search/leetcode";
import { upsertProfile } from "@/services/search/database";
import { IndexedProfile } from "@/types/user";

export async function POST(request: Request) {
    try {
        const { username, platform } = await request.json();

        if (!username || platform !== 'leetcode') {
            return NextResponse.json({ error: "Invalid username or platform" }, { status: 400 });
        }

        const profileData = await fetchLeetCodeUserProfile(username);

        if (!profileData) {
            return NextResponse.json({ error: "User not found on LeetCode" }, { status: 404 });
        }

        await upsertProfile(profileData as IndexedProfile);

        return NextResponse.json({ message: "User indexed successfully", profile: profileData });
    } catch (error) {
        console.error("Index API error:", error);
        return NextResponse.json({ error: "Failed to index user" }, { status: 500 });
    }
}
