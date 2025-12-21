import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { Hackathon } from "@/types/hackathon";

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const year = parseInt(searchParams.get("year") || "2025");
    const month = parseInt(searchParams.get("month") || "12");

    try {
        const client = await clientPromise;
        const db = client.db();
        const collection = db.collection("hackathons");

        // Open Hackathons API doesn't always have a strict startDate in ISO.
        // It often has 'submission_period_dates'. We need to be careful.
        // For the sake of the calendar, we'll return all for now or try to parse if possible.
        // Actually, let's just return all and let the frontend handle the mapping if dates are complex.
        let hackathons = await collection.find({}).toArray() as unknown as Hackathon[];

        const uniqueHackathons = Array.from(new Map(hackathons.map(h => [h.id, h])).values());

        return NextResponse.json({ hackathons: uniqueHackathons, year, month });
    } catch (error) {
        // Even on DB error, try to fallback
        try {
            const { fetchAllHackathons } = await import("@/services/hackathons");
            const all = await fetchAllHackathons();
            const uniqueAll = Array.from(new Map(all.map(h => [h.id, h])).values());
            return NextResponse.json({ hackathons: uniqueAll, year, month });
        } catch (e) {
            return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
        }
    }
}
