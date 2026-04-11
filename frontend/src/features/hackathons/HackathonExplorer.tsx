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

            const response = await axios.get(process.env.NEXT_PUBLIC_API_URL + '/api/hackathons', { params });
            if (!response.data || !response.data.hackathons) {
                throw new Error("Invalid API response structure");
            }
            return response.data.hackathons as Hackathon[];
        },
        retry: 1
    });

    const hackathons = data || [];

    return (
        <div className="max-w-7xl mx-auto p-6 space-y-10 pb-32">
            <div className="relative text-center space-y-6 pt-10">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-purple-50 border border-purple-100 text-purple-600 text-xs font-semibold tracking-wider uppercase mb-4">
                    <Sparkles size={14} className="animate-pulse" />
                    <span>Innovation & Build Events</span>
                </div>

                <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-gray-900 leading-tight">
                    Hackathon <br />
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-pink-500 to-amber-500">
                        Calendar
                    </span>
                </h1>

                <p className="text-gray-500 md:whitespace-nowrap text-sm md:text-lg">
                    Explore the world's best tech events. Filter by prizes, themes, and formats.
                </p>
            </div>

            <div className="flex flex-col md:flex-row gap-4 items-center justify-between sticky top-4 z-50">
                <div className="flex items-center gap-1 p-1.5 bg-white border border-gray-200 rounded-2xl shadow-soft w-full md:w-auto">
                    <button
                        onClick={() => setView('list')}
                        className={cn(
                            "flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all",
                            view === 'list' ? "bg-blue-600 text-white shadow-md" : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                        )}
                    >
                        <List size={16} /> List
                    </button>
                    <button
                        onClick={() => setView('calendar')}
                        className={cn(
                            "flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all",
                            view === 'calendar' ? "bg-blue-600 text-white shadow-md" : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                        )}
                    >
                        <Calendar size={16} /> Calendar
                    </button>
                </div>

                <div className="flex-1 max-w-xl w-full">
                    <div className="relative group">
                        <div className="relative flex items-center bg-white border border-gray-200 rounded-2xl shadow-soft overflow-hidden">
                            <Search className="ml-4 text-gray-400" size={18} />
                            <Input
                                type="text"
                                placeholder="Search by name, organization or theme..."
                                className="h-11 bg-transparent border-none text-gray-900 placeholder:text-gray-400 focus-visible:ring-0 shadow-none px-3"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2 bg-white border border-gray-200 p-1.5 rounded-2xl">
                    <select
                        className="bg-transparent text-xs font-medium text-gray-500 px-3 py-2 outline-none cursor-pointer"
                        value={filterType}
                        onChange={(e: any) => setFilterType(e.target.value)}
                    >
                        <option value="all">ALL MODES</option>
                        <option value="online">ONLINE</option>
                        <option value="offline">OFFLINE</option>
                    </select>
                    <div className="h-5 w-px bg-gray-200" />
                    <button
                        onClick={() => setShowFeatured(!showFeatured)}
                        className={cn(
                            "px-4 py-2 rounded-xl text-xs font-medium uppercase transition-all",
                            showFeatured ? "bg-amber-50 text-amber-700 border border-amber-200" : "text-gray-500 hover:text-gray-900"
                        )}
                    >
                        Featured
                    </button>
                </div>
            </div>

            <div className="min-h-[500px]">
                {view === 'calendar' ? (
                    <HackathonCalendar />
                ) : (
                    <div className="space-y-10">
                        {isError ? (
                            <div className="text-center py-32 bg-red-50 rounded-3xl border border-red-100">
                                <div className="p-4 bg-red-100 rounded-full w-fit mx-auto mb-5">
                                    <Sparkles size={40} className="text-red-600" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Sync Engine Failure</h3>
                                <p className="text-gray-500 mb-6 max-w-sm mx-auto">
                                    {(error as any)?.message || "We encountered an error while synchronizing with the hacking galaxy."}
                                </p>
                                <Button
                                    onClick={() => refetch()}
                                    className="bg-blue-600 text-white font-medium px-6 py-2.5 rounded-xl hover:bg-blue-700 transition-all"
                                >
                                    Retry Connection
                                </Button>
                            </div>
                        ) : (isLoading || isFetching) ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {[...Array(6)].map((_, i) => (
                                    <div key={i} className="p-6 bg-white rounded-2xl border border-gray-100 shadow-card space-y-6">
                                        <div className="flex items-center gap-4">
                                            <Skeleton className="w-16 h-16 rounded-2xl" />
                                            <div className="space-y-2 flex-1">
                                                <Skeleton className="h-4 w-3/4 rounded-full" />
                                                <Skeleton className="h-3 w-1/2 rounded-full" />
                                            </div>
                                        </div>
                                        <Skeleton className="h-9 w-full rounded-lg" />
                                        <div className="grid grid-cols-2 gap-3">
                                            <Skeleton className="h-14 rounded-xl" />
                                            <Skeleton className="h-14 rounded-xl" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : hackathons.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {hackathons.map((hackathon) => (
                                    <HackathonCard key={hackathon.id} hackathon={hackathon} />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-32 bg-gray-50 rounded-3xl border border-gray-100">
                                <Trophy size={48} className="mx-auto text-gray-300 mb-4" />
                                <h3 className="text-xl font-bold text-gray-900 mb-2">No hackathons found</h3>
                                <p className="text-gray-500">Try adjusting your filters or search query.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <div className="pt-16 border-t border-gray-100 text-center">
                <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider max-w-lg mx-auto italic">
                    DISCLAIMER: Hackathon data is sourced from publicly available APIs.
                </p>
            </div>
        </div>
    );
};