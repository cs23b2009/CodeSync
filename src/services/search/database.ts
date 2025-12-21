import clientPromise from "@/lib/mongodb";
import { IndexedProfile } from "@/types/user";

export async function upsertProfile(profile: IndexedProfile) {
    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection("indexed_profiles");

    return await collection.updateOne(
        { username: profile.username, platform: profile.platform },
        { $set: profile },
        { upsert: true }
    );
}

export async function searchProfiles(query: string, limit: number = 20): Promise<IndexedProfile[]> {
    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection("indexed_profiles");

    if (!query) return [];

    const results = await collection
        .find({
            $or: [
                { username: { $regex: query, $options: "i" } },
                { realName: { $regex: query, $options: "i" } },
            ],
        })
        .limit(limit)
        .toArray();

    return results as unknown as IndexedProfile[];
}
