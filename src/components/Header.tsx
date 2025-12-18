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
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center text-center py-2"
    >
      <div className="flex items-center gap-3 mb-2">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-600/10">
          <Sparkles className="w-6 h-6 text-blue-600 dark:text-blue-500" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
          CodeSync Pro
        </h1>
      </div>
      <p className="text-sm text-gray-400 max-w-3xl">
        Stay updated with the latest competitive programming contests from Codeforces, LeetCode, and CodeChef.
      </p>
    </motion.div>
  );
}
