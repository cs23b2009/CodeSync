import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';
import { upsertProfile } from '@/services/search/database';
import { IndexedProfile } from '@/types/user';

export async function importUsersFromCSV() {
    console.log('[CSVImporter] Starting import process...');
    const csvPath = path.join(process.cwd(), 'LeetCode User Ratings.csv');

    if (!fs.existsSync(csvPath)) {
        console.error('[CSVImporter] File not found:', csvPath);
        return;
    }

    try {
        const fileContent = fs.readFileSync(csvPath, 'utf8');
        const records = parse(fileContent, {
            columns: true,
            skip_empty_lines: true,
            trim: true
        });

        console.log(`[CSVImporter] Parsed ${records.length} records. Beginning database sync...`);

        let count = 0;
        for (const record of records as any[]) {
            const username = record.username;
            if (!username) continue;

            const profile: IndexedProfile = {
                username: username,
                realName: username, // Fallback if not matching exactly
                avatar: `https://assets.leetcode.com/users/${username}/avatar_1746376000.png`, // Generic predictor
                platform: 'leetcode',
                rating: Math.round(parseFloat(record.rating) || 0),
                ranking: record['global rank'] || 'N/A',
                lastUpdatedAt: new Date()
            };

            await upsertProfile(profile);
            count++;

            if (count % 500 === 0) {
                console.log(`[CSVImporter] Synced ${count}/${records.length} users...`);
            }
        }

        console.log(`[CSVImporter] Successfully imported ${count} users.`);
    } catch (error) {
        console.error('[CSVImporter] Import failed:', error);
    }
}
