// ────────────────────────────────────────────────────────────────
//  AI Coach — Skill Analysis Engine
//  Classifies CP topic skills into Weak / Medium / Strong and
//  generates a 30-day structured practice plan.
// ────────────────────────────────────────────────────────────────

export interface TopicStat {
    name: string;
    count: number;
}

export interface ClassifiedTopic {
    name: string;
    count: number;
    level: "weak" | "medium" | "strong";
    score: number; // 0–100 normalized score for radar chart
}

export interface SkillAnalysis {
    weakTopics: ClassifiedTopic[];
    mediumTopics: ClassifiedTopic[];
    strongTopics: ClassifiedTopic[];
    radarData: { topic: string; score: number }[];
    overallLevel: "beginner" | "intermediate" | "advanced" | "expert";
}

export interface PracticeDay {
    day: number;
    topic: string;
    focus: string;
    difficulty: "easy" | "medium" | "hard";
    problems: string[]; // short titles / slugs
}

// ──────────────────────────────────────────────
//  Classification thresholds
// ──────────────────────────────────────────────
const WEAK_THRESHOLD = 10;
const MEDIUM_THRESHOLD = 30;

function normalizeScore(count: number): number {
    // 0–9 → 0–33, 10–30 → 33–66, 30+ → 66–100 (capped at 100)
    if (count <= 0) return 0;
    if (count < WEAK_THRESHOLD) return Math.round((count / WEAK_THRESHOLD) * 33);
    if (count < MEDIUM_THRESHOLD)
        return Math.round(33 + ((count - WEAK_THRESHOLD) / (MEDIUM_THRESHOLD - WEAK_THRESHOLD)) * 33);
    return Math.min(66 + Math.round(((count - MEDIUM_THRESHOLD) / 30) * 34), 100);
}

// ──────────────────────────────────────────────
//  Topic Normalization Map
// ──────────────────────────────────────────────
const TOPIC_ALIASES: Record<string, string> = {
    "dp": "dynamic programming",
    "dfs": "graphs",
    "depth-first search": "graphs",
    "bfs": "graphs",
    "breadth-first search": "graphs",
    "graph": "graphs",
    "binary-search": "binary search",
    "two-pointers": "two pointers",
    "sliding-window": "sliding window",
    "prefix-sum": "arrays",
    "linked-list": "linked list",
    "string": "strings",
    "array": "arrays",
    "tree": "trees",
    "binary tree": "trees",
    "greedy": "greedy",
    "backtracking": "backtracking",
    "sorting": "sorting",
    "bit manipulation": "bit manipulation",
    "bitmasking": "bit manipulation",
    "heap (priority queue)": "heaps",
    "heap": "heaps",
    "priority queue": "heaps",
    "stack": "stack",
    "queue": "arrays",
    "geometry": "math",
    "number theory": "math",
    "combinatorics": "math",
    "hash-table": "arrays",
    "hash table": "arrays",
    "hash map": "arrays",
    "maths": "math",
    "mathematics": "math",
};

export function normalizeTopic(topic: string): string {
    const raw = topic.toLowerCase().trim();
    if (TOPIC_ALIASES[raw]) return TOPIC_ALIASES[raw];
    const noHyphen = raw.replace(/-/g, " ");
    if (TOPIC_ALIASES[noHyphen]) return TOPIC_ALIASES[noHyphen];
    return noHyphen;
}

export function analyzeSkills(topicStats: TopicStat[]): SkillAnalysis {
    if (!topicStats || topicStats.length === 0) {
        return {
            weakTopics: [],
            mediumTopics: [],
            strongTopics: [],
            radarData: [],
            overallLevel: "beginner",
        };
    }

    // 1. Normalize and aggregate across platforms
    const aggregated = new Map<string, number>();
    for (const t of topicStats) {
        const norm = normalizeTopic(t.name);
        aggregated.set(norm, (aggregated.get(norm) || 0) + t.count);
    }

    // 2. Classify based on total normalized count
    const classified: ClassifiedTopic[] = Array.from(aggregated.entries()).map(([name, count]) => {
        // Title case for UI display
        const displayName = name.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

        return {
            name: displayName,
            count: count,
            level:
                count < WEAK_THRESHOLD
                    ? "weak"
                    : count < MEDIUM_THRESHOLD
                        ? "medium"
                        : "strong",
            score: normalizeScore(count),
        };
    });

    const weakTopics = classified.filter((t) => t.level === "weak").sort((a, b) => a.count - b.count);
    const mediumTopics = classified.filter((t) => t.level === "medium").sort((a, b) => a.count - b.count);
    const strongTopics = classified.filter((t) => t.level === "strong").sort((a, b) => b.count - a.count);

    // Radar chart — top 8 topics by absolute count for readability
    const top8 = [...classified].sort((a, b) => b.count - a.count).slice(0, 8);
    const radarData = top8.map((t) => ({ topic: t.name, score: t.score }));

    // Overall level based on average score
    const avg = classified.reduce((s, t) => s + t.score, 0) / classified.length;
    const overallLevel =
        avg < 25
            ? "beginner"
            : avg < 50
                ? "intermediate"
                : avg < 75
                    ? "advanced"
                    : "expert";

    return { weakTopics, mediumTopics, strongTopics, radarData, overallLevel };
}

