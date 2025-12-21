import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Calendar, MapPin, Trophy, Users, Globe, Info } from "lucide-react";
import { Hackathon } from "@/types/hackathon";
import { cn } from "@/lib/utils";

interface HackathonCardProps {
    hackathon: Hackathon;
}

export const HackathonCard: React.FC<HackathonCardProps> = ({ hackathon }) => {
    return (
        <Card className="overflow-hidden bg-zinc-950/40 border-zinc-800/40 backdrop-blur-2xl transition-all duration-500 hover:bg-zinc-900/60 hover:border-indigo-500/30 group rounded-[2.5rem] hover:ring-1 hover:ring-indigo-500/20 shadow-2xl h-full flex flex-col">
            <CardContent className="p-8 flex flex-col h-full">
                {/* Header with thumbnail */}
                <div className="flex items-center gap-6 mb-8">
                    <div className="relative shrink-0">
                        <div className="absolute -inset-1 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-3xl blur opacity-0 group-hover:opacity-40 transition-opacity" />
                        <img
                            src={hackathon.thumbnail_url || "/placeholder-hackathon.png"}
                            alt={hackathon.title}
                            className="relative w-20 h-20 rounded-3xl object-cover ring-2 ring-zinc-800/80 group-hover:ring-indigo-500/50 transition-all duration-500 group-hover:scale-105"
                        />
                    </div>

                    <div className="flex-1 min-w-0 space-y-1">
                        <Badge className={cn(
                            "mb-1 px-2 py-0.5 text-[10px] font-bold tracking-wider",
                            hackathon.isOpen === 'open' ? "bg-green-500/10 text-green-400 border-green-500/20" : "bg-red-500/10 text-red-400 border-red-500/20"
                        )}>
                            {hackathon.isOpen.toUpperCase()}
                        </Badge>
                        <h3 className="text-xl font-black text-white line-clamp-2 group-hover:text-indigo-400 transition-colors">
                            {hackathon.title}
                        </h3>
                        <p className="text-zinc-500 text-sm font-medium tracking-wide truncate">{hackathon.organization_name}</p>
                    </div>
                </div>

                {/* Details grid */}
                <div className="space-y-6 flex-1">
                    <div className="grid grid-cols-1 gap-4">
                        <div className="flex items-center gap-3 text-zinc-400 text-sm bg-zinc-900/40 p-3 rounded-2xl border border-zinc-800/50">
                            <Calendar size={18} className="text-indigo-400" />
                            <span className="truncate">{hackathon.submission_period_dates}</span>
                        </div>
                        <div className="flex items-center gap-3 text-zinc-400 text-sm bg-zinc-900/40 p-3 rounded-2xl border border-zinc-800/50">
                            <MapPin size={18} className="text-pink-400" />
                            <span className="truncate">{hackathon.displayed_location}</span>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-zinc-950/60 rounded-[1.8rem] border border-zinc-800/80 group-hover:border-zinc-700/50 transition-colors">
                            <p className="text-[10px] text-zinc-600 uppercase font-black tracking-widest mb-2">Prizes</p>
                            <div className="flex items-center gap-2.5">
                                <Trophy size={16} className="text-yellow-500/60" />
                                <span className="text-lg font-black text-white truncate">{hackathon.prizeText || 'N/A'}</span>
                            </div>
                        </div>

                        <div className="p-4 bg-zinc-950/60 rounded-[1.8rem] border border-zinc-800/80 group-hover:border-zinc-700/50 transition-colors">
                            <p className="text-[10px] text-zinc-600 uppercase font-black tracking-widest mb-2">Applicants</p>
                            <div className="flex items-center gap-2.5">
                                <Users size={16} className="text-blue-400/60" />
                                <span className="text-xl font-black text-white">{(hackathon.registrations_count || 0).toLocaleString()}</span>
                            </div>
                        </div>
                    </div>

                    {/* Themes */}
                    <div className="flex flex-wrap gap-2">
                        {(hackathon.themes || []).slice(0, 3).map(theme => (
                            <span key={theme.id} className="px-3 py-1 bg-zinc-900/80 rounded-full border border-zinc-800 text-[10px] font-bold text-zinc-500 hover:text-white transition-colors">
                                #{(theme.name || 'unknown').toLowerCase()}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Footer buttons */}
                <div className="mt-8 flex gap-3">
                    <a
                        href={hackathon.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center gap-2 h-12 bg-white text-black font-black rounded-2xl transition-all hover:bg-zinc-200 active:scale-95"
                    >
                        Learn More <ExternalLink size={16} />
                    </a>
                    <a
                        href={hackathon.start_a_submission_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-12 h-12 flex items-center justify-center bg-zinc-900 border border-zinc-800 rounded-2xl text-zinc-400 hover:text-white hover:border-zinc-700 transition-all hover:scale-105"
                        title="Register / Submit"
                    >
                        <Globe size={20} />
                    </a>
                </div>
            </CardContent>

            <div className="px-8 pb-4">
                <p className="text-[8px] text-zinc-700 font-bold uppercase tracking-[0.2em] text-center italic">
                    Sourced from {hackathon.source}
                </p>
            </div>
        </Card>
    );
};
