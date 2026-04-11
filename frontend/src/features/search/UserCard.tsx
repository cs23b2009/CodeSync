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
        <Card className="overflow-hidden bg-white border border-gray-100 transition-all duration-300 hover:border-blue-200 hover:shadow-lg group rounded-2xl">
            <CardContent className="p-6">
                <div className="flex items-center gap-5 mb-6">
                    <img
                        src={user.avatar || "/placeholder-avatar.png"}
                        alt={user.username}
                        className="w-16 h-16 rounded-2xl object-cover ring-2 ring-gray-100 group-hover:ring-blue-200 transition-all duration-300"
                    />

                    <div className="flex-1 min-w-0 space-y-0.5">
                        <h3 className="text-base font-semibold text-gray-900 truncate">
                            {user.realName || user.username}
                        </h3>
                        <p className="text-gray-400 text-sm">@{user.username}</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center justify-between text-xs text-gray-500 font-medium px-4 py-3 bg-gray-50 rounded-xl">
                        <span className="overflow-hidden text-ellipsis">ID: {user.username.substring(0, 8)}</span>
                        <a
                            href={`https://leetcode.com/${user.username}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-all text-xs"
                        >
                            <span className="font-medium">explore</span>
                            <ExternalLink size={11} />
                        </a>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 group-hover:border-gray-200 transition-colors">
                            <p className="text-[10px] text-gray-400 uppercase font-semibold mb-1">Rating</p>
                            <div className="flex items-center gap-2">
                                <Trophy size={14} className="text-amber-500" />
                                <span className="text-lg font-bold text-gray-900">{user.rating || '—'}</span>
                            </div>
                        </div>

                        <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 group-hover:border-gray-200 transition-colors">
                            <p className="text-[10px] text-gray-400 uppercase font-semibold mb-1">Rank</p>
                            <div className="flex items-center gap-2">
                                <Globe size={14} className="text-blue-500" />
                                <span className="text-lg font-bold text-gray-900">#{user.ranking || '—'}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};