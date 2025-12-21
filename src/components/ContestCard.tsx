"use client";

import { useState } from "react";
import axios from "axios";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Bookmark, Calendar, ExternalLink, Mail, Clock, Youtube } from "lucide-react";

import { Contest } from "@/types/contest";
import { formatDateClient } from "@/lib/formatDateClient";
import { baseUrl } from "@/lib/constant";
import EmailPopover from "./EmailPopover";
import { cn } from "@/lib/utils";
import { PlatformLogo } from "./Icons";

const formSchema = z.object({
  name: z.string().min(2).max(50),
  email: z.string().email()
});

type FormData = z.infer<typeof formSchema>;

export interface SelectedContest {
  contestName: string;
  startTime: string;
  startTimeISO: string;
  duration: string;
  platformName: string;
  contestLink: string;
}

interface ContestCardProps {
  contests: Contest[];
  isBookmarksPage?: boolean;
  bookmarkedContestIds?: string[];
  isLoading?: boolean;
  onBookmarkChange?: (contest: Contest, isBookmarked: boolean) => void;
}

// Skeleton Loader Component
const ContestCardSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full">
    {[...Array(6)].map((_, i) => (
      <div key={i} className="p-8 bg-zinc-900/40 rounded-[2.5rem] border border-zinc-800/50 space-y-8 animate-pulse">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-zinc-800/50 rounded-3xl" />
          <div className="space-y-3 flex-1">
            <div className="h-4 w-24 bg-zinc-800/50 rounded-full" />
            <div className="h-6 w-3/4 bg-zinc-800/50 rounded-lg" />
          </div>
        </div>
        <div className="space-y-4">
          <div className="h-12 w-full bg-zinc-800/20 rounded-2xl" />
          <div className="h-12 w-full bg-zinc-800/20 rounded-2xl" />
        </div>
        <div className="pt-4 border-t border-zinc-800/50 flex gap-3">
          <div className="h-12 flex-1 bg-zinc-800/50 rounded-2xl" />
          <div className="h-12 w-12 bg-zinc-800/50 rounded-2xl" />
        </div>
      </div>
    ))}
  </div>
);