// ──────────────────────────────────────────────
//  30-Day Practice Plan Generator
// ──────────────────────────────────────────────

const FOCUS_TEMPLATES: Record<string, string[]> = {
    default: [
        "Fundamentals & Pattern Recognition",
        "Intermediate Problems",
        "Advanced Applications",
    ],
    "dynamic programming": [
        "1D DP — Fibonacci & Climbing Stairs patterns",
        "2D DP — Grid paths & knapsack",
        "DP on Intervals & Trees",
    ],
    graphs: [
        "BFS Traversal & Shortest Path",
        "DFS & Cycle Detection",
        "Dijkstra, Topological Sort & MST",
    ],
    trees: [
        "Tree Traversal (Inorder / Preorder / Postorder)",
        "Binary Search Tree operations",
        "Advanced — LCA, Diameter, Path Sum",
    ],
    "binary search": [
        "Classic Binary Search on arrays",
        "Binary Search on Answer",
        "Rotated arrays & 2D matrix search",
    ],
    "two pointers": [
        "Same-direction Two Pointers",
        "Opposite-direction (Collide) Technique",
        "Three-sum & Partition patterns",
    ],
    "sliding window": [
        "Fixed-size Window",
        "Variable-size Window",
        "Substring & Subarray problems",
    ],
    greedy: [
        "Activity selection & Interval scheduling",
        "Greedy with sorting",
        "Gas station & Jump Game patterns",
    ],
    backtracking: [
        "Permutations & Combinations",
        "Subsets & Power Set",
        "N-Queens & Sudoku",
    ],
};

function getFocusList(topic: string): string[] {
    const key = topic.toLowerCase();
    for (const k of Object.keys(FOCUS_TEMPLATES)) {
        if (key.includes(k)) return FOCUS_TEMPLATES[k];
    }
    return FOCUS_TEMPLATES["default"];
}

export function generatePracticePlan(
    weakTopics: ClassifiedTopic[],
    mediumTopics: ClassifiedTopic[]
): PracticeDay[] {
    const plan: PracticeDay[] = [];
    let day = 1;

    // Weak topics occupy Days 1–20 (up to ~3 days each)
    const weakSlots = Math.min(weakTopics.length, 6); // max 6 weak topics × 3 days = 18 days
    for (let i = 0; i < weakSlots && day <= 20; i++) {
        const topic = weakTopics[i];
        const focuses = getFocusList(topic.name);
        for (let j = 0; j < 3 && day <= 20; j++, day++) {
            plan.push({
                day,
                topic: topic.name,
                focus: focuses[j] ?? focuses[0],
                difficulty: j === 0 ? "easy" : j === 1 ? "medium" : "hard",
                problems: [],
            });
        }
    }

    // Fill up to Day 20 with extra medium-topic exposure if weak list is short
    if (day <= 20) {
        plan.push({
            day,
            topic: "Mixed Review",
            focus: "Consolidate weak topics with timed practice",
            difficulty: "medium",
            problems: [],
        });
        day++;
    }

    // Medium topics occupy Days 21–28 (up to 2 days each)
    const mediumSlots = Math.min(mediumTopics.length, 4); // max 4 topics × 2 days = 8 days
    for (let i = 0; i < mediumSlots && day <= 28; i++) {
        const topic = mediumTopics[i];
        const focuses = getFocusList(topic.name);
        for (let j = 0; j < 2 && day <= 28; j++, day++) {
            plan.push({
                day,
                topic: topic.name,
                focus: focuses[j] ?? focuses[0],
                difficulty: j === 0 ? "medium" : "hard",
                problems: [],
            });
        }
    }

    // Days 29–30: mock contest / full review
    while (day <= 30) {
        plan.push({
            day,
            topic: "Mock Contest & Review",
            focus:
                day === 29
                    ? "Solve a virtual contest mixing all studied topics"
                    : "Analyze mistakes and re-solve failed problems",
            difficulty: "hard",
            problems: [],
        });
        day++;
    }

    return plan;
}
