"use client";

import { Code, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect } from "react";

export default function Header() {
  useEffect(() => {
    const checkReminders = async () => {
      try {
        await fetch(process.env.NEXT_PUBLIC_API_URL + '/api/send-contest-reminders');
      } catch (err) {
        console.error('Failed to check reminders:', err);
      }
    };

    checkReminders();

    const interval = setInterval(checkReminders, 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative text-center space-y-6 pt-6 pb-8 w-full max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl glass-card text-blue-600 text-xs font-semibold tracking-wider uppercase mb-4"
      >
        <Sparkles size={14} className="animate-pulse" />
        <span>Contest Dashboard</span>
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="text-6xl md:text-8xl font-bold tracking-tight text-gray-900 leading-[0.9]"
      >
        CodeSync
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        className="text-gray-500 text-sm md:text-base font-medium whitespace-nowrap"
      >
        Track upcoming programming contests from
        <span className="text-gray-900 font-medium"> Codeforces</span>,
        <span className="text-gray-900 font-medium"> LeetCode</span>, and
        <span className="text-gray-900 font-medium"> CodeChef</span> in one place.
      </motion.p>
    </div>
  );
}