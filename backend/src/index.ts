import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
dotenv.config();

import { fetchCodeChefContests } from "./services/codechef";
import { fetchCodeForcesContests } from "./services/codeforces";
import { fetchLeetCodeContests } from "./services/leetcode";
import { getHackathons, syncHackathons } from "./services/hackathons";
import { fetchLeetCodeStats, fetchCodeForcesStats, fetchCodeChefStats } from "./services/stats";
import { analyzeSkills, generatePracticePlan } from "./services/skillAnalysis";
import { getRecommendations } from "./services/recommendations";
import { generateAICoachAdvice } from "./services/gemini";
import clientPromise from "./lib/mongodb";
import { searchProfiles, upsertProfile } from "./services/search/database";
import { fetchLeetCodeUserProfile, searchLeetCodeUsers } from "./services/search/leetcode";
import { IndexedProfile } from "./types/user";
import { Contest } from "./types/contest";
import { getDate, getTimeUntil } from "./lib/parser";
import nodemailer from "nodemailer";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

// Helper to sort by startTime
const sortByStartTime = (a: Contest, b: Contest) =>
    new Date(a.startTimeISO).getTime() - new Date(b.startTimeISO).getTime();

// ========== ROUTES ==========

app.get("/api/codechef", async (req, res) => {
    try {
        const contests = await fetchCodeChefContests();
        res.json(contests);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch contests" });
    }
});

app.get("/api/codeforces", async (req, res) => {
    try {
        const contests = await fetchCodeForcesContests();
        res.json(contests);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch contests" });
    }
});

app.get("/api/leetcode", async (req, res) => {
    try {
        const contests = await fetchLeetCodeContests();
        res.json(contests);
    } catch (error) {
        res.status(200).json([]);
    }
});

app.get("/api/contests", async (req, res) => {
    try {
        const [codechefData, codeforcesData, leetcodeData] = await Promise.all([
            fetchCodeChefContests(),
            fetchCodeForcesContests(),
            fetchLeetCodeContests(),
        ]);

        const allContests: Contest[] = [
            ...(Array.isArray(codechefData) ? codechefData.sort(sortByStartTime) : []),
            ...(Array.isArray(codeforcesData) ? codeforcesData.sort(sortByStartTime) : []),
            ...(Array.isArray(leetcodeData) ? leetcodeData.sort(sortByStartTime) : []),
        ];

        res.json(allContests);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch contests" });
    }
});

