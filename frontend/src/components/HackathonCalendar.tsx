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
    parseISO,
} from "date-fns";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Loader2, Star } from "lucide-react";
import { Hackathon } from "@/types/hackathon";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { cn } from "@/lib/utils";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function HackathonCalendar() {
    const [currentDate, setCurrentDate] = useState(new Date());

    const { data, isLoading } = useQuery({
        queryKey: ['hackathons-month', currentDate.getMonth(), currentDate.getFullYear()],
        queryFn: async () => {
            const response = await axios.get(process.env.NEXT_PUBLIC_API_URL + '/api/hackathons/month', {
                params: {
                    month: currentDate.getMonth() + 1,
                    year: currentDate.getFullYear()
                }
            });
            return response.data.hackathons as Hackathon[];
        }
    });

    const hackathons = data || [];

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

    if (isLoading) {
        return (
            <div className="w-full max-w-7xl mx-auto p-10 flex flex-col justify-center items-center bg-white rounded-3xl border border-gray-100 shadow-card min-h-[500px]">
                <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
                <p className="mt-6 text-gray-400 font-medium text-sm">Syncing Galaxy Data</p>
            </div>
        );
    }

    return (
        <div className="w-full max-w-7xl mx-auto p-8 bg-white rounded-3xl border border-gray-100 shadow-card space-y-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-indigo-50 rounded-2xl border border-indigo-100">
                        <CalendarIcon className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div>
                        <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mb-0.5">Hackathon Timeline</p>
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
                        const isCurrentMonth = isSameMonth(day, currentDate);
                        const isToday = isSameDay(day, new Date());

                        const dayEvents = hackathons.filter(h => {
                            if (!h.startDate) return false;
                            const hStart = parseISO(h.startDate);
                            return isSameDay(hStart, day);
                        });

                        return (
                            <div
                                key={day.toString()}
                                className={cn(
                                    "min-h-[100px] md:min-h-[120px] p-2 transition-all relative group bg-white",
                                    !isCurrentMonth && "opacity-40",
                                    isToday && "bg-indigo-50"
                                )}
                            >
                                <div className="flex justify-start mb-2">
                                    <span
                                        className={cn(
                                            "w-7 h-7 flex items-center justify-center rounded-xl text-sm font-semibold transition-all",
                                            isToday
                                                ? "bg-indigo-600 text-white shadow-md"
                                                : isCurrentMonth ? "text-gray-600 group-hover:bg-gray-100" : "text-gray-300"
                                        )}
                                    >
                                        {format(day, "d")}
                                    </span>
                                </div>

                                <div className="space-y-1 overflow-hidden">
                                    {dayEvents.slice(0, 2).map((h, i) => (
                                        <a
                                            key={h.id}
                                            href={h.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className={cn(
                                                "block text-[8px] font-medium p-1.5 rounded-lg border truncate transition-all hover:scale-[1.02]",
                                                h.featured
                                                    ? "bg-amber-50 text-amber-700 border-amber-200"
                                                    : "bg-gray-50 text-gray-600 border-gray-200"
                                            )}
                                        >
                                            {h.featured && <Star size={8} className="inline mr-1 fill-amber-500" />}
                                            {h.title.length > 12 ? h.title.substring(0, 12) + "..." : h.title}
                                        </a>
                                    ))}
                                    {dayEvents.length > 2 && (
                                        <p className="text-[7px] text-gray-400 font-medium text-center">+ {dayEvents.length - 2} MORE</p>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="pt-4 flex items-center justify-center gap-3">
                <p className="text-[9px] text-gray-400 font-medium uppercase tracking-wider">
                    Monthwise View
                </p>
            </div>
        </div>
    );
}