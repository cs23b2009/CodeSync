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

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function ContestCalendar() {
    const [currentDate, setCurrentDate] = useState(new Date());

    const { data, isLoading } = useQuery({
        queryKey: ['calendar-contests'],
        queryFn: async () => {
            const response = await axios.get('/api/all', {
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
            <div className="w-full max-w-7xl mx-auto p-12 flex justify-center items-center bg-white dark:bg-[#0a0a0a]/80 rounded-2xl border border-gray-200 dark:border-white/5 shadow-2xl">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
        );
    }

    return (
        <div className="w-full max-w-7xl mx-auto p-4 md:p-6 bg-white dark:bg-[#0a0a0a]/80 backdrop-blur-md rounded-2xl border border-gray-200 dark:border-white/5 shadow-2xl">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-blue-50 dark:bg-blue-500/10 rounded-xl">
                        <CalendarIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {format(currentDate, "MMMM yyyy")}
                    </h2>
                </div>

                <div className="flex items-center gap-2 bg-gray-100 dark:bg-white/5 p-1 rounded-lg border border-gray-200 dark:border-white/5">
                    <button
                        onClick={prevMonth}
                        className="p-2 hover:bg-white dark:hover:bg-white/10 rounded-md transition-all text-gray-600 dark:text-gray-400 hover:shadow-sm"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                        onClick={goToToday}
                        className="px-4 py-1.5 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-white/10 rounded-md transition-all"
                    >
                        Today
                    </button>
                    <button
                        onClick={nextMonth}
                        className="p-2 hover:bg-white dark:hover:bg-white/10 rounded-md transition-all text-gray-600 dark:text-gray-400 hover:shadow-sm"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Grid Header */}
            <div className="grid grid-cols-7 mb-4">
                {WEEKDAYS.map((day) => (
                    <div key={day} className="text-center py-2 text-sm font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                        {day}
                    </div>
                ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-px bg-gray-200 dark:bg-white/10 border border-gray-200 dark:border-white/10 rounded-xl overflow-hidden shadow-sm">
                {days.map((day, dayIdx) => {
                    // Filter contests for this day
                    const dayContests = contests.filter(c => {
                        // Handle ISO string or direct date object if needed
                        const cDate = parseISO(c.startTimeISO || c.startTime);
                        return isSameDay(cDate, day);
                    });

                    const isCurrentMonth = isSameMonth(day, currentDate);
                    const isToday = isSameDay(day, new Date());

                    return (
                        <div
                            key={day.toString()}
                            className={`min-h-[120px] md:min-h-[140px] p-2 bg-white dark:bg-[#111] transition-colors relative group
                ${!isCurrentMonth ? "bg-gray-50/50 dark:bg-black/40" : ""}
                ${isToday ? "ring-1 ring-inset ring-blue-500 dark:bg-blue-900/10" : ""}
              `}
                        >
                            {/* Day Number */}
                            <div className="flex justify-between items-start mb-2">
                                <span
                                    className={`
                    w-7 h-7 flex items-center justify-center rounded-full text-sm font-medium
                    ${isToday
                                            ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30"
                                            : isCurrentMonth ? "text-gray-700 dark:text-gray-300 group-hover:bg-gray-100 dark:group-hover:bg-white/10" : "text-gray-400 dark:text-gray-600"}
                  `}
                                >
                                    {format(day, "d")}
                                </span>
                                {dayContests.length > 0 && (
                                    <span className="text-[10px] font-bold text-gray-400 dark:text-gray-600 px-1.5 border border-gray-100 dark:border-white/5 rounded-full">
                                        {dayContests.length}
                                    </span>
                                )}
                            </div>

                            {/* Events List */}
                            <div className="space-y-1.5 overflow-hidden">
                                {dayContests.slice(0, 3).map((contest, idx) => ( // Show max 3
                                    <a
                                        href={contest.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        key={contest.id}
                                        className={`
                      block text-[10px] truncate px-2 py-1 rounded-md border backdrop-blur-sm transition-transform hover:scale-105 hover:z-10
                      ${getPlatformStyle(contest.platform)}
                    `}
                                        title={contest.name}
                                    >
                                        <span className="font-semibold mr-1 opacity-75 hidden md:inline">
                                            {format(parseISO(contest.startTimeISO || contest.startTime), "HH:mm")}
                                        </span>
                                        {contest.name}
                                    </a>
                                ))}
                                {dayContests.length > 3 && (
                                    <div className="text-[10px] text-center text-gray-500 dark:text-gray-400 font-medium cursor-pointer hover:text-blue-500 transition-colors">
                                        + {dayContests.length - 3} more
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
