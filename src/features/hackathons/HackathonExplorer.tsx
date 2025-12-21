"use client";

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { HackathonCard } from "@/components/HackathonCard";
import HackathonCalendar from "@/components/HackathonCalendar";
import { Search, Filter, Calendar, List, Trophy, Globe, Sparkles } from "lucide-react";
import { Hackathon } from "@/types/hackathon";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export const HackathonExplorer = () => {
    const [view, setView] = useState<'list' | 'calendar'>('list');
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState<'all' | 'online' | 'offline'>('all');
    const [showFeatured, setShowFeatured] = useState(false);

    const { data, isLoading, isFetching, isError, error, refetch } = useQuery({
        queryKey: ['hackathons', filterType, showFeatured, searchTerm],
        queryFn: async () => {
            const params: any = { q: searchTerm };
            if (filterType !== 'all') params.type = filterType;
            if (showFeatured) params.featured = 'true';

            const response = await axios.get('/api/hackathons', { params });
            if (!response.data || !response.data.hackathons) {
                throw new Error("Invalid API response structure");
            }
            return response.data.hackathons as Hackathon[];
        },
        retry: 1
    });

    const hackathons = data || [];

    return (
        <div className="max-w-7xl mx-auto p-6 space-y-12 pb-40">
            {/* Header */}
            <div className="relative text-center space-y-8 pt-12">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-purple-500/10 blur-[120px] rounded-full -z-10" />

                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md text-purple-400 text-xs font-bold tracking-widest uppercase mb-4 animate-in fade-in slide-in-from-top-4 duration-1000">
                    <Sparkles size={14} className="animate-pulse" />
                    <span>Innovation & Build Events</span>
                </div>

                <h1 className="text-6xl md:text-8xl font-black tracking-tight text-white leading-tight">
                    Hackathon <br />
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-amber-500 animate-gradient-x">
                        Calendar
                    </span>
                </h1>

                <p className="text-zinc-400 max-w-2xl mx-auto text-xl leading-relaxed font-light">
                    Explore the world's best tech events. Filter by prizes, themes, and formats.
                </p>
            </div>

            {/* Controls Bar */}
            <div className="flex flex-col md:flex-row gap-6 items-center justify-between sticky top-4 z-50">
                <div className="flex items-center gap-2 p-1.5 bg-zinc-950/80 backdrop-blur-2xl border border-white/10 rounded-[2rem] shadow-2xl w-full md:w-auto">
                    <button
                        onClick={() => setView('list')}
                        className={cn(
                            "flex items-center gap-2 px-6 py-3 rounded-[1.5rem] text-sm font-black transition-all",
                            view === 'list' ? "bg-white text-black shadow-lg" : "text-zinc-500 hover:text-white"
                        )}
                    >
                        <List size={18} /> List
                    </button>
                    <button
                        onClick={() => setView('calendar')}
                        className={cn(
                            "flex items-center gap-2 px-6 py-3 rounded-[1.5rem] text-sm font-black transition-all",
                            view === 'calendar' ? "bg-white text-black shadow-lg" : "text-zinc-500 hover:text-white"
                        )}
                    >
                        <Calendar size={18} /> Calendar
                    </button>
                </div>

                <div className="flex-1 max-w-2xl w-full">
                    <div className="relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 to-pink-600 rounded-3xl blur opacity-20 group-focus-within:opacity-40 transition-all duration-500" />
                        <div className="relative flex items-center bg-zinc-950/80 backdrop-blur-2xl border border-white/10 rounded-3xl p-1.5 shadow-2xl">
                            <Search className="ml-4 text-zinc-500" size={20} />
                            <Input
                                type="text"
                                placeholder="Search by name, organization or theme..."
                                className="h-12 bg-transparent dark:bg-transparent bg-none border-none text-white placeholder:text-zinc-600 focus-visible:ring-0 shadow-none px-4"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <Button
                                onClick={() => refetch()}
                                className="h-10 px-8 rounded-2xl bg-zinc-900 text-white border border-zinc-800 hover:bg-zinc-800 font-bold hidden md:flex"
                            >
                                Search
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3 bg-zinc-950/80 backdrop-blur-2xl border border-white/10 p-2 rounded-[2rem]">
                    <select
                        className="bg-transparent text-xs font-bold text-zinc-400 px-4 py-2 outline-none cursor-pointer hover:text-white transition-colors"
                        value={filterType}
                        onChange={(e: any) => setFilterType(e.target.value)}
                    >
                        <option value="all">ALL MODES</option>
                        <option value="online">💻 ONLINE</option>
                        <option value="offline">🏢 OFFLINE</option>
                    </select>
                    <div className="h-4 w-px bg-zinc-800" />
                    <button
                        onClick={() => setShowFeatured(!showFeatured)}
                        className={cn(
                            "px-4 py-2 rounded-2xl text-[10px] font-black tracking-widest uppercase transition-all",
                            showFeatured ? "bg-amber-500/10 text-amber-500 border border-amber-500/20" : "text-zinc-500 hover:text-white"
                        )}
                    >
                        Featured
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div className="min-h-[600px]">
                {view === 'calendar' ? (
                    <HackathonCalendar />
                ) : (
                    <div className="space-y-12">
                        {isError ? (
                            <div className="text-center py-40 bg-red-500/5 rounded-[3rem] border border-red-500/20 backdrop-blur-3xl">
                                <div className="p-6 bg-red-500/10 rounded-full w-fit mx-auto mb-6">
                                    <Sparkles size={48} className="text-red-500" />
                                </div>
                                <h3 className="text-2xl font-black text-white mb-2">Sync Engine Failure</h3>
                                <p className="text-zinc-500 mb-8 max-w-md mx-auto">
                                    {(error as any)?.message || "We encountered an error while synchronizing with the hacking galaxy. Our engineers are on it."}
                                </p>
                                <Button
                                    onClick={() => refetch()}
                                    className="bg-white text-black font-black px-8 py-6 rounded-2xl hover:bg-zinc-200 transition-all"
                                >
                                    Retry Connection
                                </Button>
                            </div>
                        ) : (isLoading || isFetching) ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {[...Array(6)].map((_, i) => (
                                    <div key={i} className="p-8 bg-zinc-900/40 rounded-[2.5rem] border border-zinc-800/50 space-y-8">
                                        <div className="flex items-center gap-6">
                                            <Skeleton className="w-20 h-20 rounded-3xl" />
                                            <div className="space-y-3 flex-1">
                                                <Skeleton className="h-5 w-3/4 rounded-full" />
                                                <Skeleton className="h-4 w-1/2 rounded-full" />
                                            </div>
                                        </div>
                                        <Skeleton className="h-10 w-full rounded-xl" />
                                        <div className="grid grid-cols-2 gap-4">
                                            <Skeleton className="h-16 rounded-[1.5rem]" />
                                            <Skeleton className="h-16 rounded-[1.5rem]" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : hackathons.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
                                {hackathons.map((hackathon) => (
                                    <HackathonCard key={hackathon.id} hackathon={hackathon} />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-40 bg-zinc-950/40 rounded-[3rem] border border-zinc-800/40 backdrop-blur-3xl">
                                <Trophy size={64} className="mx-auto text-zinc-800 mb-6" />
                                <h3 className="text-2xl font-black text-white mb-2">No hackathons found</h3>
                                <p className="text-zinc-500">Try adjusting your filters or search query.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Disclaimer */}
            <div className="pt-20 border-t border-zinc-900 text-center">
                <p className="text-[10px] text-zinc-700 font-bold uppercase tracking-[0.4em] max-w-2xl mx-auto leading-relaxed italic">
                    DISCLAIMER: Hackathon data is sourced from publicly available APIs and is not affiliated with organizers.
                    Synchronized daily from Open Hackathons API.
                </p>
            </div>
        </div>
    );
};
