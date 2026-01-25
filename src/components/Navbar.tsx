"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, Trophy, BarChart2, Calendar, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

import ProfileLink from "./ProfileLink";

export default function Navbar() {
    const pathname = usePathname();

    const links = [
        { name: "Arena", href: "/", icon: Trophy },
        { name: "Hackathons", href: "/hackathons", icon: Calendar },
        { name: "LeetCode Buddies", href: "/search", icon: Users },
        { name: "Portfolio Tracker", href: "/stats", icon: BarChart2 }
    ];

    return (
        <div className="fixed top-6 left-0 right-0 z-[100] flex justify-center px-4 pointer-events-none">
            <motion.nav
                initial={{ y: -100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ type: "spring", damping: 20, stiffness: 100 }}
                className="pointer-events-auto flex items-center gap-2 bg-zinc-950/60 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-2 pr-2 shadow-[0_20px_50px_rgba(0,0,0,0.5)] ring-1 ring-white/5"
            >
                {/* Logo Section */}
                <Link href="/" className="flex items-center gap-2 px-3 py-2 hover:bg-white/5 rounded-2xl transition-colors group">
                    <div className="bg-blue-600 p-1.5 rounded-xl group-hover:rotate-12 transition-transform shadow-lg shadow-blue-500/20">
                        <BarChart2 className="w-4 h-4 text-white" />
                    </div>
                </Link>

                <div className="h-6 w-px bg-white/10 mx-1" />

                {/* Nav Links */}
                <div className="flex items-center gap-1">
                    {links.map((link) => {
                        const Icon = link.icon;
                        const isActive = pathname === link.href;

                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={cn(
                                    "px-4 py-2 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all flex items-center gap-2 relative",
                                    isActive
                                        ? "text-white"
                                        : "text-zinc-500 hover:text-white"
                                )}
                            >
                                <Icon size={14} />
                                <span className="hidden md:inline">{link.name}</span>
                                {isActive && (
                                    <motion.div
                                        layoutId="nav-active"
                                        className="absolute inset-0 bg-white/10 rounded-2xl -z-10 border border-white/10"
                                    />
                                )}
                            </Link>
                        );
                    })}
                </div>

                <div className="h-6 w-px bg-white/10 mx-1" />

                {/* Profile Section (No Sync/Theme) */}
                <div className="flex items-center pl-2">
                    <ProfileLink />
                </div>
            </motion.nav>
        </div>
    );
}
