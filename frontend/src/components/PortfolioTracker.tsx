"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
import { Loader2, Trophy, Flame, Calendar, Award, CheckCircle2, RefreshCw, Brain } from "lucide-react";
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
    const router = useRouter();
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
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 bg-white/50 p-6 rounded-2xl border border-gray-100 backdrop-blur-sm shadow-sm">
                <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                        <Label className="text-gray-400 text-xs uppercase tracking-wider font-semibold">LeetCode</Label>
                        <div className="relative">
                            <PlatformLogo platform="leetcode" className="absolute left-3 top-2.5 opacity-40" size={16} />
                            <Input
                                className="pl-9 bg-white border-gray-200 text-gray-800"
                                placeholder="Username"
                                value={usernames.leetcode}
                                onChange={(e) => setUsernames({ ...usernames, leetcode: e.target.value })}
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label className="text-gray-400 text-xs uppercase tracking-wider font-semibold">CodeForces</Label>
                        <div className="relative">
                            <PlatformLogo platform="codeforces" className="absolute left-3 top-2.5 opacity-40" size={16} />
                            <Input
                                className="pl-9 bg-white border-gray-200 text-gray-800"
                                placeholder="Handle"
                                value={usernames.codeforces}
                                onChange={(e) => setUsernames({ ...usernames, codeforces: e.target.value })}
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label className="text-gray-400 text-xs uppercase tracking-wider font-semibold">CodeChef</Label>
                        <div className="relative">
                            <PlatformLogo platform="codechef" className="absolute left-3 top-2.5 opacity-40" size={16} />
                            <Input
                                className="pl-9 bg-white border-gray-200 text-gray-800"
                                placeholder="Handle"
                                value={usernames.codechef}
                                onChange={(e) => setUsernames({ ...usernames, codechef: e.target.value })}
                            />
                        </div>
                    </div>
                </div>
                <div className="flex items-end">
                    <Button onClick={handleFetch} disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold">
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                        Sync Stats
                    </Button>
                </div>
            </div>

            {stats && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column: Stats & Graphs */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Top Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <Card className="bg-white border-gray-100 shadow-sm">
                                <CardContent className="p-6 flex flex-col items-center justify-center">
                                    <span className="text-gray-400 text-xs uppercase font-bold tracking-wider mb-2">Total Questions</span>
                                    <span className="text-4xl font-black text-gray-900">{stats.totalSolved}</span>
                                </CardContent>
                            </Card>
                            <Card className="bg-white border-gray-100 shadow-sm">
                                <CardContent className="p-6 flex flex-col items-center justify-center">
                                    <span className="text-gray-400 text-xs uppercase font-bold tracking-wider mb-2">Active Days</span>
                                    <span className="text-4xl font-black text-gray-900">{activeDays}</span>
                                </CardContent>
                            </Card>
                            <Card className="bg-white border-gray-100 shadow-sm">
                                <CardContent className="p-6 flex flex-col items-center justify-center">
                                    <span className="text-gray-400 text-xs uppercase font-bold tracking-wider mb-2">Contests</span>
                                    <span className="text-4xl font-black text-gray-900">{stats.totalContests}</span>
                                </CardContent>
                            </Card>
                            <Card className="bg-white border-gray-100 shadow-sm">
                                <CardContent className="p-6 flex flex-col items-center justify-center">
                                    <span className="text-gray-400 text-xs uppercase font-bold tracking-wider mb-2">Peak Rating</span>
                                    <span className="text-4xl font-black text-blue-600">{stats.maxRating}</span>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Submissions Heatmap */}
                        <Card className="bg-white border-gray-100 shadow-sm overflow-hidden">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-gray-400 uppercase tracking-wider">Submission Activity</CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 pt-0 overflow-x-auto">
                                <div className="min-w-[600px] flex justify-center">
                                    <ActivityCalendar
                                        data={data}
                                        theme={{
                                            dark: ['#f0f0f0', '#004d16', '#007622', '#00a02d', '#2db55d'],
                                            light: ['#f0f0f0', '#dbeafe', '#93c5fd', '#3b82f6', '#1d4ed8']
                                        }}
                                        colorScheme="light"
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
                        <Card className="bg-white border-gray-100 shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-sm font-medium text-gray-400 uppercase tracking-wider">Rating History</CardTitle>
                            </CardHeader>
                            <CardContent className="h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={stats.ratingHistory}>
                                        <defs>
                                            <linearGradient id="colorRating" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <XAxis dataKey="date" hide />
                                        <YAxis domain={['auto', 'auto']} hide />
                                        <RechartsTooltip
                                            contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                                            itemStyle={{ color: '#111827' }}
                                        />
                                        <Area type="monotone" dataKey="rating" stroke="#3b82f6" fillOpacity={1} fill="url(#colorRating)" strokeWidth={2} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        {/* Topic Analysis */}
                        <Card className="bg-white border-gray-100 shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-sm font-medium text-gray-400 uppercase tracking-wider">Top Weak Topics</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {stats.topicStats.slice(0, 5).map((topic, i) => (
                                    <div key={i} className="space-y-1">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-700 font-medium">{topic.name}</span>
                                            <span className="text-gray-400">{topic.count}</span>
                                        </div>
                                        <div className="h-2 w-full bg-gray-50 rounded-full overflow-hidden">
                                            <div className="h-full bg-blue-500 rounded-full" style={{ width: `${Math.min((topic.count / stats.totalSolved) * 100 * 5, 100)}%` }}></div>
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column: Breakdown */}
                    <div className="space-y-6">
                        {/* Problems Solved Donut */}
                        <Card className="bg-white border-gray-100 shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-sm font-medium text-gray-400 uppercase tracking-wider text-center">Problem Distribution</CardTitle>
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
                                                stroke="none"
                                            >
                                                {donutData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                                                ))}
                                            </Pie>
                                            <RechartsTooltip />
                                        </PieChart>
                                    </ResponsiveContainer>
                                    <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
                                        <span className="text-3xl font-bold text-gray-900">{stats.totalSolved}</span>
                                        <span className="text-xs text-gray-400 uppercase font-semibold">Solved</span>
                                    </div>
                                </div>
                                <div className="w-full space-y-3 mt-4">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="flex items-center gap-2 font-medium text-gray-600"><span className="w-2 h-2 rounded-full bg-[#00af9b]"></span> Easy</span>
                                        <span className="font-bold text-gray-900">{stats.easySolved}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="flex items-center gap-2 font-medium text-gray-600"><span className="w-2 h-2 rounded-full bg-[#ffb800]"></span> Medium</span>
                                        <span className="font-bold text-gray-900">{stats.mediumSolved}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="flex items-center gap-2 font-medium text-gray-600"><span className="w-2 h-2 rounded-full bg-[#ff2d55]"></span> Hard</span>
                                        <span className="font-bold text-gray-900">{stats.hardSolved}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Platform Ratings */}
                        <Card className="bg-white border-gray-100 shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-sm font-medium text-gray-400 uppercase tracking-wider">Contest Ratings</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {stats.details.map((platformStat, i) => (
                                    platformStat.contestRating > 0 && (
                                        <div key={i} className="flex items-center justify-between p-4 bg-gray-50/50 rounded-xl border border-gray-100 group hover:border-blue-200 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <PlatformLogo platform={platformStat.platform} size={24} />
                                                <div>
                                                    <div className="text-sm font-bold text-gray-900 capitalize">{platformStat.platform}</div>
                                                    <div className="text-xs text-gray-500">{platformStat.contestCount} contests</div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-xl font-black text-gray-900 group-hover:text-blue-600 transition-colors">{platformStat.contestRating}</div>
                                                <div className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">Max Rating</div>
                                            </div>
                                        </div>
                                    )
                                ))}
                                {stats.details.every(s => s.contestRating === 0) && (
                                    <div className="text-center text-gray-400 text-sm py-4">No contest data available</div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Get Card Button */}
                        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100 shadow-sm relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-100/50 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl group-hover:scale-150 transition-transform duration-700" />
                            <CardContent className="p-6 text-center space-y-4 relative z-10">
                                <Award className="w-12 h-12 text-blue-500 mx-auto" />
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">Share Your Stats</h3>
                                    <p className="text-sm text-gray-500 font-medium">Download your premium CodeSync card.</p>
                                </div>
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button variant="outline" className="w-full border-blue-200 text-blue-600 bg-white hover:bg-blue-50 shadow-sm">
                                            Get Card
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-5xl bg-white border-gray-100 p-8 shadow-2xl">
                                        <DialogHeader>
                                            <DialogTitle className="text-xl font-bold text-gray-900 uppercase">Your Achievement Card</DialogTitle>
                                            <DialogDescription className="text-gray-500">
                                                Your journey summarized in one premium card.
                                            </DialogDescription>
                                        </DialogHeader>
                                        <CombinedHeatmap
                                            preloadedData={data}
                                            preloadedStats={stats}
                                            preloadedUsernames={usernames}
                                        />
                                    </DialogContent>
                                </Dialog>
                            </CardContent>
                        </Card>

                        {/* AI Assistant Button */}
                        <Card className="bg-gradient-to-br from-purple-50 to-fuchsia-50 border-purple-100 shadow-sm relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-purple-100/50 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl group-hover:scale-150 transition-transform duration-700" />
                            <CardContent className="p-6 text-center space-y-4 relative z-10">
                                <Brain className="w-12 h-12 text-purple-500 mx-auto" />
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">AI Assistant</h3>
                                    <p className="text-sm text-gray-500 font-medium">Personalised skill analysis and a 30-day practice plan.</p>
                                </div>
                                <Button
                                    onClick={() => {
                                        const params = new URLSearchParams();
                                        if (usernames.leetcode) params.set("leetcode", usernames.leetcode);
                                        if (usernames.codeforces) params.set("codeforces", usernames.codeforces);
                                        if (usernames.codechef) params.set("codechef", usernames.codechef);
                                        router.push(`/ai-coach?${params.toString()}`);
                                    }}
                                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:opacity-90 text-white font-semibold shadow-md"
                                >
                                    <Brain className="mr-2 h-4 w-4" /> Analyze Skills
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            )}

            {!stats && !loading && (
                <div className="text-center py-20">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                        <Flame className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-700">No Portfolio Loaded</h3>
                    <p className="text-gray-400 mt-2">Enter your usernames above and sync to view your tracker.</p>
                </div>
            )}
        </div>
    );
}
