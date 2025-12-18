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
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 w-full">
    {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
      <div key={`skeleton-${i}`} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 h-[300px] animate-pulse shadow-sm">
        <div className="flex justify-between mb-4">
          <div className="h-6 w-20 bg-gray-200 dark:bg-gray-800 rounded-full"></div>
          <div className="h-6 w-20 bg-gray-200 dark:bg-gray-800 rounded-full"></div>
        </div>
        <div className="h-8 w-3/4 bg-gray-200 dark:bg-gray-800 rounded mb-4"></div>
        <div className="h-4 w-1/2 bg-gray-200 dark:bg-gray-800 rounded mb-2"></div>
        <div className="h-4 w-1/3 bg-gray-200 dark:bg-gray-800 rounded mb-8"></div>
        <div className="h-10 w-full bg-gray-200 dark:bg-gray-800 rounded mb-3"></div>
        <div className="h-10 w-full bg-gray-200 dark:bg-gray-800 rounded"></div>
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {contests.map((contest) => {
          const contestId = contest.id || contest.name;
          const isBookmarked = bookmarkedContestIds.includes(contestId.toString());
          const platformStyle = getPlatformStyle(contest.platform);

          return (
            <div
              key={contestId}
              className="group bg-white dark:bg-[#111] border border-gray-200 dark:border-gray-800 rounded-xl p-5 flex flex-col justify-between hover:border-gray-300 dark:hover:border-gray-700 transition-colors shadow-sm dark:shadow-none"
            >
              <div>
                <div className="flex justify-between items-start mb-4">
                  <span className={cn("px-2 py-0.5 rounded text-xs font-semibold bg-gray-100 dark:bg-white text-gray-900 border border-gray-200 dark:border-gray-200 flex items-center gap-1")}>
                    <PlatformLogo platform={contest.platform} size={16} />
                    {platformStyle.name}
                  </span>
                  <span className="bg-blue-100 dark:bg-blue-600/10 text-blue-700 dark:text-blue-400 text-xs font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                    Upcoming
                  </span>
                </div>

                <h3 className="text-gray-900 dark:text-white font-medium text-lg leading-snug mb-4 min-h-[3.5rem] line-clamp-2">
                  {contest.name}
                </h3>

                <div className="space-y-2 mb-6 text-gray-500 dark:text-gray-400 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDateClient(contest.startTime)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>{contest.duration}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex gap-2">
                  <a
                    href={contest.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 bg-blue-600 hover:bg-blue-500 text-white border border-transparent font-medium text-sm py-2 px-3 rounded-lg flex items-center justify-center gap-1 transition-all active:scale-95 shadow-lg shadow-blue-500/20"
                  >
                    Visit {platformStyle.name.split(' ')[0]} <ExternalLink className="w-3 h-3 ml-1" />
                  </a>
                  <button
                    onClick={(e) => handleSendReminder(e, contest)}
                    className="flex-1 bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-zinc-700 hover:bg-gray-200 dark:hover:bg-zinc-700 font-medium text-sm py-2 px-3 rounded-lg flex items-center justify-center gap-1 transition-all active:scale-95"
                  >
                    Reminder <Mail className="w-3 h-3 ml-1" />
                  </button>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={(e) => handleBookmark(e, contest)}
                    className={cn(
                      "flex-1 bg-gray-100 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-zinc-700 font-medium text-sm py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition-all active:scale-95",
                      isBookmarked && "text-yellow-600 dark:text-yellow-400 border-yellow-500/30 bg-yellow-50 dark:bg-yellow-400/10 hover:text-yellow-700 dark:hover:text-yellow-300"
                    )}
                  >
                    Bookmark <Bookmark className={cn("w-3 h-3", isBookmarked && "fill-current")} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
