import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';

const csvFilePath = path.join(process.cwd(), 'LeetCode User Ratings.csv');
const jsonFilePath = path.join(process.cwd(), 'src/data/seeded_users.json');

async function main() {
    try {
        const fileContent = fs.readFileSync(csvFilePath, 'utf-8');
        const records = parse(fileContent, {
            columns: true,
            skip_empty_lines: true
        });

        const users = records.map((r: any) => ({
            username: r.username,
            realName: r.username, // CSV doesn't have real name, use username
            avatar: `https://ui-avatars.com/api/?name=${r.username}&background=random`, // Placeholder
            platform: 'leetcode',
            rating: parseFloat(r.rating) || 0,
            ranking: parseInt(r['global rank']) || 0,
            country: r.country
        }));

        // Ensure directory exists
        const dir = path.dirname(jsonFilePath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        fs.writeFileSync(jsonFilePath, JSON.stringify(users, null, 2));
        console.log(`Successfully converted ${users.length} users to JSON.`);
    } catch (err) {
        console.error('Error converting CSV:', err);
    }
}

main();
