import { NextResponse } from "next/server";
import { syncHackathons } from "@/services/hackathons";

export async function POST() {
    try {
        await syncHackathons();
        return NextResponse.json({ message: "Sync successful" });
    } catch (error: any) {
        console.error("Sync error:", error);
        return NextResponse.json({ error: "Sync failed", details: error.message }, { status: 500 });
    }
}
