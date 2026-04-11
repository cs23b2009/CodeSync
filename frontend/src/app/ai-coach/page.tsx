"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
    ResponsiveContainer, Tooltip as RechartsTooltip
} from "recharts";
import {
    Brain, Loader2, Zap, Target, BookOpen, Calendar,
    ExternalLink, AlertTriangle, ChevronDown, ChevronUp,
    Sparkles, TrendingUp, Shield, RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlatformLogo } from "@/components/Icons";
import { cn } from "@/lib/utils";
import Footer from "@/components/Footer";
import type { SkillAnalysis, PracticeDay } from "@/services/skillAnalysis";
import type { TopicRecommendation } from "@/services/recommendations";

interface AICoachAdvice {
    text: string;
    error?: string;
    fromCache?: boolean;
}

interface AICoachResponse {
    skillAnalysis: SkillAnalysis;
    recommendations: TopicRecommendation[];
    practicePlan: PracticeDay[];
    aiAdvice: AICoachAdvice;
    meta: { totalSolved: number; maxRating: number };
}

const LEVEL_CONFIG = {
    weak: { label: "Weak", color: "text-red-600", bg: "bg-red-50", border: "border-red-200", dot: "bg-red-500" },
    medium: { label: "Medium", color: "text-yellow-600", bg: "bg-yellow-50", border: "border-yellow-200", dot: "bg-yellow-500" },
    strong: { label: "Strong", color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200", dot: "bg-emerald-500" },
};

const DIFF_CONFIG = {
    easy: { label: "Easy", color: "text-emerald-600", bg: "bg-emerald-50" },
    medium: { label: "Medium", color: "text-yellow-600", bg: "bg-yellow-50" },
    hard: { label: "Hard", color: "text-red-600", bg: "bg-red-50" },
};

function SkillBadge({ level, name, count }: { level: "weak" | "medium" | "strong"; name: string; count: number }) {
    const cfg = LEVEL_CONFIG[level];
    return (
        <div className={cn("flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-medium", cfg.bg, cfg.border)}>
            <span className={cn("w-2 h-2 rounded-full shrink-0", cfg.dot)} />
            <span className="text-gray-700 truncate max-w-[130px]">{name}</span>
            <span className={cn("ml-auto text-xs font-bold", cfg.color)}>{count}</span>
        </div>
    );
}

function PracticeDayCard({ day }: { day: PracticeDay }) {
    const cfg = DIFF_CONFIG[day.difficulty];
    return (
        <div className="flex gap-4 items-start p-4 bg-gray-50 border border-gray-100 rounded-2xl hover:border-gray-200 transition-colors">
            <div className="shrink-0 w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center">
                <span className="text-blue-600 font-bold text-sm">{day.day}</span>
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-gray-900 font-semibold text-sm">{day.topic}</span>
                    <span className={cn("text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full", cfg.bg, cfg.color)}>
                        {cfg.label}
                    </span>
                </div>
                <p className="text-gray-500 text-xs leading-relaxed">{day.focus}</p>
            </div>
        </div>
    );
}

function RecommendationCard({ rec }: { rec: TopicRecommendation }) {
    const [open, setOpen] = useState(false);
    return (
        <div className="bg-gray-50 border border-gray-100 rounded-2xl overflow-hidden">
            <button
                onClick={() => setOpen(v => !v)}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-100 transition-colors"
            >
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center">
                        <Target size={14} className="text-red-500" />
                    </div>
                    <span className="text-gray-900 font-semibold text-sm">{rec.topic}</span>
                    <span className="text-[10px] text-gray-500 bg-gray-200 px-2 py-0.5 rounded-full">
                        {rec.recommendedProblems.length} problems
                    </span>
                </div>
                {open ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
            </button>

            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="border-t border-gray-100"
                    >
                        <div className="p-4 space-y-2">
                            {rec.recommendedProblems.map((p, i) => {
                                const diff = DIFF_CONFIG[p.difficulty];
                                return (
                                    <a
                                        key={i}
                                        href={p.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-3 p-3 rounded-xl bg-white hover:bg-gray-50 border border-gray-100 hover:border-gray-200 transition-all group"
                                    >
                                        <PlatformLogo platform={p.platform} size={16} />
                                        <span className="flex-1 text-gray-700 text-sm group-hover:text-gray-900 transition-colors truncate">
                                            {p.name}
                                        </span>
                                        <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0", diff.bg, diff.color)}>
                                            {diff.label}
                                        </span>
                                        <ExternalLink size={12} className="text-gray-300 group-hover:text-gray-500 shrink-0" />
                                    </a>
                                );
                            })}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

function TypewriterText({ text }: { text: string }) {
    const [displayed, setDisplayed] = useState("");
    const [done, setDone] = useState(false);
    useEffect(() => {
        setDisplayed("");
        setDone(false);
        if (!text) return;
        let i = 0;
        const id = setInterval(() => {
            if (i < text.length) {
                setDisplayed(text.slice(0, i + 1));
                i++;
            } else {
                setDone(true);
                clearInterval(id);
            }
        }, 8);
        return () => clearInterval(id);
    }, [text]);

    return (
        <div className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap font-mono">
            {displayed}
            {!done && <span className="animate-pulse">▌</span>}
        </div>
    );
}

function OverviewStats({ analysis, meta }: { analysis: SkillAnalysis; meta: { totalSolved: number; maxRating: number } }) {
    const stats = [
        { label: "Total Solved", value: meta.totalSolved, icon: BookOpen, color: "text-blue-600" },
        { label: "Weak Topics", value: analysis.weakTopics.length, icon: AlertTriangle, color: "text-red-600" },
        { label: "Peak Rating", value: meta.maxRating, icon: TrendingUp, color: "text-emerald-600" },
        { label: "Overall Level", value: analysis.overallLevel.charAt(0).toUpperCase() + analysis.overallLevel.slice(1), icon: Shield, color: "text-purple-600" },
    ];
    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((s, i) => {
                const Icon = s.icon;
                return (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.08 }}
                    >
                        <Card className="bg-white border border-gray-100 shadow-card">
                            <CardContent className="p-5 flex flex-col items-center justify-center text-center gap-2">
                                <Icon size={20} className={s.color} />
                                <span className="text-gray-400 text-[10px] uppercase font-semibold tracking-wider">{s.label}</span>
                                <span className="text-2xl font-bold text-gray-900">{s.value}</span>
                            </CardContent>
                        </Card>
                    </motion.div>
                );
            })}
        </div>
    );
}

function AICoachContent() {
    const searchParams = useSearchParams();
    const [usernames, setUsernames] = useState({
        leetcode: "",
        codeforces: "",
        codechef: "",
    });
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<AICoachResponse | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [planExpanded, setPlanExpanded] = useState(false);

    useEffect(() => {
        const lc = searchParams.get("leetcode") || "";
        const cf = searchParams.get("codeforces") || "";
        const cc = searchParams.get("codechef") || "";
        const saved = {
            leetcode: lc || localStorage.getItem("leetcode_user") || "",
            codeforces: cf || localStorage.getItem("codeforces_user") || "",
            codechef: cc || localStorage.getItem("codechef_user") || "",
        };
        setUsernames(saved);
        if (lc || cf || cc) {
            setTimeout(() => fetchCoachData(saved), 300);
        }
    }, []);

    const fetchCoachData = async (u = usernames) => {
        if (!u.leetcode && !u.codeforces && !u.codechef) return;
        setLoading(true);
        setError(null);
        setResult(null);

        localStorage.setItem("leetcode_user", u.leetcode);
        localStorage.setItem("codeforces_user", u.codeforces);
        localStorage.setItem("codechef_user", u.codechef);

        try {
            const res = await fetch(process.env.NEXT_PUBLIC_API_URL + "/api/ai-coach", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(u),
            });
            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData?.error || `HTTP ${res.status}`);
            }
            const data: AICoachResponse = await res.json();
            setResult(data);
        } catch (e: any) {
            setError(e?.message || "Failed to fetch AI Coach data");
        } finally {
            setLoading(false);
        }
    };

    const visibleDays = planExpanded ? result?.practicePlan : result?.practicePlan.slice(0, 7);

    return (
        <div className="min-h-screen bg-background text-foreground font-[family-name:var(--font-geist-sans)] selection:bg-blue-100 relative overflow-x-hidden pt-28">
            <div className="absolute inset-0 -z-10 h-full w-full bg-grid-cream"></div>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-blue-100 blur-[100px] rounded-full -z-10 pointer-events-none" />

            <div className="w-full max-w-6xl mx-auto px-6 py-10 flex flex-col items-center gap-8">

                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center space-y-3 max-w-xl"
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-100 rounded-full mb-2">
                        <Sparkles size={12} className="text-blue-600" />
                        <span className="text-blue-600 text-xs font-semibold uppercase tracking-wider">AI Analysis</span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
                        Competitive Programming
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600"> Assistant</span>
                    </h1>
                    <p className="text-gray-500 text-base leading-relaxed">
                        Enter your platform usernames to get a personalised skill analysis,
                        curated problem recommendations, and an AI-generated 30-day plan.
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="w-full grid grid-cols-1 lg:grid-cols-4 gap-4 bg-white p-5 rounded-2xl border border-gray-100 shadow-card"
                >
                    {(["leetcode", "codeforces", "codechef"] as const).map((p) => (
                        <div key={p} className="space-y-2">
                            <Label className="text-gray-500 text-xs uppercase tracking-wider capitalize">{p}</Label>
                            <div className="relative">
                                <PlatformLogo platform={p} className="absolute left-3 top-2.5 opacity-40" size={16} />
                                <Input
                                    className="pl-9 bg-gray-50 border-gray-200 text-gray-900"
                                    placeholder="Username"
                                    value={usernames[p]}
                                    onChange={(e) => setUsernames({ ...usernames, [p]: e.target.value })}
                                    onKeyDown={(e) => e.key === "Enter" && fetchCoachData()}
                                />
                            </div>
                        </div>
                    ))}
                    <div className="flex items-end">
                        <Button
                            onClick={() => fetchCoachData()}
                            disabled={loading}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium"
                        >
                            {loading ? (
                                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing...</>
                            ) : (
                                <><Brain className="mr-2 h-4 w-4" /> Analyze My Skills</>
                            )}
                        </Button>
                    </div>
                </motion.div>

                {error && !loading && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="w-full flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm"
                    >
                        <AlertTriangle size={16} className="shrink-0" />
                        {error}
                    </motion.div>
                )}

                {loading && (
                    <div className="w-full space-y-6">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-32 bg-white border border-gray-100 rounded-2xl animate-pulse" />
                        ))}
                    </div>
                )}

                {result && !loading && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.4 }}
                        className="w-full space-y-8"
                    >
                        <OverviewStats analysis={result.skillAnalysis} meta={result.meta} />

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <Card className="bg-white border border-gray-100 shadow-card">
                                <CardHeader>
                                    <CardTitle className="text-sm font-semibold text-gray-600 uppercase tracking-wider flex items-center gap-2">
                                        <Zap size={14} className="text-blue-600" /> Skill Analysis
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="h-[280px]">
                                    {result.skillAnalysis.radarData.length > 0 ? (
                                        <ResponsiveContainer width="100%" height="100%">
                                            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={result.skillAnalysis.radarData}>
                                                <PolarGrid stroke="#e5e7eb" />
                                                <PolarAngleAxis
                                                    dataKey="topic"
                                                    tick={{ fill: "#6b7280", fontSize: 11, fontWeight: 600 }}
                                                />
                                                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                                <Radar
                                                    name="Skill Score"
                                                    dataKey="score"
                                                    stroke="#3b82f6"
                                                    fill="#3b82f6"
                                                    fillOpacity={0.25}
                                                    strokeWidth={2}
                                                />
                                                <RechartsTooltip
                                                    contentStyle={{ backgroundColor: "#ffffff", border: "1px solid #e5e7eb", borderRadius: "8px" }}
                                                    itemStyle={{ color: "#1f2937" }}
                                                    formatter={(v: number | undefined) => [`${v ?? 0}/100`, "Skill Score"]}
                                                />
                                            </RadarChart>
                                        </ResponsiveContainer>
                                    ) : (
                                        <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                                            Not enough topic data to render radar chart.
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            <Card className="bg-white border border-gray-100 shadow-card">
                                <CardHeader>
                                    <CardTitle className="text-sm font-semibold text-gray-600 uppercase tracking-wider flex items-center gap-2">
                                        <Target size={14} className="text-purple-600" /> Skill Breakdown
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-5">
                                    {(["weak", "medium", "strong"] as const).map((lvl) => {
                                        const topics = result.skillAnalysis[`${lvl}Topics` as keyof SkillAnalysis] as any[];
                                        const cfg = LEVEL_CONFIG[lvl];
                                        return (
                                            <div key={lvl}>
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className={cn("text-[10px] font-semibold uppercase tracking-wider", cfg.color)}>
                                                        {cfg.label}
                                                    </span>
                                                    <span className="text-gray-400 text-xs">({topics.length})</span>
                                                </div>
                                                {topics.length > 0 ? (
                                                    <div className="grid grid-cols-1 gap-1.5">
                                                        {topics.slice(0, 4).map((t: any, i: number) => (
                                                            <SkillBadge key={i} level={lvl} name={t.name} count={t.count} />
                                                        ))}
                                                        {topics.length > 4 && (
                                                            <p className="text-gray-400 text-xs pl-1">+{topics.length - 4} more</p>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <p className="text-gray-400 text-xs pl-1">None identified</p>
                                                )}
                                            </div>
                                        );
                                    })}
                                </CardContent>
                            </Card>
                        </div>

                        {result.recommendations.length > 0 && (
                            <Card className="bg-white border border-gray-100 shadow-card">
                                <CardHeader>
                                    <CardTitle className="text-sm font-semibold text-gray-600 uppercase tracking-wider flex items-center gap-2">
                                        <BookOpen size={14} className="text-red-600" /> Recommended Problems
                                        <span className="text-gray-400 font-normal normal-case text-xs">— focus on your weak topics</span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {result.recommendations.map((rec, i) => (
                                        <RecommendationCard key={i} rec={rec} />
                                    ))}
                                </CardContent>
                            </Card>
                        )}

                        <Card className="bg-white border border-gray-100 shadow-card">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-sm font-semibold text-gray-600 uppercase tracking-wider flex items-center gap-2">
                                        <Calendar size={14} className="text-emerald-600" /> 30-Day Practice Plan
                                    </CardTitle>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setPlanExpanded(v => !v)}
                                        className="border-gray-200 text-gray-600 hover:text-gray-900 hover:bg-gray-50 text-xs"
                                    >
                                        {planExpanded ? "Show Less" : "Show All 30 Days"}
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <AnimatePresence>
                                    {visibleDays?.map((day, i) => (
                                        <motion.div
                                            key={day.day}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: i * 0.03 }}
                                        >
                                            <PracticeDayCard day={day} />
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                                {!planExpanded && result.practicePlan.length > 7 && (
                                    <p className="text-center text-gray-400 text-xs pt-2">
                                        Showing 7 of {result.practicePlan.length} days
                                    </p>
                                )}
                            </CardContent>
                        </Card>

                        <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-100">
                            <CardHeader>
                                <CardTitle className="text-sm font-semibold text-gray-600 uppercase tracking-wider flex items-center gap-2">
                                    <Brain size={14} className="text-blue-600" />
                                    AI Assistant Advice
                                    {result.aiAdvice.fromCache && (
                                        <span className="text-[10px] text-gray-500 bg-gray-200 px-2 py-0.5 rounded-full normal-case font-normal">
                                            Fallback mode
                                        </span>
                                    )}
                                    {!result.aiAdvice.fromCache && (
                                        <span className="text-[10px] text-blue-600 bg-blue-100 border border-blue-200 px-2 py-0.5 rounded-full normal-case font-normal">
                                            Gemini 2.0 Flash
                                        </span>
                                    )}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="p-4 bg-white rounded-xl border border-gray-100 min-h-[100px]">
                                    <TypewriterText text={result.aiAdvice.text} />
                                </div>
                                {result.aiAdvice.error && (
                                    <p className="mt-2 text-xs text-gray-400 flex items-center gap-1">
                                        <AlertTriangle size={12} /> {result.aiAdvice.error}
                                    </p>
                                )}
                            </CardContent>
                        </Card>

                        <div className="flex justify-center pt-2 pb-4">
                            <Button
                                variant="outline"
                                onClick={() => fetchCoachData()}
                                className="border-gray-200 text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                            >
                                <RefreshCw size={14} className="mr-2" /> Re-Analyze
                            </Button>
                        </div>
                    </motion.div>
                )}

                {!result && !loading && !error && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex flex-col items-center gap-4 py-14 text-center"
                    >
                        <div className="w-16 h-16 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center">
                            <Brain className="w-8 h-8 text-blue-600" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">Ready to Coach You</h3>
                        <p className="text-gray-500 max-w-sm">
                            Enter at least one platform username above and click <strong className="text-gray-700">Analyze My Skills</strong> to get started.
                        </p>
                    </motion.div>
                )}

                <Footer />
            </div>
        </div>
    );
}

export default function AICoachPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-background flex items-center justify-center pt-32">
                <div className="flex flex-col items-center gap-4 text-gray-400">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                    <p className="text-sm">Loading Coach...</p>
                </div>
            </div>
        }>
            <AICoachContent />
        </Suspense>
    );
}