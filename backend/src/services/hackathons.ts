import clientPromise from "@/lib/mongodb";
import { Hackathon, HackathonResponse } from "@/types/hackathon";

const BASE_URL = "https://webdevharsha.github.io/open-hackathons-api";

function parseDates(dateStr: string) {
    if (!dateStr) return { startDate: null, endDate: null };
    try {
        const parts = dateStr.split(' - ');
        if (parts.length === 2) {
            const yearMatch = dateStr.match(/\d{4}/);
            const currentYear = new Date().getFullYear();
            const year = yearMatch ? yearMatch[0] : currentYear.toString();

            let startPart = parts[0];
            let endPart = parts[1];

            if (!startPart.match(/\d{4}/)) startPart += `, ${year}`;
            if (!endPart.match(/\d{4}/)) endPart += `, ${year}`;

            const start = new Date(startPart);
            const end = new Date(endPart);

            return {
                startDate: !isNaN(start.getTime()) ? start.toISOString() : null,
                endDate: !isNaN(end.getTime()) ? end.toISOString() : null
            };
        }
    } catch (e) {
        console.error("Date parsing error for:", dateStr, e);
    }
    return { startDate: null, endDate: null };
}

export async function fetchAllHackathons(): Promise<Hackathon[]> {
    try {
        const response = await fetch(`${BASE_URL}/data.json`, { cache: 'no-store' });
        if (!response.ok) throw new Error("Failed to fetch hackathons");
        const data: HackathonResponse = await response.json();
        return data.hackathons.map(h => {
            const { startDate, endDate } = parseDates(h.submission_period_dates);
            return {
                ...h,
                prizeText: h.prizeText ? h.prizeText.replace(/<[^>]*>?/gm, '') : h.prizeText,
                type: h.displayed_location.toLowerCase().includes('online') ? 'online' : 'offline',
                startDate,
                endDate
            };
        });
    } catch (error) {
        console.error("Error fetching hackathons:", error);
        return [];
    }
}

export async function syncHackathons() {
    const hackathons = await fetchAllHackathons();
    if (hackathons.length === 0) return;

    const client = await clientPromise;
    if (!client) {
        throw new Error("Database connection not available");
    }
    const db = client.db();
    const collection = db.collection("hackathons");

    // Upsert each hackathon
    const bulkOps = hackathons.map(h => ({
        updateOne: {
            filter: { id: h.id },
            update: { $set: { ...h, last_synced: new Date() } },
            upsert: true
        }
    }));

    if (bulkOps.length > 0) {
        await collection.bulkWrite(bulkOps);
    }

    console.log(`Synced ${hackathons.length} hackathons to database.`);
}

export async function getHackathons(filter: any = {}): Promise<Hackathon[]> {
    let results: Hackathon[] = [];

    try {
        const client = await clientPromise;
        if (!client) {
            throw new Error("Database connection not available");
        }
        const db = client.db();
        const collection = db.collection("hackathons");

        const query: any = {};
        if (filter.type === 'online' || filter.type === 'offline') {
            query.type = filter.type;
        }
        if (filter.featured === 'true' || filter.featured === true) {
            query.featured = true;
        }
        if (filter.search) {
            query.$or = [
                { title: { $regex: filter.search, $options: 'i' } },
                { organization_name: { $regex: filter.search, $options: 'i' } },
                { "themes.name": { $regex: filter.search, $options: 'i' } }
            ];
        }

        results = await collection.find(query).limit(100).toArray() as unknown as Hackathon[];
    } catch (dbError) {
        console.error("Database fetch failed, falling back to API:", dbError);
    }

    if (results.length === 0) {
        // Fallback to direct API if DB is empty or connection failed
        let all = await fetchAllHackathons();

        // Apply filters manually to the fallback data
        if (filter.type === 'online' || filter.type === 'offline') {
            all = all.filter(h => h.type === filter.type);
        }
        if (filter.featured === 'true' || filter.featured === true) {
            all = all.filter(h => h.featured);
        }
        if (filter.search) {
            const s = filter.search.toLowerCase();
            all = all.filter(h =>
                h.title.toLowerCase().includes(s) ||
                h.organization_name.toLowerCase().includes(s) ||
                (h.themes && h.themes.some(t => t.name.toLowerCase().includes(s)))
            );
        }
        results = all;
    }

    // Deduplicate by id to prevent React key warnings if API has duplicates
    const uniqueResults = Array.from(new Map(results.map(h => [h.id, h])).values());

    return uniqueResults.slice(0, 50);
}
