"use client";

import { Code, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect } from "react";

export default function Header() {
  // Poll for reminders every minute
  useEffect(() => {
    const checkReminders = async () => {
      try {
        await fetch('/api/send-contest-reminders');
        // console.log('Checked for reminders');
      } catch (err) {
        console.error('Failed to check reminders:', err);
      }
    };

    // Check immediately on mount
    checkReminders();

    const interval = setInterval(checkReminders, 60 * 1000); // Every minute
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative text-center space-y-8 pt-12 pb-16 w-full max-w-7xl mx-auto">
      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-blue-500/10 blur-[120px] rounded-full -z-10" />

      {/* Floating Badge */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md text-blue-400 text-xs font-bold tracking-widest uppercase mb-4"
      >
        <Sparkles size={14} className="animate-pulse" />
        <span>Unified Competitive Ecosystem</span>
      </motion.div>

      {/* Main Title */}
      <motion.h1
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="text-7xl md:text-9xl font-black tracking-tighter text-zinc-100 leading-[0.85]"
      >
        CodeSync <br />
        <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 via-indigo-400 to-purple-500 animate-gradient-x italic">
          Pro
        </span>
      </motion.h1>

      {/* Subtitle */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        className="text-zinc-500 max-w-2xl mx-auto text-lg leading-relaxed font-medium uppercase tracking-[0.2em]"
      >
        Stay updated with the latest competitive programming contests from
        <span className="text-white font-medium"> Codeforces</span>,
        <span className="text-white font-medium"> LeetCode</span>, and
        <span className="text-white font-medium"> CodeChef</span>.
      </motion.p>
    </div>
  );
}
