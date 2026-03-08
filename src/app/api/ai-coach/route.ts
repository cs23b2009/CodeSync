// ────────────────────────────────────────────────────────────────
//  POST /api/ai-coach
//  Orchestrator: fetches stats → analyzes skills → recommends
//  problems → generates practice plan → calls Ollama LLM
// ────────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from "next/server";
import { fetchLeetCodeStats, fetchCodeForcesStats, fetchCodeChefStats } from "@/services/stats";
import { analyzeSkills, generatePracticePlan } from "@/services/skillAnalysis";
import { getRecommendations } from "@/services/recommendations";
import { generateAICoachAdvice } from "@/services/gemini";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const {
            leetcode = "",
            codeforces = "",
            codechef = "",
        }: { leetcode?: string; codeforces?: string; codechef?: string } = body;

        if (!leetcode && !codeforces && !codechef) {
            return NextResponse.json(
                { error: "At least one username is required." },
                { status: 400 }
            );
        }

        // ── Step 1: Fetch stats in parallel (reuses existing services) ──
        const [lcStats, cfStats, ccStats] = await Promise.all([
            fetchLeetCodeStats(leetcode),
            fetchCodeForcesStats(codeforces),
            fetchCodeChefStats(codechef),
        ]);

        // ── Step 2: Merge topic stats across platforms ──
        const combinedTopics = new Map<string, number>();
        [...(lcStats.topicStats || []), ...(cfStats.topicStats || [])].forEach(
            (t) => combinedTopics.set(t.name, (combinedTopics.get(t.name) || 0) + t.count)
        );
        const mergedTopicStats = Array.from(combinedTopics.entries())
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count);

        const totalSolved =
            lcStats.totalSolved + cfStats.totalSolved + ccStats.totalSolved;
        const maxRating = Math.max(
            lcStats.contestRating,
            cfStats.contestRating,
            ccStats.contestRating
        );

        // ── Step 3: Skill analysis ──
        const skillAnalysis = analyzeSkills(mergedTopicStats);

        // ── Step 4: Problem recommendations (for weak topics) ──
        const weakNames = skillAnalysis.weakTopics.map((t) => t.name);
        const recommendations = getRecommendations(weakNames.slice(0, 5));

        // ── Step 5: 30-day practice plan ──
        const practicePlan = generatePracticePlan(
            skillAnalysis.weakTopics,
            skillAnalysis.mediumTopics
        );

        // ── Step 6: AI Advice via Ollama (may use fallback if offline) ──
        const mediumNames = skillAnalysis.mediumTopics.map((t) => t.name);
        const aiAdvice = await generateAICoachAdvice(
            weakNames,
            mediumNames,
            totalSolved,
            maxRating
        );

        return NextResponse.json({
            skillAnalysis,
            recommendations,
            practicePlan,
            aiAdvice,
            meta: {
                totalSolved,
                maxRating,
                platforms: {
                    leetcode: !!leetcode,
                    codeforces: !!codeforces,
                    codechef: !!codechef,
                },
            },
        });
    } catch (err: any) {
        console.error("[/api/ai-coach] Error:", err);
        return NextResponse.json(
            { error: "Internal server error", details: err?.message },
            { status: 500 }
        );
    }
}