app.get("/api/hackathons", async (req, res) => {
    const type = req.query.type as string;
    const featured = req.query.featured as string;
    const search = req.query.q as string;

    try {
        const hackathons = await getHackathons({ type, featured, search });
        res.json({ hackathons });
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.get("/api/hackathons/month", async (req, res) => {
    const year = parseInt((req.query.year as string) || "2025");
    const month = parseInt((req.query.month as string) || "12");

    try {
        const client = await clientPromise;
        if (!client) throw new Error("Database connection not available");
        const db = client.db();
        const collection = db.collection("hackathons");

        let hackathons = await collection.find({}).toArray() as unknown as any[];
        const uniqueHackathons = Array.from(new Map(hackathons.map(h => [h.id, h])).values());

        res.json({ hackathons: uniqueHackathons, year, month });
    } catch (error) {
        try {
            const all = await getHackathons({}); // Fallback
            const uniqueAll = Array.from(new Map(all.map(h => [h.id, h])).values());
            res.json({ hackathons: uniqueAll, year, month });
        } catch (e) {
            res.status(500).json({ error: "Internal Server Error" });
        }
    }
});

app.post("/api/hackathons/sync", async (req, res) => {
    try {
        await syncHackathons();
        res.json({ message: "Sync successful" });
    } catch (error: any) {
        res.status(500).json({ error: "Sync failed", details: error.message });
    }
});


app.post("/api/ai-coach", async (req, res) => {
    try {
        const { leetcode = "", codeforces = "", codechef = "" } = req.body;

        if (!leetcode && !codeforces && !codechef) {
            return res.status(400).json({ error: "At least one username is required." });
        }

        const [lcStats, cfStats, ccStats] = await Promise.all([
            fetchLeetCodeStats(leetcode),
            fetchCodeForcesStats(codeforces),
            fetchCodeChefStats(codechef),
        ]);

        const combinedTopics = new Map<string, number>();
        [...(lcStats.topicStats || []), ...(cfStats.topicStats || [])].forEach(
            (t) => combinedTopics.set(t.name, (combinedTopics.get(t.name) || 0) + t.count)
        );
        const mergedTopicStats = Array.from(combinedTopics.entries())
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count);

        const totalSolved = lcStats.totalSolved + cfStats.totalSolved + ccStats.totalSolved;
        const maxRating = Math.max(lcStats.contestRating, cfStats.contestRating, ccStats.contestRating);

        const skillAnalysis = analyzeSkills(mergedTopicStats);
        const weakNames = skillAnalysis.weakTopics.map((t) => t.name);
        const recommendations = getRecommendations(weakNames.slice(0, 5));
        const practicePlan = generatePracticePlan(skillAnalysis.weakTopics, skillAnalysis.mediumTopics);

        const mediumNames = skillAnalysis.mediumTopics.map((t) => t.name);
        const aiAdvice = await generateAICoachAdvice(weakNames, mediumNames, totalSolved, maxRating);

        res.json({
            skillAnalysis,
            recommendations,
            practicePlan,
            aiAdvice,
            meta: {
                totalSolved,
                maxRating,
                platforms: { leetcode: !!leetcode, codeforces: !!codeforces, codechef: !!codechef },
            },
        });
    } catch (err: any) {
        res.status(500).json({ error: "Internal server error", details: err?.message });
    }
});

app.get("/api/search/users", async (req, res) => {
    const query = req.query.q as string;
    const page = parseInt((req.query.page as string) || "1");
    const pageSize = parseInt((req.query.limit as string) || "12");

    if (!query) {
        return res.json({ users: [] });
    }

    try {
        let discoveredUsers = await searchLeetCodeUsers(query);
        if (discoveredUsers.length === 0) {
            const exactMatch = await fetchLeetCodeUserProfile(query);
            if (exactMatch) discoveredUsers = [exactMatch];
        }

        const discoveredResults = discoveredUsers.map(u => ({
            username: u.username,
            realName: u.realName || u.username,
            avatar: u.avatar,
            platform: 'leetcode',
            rating: u.rating || 0,
            ranking: u.ranking || 'N/A'
        })) as IndexedProfile[];

        const syncLimit = 15;
        const toProcess = discoveredUsers.slice(0, syncLimit);

        (async () => {
            for (const discovery of toProcess) {
                try {
                    if (!discovery.username) continue;
                    const fullProfile = await fetchLeetCodeUserProfile(discovery.username);
                    if (fullProfile) await upsertProfile(fullProfile as IndexedProfile);
                } catch (e) {}
            }
        })();

        let combinedUsers = discoveredResults;

        try {
            const jsonPath = path.join(process.cwd(), 'src/data/seeded_users.json');
            if (fs.existsSync(jsonPath)) {
                const fileContent = fs.readFileSync(jsonPath, 'utf-8');
                const seededUsers = JSON.parse(fileContent);
                const queryLower = query.toLowerCase();
                const matchedSeeded = seededUsers
                    .filter((u: any) => u.username.toLowerCase().includes(queryLower))
                    .slice(0, 50);

                const existingNames = new Set(combinedUsers.map(u => u.username));
                matchedSeeded.forEach((u: any) => {
                    if (!existingNames.has(u.username)) {
                        combinedUsers.push(u);
                        existingNames.add(u.username);
                    }
                });
            }
        } catch (e) {}

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
        } catch (dbError) {}

        combinedUsers.sort((a, b) => (b.rating || 0) - (a.rating || 0));

        const totalFound = combinedUsers.length;
        const startIndex = (page - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        const paginatedUsers = combinedUsers.slice(startIndex, endIndex);

        res.json({
            users: paginatedUsers,
            totalFound,
            page,
            totalPages: Math.ceil(totalFound / pageSize)
        });
    } catch (error) {
        res.status(500).json({ error: "Search unavailable" });
    }
});


app.post("/api/reminder", async (req, res) => {
    const { name, email, contestName, startTime, startTimeISO, duration, platformName, contestLink } = req.body;

    if (!name || !email || !contestName || !startTime || !startTimeISO || !duration || !platformName || !contestLink) {
        return res.status(400).json({ message: "Missing required fields" });
    }

    try {
        const client = await clientPromise;
        if (!client) throw new Error("Database connection not available");
        const db = client.db("contestTracker");
        const collection = db.collection("reminders");

        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT),
            secure: false,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        } as any);

        let emailTemplate = fs.readFileSync(path.join(process.cwd(), "public/email.html"), "utf-8");
        const startDateTime = new Date(startTimeISO);
        const timeUntil = getTimeUntil(startDateTime);

        const timeMatch = startTime.match(/(\w+ \d+, \d+), (.+)/);
        const formattedDate = timeMatch ? timeMatch[1] : startTime.split(",")[0] + "," + startTime.split(",")[1];
        const formattedTime = timeMatch ? timeMatch[2] : startTime.split(", ").pop();

        emailTemplate = emailTemplate
            .replace(/\{\{CONTEST_NAME\}\}/g, contestName)
            .replace(/\{\{START_DATE\}\}/g, formattedDate)
            .replace(/\{\{START_TIME\}\}/g, formattedTime)
            .replace(/\{\{DURATION\}\}/g, duration)
            .replace(/\{\{PLATFORM_NAME\}\}/g, platformName)
            .replace(/\{\{CONTEST_URL\}\}/g, contestLink)
            .replace(/\{\{PLATFORM_CLASS\}\}/g, platformName.toLowerCase())
            .replace(/\{\{TIME_UNTIL\}\}/g, timeUntil)
            .replace(/\{\{PLATFORM_URL\}\}/g, contestLink);

        await transporter.sendMail({
            from: process.env.SMTP_USER,
            to: email,
            subject: `Reminder Setup for Contest: ${contestName}`,
            html: emailTemplate,
        });

        await collection.insertOne({
            email, name, startTime, startTimeISO, contestName, duration,
            contestLink, platformName, formattedStartTime: new Date(startTimeISO),
        });

        res.status(200).json({ message: "Email sent successfully" });
    } catch (error) {
        res.status(500).json({ message: "Failed to send email" });
    }
});