export default function ContestCard({
  contests = [],
  isBookmarksPage = false,
  bookmarkedContestIds = [],
  isLoading = false,
  onBookmarkChange,
}: ContestCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedContest, setSelectedContest] = useState<SelectedContest | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
    },
  });

  const handleBookmark = async (e: React.MouseEvent, contest: Contest) => {
    e.preventDefault();
    e.stopPropagation();

    const contestId = contest.id || contest.name;
    const isBookmarked = bookmarkedContestIds.includes(contestId.toString());

    if (onBookmarkChange) {
      onBookmarkChange(contest, !isBookmarked);
    }

    try {
      await axios({
        method: isBookmarked ? "DELETE" : "POST",
        url: `${baseUrl}/api/bookmark`,
        data: { ...contest, id: contestId },
      });
    } catch (error) {
      console.error("Error handling bookmark:", error);
      // Revert the optimistic update if the API call fails
      if (onBookmarkChange) {
        onBookmarkChange(contest, isBookmarked);
      }
    }
  };

  const handleSendReminder = (e: React.MouseEvent, contest: Contest) => {
    e.preventDefault();
    e.stopPropagation();

    setSelectedContest({
      contestName: contest.name,
      startTime: contest.startTime,
      startTimeISO: contest.startTimeISO || new Date(contest.startTime).toISOString(),
      duration: contest.duration || 'N/A',
      platformName: contest.platform,
      contestLink: contest.href || '#',
    });

    setIsModalOpen(true);
  };

  const handleSubmit = async (values: FormData) => {
    if (!selectedContest) return;

    try {
      await axios.post(`${baseUrl}/api/reminder`, {
        ...values,
        ...selectedContest,
      });

      setIsModalOpen(false);
      form.reset();
    } catch (error) {
      console.error("Error sending reminder:", error);
    }
  };

  const getPlatformStyle = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'codechef': return { badge: 'text-white border border-gray-600', name: 'CodeChef' };
      case 'codeforces': return { badge: 'text-blue-500 border border-blue-500/30', name: 'CodeForces' };
      case 'leetcode': return { badge: 'text-yellow-500 border border-yellow-500/30', name: 'LeetCode' };
      default: return { badge: 'text-gray-400 border border-gray-600', name: platform };
    }
  };

  if (isLoading) {
    return <ContestCardSkeleton />;
  }

  if (!contests || contests.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">No contests found</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {isModalOpen && selectedContest && (
        <EmailPopover
          isModalOpen={isModalOpen}
          setIsModalOpen={setIsModalOpen}
          form={form}
          onSubmit={handleSubmit}
          setContestSelected={setSelectedContest}
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {contests.map((contest) => {
          const contestId = contest.id || contest.name;
          const isBookmarked = bookmarkedContestIds.includes(contestId.toString());
          const platformStyle = getPlatformStyle(contest.platform);

          return (
            <div
              key={contestId}
              className="group relative bg-zinc-950/40 border border-zinc-800/40 backdrop-blur-2xl transition-all duration-500 hover:bg-zinc-900/60 hover:border-blue-500/30 rounded-[2.5rem] hover:ring-1 hover:ring-blue-500/20 shadow-2xl h-full flex flex-col p-8 overflow-hidden"
            >
              {/* Card Background Glow */}
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-500/5 blur-[80px] rounded-full group-hover:bg-blue-500/10 transition-all duration-500" />

              <div className="relative z-10 flex flex-col h-full">
                {/* Header with Platform Logo */}
                <div className="flex items-center gap-6 mb-8">
                  <div className="relative shrink-0">
                    <div className="absolute -inset-1 bg-gradient-to-tr from-blue-500 to-indigo-600 rounded-3xl blur opacity-0 group-hover:opacity-40 transition-opacity" />
                    <div className="relative w-16 h-16 bg-zinc-900 border border-zinc-800/50 rounded-3xl flex items-center justify-center group-hover:scale-105 transition-transform duration-500">
                      <PlatformLogo platform={contest.platform} size={32} />
                    </div>
                  </div>

                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black tracking-widest uppercase bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        {platformStyle.name}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black tracking-widest uppercase bg-green-500/10 text-green-400 border border-green-500/20">
                        Upcoming
                      </span>
                    </div>
                    <h3 className="text-xl font-black text-white line-clamp-2 leading-tight group-hover:text-blue-400 transition-colors">
                      {contest.name}
                    </h3>
                  </div>
                </div>

                {/* Details Section */}
                <div className="space-y-4 flex-1">
                  <div className="grid grid-cols-1 gap-3">
                    <div className="flex items-center gap-3 text-zinc-400 text-sm bg-zinc-900/40 p-3 rounded-2xl border border-zinc-800/50">
                      <Calendar size={18} className="text-blue-400" />
                      <span className="font-medium text-xs uppercase tracking-wider">{formatDateClient(contest.startTime)}</span>
                    </div>
                    <div className="flex items-center gap-3 text-zinc-400 text-sm bg-zinc-900/40 p-3 rounded-2xl border border-zinc-800/50">
                      <Clock size={18} className="text-purple-400" />
                      <span className="font-medium text-xs uppercase tracking-wider">{contest.duration}</span>
                    </div>
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="mt-8 space-y-3">
                  <div className="flex gap-3">
                    <a
                      href={contest.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-2 h-12 bg-white text-black font-black rounded-2xl transition-all hover:bg-zinc-200 active:scale-95"
                    >
                      Enter Arena <ExternalLink size={16} />
                    </a>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={(e) => handleSendReminder(e, contest)}
                      className="flex-1 flex items-center justify-center gap-2 h-12 bg-zinc-900 border border-zinc-800 rounded-2xl text-zinc-400 hover:text-white hover:border-zinc-700 transition-all font-bold text-[10px] uppercase tracking-widest"
                    >
                      Remind Me <Mail size={14} />
                    </button>
                    <button
                      onClick={(e) => handleBookmark(e, contest)}
                      className={cn(
                        "w-12 h-12 flex items-center justify-center border rounded-2xl transition-all hover:scale-105 active:scale-95",
                        isBookmarked
                          ? "bg-yellow-500/10 border-yellow-500/40 text-yellow-500 shadow-lg shadow-yellow-500/10"
                          : "bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-white"
                      )}
                    >
                      <Bookmark size={18} className={cn(isBookmarked && "fill-current")} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
