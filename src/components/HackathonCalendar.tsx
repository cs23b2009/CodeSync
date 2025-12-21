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
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Loader2, Info, Star } from "lucide-react";
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
            const response = await axios.get('/api/hackathons/month', {
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
            <div className="w-full max-w-7xl mx-auto p-12 flex flex-col justify-center items-center bg-zinc-950/40 backdrop-blur-3xl rounded-[2.5rem] border border-zinc-800/40 min-h-[600px] shadow-2xl">
                <div className="relative">
                    <div className="absolute -inset-8 bg-indigo-500/20 blur-[60px] rounded-full animate-pulse" />
                    <Loader2 className="w-12 h-12 animate-spin text-indigo-500 relative" />
                </div>
                <p className="mt-8 text-zinc-500 font-bold uppercase tracking-[0.3em] text-[10px] animate-pulse">Syncing Galaxy Data</p>
            </div>
        );
    }

    return (
        <div className="w-full max-w-7xl mx-auto p-8 md:p-10 bg-zinc-950/40 backdrop-blur-3xl rounded-[3rem] border border-zinc-800/40 shadow-2xl space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-5">
                    <div className="p-4 bg-indigo-500/10 rounded-3xl border border-indigo-500/20">
                        <CalendarIcon className="w-8 h-8 text-indigo-400" />
                    </div>
                    <div>
                        <p className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.4em] mb-1">Hackathon Timeline</p>
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
                        // For hackathons, dates are usually ranges. Match logic might be complex.
                        // For now, let's just show counts if we can't parse exactly yet.
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
                                    "min-h-[140px] md:min-h-[160px] p-4 transition-all relative group bg-zinc-950/40",
                                    !isCurrentMonth && "opacity-20",
                                    isToday && "bg-indigo-500/5"
                                )}
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <span
                                        className={cn(
                                            "w-9 h-9 flex items-center justify-center rounded-2xl text-sm font-black transition-all",
                                            isToday
                                                ? "bg-indigo-600 text-white shadow-xl shadow-indigo-600/30 ring-2 ring-indigo-400/20"
                                                : isCurrentMonth ? "text-zinc-400 group-hover:bg-zinc-800 group-hover:text-white" : "text-zinc-700"
                                        )}
                                    >
                                        {format(day, "d")}
                                    </span>
                                </div>

                                <div className="space-y-1.5 overflow-hidden">
                                    {dayEvents.slice(0, 2).map((h, i) => (
                                        <a
                                            key={h.id}
                                            href={h.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className={cn(
                                                "block text-[9px] font-bold p-1.5 rounded-lg border truncate transition-all hover:scale-105",
                                                h.featured
                                                    ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
                                                    : "bg-zinc-900 text-zinc-400 border-zinc-800"
                                            )}
                                        >
                                            {h.featured && <Star size={8} className="inline mr-1 fill-amber-500" />}
                                            {h.title}
                                        </a>
                                    ))}
                                    {dayEvents.length > 2 && (
                                        <p className="text-[8px] text-zinc-600 font-black text-center">+ {dayEvents.length - 2} MORE</p>
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
                    Monthwise View Overload
                </p>
                <div className="h-px w-20 bg-gradient-to-l from-transparent to-zinc-800" />
            </div>
        </div>
    );
}
