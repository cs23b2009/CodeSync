"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, TrendingUp, Bookmark, Settings } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";

export default function NavigationTabs() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get('tab') || 'contests';

  const tabs = [
    {
      value: 'contests',
      label: 'Live Contests',
      icon: Calendar,
      description: 'Browse active and upcoming contests'
    },
    {
      value: 'bookmarks',
      label: 'Saved',
      icon: Bookmark,
      description: 'Your bookmarked contests'
    },
    {
      value: 'settings',
      label: 'Settings',
      icon: Settings,
      description: 'Preferences and notifications'
    }
  ];

  const handleTabChange = (value: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('tab', value);
    router.push(`/?${params.toString()}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="w-full flex justify-center"
    >
      <Tabs value={currentTab} onValueChange={handleTabChange}>
        <TabsList className="inline-flex h-auto bg-gray-100 dark:bg-gray-800 rounded-lg p-1 gap-1">
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="flex items-center gap-2 px-5 py-2.5 rounded-md text-sm font-medium transition-all data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-md text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
            >
              <tab.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </motion.div>
  );
}