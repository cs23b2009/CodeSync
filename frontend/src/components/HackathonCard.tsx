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
        <Card className="overflow-hidden bg-white border border-gray-100 transition-all duration-300 hover:border-blue-200 hover:shadow-lg group rounded-2xl h-full flex flex-col">
            <CardContent className="p-6 flex flex-col h-full">
                <div className="flex items-center gap-5 mb-5">
                    <img
                        src={hackathon.thumbnail_url || "/placeholder-hackathon.png"}
                        alt={hackathon.title}
                        className="w-16 h-16 rounded-2xl object-cover ring-2 ring-gray-100 group-hover:ring-blue-200 transition-all duration-300"
                    />

                    <div className="flex-1 min-w-0 space-y-1">
                        <Badge className={cn(
                            "mb-1 px-2 py-0.5 text-[9px] font-semibold tracking-wider",
                            hackathon.isOpen === 'open' ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"
                        )}>
                            {hackathon.isOpen.toUpperCase()}
                        </Badge>
                        <h3 className="text-base font-semibold text-gray-900 line-clamp-2">
                            {hackathon.title}
                        </h3>
                        <p className="text-gray-400 text-sm truncate">{hackathon.organization_name}</p>
                    </div>
                </div>

                <div className="space-y-4 flex-1">
                    <div className="grid grid-cols-1 gap-3">
                        <div className="flex items-center gap-3 text-gray-600 text-sm bg-gray-50 p-3 rounded-xl">
                            <Calendar size={16} className="text-indigo-600" />
                            <span className="truncate text-xs">{hackathon.submission_period_dates}</span>
                        </div>
                        <div className="flex items-center gap-3 text-gray-600 text-sm bg-gray-50 p-3 rounded-xl">
                            <MapPin size={16} className="text-pink-600" />
                            <span className="truncate text-xs">{hackathon.displayed_location}</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                            <p className="text-[9px] text-gray-400 uppercase font-semibold mb-1">Prizes</p>
                            <div className="flex items-center gap-2">
                                <Trophy size={14} className="text-amber-500" />
                                <span className="text-sm font-bold text-gray-900 truncate">{hackathon.prizeText || 'N/A'}</span>
                            </div>
                        </div>

                        <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                            <p className="text-[9px] text-gray-400 uppercase font-semibold mb-1">Applicants</p>
                            <div className="flex items-center gap-2">
                                <Users size={14} className="text-blue-500" />
                                <span className="text-sm font-bold text-gray-900">{(hackathon.registrations_count || 0).toLocaleString()}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                        {(hackathon.themes || []).slice(0, 3).map(theme => (
                            <span key={theme.id} className="px-2.5 py-1 bg-gray-50 rounded-full border border-gray-100 text-[9px] font-medium text-gray-500">
                                #{(theme.name || 'unknown').toLowerCase()}
                            </span>
                        ))}
                    </div>
                </div>

                <div className="mt-5 flex gap-2">
                    <a
                        href={hackathon.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center gap-2 h-10 bg-blue-600 text-white font-medium rounded-xl transition-all hover:bg-blue-700"
                    >
                        Learn More <ExternalLink size={14} />
                    </a>
                    <a
                        href={hackathon.start_a_submission_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-10 h-10 flex items-center justify-center bg-gray-50 border border-gray-200 rounded-xl text-gray-400 hover:text-gray-600 hover:border-gray-300 transition-all"
                        title="Register / Submit"
                    >
                        <Globe size={16} />
                    </a>
                </div>
            </CardContent>

            <div className="px-6 pb-4">
                <p className="text-[8px] text-gray-300 font-medium uppercase tracking-wider text-center">
                    Sourced from {hackathon.source}
                </p>
            </div>
        </Card>
    );
};