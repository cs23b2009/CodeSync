import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Trophy, Globe } from "lucide-react";
import { IndexedProfile } from "@/types/user";

interface UserCardProps {
    user: IndexedProfile;
}

export const UserCard: React.FC<UserCardProps> = ({ user }) => {
    return (
        <Card className="overflow-hidden bg-zinc-950/40 border-zinc-800/40 backdrop-blur-2xl transition-all duration-500 hover:bg-zinc-900/60 hover:border-indigo-500/30 group rounded-[2.5rem] hover:ring-1 hover:ring-indigo-500/20 shadow-2xl">
            <CardContent className="p-8">
                <div className="flex items-center gap-6 mb-8">
                    <div className="relative">
                        <div className="absolute -inset-1 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-3xl blur opacity-0 group-hover:opacity-40 transition-opacity" />
                        <img
                            src={user.avatar || "/placeholder-avatar.png"}
                            alt={user.username}
                            className="relative w-20 h-20 rounded-3xl object-cover ring-2 ring-zinc-800/80 group-hover:ring-indigo-500/50 transition-all duration-500 group-hover:scale-105"
                        />
                    </div>

                    <div className="flex-1 min-w-0 space-y-1">
                        <h3 className="text-xl font-black text-white truncate group-hover:text-indigo-400 transition-colors">
                            {user.realName || user.username}
                        </h3>
                        <p className="text-zinc-500 text-sm font-medium tracking-wide">@{user.username}</p>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="flex items-center justify-between text-[11px] text-zinc-500 font-bold tracking-widest uppercase px-4 py-3 bg-zinc-950/80 rounded-2xl border border-zinc-800/50">
                        <span className="opacity-60 overflow-hidden text-ellipsis">ID: {user.username.substring(0, 8)}</span>
                        <a
                            href={`https://leetcode.com/${user.username}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-indigo-400 hover:text-white flex items-center gap-1.5 transition-all active:scale-95 px-2 py-0.5 rounded-lg hover:bg-indigo-500/10"
                        >
                            <span className="font-sans lowercase tracking-tight font-medium">explore</span>
                            <ExternalLink size={12} />
                        </a>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-2">
                        <div className="p-4 bg-zinc-950/60 rounded-[1.8rem] border border-zinc-800/80 group-hover:border-zinc-700/50 transition-colors">
                            <p className="text-[10px] text-zinc-600 uppercase font-black tracking-widest mb-2">Rating</p>
                            <div className="flex items-center gap-2.5">
                                <Trophy size={16} className="text-yellow-500/60" />
                                <span className="text-xl font-black text-white">{user.rating || '—'}</span>
                            </div>
                        </div>

                        <div className="p-4 bg-zinc-950/60 rounded-[1.8rem] border border-zinc-800/80 group-hover:border-zinc-700/50 transition-colors">
                            <p className="text-[10px] text-zinc-600 uppercase font-black tracking-widest mb-2">Rank</p>
                            <div className="flex items-center gap-2.5">
                                <Globe size={16} className="text-blue-400/60" />
                                <span className="text-xl font-black text-white">#{user.ranking || '—'}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};
