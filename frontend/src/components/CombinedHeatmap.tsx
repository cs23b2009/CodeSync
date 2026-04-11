"use client";

import { useState, useEffect, useRef } from "react";
import { ActivityCalendar } from "react-activity-calendar";
import { getUserActivity, getCumulativeStats } from "@/app/actions";
import { ActivitySubmission } from "@/services/activity";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTheme } from "next-themes";
import { Loader2, Download, Trophy, Flame, Calendar, Award, Star, CheckCircle2, TrendingUp, Zap, X } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

import { toast } from "sonner";
import { PlatformLogo } from "@/components/Icons";

interface CombinedHeatmapProps {
    preloadedData?: ActivitySubmission[];
    preloadedStats?: {
        totalSolved: number;
        totalContests: number;
        maxRating: number;
        details?: any[];
        easySolved?: number;
        mediumSolved?: number;
        hardSolved?: number;
        ratingHistory?: any[];
    };
    preloadedUsernames?: {
        leetcode: string;
        codeforces: string;
        codechef: string;
    };
}

// --- Helpers for Ranks & Badges ---

function getLeetCodeRank(rating: number) {
    if (rating >= 2150) return { name: "Guardian", color: "text-orange-400", badge: "🛡️" };
    if (rating >= 1850) return { name: "Knight", color: "text-purple-400", badge: "⚔️" };
    if (rating >= 1500) return { name: "Warrior", color: "text-blue-400", badge: "🤺" };
    return { name: "Newbie", color: "text-gray-400", badge: "🐣" };
}

function getCodeChefStars(rating: number) {
    if (rating >= 2500) return { stars: 7, color: "text-red-600" };
    if (rating >= 2200) return { stars: 6, color: "text-orange-500" };
    if (rating >= 2000) return { stars: 5, color: "text-yellow-500" };
    if (rating >= 1800) return { stars: 4, color: "text-purple-500" };
    if (rating >= 1600) return { stars: 3, color: "text-blue-500" };
    if (rating >= 1400) return { stars: 2, color: "text-green-500" };
    return { stars: 1, color: "text-zinc-500" };
}

function getCodeForcesRank(rating: number) {
    if (rating >= 2400) return { name: "Grandmaster", color: "text-red-500" };
    if (rating >= 2100) return { name: "Master", color: "text-orange-400" };
    if (rating >= 1900) return { name: "Candidate Master", color: "text-purple-400" };
    if (rating >= 1600) return { name: "Expert", color: "text-blue-400" };
    if (rating >= 1400) return { name: "Specialist", color: "text-cyan-400" };
    if (rating >= 1200) return { name: "Pupil", color: "text-green-400" };
    return { name: "Newbie", color: "text-zinc-400" };
}

