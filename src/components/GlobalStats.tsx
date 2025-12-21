"use client";

import { motion } from "framer-motion";
import { Zap, Users, Trophy, Globe } from "lucide-react";
import { useEffect, useState } from "react";
import axios from "axios";

export default function GlobalStats() {
    const [stats, setStats] = useState({
        arena: 0,
        hackathons: 0,
        builders: 1240, // Mock
        countries: 42   // Mock
    });

    useEffect(() => {
        const fetchQuickStats = async () => {
            try {
                const [arenaRes, hackRes] = await Promise.all([
                    axios.get('/api/all?limit=1'),
                    axios.get('/api/hackathons')
                ]);
                setStats(prev => ({
                    ...prev,
                    arena: arenaRes.data.pagination?.total_contests || 45,
                    hackathons: hackRes.data.hackathons?.length || 24
                }));
            } catch (e) {
                // Keep default mocks
            }
        };
        fetchQuickStats();
    }, []);

    const items = [
        { label: "Active Contests", value: stats.arena.toString(), icon: Trophy, color: "text-blue-400" },
        { label: "Elite Hackathons", value: stats.hackathons.toString(), icon: Zap, color: "text-amber-400" },
        { label: "Build Force", value: stats.builders.toLocaleString(), icon: Users, color: "text-purple-400" },
        { label: "Nodes Connected", value: stats.countries.toString(), icon: Globe, color: "text-emerald-400" }
    ];

    return (
        <div className="w-full grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
            {items.map((item, i) => (
                <motion.div
                    key={item.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="p-6 bg-zinc-950/40 backdrop-blur-3xl rounded-[2rem] border border-zinc-800/40 relative group overflow-hidden"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="relative z-10 flex flex-col items-center text-center gap-3">
                        <div className={cn("p-3 rounded-2xl bg-zinc-900/80 border border-zinc-800", item.color)}>
                            <item.icon size={20} />
                        </div>
                        <div>
                            <p className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.3em] mb-1">{item.label}</p>
                            <p className="text-3xl font-black text-white tracking-tighter">{item.value}+</p>
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
