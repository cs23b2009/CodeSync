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

    const getPlatformStyle = (platform: string) => {
        switch (platform.toLowerCase()) {
            case 'codeforces':
                return "bg-amber-100 text-amber-800 border-amber-200";
            case 'leetcode':
                return "bg-orange-100 text-orange-800 border-orange-200";
            case 'codechef':
                return "bg-stone-100 text-stone-800 border-stone-200";
            case 'atcoder':
                return "bg-gray-100 text-gray-800 border-gray-200";
            default:
                return "bg-blue-100 text-blue-800 border-blue-200";
        }
    };

    if (isLoading) {
        return (
            <div className="w-full max-w-7xl mx-auto p-10 flex flex-col justify-center items-center bg-white rounded-3xl border border-gray-100 shadow-card min-h-[500px]">
                <div className="relative">
                    <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
                </div>
                <p className="mt-6 text-gray-400 font-medium text-sm">Syncing Contest Data</p>
            </div>
        );
    }

    return (
        <div className="w-full max-w-6xl mx-auto p-8 bg-white rounded-3xl border border-gray-100 shadow-card space-y-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-50 rounded-2xl border border-blue-100">
                        <CalendarIcon className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                        <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mb-0.5">Contest Timeline</p>
                        <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                            {format(currentDate, "MMMM yyyy")}
                        </h2>
                    </div>
                </div>

                <div className="flex items-center gap-1 bg-gray-50 p-1.5 rounded-xl">
                    <button
                        onClick={prevMonth}
                        className="p-2 hover:bg-white rounded-xl transition-all text-gray-500 hover:text-gray-900"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                        onClick={goToToday}
                        className="px-4 py-1.5 text-xs font-medium text-gray-500 hover:text-gray-900 transition-all"
                    >
                        Today
                    </button>
                    <button
                        onClick={nextMonth}
                        className="p-2 hover:bg-white rounded-xl transition-all text-gray-500 hover:text-gray-900"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            </div>

            <div className="space-y-3">
                <div className="grid grid-cols-7">
                    {WEEKDAYS.map((day) => (
                        <div key={day} className="text-center py-3 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                            {day}
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-7 gap-px bg-gray-100 border border-gray-100 rounded-2xl overflow-hidden">
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
                                    "min-h-[100px] md:min-h-[120px] p-2 transition-all relative group bg-white",
                                    !isCurrentMonth && "opacity-40",
                                    isToday && "bg-blue-50"
                                )}
                            >
                                <div className="flex justify-start mb-2">
                                    <span
                                        className={cn(
                                            "w-7 h-7 flex items-center justify-center rounded-xl text-sm font-semibold transition-all",
                                            isToday
                                                ? "bg-blue-600 text-white shadow-md"
                                                : isCurrentMonth ? "text-gray-600 group-hover:bg-gray-100" : "text-gray-300"
                                        )}
                                    >
                                        {format(day, "d")}
                                    </span>
                                </div>

                                <div className="space-y-1 overflow-hidden">
                                    {dayContests.slice(0, 3).map((contest) => (
                                        <a
                                            key={contest.id}
                                            href={contest.href}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className={cn(
                                                "block text-[8px] font-medium p-1.5 rounded-lg border truncate transition-all hover:scale-[1.02]",
                                                getPlatformStyle(contest.platform)
                                            )}
                                        >
                                            <span className="opacity-60 mr-1">{format(parseISO(contest.startTimeISO || contest.startTime), "HH:mm")}</span>
                                            {contest.name.length > 15 ? contest.name.substring(0, 15) + "..." : contest.name}
                                        </a>
                                    ))}
                                    {dayContests.length > 3 && (
                                        <p className="text-[7px] text-gray-400 font-medium text-center uppercase tracking-wider">
                                            + {dayContests.length - 3} MORE
                                        </p>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="pt-4 flex items-center justify-center gap-3">
                <p className="text-[9px] text-gray-400 font-medium uppercase tracking-wider">
                    Contest Synchronization
                </p>
            </div>
        </div>
    );
}