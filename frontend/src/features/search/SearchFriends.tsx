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

    useEffect(() => {
        setCurrentPage(1);
    }, [debouncedSearch]);

    const { data, isLoading, refetch, isFetching } = useQuery({
        queryKey: ['searchUsers', debouncedSearch, currentPage],
        queryFn: async () => {
            if (!debouncedSearch) return { users: [], totalFound: 0, totalPages: 0 };
            const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/search/users?q=${debouncedSearch}&page=${currentPage}&limit=12`);
            return response.data;
        },
        enabled: debouncedSearch.length > 0,
        placeholderData: (previousData) => previousData,
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
        <div className="max-w-6xl mx-auto p-6 space-y-8 pb-32">
            <div className="relative text-center space-y-6 pt-10">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-blue-50 border border-blue-100 text-blue-600 text-xs font-semibold tracking-wider uppercase mb-4">
                    <Sparkles size={14} className="animate-pulse" />
                    <span>User Search</span>
                </div>

                <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-gray-900 leading-tight">
                    Find <br />
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-500 to-pink-500">
                        Profiles
                    </span>
                </h1>

                <p className="text-gray-500 max-w-xl mx-auto text-lg">
                    Find and discover developer profiles across platforms.
                </p>
            </div>

            <div className="max-w-xl mx-auto sticky top-4 z-50">
                <div className="relative group">
                    <div className="relative flex items-center bg-white border border-gray-200 rounded-2xl shadow-soft overflow-hidden">
                        <Search className="ml-5 text-gray-400" size={20} />
                        <Input
                            type="text"
                            placeholder="Type a name (e.g. aryanc)..."
                            className="h-12 bg-transparent border-none text-gray-900 text-base placeholder:text-gray-400 focus-visible:ring-0 focus-visible:ring-offset-0 px-4 shadow-none"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && refetch()}
                        />
                        <Button
                            onClick={() => refetch()}
                            className="h-10 px-6 rounded-xl bg-blue-600 text-white hover:bg-blue-700 font-medium transition-all mr-1.5 hidden md:flex"
                        >
                            Search
                        </Button>
                    </div>
                </div>

                <div className="mt-3 px-2">
                    {(isLoading || isFetching) && (
                        <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-600 animate-pulse w-1/3 rounded-full" />
                        </div>
                    )}
                </div>
            </div>

            <div className="space-y-8">
                {!isLoading && debouncedSearch && (
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center">
                                <Hash size={18} className="text-blue-600" />
                            </div>
                            <div>
                                <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Available Matches</p>
                                <p className="text-xl font-bold text-gray-900">{totalFound}</p>
                            </div>
                        </div>

                        {totalPages > 1 && (
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={handlePrevPage}
                                    disabled={currentPage === 1 || isFetching}
                                    className="h-10 w-10 rounded-xl border-gray-200 text-gray-600 hover:text-gray-900 hover:border-gray-300 disabled:opacity-30 transition-all"
                                >
                                    <ChevronLeft size={18} />
                                </Button>

                                <div className="px-4 h-10 flex items-center justify-center rounded-xl bg-gray-50 border border-gray-200 text-sm font-medium text-gray-600">
                                    <span className="text-gray-900 mr-1">{currentPage}</span> / {totalPages}
                                </div>

                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={handleNextPage}
                                    disabled={currentPage === totalPages || isFetching}
                                    className="h-10 w-10 rounded-xl border-gray-200 text-gray-600 hover:text-gray-900 hover:border-gray-300 disabled:opacity-30 transition-all"
                                >
                                    <ChevronRight size={18} />
                                </Button>
                            </div>
                        )}
                    </div>
                )}

                <div className="min-h-[500px] relative">
                    {(isLoading || (isFetching && users.length === 0)) ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-2">
                            {[...Array(12)].map((_, i) => (
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
                    ) : users.length > 0 ? (
                        <div className={cn(
                            "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-2 transition-all duration-300",
                            isFetching ? "opacity-30 blur-sm" : "opacity-100"
                        )}>
                            {users.map((user, idx) => (
                                <div
                                    key={`${user.platform}-${user.username}-${currentPage}-${idx}`}
                                >
                                    <UserCard user={user} />
                                </div>
                            ))}
                        </div>
                    ) : debouncedSearch && !isLoading ? (
                        <div className="flex flex-col items-center justify-center py-32 space-y-6">
                            <div className="w-24 h-24 bg-gray-50 rounded-3xl border border-gray-100 flex items-center justify-center text-gray-300">
                                <Users size={48} />
                            </div>
                            <div className="text-center space-y-2">
                                <h3 className="text-2xl font-bold text-gray-900">No results found</h3>
                                <p className="text-gray-500 max-w-sm mx-auto">
                                    We couldn't find any users matching "{debouncedSearch}".
                                </p>
                            </div>
                            <Button
                                variant="outline"
                                onClick={() => setSearchTerm('')}
                                className="rounded-full px-6 border-gray-200 text-gray-600"
                            >
                                Clear Search
                            </Button>
                        </div>
                    ) : null}
                </div>

                {!isLoading && totalPages > 1 && (
                    <div className="flex flex-col items-center gap-6 py-16">
                        <div className="flex items-center gap-1.5 p-1.5 bg-white rounded-2xl border border-gray-100 shadow-card">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={handlePrevPage}
                                disabled={currentPage === 1 || isFetching}
                                className="h-10 w-10 rounded-xl text-gray-500 hover:bg-gray-100 disabled:opacity-30"
                            >
                                <ChevronLeft size={18} />
                            </Button>

                            <div className="flex px-1">
                                {[...Array(totalPages)].map((_, i) => {
                                    const pageNum = i + 1;
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
                                                    "w-10 h-10 rounded-xl text-sm font-medium transition-all",
                                                    currentPage === pageNum
                                                        ? "bg-blue-600 text-white shadow-sm"
                                                        : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                                                )}
                                            >
                                                {pageNum}
                                            </button>
                                        );
                                    }
                                    if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
                                        return <span key={pageNum} className="w-6 flex items-center justify-center text-gray-300">...</span>;
                                    }
                                    return null;
                                })}
                            </div>

                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={handleNextPage}
                                disabled={currentPage === totalPages || isFetching}
                                className="h-10 w-10 rounded-xl text-gray-500 hover:bg-gray-100 disabled:opacity-30"
                            >
                                <ChevronRight size={18} />
                            </Button>
                        </div>

                        <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">
                            {currentPage === totalPages ? "End of Results" : "Next Page"}
                        </p>
                    </div>
                )}
            </div>

            <div className="py-16 text-center">
            </div>
        </div>
    );
};