const DONUT_COLORS = {
    easy: '#00af9b',
    medium: '#ffb800',
    hard: '#ff2d55'
};

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
        maxRating: 0,
        details: [] as any[],
        easySolved: 0,
        mediumSolved: 0,
        hardSolved: 0,
        ratingHistory: [] as any[]
    });
    const [showModal, setShowModal] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const exportRef = useRef<HTMLDivElement>(null);

    const cardRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (preloadedData && preloadedStats && preloadedUsernames) {
            setLeetcode(preloadedUsernames.leetcode);
            setCodeforces(preloadedUsernames.codeforces);
            setCodechef(preloadedUsernames.codechef);
            setData(preloadedData);
            // @ts-ignore
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

    const calculateStats = (submissions: ActivitySubmission[], cumulativeStats?: any) => {
        if (!submissions.length && !cumulativeStats) return;

        const heatmapCount = submissions.reduce((acc, curr) => acc + curr.count, 0);
        const totalSolved = cumulativeStats?.totalSolved || heatmapCount;
        const totalContests = cumulativeStats?.totalContests || 0;
        const maxRating = cumulativeStats?.maxRating || 0;
        const details = cumulativeStats?.details || [];
        const easySolved = cumulativeStats?.easySolved || 0;
        const mediumSolved = cumulativeStats?.mediumSolved || 0;
        const hardSolved = cumulativeStats?.hardSolved || 0;
        const ratingHistory = cumulativeStats?.ratingHistory || [];

        const activeSubmissions = submissions.filter(s => s.count > 0);
        const activeDays = activeSubmissions.length;

        let maxStreak = 0;
        let currentStreak = 0;
        let tempStreak = 0;
        const sorted = [...activeSubmissions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        for (let i = 0; i < sorted.length; i++) {
            if (i === 0) tempStreak = 1;
            else {
                const prev = new Date(sorted[i - 1].date);
                const curr = new Date(sorted[i].date);
                const diffTime = Math.abs(curr.getTime() - prev.getTime());
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                if (diffDays === 1) tempStreak++;
                else tempStreak = 1;
            }
            maxStreak = Math.max(maxStreak, tempStreak);
        }

        if (sorted.length > 0) {
            const last = sorted[sorted.length - 1];
            const today = new Date();
            const lastDate = new Date(last.date);
            const diff = (today.getTime() - lastDate.getTime()) / (1000 * 3600 * 24);
            if (diff <= 2) {
                currentStreak = 1;
                for (let i = sorted.length - 2; i >= 0; i--) {
                    const prev = new Date(sorted[i].date);
                    const curr = new Date(sorted[i + 1].date);
                    const d = (curr.getTime() - prev.getTime()) / (1000 * 3600 * 24);
                    if (d <= 1.5) currentStreak++;
                    else break;
                }
            } else currentStreak = 0;
        }

        setStats({
            totalSolved, activeDays, maxStreak, currentStreak, totalContests, maxRating, details,
            easySolved, mediumSolved, hardSolved, ratingHistory
        });
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

            // Reconstruct full year empty map
            const today = new Date();
            const oneYearAgo = new Date();
            oneYearAgo.setFullYear(today.getFullYear() - 1);
            const dateMap = new Map<string, ActivitySubmission>();
            for (let d = new Date(oneYearAgo); d <= today; d.setDate(d.getDate() + 1)) {
                const dateStr = d.toISOString().split('T')[0];
                dateMap.set(dateStr, { date: dateStr, count: 0, level: 0 });
            }
            activityResult.forEach(item => {
                if (dateMap.has(item.date)) dateMap.set(item.date, item);
            });
            const fullYearData = Array.from(dateMap.values()).sort((a, b) => a.date.localeCompare(b.date));

            setData(fullYearData);
            calculateStats(activityResult, statsResult);
            setShowModal(true); // Open Export Mode
        } catch (error) {
            console.error(error);
            toast.error("Failed to fetch activity data");
        } finally {
            setLoading(false);
        }
    };

    const downloadCard = async () => {
        setIsExporting(true);
        // Wait for render cycle and layout stabilization
        await new Promise(resolve => setTimeout(resolve, 500));

        if (!exportRef.current) {
            setIsExporting(false);
            toast.error("Export element not found");
            return;
        }

        try {
            const { toPng } = await import('html-to-image');
            const dataUrl = await toPng(exportRef.current, {
                cacheBust: true,
                backgroundColor: '#ffffff',
                pixelRatio: 2, 
                width: 1080,
                height: 1350,
                style: {
                    transform: 'none', 
                    margin: '0',
                    padding: '3.5rem' 
                }
            });
            const link = document.createElement("a");
            link.download = `codesync-poster-${new Date().toISOString().split('T')[0]}.png`;
            link.href = dataUrl;
            link.click();
            toast.success("Poster generated successfully!");
        } catch (err) {
            console.error(err);
            toast.error("Failed to generate image.");
        } finally {
            setIsExporting(false);
        }
    };

    // Platform Stats
    const lcStat = stats.details.find(d => d.platform === 'leetcode');
    const cfStat = stats.details.find(d => d.platform === 'codeforces');
    const ccStat = stats.details.find(d => d.platform === 'codechef');

    const lcRank = getLeetCodeRank(lcStat?.contestRating || 0);
    const cfRank = getCodeForcesRank(cfStat?.contestRating || 0);
    const ccStars = getCodeChefStars(ccStat?.contestRating || 0);

    const donutData = [
        { name: 'Easy', value: stats.easySolved, color: DONUT_COLORS.easy },
        { name: 'Medium', value: stats.mediumSolved, color: DONUT_COLORS.medium },
        { name: 'Hard', value: stats.hardSolved, color: DONUT_COLORS.hard },
    ];

    // Reusable Card Content Renderer
    const renderCard = (ref: any) => (
        <div
            ref={ref}
            className="relative w-[1080px] h-[1350px] bg-white p-14 rounded-[48px] shadow-2xl overflow-hidden border border-gray-100 flex flex-col justify-between ml-auto mr-auto"
        >
            {/* Decorative Background */}
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-50/50 rounded-full blur-[150px] pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-50/50 rounded-full blur-[150px] pointer-events-none"></div>
            <div className="absolute inset-0 bg-grid-cream opacity-50 pointer-events-none"></div>

            <div className="relative z-10 flex flex-col gap-8 flex-grow">

                {/* Header Layout: Top Row (Solved & Days) */}
                <div className="grid grid-cols-2 gap-8 h-[360px]">
                    {/* Total Questions Hero */}
                    <div className="bg-white/80 backdrop-blur-sm border border-gray-100 rounded-[40px] p-10 relative overflow-hidden flex flex-col justify-between group shadow-sm">
                        <div className="absolute right-8 top-8 text-gray-100 group-hover:text-gray-200 transition-colors duration-500">
                            <CheckCircle2 size={100} strokeWidth={1} />
                        </div>
                        <div>
                            <h3 className="text-gray-400 text-sm font-bold uppercase tracking-[0.3em] mb-4">Total Solved</h3>
                            <div className="text-9xl font-black bg-gradient-to-br from-gray-900 via-gray-700 to-gray-500 bg-clip-text text-transparent leading-none -ml-1">
                                {stats.totalSolved}
                            </div>
                        </div>
                        <div className="flex items-center gap-3 text-lg font-medium text-blue-600 bg-blue-50 px-4 py-2 rounded-full w-fit border border-blue-100">
                            <Trophy size={20} />
                            TOP {(100 - (stats.totalSolved > 500 ? 90 : stats.totalSolved / 10)).toFixed(0)}% GLOBAL
                        </div>
                    </div>

                    {/* Active Days */}
                    <div className="bg-white/80 backdrop-blur-sm border border-gray-100 rounded-[40px] p-10 relative overflow-hidden flex flex-col justify-between group shadow-sm">
                        <div className="absolute right-8 top-8 text-gray-100 group-hover:text-gray-200 transition-colors duration-500">
                            <Calendar size={100} strokeWidth={1} />
                        </div>
                        <div>
                            <h3 className="text-gray-400 text-sm font-bold uppercase tracking-[0.3em] mb-4">Active Days</h3>
                            <div className="text-9xl font-black text-gray-900 leading-none -ml-1">
                                {stats.activeDays}
                            </div>
                        </div>
                        <div className="flex items-center gap-3 text-lg font-medium text-amber-600 bg-amber-50 px-4 py-2 rounded-full w-fit border border-amber-100">
                            <Flame size={20} />
                            {stats.maxStreak} DAY MAX STREAK
                        </div>
                    </div>
                </div>

                {/* Bottom Grid: Stats & Rankings */}
                <div className="grid grid-cols-3 gap-8 flex-grow">

                    {/* LEFT COLUMN (Span 2) */}
                    <div className="col-span-2 flex flex-col gap-8 h-full">

                        {/* Total Contests Strip */}
                        <div className="bg-white/80 backdrop-blur-sm border border-gray-100 rounded-[40px] p-8 flex items-center justify-between h-[180px] px-12 relative overflow-hidden shadow-sm">
                            <div className="absolute right-0 top-0 h-full w-32 bg-gradient-to-l from-white/80 to-transparent"></div>
                            <div className="flex flex-col justify-center">
                                <h3 className="text-gray-400 text-sm font-bold uppercase tracking-[0.3em] mb-2">Total Contests</h3>
                                <div className="text-7xl font-black text-gray-900">{stats.totalContests}</div>
                            </div>
                            <div className="flex items-center gap-10 z-10">
                                <div className="flex flex-col items-center gap-2">
                                    <PlatformLogo platform="leetcode" size={32} />
                                    <span className="text-2xl font-bold text-gray-700">{lcStat?.contestCount || 0}</span>
                                </div>
                                <div className="w-px h-12 bg-gray-100"></div>
                                <div className="flex flex-col items-center gap-2">
                                    <PlatformLogo platform="codechef" size={32} />
                                    <span className="text-2xl font-bold text-gray-700">{ccStat?.contestCount || 0}</span>
                                </div>
                                <div className="w-px h-12 bg-gray-100"></div>
                                <div className="flex flex-col items-center gap-2">
                                    <div className="text-yellow-600"><PlatformLogo platform="codeforces" size={32} /></div>
                                    <span className="text-2xl font-bold text-gray-700">{cfStat?.contestCount || 0}</span>
                                </div>
                            </div>
                        </div>

                        {/* Problem Distribution (Expanded) */}
                        <div className="bg-white/80 backdrop-blur-sm border border-gray-100 rounded-[40px] p-10 flex-grow flex flex-col justify-center relative overflow-hidden shadow-sm">
                            <h3 className="absolute top-10 left-10 text-gray-400 text-sm font-bold uppercase tracking-[0.3em]">Problem Distribution</h3>

                            <div className="flex items-center justify-between px-6 pt-8">
                                {/* Donut Chart */}
                                <div className="h-72 w-72 relative">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={donutData}
                                                innerRadius={90}
                                                outerRadius={120}
                                                paddingAngle={5}
                                                dataKey="value"
                                                stroke="none"
                                                startAngle={90}
                                                endAngle={-450}
                                            >
                                                {donutData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                        </PieChart>
                                    </ResponsiveContainer>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                        <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">Solved</span>
                                        <span className="text-5xl font-black text-gray-900">{stats.totalSolved}</span>
                                    </div>
                                </div>

                                {/* Breakdown Stats */}
                                <div className="flex flex-col gap-5 w-[320px]">
                                    <div className="bg-gray-50/50 rounded-2xl p-5 border border-gray-100 flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-2 h-10 rounded-full bg-[#00af9b] shadow-[0_0_15px_rgba(0,175,155,0.2)]"></div>
                                            <div>
                                                <div className="text-gray-900 font-bold text-2xl">Easy</div>
                                                <div className="text-gray-500 text-sm font-medium">Fundamentals</div>
                                            </div>
                                        </div>
                                        <div className="text-3xl font-black text-gray-900">{stats.easySolved}</div>
                                    </div>
                                    <div className="bg-gray-50/50 rounded-2xl p-5 border border-gray-100 flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-2 h-10 rounded-full bg-[#ffb800] shadow-[0_0_15px_rgba(255,184,0,0.2)]"></div>
                                            <div>
                                                <div className="text-gray-900 font-bold text-2xl">Medium</div>
                                                <div className="text-gray-500 text-sm font-medium">Algorithms</div>
                                            </div>
                                        </div>
                                        <div className="text-3xl font-black text-gray-900">{stats.mediumSolved}</div>
                                    </div>
                                    <div className="bg-gray-50/50 rounded-2xl p-5 border border-gray-100 flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-2 h-10 rounded-full bg-[#ff2d55] shadow-[0_0_15px_rgba(255,45,85,0.2)]"></div>
                                            <div>
                                                <div className="text-gray-900 font-bold text-2xl">Hard</div>
                                                <div className="text-gray-500 text-sm font-medium">Advanced</div>
                                            </div>
                                        </div>
                                        <div className="text-3xl font-black text-gray-900">{stats.hardSolved}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN (Rankings) */}
                    <div className="bg-white/80 backdrop-blur-sm border border-gray-100 rounded-[40px] p-10 flex flex-col h-full relative overflow-hidden shadow-sm">
                        <div className="absolute top-0 right-0 p-40 bg-blue-50/20 blur-[100px] rounded-full pointer-events-none -translate-y-1/2 translate-x-1/2"></div>
                        <h3 className="text-gray-400 text-sm font-bold uppercase tracking-[0.3em] mb-12 text-center z-10">Global Rankings</h3>

                        <div className="flex flex-col gap-6 flex-grow z-10">
                            {/* LeetCode */}
                            <div className="bg-white border border-gray-100 rounded-3xl p-6 flex flex-col gap-4 shadow-sm">
                                <div className="flex items-center gap-4">
                                    <div className="bg-gray-50 p-3 rounded-xl"><PlatformLogo platform="leetcode" size={24} /></div>
                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">LeetCode</span>
                                </div>
                                <div className="flex items-end justify-between">
                                    <div className="text-4xl font-black text-gray-900">{lcStat?.contestRating || "-"}</div>
                                    <span className={`px-4 py-1.5 rounded-full bg-gray-50 border border-gray-100 text-sm font-bold ${lcRank.color} mb-1 shadow-sm`}>
                                        {lcStat?.contestRating ? lcRank.name : "Unrated"}
                                    </span>
                                </div>
                            </div>

                            {/* CodeChef */}
                            <div className="bg-white border border-gray-100 rounded-3xl p-6 flex flex-col gap-4 shadow-sm">
                                <div className="flex items-center gap-4">
                                    <div className="bg-gray-50 p-3 rounded-xl"><PlatformLogo platform="codechef" size={24} /></div>
                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">CodeChef</span>
                                </div>
                                <div className="flex items-end justify-between">
                                    <div className="text-4xl font-black text-gray-900">{ccStat?.contestRating || "-"}</div>
                                    <span className={`px-4 py-1.5 rounded-full bg-gray-50 border border-gray-100 text-sm font-bold ${ccStars.color} mb-1 flex items-center gap-2 shadow-sm`}>
                                        {ccStat?.contestRating ? `${ccStars.stars} STAR` : "Unrated"}
                                        {ccStat?.contestRating > 0 && <Star size={14} fill="currentColor" />}
                                    </span>
                                </div>
                            </div>

                            {/* CodeForces */}
                            <div className="bg-white border border-gray-100 rounded-3xl p-6 flex flex-col gap-4 shadow-sm">
                                <div className="flex items-center gap-4">
                                    <div className="bg-gray-50 p-3 rounded-xl text-yellow-600"><PlatformLogo platform="codeforces" size={24} /></div>
                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">CodeForces</span>
                                </div>
                                <div className="flex items-end justify-between">
                                    <div className="text-4xl font-black text-gray-900">{cfStat?.contestRating || "-"}</div>
                                    <span className={`px-4 py-1.5 rounded-full bg-gray-50 border border-gray-100 text-sm font-bold ${cfRank.color} mb-1 shadow-sm`}>
                                        {cfStat?.contestRating ? cfRank.name : "Unrated"}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer Brand */}
            <div className="flex justify-between items-center text-gray-400 border-t border-gray-100 pt-8 mt-2">
                <div className="text-sm font-mono tracking-tight">
                    GENERATED BY <span className="text-gray-900 font-bold uppercase">CodeSync</span>
                </div>
                <div className="flex items-center gap-3 text-sm font-mono bg-white border border-gray-100 px-5 py-2 rounded-full">
                    <CheckCircle2 size={16} className="text-blue-500" />
                    codesync.app
                </div>
            </div>
        </div>
    );

    return (
        <div className="w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Main Content: Either Inputs OR The Card */}
            {data.length > 0 ? (
                <div className="flex flex-col items-center animate-in fade-in zoom-in duration-500 w-full">
                    {/* Embedded Card View (Even Smaller Preview: 0.35x) */}
                    <div className="relative mx-auto mt-4" style={{ width: 378, height: 475 }}>
                        <div style={{ transform: 'scale(0.35)', transformOrigin: 'top left' }}>
                            {renderCard(cardRef)}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-center mt-6 pb-4">
                        <Button onClick={downloadCard} className="bg-white text-black hover:bg-gray-200 px-8 w-full max-w-[300px]">
                            <Download size={18} className="mr-2" /> Download Poster
                        </Button>
                    </div>
                </div>
            ) : (
                /* Input Section (Only if no data) */
                <div className="grid gap-4 md:grid-cols-4 items-end bg-white/50 p-6 rounded-xl border border-gray-100 backdrop-blur-sm">
                    <div className="grid gap-2">
                        <Label className="text-gray-500">LeetCode</Label>
                        <Input value={leetcode} onChange={(e) => setLeetcode(e.target.value)} placeholder="Username" className="bg-white border-gray-200 text-gray-900 focus:ring-blue-500" />
                    </div>
                    <div className="grid gap-2">
                        <Label className="text-gray-500">CodeForces</Label>
                        <Input value={codeforces} onChange={(e) => setCodeforces(e.target.value)} placeholder="Handle" className="bg-white border-gray-200 text-gray-900 focus:ring-blue-500" />
                    </div>
                    <div className="grid gap-2">
                        <Label className="text-gray-500">CodeChef</Label>
                        <Input value={codechef} onChange={(e) => setCodechef(e.target.value)} placeholder="Handle" className="bg-white border-gray-200 text-gray-900 focus:ring-blue-500" />
                    </div>
                    <Button onClick={handleFetch} disabled={loading} className="bg-blue-600 text-white hover:bg-blue-700">
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Sync Stats
                    </Button>
                </div>
            )}

            {/* EXPORT OVERLAY (The only one that gets captured) */}
            {isExporting && (
                <div className="fixed inset-0 z-[9999] bg-white flex items-center justify-center">
                    <div className="flex flex-col items-center gap-4">
                        <Loader2 className="animate-spin text-blue-600 mb-4" size={48} />
                        <span className="text-gray-500 font-mono">Generating poster...</span>
                        {/* Hidden Export Node (Mounted but centered and clean) */}
                        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-100 pointer-events-none">
                            {renderCard(exportRef)}
                        </div>
                    </div>
                </div>
            )}

            {/* PREVIEW MODAL (Clean Lightbox Mode) */}
            {data.length > 0 && showModal && !isExporting && (
                <div className="fixed inset-0 z-[100] bg-white/95 backdrop-blur-md flex items-center justify-center animate-in fade-in duration-300 overflow-y-auto no-scrollbar">
                    <style>{`.no-scrollbar::-webkit-scrollbar { display: none; } .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }`}</style>

                    {/* Close Button (Top Right) */}
                    <div className="fixed top-8 right-8 z-[120]">
                        <Button
                            onClick={() => setShowModal(false)}
                            size="icon"
                            variant="ghost"
                            className="text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-full h-12 w-12 transition-colors"
                        >
                            <X size={32} />
                        </Button>
                    </div>

                    {/* Card Preview (Centered, Scaled to Fit) */}
                    {/* Width/Height Wrapper ensures scrollable area handles the scale properly */}
                    <div className="min-h-full w-full flex items-center justify-center p-10">
                        <div style={{ transform: 'scale(0.55)' }} className="w-[1080px] h-[1350px] flex-shrink-0 select-none shadow-2xl shadow-gray-200 origin-center">
                            {renderCard(cardRef)}
                        </div>
                    </div>

                    {/* Download Action (Bottom Center) */}
                    <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[120]">
                        <Button
                            onClick={downloadCard}
                            className="bg-blue-600 text-white hover:bg-blue-700 rounded-full h-14 px-8 font-bold text-lg shadow-lg transition-all hover:scale-105 active:scale-95"
                        >
                            <Download size={20} className="mr-2" />
                            Download Poster
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
