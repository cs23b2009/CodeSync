// ────────────────────────────────────────────────────────────────
//  AI Coach — Google Gemini LLM Integration
//  Uses @google/generative-ai SDK to generate personalised
//  competitive programming coaching advice via Gemini 2.0 Flash.
// ────────────────────────────────────────────────────────────────

import { GoogleGenerativeAI } from "@google/generative-ai";

export interface AICoachAdvice {
    text: string;
    model: string;
    fromCache: boolean;
    error?: string;
}

const MODEL_NAME = "gemini-2.0-flash";

// ──────────────────────────────────────────────
//  Prompt builder
// ──────────────────────────────────────────────
function buildPrompt(
    weakTopics: string[],
    mediumTopics: string[],
    totalSolved: number,
    maxRating: number
): string {
    const weakList = weakTopics.length
        ? weakTopics.join(", ")
        : "none identified yet";
    const mediumList = mediumTopics.length
        ? mediumTopics.join(", ")
        : "none identified yet";

    return `You are an expert competitive programming coach. A developer has the following profile:
- Total problems solved across all platforms: ${totalSolved}
- Highest contest rating: ${maxRating}
- Weak topics (fewer than 10 problems solved): ${weakList}
- Medium topics (10–30 problems solved): ${mediumList}

Give a concise, actionable, and encouraging 4-week competitive programming improvement plan.
Focus on:
1. Priority weak areas to fix first
2. Specific techniques and patterns to study
3. Daily practice habits
4. How to build up from weak to strong

Keep it practical, specific, and under 250 words. Use bullet points.`;
}

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 2000;

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// ──────────────────────────────────────────────
//  Main Gemini call
// ──────────────────────────────────────────────
export async function generateAICoachAdvice(
    weakTopics: string[],
    mediumTopics: string[],
    totalSolved: number,
    maxRating: number,
    retryCount = 0
): Promise<AICoachAdvice> {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        console.warn("[Gemini AI Coach] GEMINI_API_KEY not set — using fallback.");
        return {
            text: buildFallbackAdvice(weakTopics, mediumTopics),
            model: "fallback",
            fromCache: true,
            error: "GEMINI_API_KEY environment variable is not configured.",
        };
    }

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
            model: MODEL_NAME,
            generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 512,
            },
            systemInstruction:
                "You are an expert competitive programming coach. Be concise, encouraging, and practical.",
        });

        const prompt = buildPrompt(weakTopics, mediumTopics, totalSolved, maxRating);
        const result = await model.generateContent(prompt);
        const text = result.response.text();

        if (!text?.trim()) {
            throw new Error("Empty response from Gemini");
        }

        return { text: text.trim(), model: MODEL_NAME, fromCache: false };
    } catch (err: any) {
        const errorMsg = err?.message ?? "Unknown Gemini error";

        // Handle Rate Limit / Quota Exceeded (429)
        const isRateLimit = errorMsg.includes("429") ||
            errorMsg.toLowerCase().includes("quota") ||
            errorMsg.toLowerCase().includes("rate limit") ||
            errorMsg.includes("exceeded");

        if (isRateLimit && retryCount < MAX_RETRIES) {
            const waitTime = RETRY_DELAY_MS * Math.pow(2, retryCount);
            console.warn(`[Gemini AI Coach] Rate limit hit. Retrying in ${waitTime}ms... (Attempt ${retryCount + 1}/${MAX_RETRIES})`);
            await delay(waitTime);
            return generateAICoachAdvice(weakTopics, mediumTopics, totalSolved, maxRating, retryCount + 1);
        }

        console.error("[Gemini AI Coach] Error:", errorMsg);

        const friendlyError = isRateLimit
            ? "API quota exceeded. Displaying fallback coaching advice."
            : "Live AI unavailable. Displaying fallback coaching advice.";

        return {
            text: buildFallbackAdvice(weakTopics, mediumTopics),
            model: "fallback",
            fromCache: true,
            error: friendlyError,
        };
    }
}

// ──────────────────────────────────────────────
//  Offline fallback
// ──────────────────────────────────────────────
function buildFallbackAdvice(weak: string[], medium: string[]): string {
    const topWeak = weak.slice(0, 3).join(", ") || "fundamentals";
    const topMedium = medium.slice(0, 2).join(", ") || "intermediate topics";

    return `## Your Personalised 4-Week Roadmap

**Week 1–2 — Fix Weak Foundations**
• Focus intensely on **${topWeak}**. Solve 2–3 problems daily in these topics.
• Start with LeetCode Easy problems to build pattern recognition, then move to Mediums.
• Write out your approach before coding — verbalising the algorithm accelerates learning.

**Week 3 — Strengthen Medium Areas**
• Dedicate sessions to **${topMedium}**. Aim for 10+ problems per topic.
• After each problem, read the editorial even if you solved it — there is often a cleaner approach.

**Week 4 — Contest Simulation**
• Participate in at least 2 Codeforces Div. 3 or LeetCode Weekly contests.
• Upsolve all problems you couldn't finish during the contest.

**Daily Habit**
• 1 hour minimum, every single day. Consistency beats intensity.
• Maintain a mistake journal — every wrong approach is a lesson.`;
}
