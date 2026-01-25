"use client";

import { useState, useEffect } from "react";
import {
    BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer,
    AreaChart, Area, PieChart, Pie, Cell, Legend
} from "recharts";
import { ActivityCalendar } from "react-activity-calendar";
import { getUserActivity, getCumulativeStats } from "@/app/actions";
import { ActivitySubmission } from "@/services/activity";
import CombinedHeatmap from "@/components/CombinedHeatmap";
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { UserStats } from "@/services/stats";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Trophy, Flame, Calendar, Award, CheckCircle2, RefreshCw } from "lucide-react";
import { PlatformLogo } from "@/components/Icons";
import { toast } from "sonner";

// Colors for charts
const COLORS = {
    easy: '#00af9b',
    medium: '#ffb800',
    hard: '#ff2d55',
    leetcode: '#ffa116',
    codeforces: '#1f8dd6',
    codechef: '#5b4638'
};

export default function PortfolioTracker() {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<ActivitySubmission[]>([]);
    const [stats, setStats] = useState<{
        totalSolved: number;
        totalContests: number;
        maxRating: number;
        details: UserStats[];
        easySolved: number;
        mediumSolved: number;
        hardSolved: number;
        ratingHistory: any[];
        topicStats: any[];
    } | null>(null);

    const [usernames, setUsernames] = useState({
        leetcode: "",
        codeforces: "",
        codechef: ""
    });

    const [activeDays, setActiveDays] = useState(0);
    const [streak, setStreak] = useState(0);

    useEffect(() => {
        const savedLC = localStorage.getItem("leetcode_user");
        const savedCF = localStorage.getItem("codeforces_user");
        const savedCC = localStorage.getItem("codechef_user");
        if (savedLC || savedCF || savedCC) {
            setUsernames({
                leetcode: savedLC || "",
                codeforces: savedCF || "",
                codechef: savedCC || ""
            });
        }
    }, []);

    const handleFetch = async () => {
        if (!usernames.leetcode && !usernames.codeforces && !usernames.codechef) return;

        setLoading(true);
        localStorage.setItem("leetcode_user", usernames.leetcode);
        localStorage.setItem("codeforces_user", usernames.codeforces);
        localStorage.setItem("codechef_user", usernames.codechef);

        try {
            const [activity, aggregateStats] = await Promise.all([
                getUserActivity(usernames.leetcode, usernames.codeforces, usernames.codechef),
                getCumulativeStats(usernames.leetcode, usernames.codeforces, usernames.codechef)
            ]);

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
            activity.forEach(item => {
                if (dateMap.has(item.date)) {
                    dateMap.set(item.date, item);
                }
            });

            const fullYearData = Array.from(dateMap.values()).sort((a, b) => a.date.localeCompare(b.date));

            setData(fullYearData);
            setStats(aggregateStats);
            setActiveDays(activity.length);

            // Calculate Streak
            let currentStreak = 0;
            if (activity.length > 0) {
                const sortedDateStrs = activity.map(a => a.date).sort();
                const lastDate = new Date(sortedDateStrs[sortedDateStrs.length - 1]);
                const todayDate = new Date();
                const diffHours = (todayDate.getTime() - lastDate.getTime()) / (1000 * 3600);

                // If last submission was today or yesterday
                if (diffHours < 48) {
                    currentStreak = 1;
                    // Check backwards
                    for (let i = sortedDateStrs.length - 2; i >= 0; i--) {
                        const curr = new Date(sortedDateStrs[i]);
                        const next = new Date(sortedDateStrs[i + 1]);
                        const diffDays = (next.getTime() - curr.getTime()) / (1000 * 3600 * 24);
                        if (diffDays <= 1.5) { // Allow slight irregularities
                            currentStreak++;
                        } else {
                            break;
                        }
                    }
                }
            }
            setStreak(currentStreak);

        } catch (err) {
            console.error(err);
            toast.error("Failed to fetch data");
        } finally {
            setLoading(false);
        }
    };

    const donutData = stats ? [
        { name: 'Easy', value: stats.easySolved, color: COLORS.easy },
        { name: 'Medium', value: stats.mediumSolved, color: COLORS.medium },
        { name: 'Hard', value: stats.hardSolved, color: COLORS.hard },
    ] : [];

    return (
        <div className="w-full space-y-6">
            {/* Search Bar / Header */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 bg-zinc-900/50 p-6 rounded-2xl border border-zinc-800 backdrop-blur-sm">
                <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                        <Label className="text-zinc-400 text-xs uppercase tracking-wider">LeetCode</Label>
                        <div className="relative">
                            <PlatformLogo platform="leetcode" className="absolute left-3 top-2.5 opacity-50" size={16} />
                            <Input
                                className="pl-9 bg-zinc-950/50 border-zinc-800 text-zinc-200"
                                placeholder="Username"
                                value={usernames.leetcode}
                                onChange={(e) => setUsernames({ ...usernames, leetcode: e.target.value })}
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label className="text-zinc-400 text-xs uppercase tracking-wider">CodeForces</Label>
                        <div className="relative">
                            <PlatformLogo platform="codeforces" className="absolute left-3 top-2.5 opacity-50" size={16} />
                            <Input
                                className="pl-9 bg-zinc-950/50 border-zinc-800 text-zinc-200"
                                placeholder="Handle"
                                value={usernames.codeforces}
                                onChange={(e) => setUsernames({ ...usernames, codeforces: e.target.value })}
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label className="text-zinc-400 text-xs uppercase tracking-wider">CodeChef</Label>
                        <div className="relative">
                            <PlatformLogo platform="codechef" className="absolute left-3 top-2.5 opacity-50" size={16} />
                            <Input
                                className="pl-9 bg-zinc-950/50 border-zinc-800 text-zinc-200"
                                placeholder="Handle"
                                value={usernames.codechef}
                                onChange={(e) => setUsernames({ ...usernames, codechef: e.target.value })}
                            />
                        </div>
                    </div>
                </div>
                <div className="flex items-end">
                    <Button onClick={handleFetch} disabled={loading} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold">
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                        Sync Portfolio
                    </Button>
                </div>
            </div>

            {stats && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column: Stats & Graphs */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Top Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <Card className="bg-zinc-900/40 border-zinc-800">
                                <CardContent className="p-6 flex flex-col items-center justify-center">
                                    <span className="text-zinc-500 text-xs uppercase font-bold tracking-wider mb-2">Total Questions</span>
                                    <span className="text-4xl font-black text-white">{stats.totalSolved}</span>
                                </CardContent>
                            </Card>
                            <Card className="bg-zinc-900/40 border-zinc-800">
                                <CardContent className="p-6 flex flex-col items-center justify-center">
                                    <span className="text-zinc-500 text-xs uppercase font-bold tracking-wider mb-2">Active Days</span>
                                    <span className="text-4xl font-black text-white">{activeDays}</span>
                                </CardContent>
                            </Card>
                            <Card className="bg-zinc-900/40 border-zinc-800">
                                <CardContent className="p-6 flex flex-col items-center justify-center">
                                    <span className="text-zinc-500 text-xs uppercase font-bold tracking-wider mb-2">Contests</span>
                                    <span className="text-4xl font-black text-white">{stats.totalContests}</span>
                                </CardContent>
                            </Card>
                            <Card className="bg-zinc-900/40 border-zinc-800">
                                <CardContent className="p-6 flex flex-col items-center justify-center">
                                    <span className="text-zinc-500 text-xs uppercase font-bold tracking-wider mb-2">Peak Rating</span>
                                    <span className="text-4xl font-black text-emerald-400">{stats.maxRating}</span>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Submissions Heatmap */}
                        <Card className="bg-zinc-900/40 border-zinc-800 overflow-hidden">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-zinc-400 uppercase tracking-wider">Submission Activity</CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 pt-0 overflow-x-auto">
                                <div className="min-w-[600px] flex justify-center">
                                    <ActivityCalendar
                                        data={data}
                                        theme={{
                                            dark: ['#2d2d2d', '#004d16', '#007622', '#00a02d', '#2db55d'],
                                            light: ['#ebedf0', '#c6e48b', '#7bc96f', '#239a3b', '#196127']
                                        }}
                                        colorScheme="dark"
                                        blockSize={13}
                                        blockMargin={3}
                                        fontSize={12}
                                        blockRadius={2}
                                        showWeekdayLabels
                                        renderColorLegend={() => <></>}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Rating Graph */}
                        <Card className="bg-zinc-900/40 border-zinc-800">
                            <CardHeader>
                                <CardTitle className="text-sm font-medium text-zinc-400 uppercase tracking-wider">Rating History</CardTitle>
                            </CardHeader>
                            <CardContent className="h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={stats.ratingHistory}>
                                        <defs>
                                            <linearGradient id="colorRating" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#8884d8" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <XAxis dataKey="date" hide />
                                        <YAxis domain={['auto', 'auto']} hide />
                                        <RechartsTooltip
                                            contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px' }}
                                            itemStyle={{ color: '#fff' }}
                                        />
                                        <Area type="monotone" dataKey="rating" stroke="#8884d8" fillOpacity={1} fill="url(#colorRating)" strokeWidth={2} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        {/* Topic Analysis */}
                        <Card className="bg-zinc-900/40 border-zinc-800">
                            <CardHeader>
                                <CardTitle className="text-sm font-medium text-zinc-400 uppercase tracking-wider">Top Weak Topics</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {stats.topicStats.slice(0, 5).map((topic, i) => (
                                    <div key={i} className="space-y-1">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-zinc-300">{topic.name}</span>
                                            <span className="text-zinc-500">{topic.count}</span>
                                        </div>
                                        <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
                                            <div className="h-full bg-blue-600 rounded-full" style={{ width: `${Math.min((topic.count / stats.totalSolved) * 100 * 5, 100)}%` }}></div>
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column: Breakdown */}
                    <div className="space-y-6">
                        {/* Problems Solved Donut */}
                        <Card className="bg-zinc-900/40 border-zinc-800">
                            <CardHeader>
                                <CardTitle className="text-sm font-medium text-zinc-400 uppercase tracking-wider text-center">Problem Distribution</CardTitle>
                            </CardHeader>
                            <CardContent className="flex flex-col items-center">
                                <div className="h-[200px] w-full relative">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={donutData}
                                                innerRadius={60}
                                                outerRadius={80}
                                                paddingAngle={5}
                                                dataKey="value"
                                            >
                                                {donutData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                                                ))}
                                            </Pie>
                                            <RechartsTooltip />
                                        </PieChart>
                                    </ResponsiveContainer>
                                    <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
                                        <span className="text-3xl font-bold text-white">{stats.totalSolved}</span>
                                        <span className="text-xs text-zinc-500 uppercase">Solved</span>
                                    </div>
                                </div>
                                <div className="w-full space-y-3 mt-4">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#00af9b]"></span> Easy</span>
                                        <span className="font-bold text-zinc-200">{stats.easySolved}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#ffb800]"></span> Medium</span>
                                        <span className="font-bold text-zinc-200">{stats.mediumSolved}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#ff2d55]"></span> Hard</span>
                                        <span className="font-bold text-zinc-200">{stats.hardSolved}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Platform Ratings */}
                        <Card className="bg-zinc-900/40 border-zinc-800">
                            <CardHeader>
                                <CardTitle className="text-sm font-medium text-zinc-400 uppercase tracking-wider">Contest Ratings</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {stats.details.map((platformStat, i) => (
                                    platformStat.contestRating > 0 && (
                                        <div key={i} className="flex items-center justify-between p-3 bg-zinc-950/50 rounded-xl border border-zinc-800">
                                            <div className="flex items-center gap-3">
                                                <PlatformLogo platform={platformStat.platform} size={24} />
                                                <div>
                                                    <div className="text-sm font-bold text-zinc-200 capitalize">{platformStat.platform}</div>
                                                    <div className="text-xs text-zinc-500">{platformStat.contestCount} contests</div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-xl font-bold text-white">{platformStat.contestRating}</div>
                                                <div className="text-[10px] text-zinc-500 uppercase tracking-wider">Max Rating</div>
                                            </div>
                                        </div>
                                    )
                                ))}
                                {stats.details.every(s => s.contestRating === 0) && (
                                    <div className="text-center text-zinc-500 text-sm py-4">No contest data available</div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Get Card Button */}
                        <Card className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 border-blue-500/30">
                            <CardContent className="p-6 text-center space-y-4">
                                <Award className="w-12 h-12 text-blue-400 mx-auto" />
                                <div>
                                    <h3 className="text-lg font-bold text-white">Share Your Stats</h3>
                                    <p className="text-sm text-zinc-400">Download your premium CodeSync card.</p>
                                </div>
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button variant="outline" className="w-full border-blue-500/50 text-blue-400 hover:bg-blue-500/10">
                                            Get Card
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-5xl bg-[#0d1117] border-zinc-800 p-8">
                                        <DialogHeader>
                                            <DialogTitle className="text-xl font-bold text-zinc-100">Your Portfolio Card</DialogTitle>
                                            <DialogDescription className="text-zinc-500">
                                                Share your achievements with the world. Click the download button to save.
                                            </DialogDescription>
                                        </DialogHeader>
                                        <CombinedHeatmap
                                            preloadedData={data}
                                            preloadedStats={{
                                                totalSolved: stats.totalSolved,
                                                totalContests: stats.totalContests,
                                                maxRating: stats.maxRating
                                            }}
                                            preloadedUsernames={usernames}
                                        />
                                    </DialogContent>
                                </Dialog>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            )}

            {!stats && !loading && (
                <div className="text-center py-20">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-zinc-900 mb-4">
                        <Flame className="w-8 h-8 text-zinc-600" />
                    </div>
                    <h3 className="text-xl font-bold text-zinc-200">No Portfolio Loaded</h3>
                    <p className="text-zinc-500 mt-2">Enter your usernames above and sync to view your tracker.</p>
                </div>
            )}
        </div>
    );
}