app.get("/api/all", async (req, res) => {
    const page = parseInt((req.query.page as string) || "1");
    let contests: Contest[] = [];

    try {
        const [codechefData, codeforcesData, leetcodeData] = await Promise.all([
            fetchCodeChefContests(),
            fetchCodeForcesContests(),
            fetchLeetCodeContests(),
        ]);

        contests = [
            ...(Array.isArray(codechefData) ? codechefData : []),
            ...(Array.isArray(codeforcesData) ? codeforcesData : []),
            ...(Array.isArray(leetcodeData) ? leetcodeData : []),
        ];

        const x = contests
            .filter((contest) => contest.status === "upcoming")
            .sort((a, b) => getDate(a.startTimeISO) - getDate(b.startTimeISO));
        const y = contests.filter((contest) => contest.status !== "upcoming");
        contests = [...x, ...y];

        const limitParam = req.query.limit as string;
        const contests_per_page = limitParam ? parseInt(limitParam) : 9;

        const total_contests = contests.length;
        const no_of_pages = Math.ceil(total_contests / contests_per_page);

        let start = (page - 1) * contests_per_page;
        if (start < 0) start = 0;
        const end = start + contests_per_page;

        res.json({
            contests: contests.slice(start, end),
            pagination: { current_page: page, no_of_pages, total_contests, contests_per_page },
        });
    } catch (error) {
        res.json({
            contests: [],
            pagination: { current_page: 1, no_of_pages: 0, total_contests: 0, contests_per_page: 9 }
        });
    }
});


// Add a ping route
app.get("/", (req, res) => {
    res.send("API Server is running");
});

app.listen(PORT, () => {
    console.log(`Backend server running on port ${PORT}`);
});
