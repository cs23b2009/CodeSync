import { NextRequest, NextResponse } from "next/server";
import { getHackathons } from "@/services/hackathons";

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const featured = searchParams.get("featured");
    const search = searchParams.get("q");

    try {
        const hackathons = await getHackathons({ type, featured, search });
        return NextResponse.json({ hackathons });
    } catch (error) {
        console.error("API error fetching hackathons:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
