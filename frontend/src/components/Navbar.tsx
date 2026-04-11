"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Trophy, BarChart2, Calendar, Users, Brain } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

import ProfileLink from "./ProfileLink";

export default function Navbar() {
    const pathname = usePathname();

    const links = [
        { name: "Contests", href: "/", icon: Trophy },
        { name: "Hackathons", href: "/hackathons", icon: Calendar },
        { name: "User Search", href: "/search", icon: Users },
        { name: "My Stats", href: "/stats", icon: BarChart2 },
        { name: "AI Assistant", href: "/ai-coach", icon: Brain },
    ];

    return (
        <div className="fixed top-4 left-0 right-0 z-[100] flex justify-center px-4 pointer-events-none">
            <motion.nav
                initial={{ y: -100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ type: "spring", damping: 20, stiffness: 100 }}
                className="pointer-events-auto flex items-center gap-2 glass-card rounded-[2rem] p-2 pr-2 shadow-card"
            >
                <Link href="/" className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded-2xl transition-colors group">
                    <div className="bg-blue-600 p-1.5 rounded-xl group-hover:rotate-12 transition-transform shadow-md">
                        <BarChart2 className="w-4 h-4 text-white" />
                    </div>
                </Link>

                <div className="h-6 w-px bg-gray-200 mx-1" />

                <div className="flex items-center gap-1">
                    {links.map((link) => {
                        const Icon = link.icon;
                        const isActive = pathname === link.href;

                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={cn(
                                    "px-4 py-2 rounded-2xl text-[11px] font-bold uppercase tracking-wider transition-all flex items-center gap-2 relative",
                                    isActive
                                        ? "text-gray-900"
                                        : "text-gray-500 hover:text-gray-900"
                                )}
                            >
                                <Icon size={14} />
                                <span className="hidden md:inline">{link.name}</span>
                                {isActive && (
                                    <motion.div
                                        layoutId="nav-active"
                                        className="absolute inset-0 bg-blue-50 rounded-2xl -z-10 border border-blue-100"
                                    />
                                )}
                            </Link>
                        );
                    })}
                </div>

                <div className="h-6 w-px bg-gray-200 mx-1" />

                <div className="flex items-center pl-2">
                    <ProfileLink />
                </div>
            </motion.nav>
        </div>
    );
}