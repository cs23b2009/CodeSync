"use client";

import React, { useState } from "react";
import {
    format,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    isSameMonth,
    isSameDay,
    addMonths,
    subMonths,
    parseISO
} from "date-fns";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Loader2 } from "lucide-react";
import { Contest } from "@/types/contest";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { cn } from "@/lib/utils";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function ContestCalendar() {
    const [currentDate, setCurrentDate] = useState(new Date());

    const { data, isLoading } = useQuery({
        queryKey: ['calendar-contests'],
        queryFn: async () => {
            const response = await axios.get(process.env.NEXT_PUBLIC_API_URL + '/api/all', {
                params: { limit: 100 }
            });
            return response.data.contests as Contest[];
        }
    });

    const contests = data || [];

    const firstDayOfMonth = startOfMonth(currentDate);
    const lastDayOfMonth = endOfMonth(currentDate);
    const startDate = startOfWeek(firstDayOfMonth);
    const endDate = endOfWeek(lastDayOfMonth);

    const days = eachDayOfInterval({
        start: startDate,
        end: endDate,
    });

    const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
    const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
    const goToToday = () => setCurrentDate(new Date());

    // Platform styling helper
    const getPlatformStyle = (platform: string) => {
        switch (platform.toLowerCase()) {
            case 'codeforces':
                return "bg-amber-100 text-amber-800 dark:bg-yellow-500/20 dark:text-yellow-400 border-amber-200 dark:border-yellow-500/30";
            case 'leetcode':
                return "bg-orange-100 text-orange-800 dark:bg-orange-500/20 dark:text-orange-400 border-orange-200 dark:border-orange-500/30";
            case 'codechef':
                return "bg-stone-100 text-stone-800 dark:bg-amber-700/20 dark:text-amber-400 border-stone-200 dark:border-amber-700/30";
            case 'atcoder':
                return "bg-gray-100 text-gray-800 dark:bg-gray-700/40 dark:text-gray-300 border-gray-200 dark:border-gray-600";
            default:
                return "bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-400 border-blue-200 dark:border-blue-500/30";
        }
    };

    if (isLoading) {
        return (
            <div className="w-full max-w-7xl mx-auto p-12 flex flex-col justify-center items-center bg-zinc-950/40 backdrop-blur-3xl rounded-[2.5rem] border border-zinc-800/40 min-h-[600px] shadow-2xl">
                <div className="relative">
                    <div className="absolute -inset-8 bg-blue-500/20 blur-[60px] rounded-full animate-pulse" />
                    <Loader2 className="w-12 h-12 animate-spin text-blue-500 relative" />
                </div>
                <p className="mt-8 text-zinc-500 font-bold uppercase tracking-[0.3em] text-[10px] animate-pulse">Syncing Arena Data</p>
            </div>
        );
    }

    return (
        <div className="w-full max-w-7xl mx-auto p-8 md:p-10 bg-zinc-950/40 backdrop-blur-3xl rounded-[3rem] border border-zinc-800/40 shadow-2xl space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-5">
                    <div className="p-4 bg-blue-500/10 rounded-3xl border border-blue-500/20">
                        <CalendarIcon className="w-8 h-8 text-blue-400" />
                    </div>
                    <div>
                        <p className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.4em] mb-1">Contest Timeline</p>
                        <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter">
                            {format(currentDate, "MMMM yyyy")}
                        </h2>
                    </div>
                </div>

                <div className="flex items-center gap-3 bg-zinc-900/60 p-2 rounded-[1.8rem] border border-zinc-800/50">
                    <button
                        onClick={prevMonth}
                        className="p-3 hover:bg-zinc-800 rounded-2xl transition-all text-zinc-400 hover:text-white"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button
                        onClick={goToToday}
                        className="px-6 py-2 text-xs font-black uppercase tracking-widest text-zinc-400 hover:text-white transition-all"
                    >
                        Today
                    </button>
                    <button
                        onClick={nextMonth}
                        className="p-3 hover:bg-zinc-800 rounded-2xl transition-all text-zinc-400 hover:text-white"
                    >
                        <ChevronRight className="w-6 h-6" />
                    </button>
                </div>
            </div>

            {/* Calendar Grid */}
            <div className="space-y-4">
                <div className="grid grid-cols-7">
                    {WEEKDAYS.map((day) => (
                        <div key={day} className="text-center py-4 text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em]">
                            {day}
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-7 gap-px bg-zinc-800/20 border border-zinc-800/30 rounded-[2rem] overflow-hidden shadow-inner">
                    {days.map((day, dayIdx) => {
                        const dayContests = contests.filter(c => {
                            const cDate = parseISO(c.startTimeISO || c.startTime);
                            return isSameDay(cDate, day);
                        });

                        const isCurrentMonth = isSameMonth(day, currentDate);
                        const isToday = isSameDay(day, new Date());

                        return (
                            <div
                                key={day.toString()}
                                className={cn(
                                    "min-h-[140px] md:min-h-[160px] p-4 transition-all relative group bg-zinc-950/40",
                                    !isCurrentMonth && "opacity-20",
                                    isToday && "bg-blue-500/5"
                                )}
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <span
                                        className={cn(
                                            "w-9 h-9 flex items-center justify-center rounded-2xl text-sm font-black transition-all",
                                            isToday
                                                ? "bg-blue-600 text-white shadow-xl shadow-blue-500/30 ring-2 ring-blue-400/20"
                                                : isCurrentMonth ? "text-zinc-400 group-hover:bg-zinc-800 group-hover:text-white" : "text-zinc-700"
                                        )}
                                    >
                                        {format(day, "d")}
                                    </span>
                                </div>

                                <div className="space-y-1.5 overflow-hidden">
                                    {dayContests.slice(0, 3).map((contest) => (
                                        <a
                                            key={contest.id}
                                            href={contest.href}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className={cn(
                                                "block text-[9px] font-bold p-1.5 rounded-lg border truncate transition-all hover:scale-105",
                                                contest.platform.toLowerCase() === 'codeforces' ? "bg-amber-500/10 text-amber-500 border-amber-500/20" :
                                                    contest.platform.toLowerCase() === 'leetcode' ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/20" :
                                                        "bg-blue-500/10 text-blue-500 border-blue-500/20"
                                            )}
                                        >
                                            <span className="opacity-60 mr-1">{format(parseISO(contest.startTimeISO || contest.startTime), "HH:mm")}</span>
                                            {contest.name}
                                        </a>
                                    ))}
                                    {dayContests.length > 3 && (
                                        <p className="text-[8px] text-zinc-600 font-black text-center uppercase tracking-tighter tracking-[0.2em]">+ {dayContests.length - 3} MORE</p>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="pt-6 flex items-center justify-center gap-3">
                <div className="h-px w-20 bg-gradient-to-r from-transparent to-zinc-800" />
                <p className="text-[9px] text-zinc-600 font-black uppercase tracking-[0.5em]">
                    Competitive Arena Sync
                </p>
                <div className="h-px w-20 bg-gradient-to-l from-transparent to-zinc-800" />
            </div>
        </div>
    );
}
