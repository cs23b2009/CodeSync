"use client";

import { useState, useEffect, useRef } from "react";
import { ActivityCalendar } from "react-activity-calendar";
import { getUserActivity, getCumulativeStats } from "@/app/actions";
import { ActivitySubmission } from "@/services/activity";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useTheme } from "next-themes";
import { Loader2, Download, Trophy, Flame, Calendar, CheckCircle2, Award } from "lucide-react";
import html2canvas from "html2canvas";
import { toast } from "sonner";
import { PlatformLogo } from "@/components/Icons";

interface CombinedHeatmapProps {
    preloadedData?: ActivitySubmission[];
    preloadedStats?: {
        totalSolved: number;
        totalContests: number;
        maxRating: number;
    };
    preloadedUsernames?: {
        leetcode: string;
        codeforces: string;
        codechef: string;
    };
}

export default function CombinedHeatmap({ preloadedData, preloadedStats, preloadedUsernames }: CombinedHeatmapProps) {
    const [data, setData] = useState<ActivitySubmission[]>([]);
    const [loading, setLoading] = useState(false);
    const [leetcode, setLeetcode] = useState("");
    const [codeforces, setCodeforces] = useState("");
    const [codechef, setCodechef] = useState("");
    const [stats, setStats] = useState({
        totalSolved: 0,
        activeDays: 0,
        maxStreak: 0,
        currentStreak: 0,
        totalContests: 0,
        maxRating: 0
    });

    const { theme } = useTheme();
    const cardRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (preloadedData && preloadedStats && preloadedUsernames) {
            setLeetcode(preloadedUsernames.leetcode);
            setCodeforces(preloadedUsernames.codeforces);
            setCodechef(preloadedUsernames.codechef);
            setData(preloadedData);
            calculateStats(preloadedData, preloadedStats);
        } else {
            const savedLeet = localStorage.getItem("leetcode_user");
            const savedCF = localStorage.getItem("codeforces_user");
            const savedCC = localStorage.getItem("codechef_user");
            if (savedLeet) setLeetcode(savedLeet);
            if (savedCF) setCodeforces(savedCF);
            if (savedCC) setCodechef(savedCC);
        }
    }, [preloadedData, preloadedStats, preloadedUsernames]);

    const calculateStats = (submissions: ActivitySubmission[], cumulativeStats?: { totalSolved: number, totalContests: number, maxRating: number }) => {
        if (!submissions.length) return;

        // Use fetched totalSolved if available, otherwise fallback to heatmap sum
        const heatmapCount = submissions.reduce((acc, curr) => acc + curr.count, 0);
        const totalSolved = cumulativeStats?.totalSolved || heatmapCount;
        const totalContests = cumulativeStats?.totalContests || 0;
        const maxRating = cumulativeStats?.maxRating || 0;

        // Filter valid days for stats (ignore zero-count padding days)
        const activeSubmissions = submissions.filter(s => s.count > 0);
        const activeDays = activeSubmissions.length;

        // Calculate streaks based on ACTIVE submissions only
        let maxStreak = 0;
        let currentStreak = 0;
        let tempStreak = 0;

        // Sort by date
        const sorted = [...activeSubmissions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        for (let i = 0; i < sorted.length; i++) {
            if (i === 0) {
                tempStreak = 1;
            } else {
                const prev = new Date(sorted[i - 1].date);
                const curr = new Date(sorted[i].date);
                const diffTime = Math.abs(curr.getTime() - prev.getTime());
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                if (diffDays === 1) {
                    tempStreak++;
                } else {
                    tempStreak = 1;
                    // Check if gap is small enough? Naive strict streak for now.
                }
            }
            maxStreak = Math.max(maxStreak, tempStreak);
        }

        // Improve current streak logic to be more forgiving for "today"
        // ... (reuse simple logic or keep existing but applied to activeSubmissions)

        // Simple Current Streak from sorted active
        if (sorted.length > 0) {
            const last = sorted[sorted.length - 1];
            const today = new Date();
            const lastDate = new Date(last.date);
            const diff = (today.getTime() - lastDate.getTime()) / (1000 * 3600 * 24);
            if (diff <= 2) {
                // Iterate back
                currentStreak = 1;
                for (let i = sorted.length - 2; i >= 0; i--) {
                    const prev = new Date(sorted[i].date);
                    const curr = new Date(sorted[i + 1].date);
                    const d = (curr.getTime() - prev.getTime()) / (1000 * 3600 * 24);
                    if (d <= 1.5) currentStreak++;
                    else break;
                }
            } else {
                currentStreak = 0;
            }
        }

        setStats({ totalSolved, activeDays, maxStreak, currentStreak, totalContests, maxRating });
    };

    const handleFetch = async () => {
        if (!leetcode && !codeforces && !codechef) return;

        localStorage.setItem("leetcode_user", leetcode);
        localStorage.setItem("codeforces_user", codeforces);
        localStorage.setItem("codechef_user", codechef);

        setLoading(true);
        try {
            const [activityResult, statsResult] = await Promise.all([
                getUserActivity(leetcode, codeforces, codechef),
                getCumulativeStats(leetcode, codeforces, codechef)
            ]);

            // Filter for last 365 days
            // detailed full year data
            const today = new Date();
            const oneYearAgo = new Date();
            oneYearAgo.setFullYear(today.getFullYear() - 1);

            // Generate map of all dates in the last year
            const dateMap = new Map<string, ActivitySubmission>();
            for (let d = new Date(oneYearAgo); d <= today; d.setDate(d.getDate() + 1)) {
                const dateStr = d.toISOString().split('T')[0];
                dateMap.set(dateStr, { date: dateStr, count: 0, level: 0 });
            }

            // Merge actual activity
            activityResult.forEach(item => {
                if (dateMap.has(item.date)) {
                    dateMap.set(item.date, item);
                }
            });

            const fullYearData = Array.from(dateMap.values()).sort((a, b) => a.date.localeCompare(b.date));

            setData(fullYearData);
            // Calculate stats using actual activity only to avoid 0s skewing logic (though logic handles it)
            // Actually, pass filtered/actual activity to calculateStats for correct activeDays/streak
            calculateStats(activityResult, statsResult);
        } catch (error) {
            console.error(error);
            toast.error("Failed to fetch activity data");
        } finally {
            setLoading(false);
        }
    };

    const downloadCard = async () => {
        if (!cardRef.current) return;
        try {
            const canvas = await html2canvas(cardRef.current, {
                backgroundColor: "#0d1117", // Set explicit background
                scale: 3, // Higher quality
                useCORS: true,
                logging: true,
                allowTaint: true,
                onclone: (clonedDoc) => {
                    // Fix any potential style issues in clone
                    const clonedCard = clonedDoc.querySelector('[data-card-ref="true"]');
                    if (clonedCard instanceof HTMLElement) {
                        clonedCard.style.transform = "none";
                        clonedCard.style.boxShadow = "none";
                    }
                }
            });
            const image = canvas.toDataURL("image/png");
            const link = document.createElement("a");
            link.href = image;
            link.download = `codesync-stats-${new Date().toISOString().split('T')[0]}.png`;
            link.click();
            toast.success("Card downloaded successfully!");
        } catch (err) {
            console.error("Image generation failed:", err);
            toast.error("Failed to generate image. Please try again.");
        }
    };

    return (
        <div className="w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Input Section */}
            <div className="grid gap-4 md:grid-cols-4 items-end bg-zinc-900/50 p-6 rounded-xl border border-zinc-800/50 backdrop-blur-sm">
                <div className="grid gap-2">
                    <Label htmlFor="leetcode" className="text-zinc-400">LeetCode</Label>
                    <Input
                        id="leetcode"
                        value={leetcode}
                        onChange={(e) => setLeetcode(e.target.value)}
                        placeholder="Username"
                        className="bg-zinc-950/50 border-zinc-800 text-zinc-200 focus:ring-emerald-500/20 focus:border-emerald-500/50"
                    />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="codeforces" className="text-zinc-400">CodeForces</Label>
                    <Input
                        id="codeforces"
                        value={codeforces}
                        onChange={(e) => setCodeforces(e.target.value)}
                        placeholder="Handle"
                        className="bg-zinc-950/50 border-zinc-800 text-zinc-200 focus:ring-blue-500/20 focus:border-blue-500/50"
                    />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="codechef" className="text-zinc-400">CodeChef</Label>
                    <Input
                        id="codechef"
                        value={codechef}
                        onChange={(e) => setCodechef(e.target.value)}
                        placeholder="Handle"
                        className="bg-zinc-950/50 border-zinc-800 text-zinc-200 focus:ring-orange-500/20 focus:border-orange-500/50"
                    />
                </div>
                <Button
                    onClick={handleFetch}
                    disabled={loading}
                    className="bg-zinc-100 text-zinc-900 hover:bg-zinc-200 font-semibold"
                >
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Sync Stats
                </Button>
            </div>

            {/* Shareable Card Area */}
            {data.length > 0 && (
                <div className="flex justify-center">
                    <div className="relative group perspective-1000">
                        <div
                            ref={cardRef}
                            data-card-ref="true"
                            className="relative w-full max-w-4xl bg-[#0d1117] rounded-3xl border border-zinc-800 p-8 shadow-2xl overflow-hidden"
                            style={{ boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)" }}
                        >
                            {/* Background Pattern */}
                            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
                            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/4 pointer-events-none"></div>
                            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.03]"></div>

                            {/* Card Header: User Info & Main Stats */}
                            <div className="flex flex-col lg:flex-row gap-8 items-start justify-between mb-8 relative z-10">
                                <div className="flex items-center gap-5">
                                    <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-zinc-800 to-zinc-900 border border-zinc-700 flex items-center justify-center text-3xl font-bold text-zinc-300 shadow-inner">
                                        {leetcode.slice(0, 1).toUpperCase() || codeforces.slice(0, 1).toUpperCase()}
                                    </div>
                                    <div>
                                        <h2 className="text-3xl font-bold text-zinc-100 flex items-center gap-2">
                                            {leetcode || codeforces || codechef}
                                            <span className="text-emerald-500"><CheckCircle2 size={22} fill="currentColor" className="text-emerald-950" /></span>
                                        </h2>
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {leetcode && <div className="flex items-center gap-1.5 text-xs font-medium text-zinc-300 bg-zinc-800/60 px-2.5 py-1 rounded-md border border-zinc-700/50"><PlatformLogo platform="leetcode" size={14} /> {leetcode}</div>}
                                            {codeforces && <div className="flex items-center gap-1.5 text-xs font-medium text-zinc-300 bg-zinc-800/60 px-2.5 py-1 rounded-md border border-zinc-700/50"><PlatformLogo platform="codeforces" size={14} /> {codeforces}</div>}
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full lg:w-auto">
                                    <div className="bg-zinc-900/40 backdrop-blur-md border border-zinc-800 rounded-2xl p-4 flex flex-col items-center min-w-[110px] hover:bg-zinc-800/40 transition-colors">
                                        <span className="text-zinc-500 text-[10px] uppercase tracking-widest font-semibold mb-1 flex items-center gap-1.5"><Trophy size={12} className="text-yellow-500" /> Solved</span>
                                        <span className="text-2xl font-bold text-zinc-100">{stats.totalSolved}</span>
                                    </div>
                                    <div className="bg-zinc-900/40 backdrop-blur-md border border-zinc-800 rounded-2xl p-4 flex flex-col items-center min-w-[110px] hover:bg-zinc-800/40 transition-colors">
                                        <span className="text-zinc-500 text-[10px] uppercase tracking-widest font-semibold mb-1 flex items-center gap-1.5"><Award size={12} className="text-purple-500" /> Contests</span>
                                        <span className="text-2xl font-bold text-zinc-100">{stats.totalContests}</span>
                                    </div>
                                    <div className="bg-zinc-900/40 backdrop-blur-md border border-zinc-800 rounded-2xl p-4 flex flex-col items-center min-w-[110px] hover:bg-zinc-800/40 transition-colors">
                                        <span className="text-zinc-500 text-[10px] uppercase tracking-widest font-semibold mb-1 flex items-center gap-1.5"><Flame size={12} className="text-orange-500" /> Max Streak</span>
                                        <span className="text-2xl font-bold text-zinc-100">{stats.maxStreak}</span>
                                    </div>
                                    <div className="bg-zinc-900/40 backdrop-blur-md border border-zinc-800 rounded-2xl p-4 flex flex-col items-center min-w-[110px] hover:bg-zinc-800/40 transition-colors">
                                        <span className="text-zinc-500 text-[10px] uppercase tracking-widest font-semibold mb-1 flex items-center gap-1.5"><Calendar size={12} className="text-blue-500" /> Active Days</span>
                                        <span className="text-2xl font-bold text-zinc-100">{stats.activeDays}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Rating Section (Conditional) */}
                            {stats.maxRating > 0 && (
                                <div className="mb-6 px-1 z-10 relative">
                                    <div className="text-xs text-zinc-500 uppercase tracking-widest font-semibold mb-2">Peak Rating</div>
                                    <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-blue-600 to-purple-600"
                                            style={{ width: `${Math.min((stats.maxRating / 3000) * 100, 100)}%` }} // Normalized to 3000 as "max"
                                        ></div>
                                    </div>
                                    <div className="flex justify-between mt-1 text-xs text-zinc-400 font-mono">
                                        <span>0</span>
                                        <span className="text-white font-bold">{stats.maxRating}</span>
                                        <span>3000+</span>
                                    </div>
                                </div>
                            )}

                            {/* Heatmap Section */}
                            <div className="bg-[#0f141c] rounded-2xl p-6 border border-zinc-800/80 relative z-10 overflow-x-auto shadow-inner">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Activity Graph</h3>
                                    <div className="flex items-center gap-3 text-[10px] text-zinc-500 font-medium">
                                        <span>LESS</span>
                                        <div className="flex gap-1">
                                            <div className="w-2.5 h-2.5 rounded-[2px] bg-[#161b22] border border-zinc-800"></div>
                                            <div className="w-2.5 h-2.5 rounded-[2px] bg-[#0e4429]"></div>
                                            <div className="w-2.5 h-2.5 rounded-[2px] bg-[#006d32]"></div>
                                            <div className="w-2.5 h-2.5 rounded-[2px] bg-[#26a641]"></div>
                                            <div className="w-2.5 h-2.5 rounded-[2px] bg-[#39d353]"></div>
                                        </div>
                                        <span>MORE</span>
                                    </div>
                                </div>

                                <div className="flex justify-center w-full min-w-[700px]">
                                    <ActivityCalendar
                                        data={data}
                                        blockSize={13}
                                        blockMargin={4}
                                        fontSize={11}
                                        renderColorLegend={() => <></>}
                                        showWeekdayLabels
                                        colorScheme="dark"
                                        theme={{
                                            dark: ['#161b22', '#0e4429', '#006d32', '#26a641', '#39d353'],
                                            light: ['#ebedf0', '#9be9a8', '#40c463', '#30a14e', '#216e39'],
                                        }}
                                        labels={{
                                            totalCount: '{{count}} submissions in the last year'
                                        }}
                                    />
                                </div>
                            </div>

                            <div className="mt-8 flex justify-between items-end text-zinc-600 z-10 relative">
                                <div className="text-[10px] font-mono tracking-tight">
                                    GENERATED BY <span className="text-zinc-400 font-bold">CODESYNC PRO</span>
                                </div>
                                <div className="text-[10px] font-mono border border-zinc-800 px-2 py-1 rounded bg-zinc-900/50">
                                    codesync.pro
                                </div>
                            </div>
                        </div>

                        {/* Floating Action Buttons */}
                        <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                            <Button onClick={downloadCard} size="icon" className="h-10 w-10 rounded-full shadow-xl bg-white text-black hover:bg-zinc-200 border-2 border-zinc-900 transition-transform hover:scale-105">
                                <Download size={18} />
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
