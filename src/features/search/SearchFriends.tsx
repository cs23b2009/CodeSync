"use client";

import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Input } from "@/components/ui/input";
import { UserCard } from "./UserCard";
import { Search, Users, ChevronLeft, ChevronRight, Hash, Sparkles } from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";
import { IndexedProfile } from "@/types/user";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export const SearchFriends = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const debouncedSearch = useDebounce(searchTerm, 500);

    // Reset page on search change
    useEffect(() => {
        setCurrentPage(1);
    }, [debouncedSearch]);

    const { data, isLoading, refetch, isFetching } = useQuery({
        queryKey: ['searchUsers', debouncedSearch, currentPage],
        queryFn: async () => {
            if (!debouncedSearch) return { users: [], totalFound: 0, totalPages: 0 };
            const response = await axios.get(`/api/search/users?q=${debouncedSearch}&page=${currentPage}&limit=12`);
            return response.data;
        },
        enabled: debouncedSearch.length > 0,
        placeholderData: (previousData) => previousData, // Keep old data while fetching
    });

    const users: IndexedProfile[] = data?.users || [];
    const totalFound = data?.totalFound || 0;
    const totalPages = data?.totalPages || 0;

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(prev => prev + 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handlePrevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(prev => prev - 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    return (
        <div className="max-w-7xl mx-auto p-6 space-y-12 pb-40">
            {/* Ultra Premium Header */}
            <div className="relative text-center space-y-8 pt-12">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-indigo-500/10 blur-[120px] rounded-full -z-10" />

                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md text-indigo-400 text-xs font-bold tracking-widest uppercase mb-4 animate-in fade-in slide-in-from-top-4 duration-1000">
                    <Sparkles size={14} className="animate-pulse" />
                    <span>LeetCode Discovery</span>
                </div>

                <h1 className="text-6xl md:text-8xl font-black tracking-tight text-white leading-tight">
                    Search Your <br />
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-500 to-pink-500 animate-gradient-x">
                        Buddies
                    </span>
                </h1>

                <p className="text-zinc-400 max-w-2xl mx-auto text-xl leading-relaxed font-light">
                    Find and discover your buddies across LeetCode.
                </p>
            </div>

            {/* Floating Search Bar Container */}
            <div className="max-w-3xl mx-auto sticky top-4 z-50">
                <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-500 rounded-[2.5rem] blur opacity-25 group-focus-within:opacity-60 transition-all duration-500" />
                    <div className="relative flex items-center bg-zinc-950/90 backdrop-blur-2xl border border-white/10 rounded-[2.2rem] p-2 shadow-2xl">
                        <Search className="ml-6 text-zinc-500" size={24} />
                        <Input
                            type="text"
                            placeholder="Type a name (e.g. aryanc)..."
                            className="h-16 bg-transparent dark:bg-transparent border-none text-white text-xl placeholder:text-zinc-600 focus-visible:ring-0 focus-visible:ring-offset-0 px-6 shadow-none"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && refetch()}
                        />
                        <Button
                            onClick={() => refetch()}
                            className="h-14 px-10 rounded-[1.8rem] bg-white text-black hover:bg-zinc-200 font-bold active:scale-95 transition-all hidden md:flex"
                        >
                            Search
                        </Button>
                    </div>
                </div>

                {/* Micro Loading bar */}
                <div className="mt-4 px-8">
                    {(isLoading || isFetching) && (
                        <div className="h-1 w-full bg-zinc-900 rounded-full overflow-hidden">
                            <div className="h-full bg-indigo-500 animate-[loading-shimmer_1.5s_infinite] w-1/3 rounded-full" />
                        </div>
                    )}
                </div>
            </div>

            {/* Results Section */}
            <div className="space-y-8">
                {/* Visual Stats Row */}
                {!isLoading && debouncedSearch && (
                    <div className="flex flex-wrap items-center justify-between gap-6 px-4">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                                <Hash size={20} className="text-indigo-400" />
                            </div>
                            <div>
                                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Available Matches</p>
                                <p className="text-2xl font-black text-white">{totalFound}</p>
                            </div>
                        </div>

                        {totalPages > 1 && (
                            <div className="flex items-center gap-3">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={handlePrevPage}
                                    disabled={currentPage === 1 || isFetching}
                                    className="h-12 w-12 rounded-2xl bg-zinc-900/50 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700 disabled:opacity-20 transition-all"
                                >
                                    <ChevronLeft size={20} />
                                </Button>

                                <div className="px-6 h-12 flex items-center justify-center rounded-2xl bg-zinc-900/50 border border-zinc-800 text-sm font-black text-zinc-400">
                                    <span className="text-white mr-1.5">{currentPage}</span> / {totalPages}
                                </div>

                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={handleNextPage}
                                    disabled={currentPage === totalPages || isFetching}
                                    className="h-12 w-12 rounded-2xl bg-zinc-900/50 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700 disabled:opacity-20 transition-all"
                                >
                                    <ChevronRight size={20} />
                                </Button>
                            </div>
                        )}
                    </div>
                )}

                {/* The Grid / Skeletons */}
                <div className="min-h-[600px] relative">
                    {(isLoading || (isFetching && users.length === 0)) ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 p-4">
                            {[...Array(12)].map((_, i) => (
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
                    ) : users.length > 0 ? (
                        <div className={cn(
                            "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 p-4 transition-all duration-500",
                            isFetching ? "opacity-30 blur-md grayscale scale-95" : "opacity-100 scale-100"
                        )}>
                            {users.map((user, idx) => (
                                <div
                                    key={`${user.platform}-${user.username}-${currentPage}-${idx}`}
                                    className="animate-in fade-in zoom-in-95 duration-500"
                                    style={{ animationDelay: `${idx * 50}ms` }}
                                >
                                    <UserCard user={user} />
                                </div>
                            ))}
                        </div>
                    ) : debouncedSearch && !isLoading ? (
                        <div className="flex flex-col items-center justify-center py-40 space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
                            <div className="relative">
                                <div className="absolute -inset-8 bg-indigo-500/20 blur-[60px] rounded-full animate-pulse" />
                                <div className="relative w-32 h-32 bg-zinc-900 rounded-[3rem] border border-zinc-800 flex items-center justify-center text-zinc-700">
                                    <Users size={64} />
                                </div>
                            </div>
                            <div className="text-center space-y-4">
                                <h3 className="text-3xl font-black text-white">No matches detected</h3>
                                <p className="text-zinc-500 max-w-md mx-auto text-lg">
                                    Our search probes couldn't find anyone matching "{debouncedSearch}" in the cluster.
                                </p>
                            </div>
                            <Button
                                variant="outline"
                                onClick={() => setSearchTerm('')}
                                className="rounded-full px-8 border-zinc-800 text-white"
                            >
                                Clear Search
                            </Button>
                        </div>
                    ) : null}
                </div>

                {/* Footer Pagination */}
                {!isLoading && totalPages > 1 && (
                    <div className="flex flex-col items-center gap-8 py-20 pb-40">
                        <div className="h-px w-32 bg-gradient-to-r from-transparent via-zinc-800 to-transparent" />

                        <div className="flex items-center gap-2 p-2 bg-zinc-900/60 backdrop-blur-xl rounded-[2rem] border border-zinc-800/50 shadow-2xl">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={handlePrevPage}
                                disabled={currentPage === 1 || isFetching}
                                className="h-12 w-12 rounded-[1.2rem] text-zinc-500 hover:bg-white/5 disabled:opacity-10"
                            >
                                <ChevronLeft size={20} />
                            </Button>

                            <div className="flex px-2">
                                {[...Array(totalPages)].map((_, i) => {
                                    const pageNum = i + 1;
                                    // Complex pagination logic to only show nearby pages
                                    if (
                                        pageNum === 1 ||
                                        pageNum === totalPages ||
                                        (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                                    ) {
                                        return (
                                            <button
                                                key={pageNum}
                                                onClick={() => {
                                                    setCurrentPage(pageNum);
                                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                                }}
                                                className={cn(
                                                    "w-12 h-12 rounded-[1.2rem] text-sm font-bold transition-all",
                                                    currentPage === pageNum
                                                        ? "bg-indigo-600 text-white shadow-xl shadow-indigo-600/30 ring-2 ring-indigo-400/20"
                                                        : "text-zinc-500 hover:text-white hover:bg-white/5"
                                                )}
                                            >
                                                {pageNum}
                                            </button>
                                        );
                                    }
                                    if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
                                        return <span key={pageNum} className="w-8 flex items-center justify-center text-zinc-700">...</span>;
                                    }
                                    return null;
                                })}
                            </div>

                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={handleNextPage}
                                disabled={currentPage === totalPages || isFetching}
                                className="h-12 w-12 rounded-[1.2rem] text-zinc-500 hover:bg-white/5 disabled:opacity-10"
                            >
                                <ChevronRight size={20} />
                            </Button>
                        </div>

                        <p className="text-[10px] text-zinc-700 font-bold uppercase tracking-[0.4em]">
                            {currentPage === totalPages ? "End of Results" : "Next Slide Awaits"}
                        </p>
                    </div>
                )}
            </div>

            {/* Bottom Credits */}
            <div className="py-20 text-center relative">
                <div className="absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-zinc-900 to-transparent -z-10" />
                <p className="inline-block px-12 bg-zinc-950 text-[11px] text-zinc-600 font-bold uppercase tracking-[0.5em] leading-relaxed">
                    Designed for Elite Performance. Engineered for the Social Ecosystem.
                </p>
            </div>
        </div>
    );
};
