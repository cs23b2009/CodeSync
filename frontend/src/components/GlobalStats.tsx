"use client";

import { motion } from "framer-motion";
import { Zap, Users, Trophy, Globe } from "lucide-react";
import { useEffect, useState } from "react";
import axios from "axios";

export default function GlobalStats() {
    const [stats, setStats] = useState({
        arena: 0,
        hackathons: 0,
        builders: 1240,
        countries: 42
    });

    useEffect(() => {
        const fetchQuickStats = async () => {
            try {
                const [arenaRes, hackRes] = await Promise.all([
                    axios.get(process.env.NEXT_PUBLIC_API_URL + '/api/all?limit=1'),
                    axios.get(process.env.NEXT_PUBLIC_API_URL + '/api/hackathons')
                ]);
                setStats(prev => ({
                    ...prev,
                    arena: arenaRes.data.pagination?.total_contests || 45,
                    hackathons: hackRes.data.hackathons?.length || 24
                }));
            } catch (e) {
            }
        };
        fetchQuickStats();
    }, []);

    const items = [
        { label: "Upcoming Contests", value: stats.arena.toString(), icon: Trophy, color: "text-blue-600 bg-blue-50" },
        { label: "Hackathons", value: stats.hackathons.toString(), icon: Zap, color: "text-amber-600 bg-amber-50" }
    ];

    return (
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
            {items.map((item, i) => (
                <motion.div
                    key={item.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="p-5 bg-white rounded-2xl border border-gray-100 shadow-card relative group"
                >
                    <div className="relative z-10 flex flex-col items-center text-center gap-3">
                        <div className={cn("p-2.5 rounded-xl", item.color)}>
                            <item.icon size={18} />
                        </div>
                        <div>
                            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">{item.label}</p>
                            <p className="text-2xl font-bold text-gray-900">{item.value}+</p>
                        </div>
                    </div>
                </motion.div>
            ))}
        </div>
    );
}

function cn(...inputs: any[]) {
    return inputs.filter(Boolean).join(" ");
}