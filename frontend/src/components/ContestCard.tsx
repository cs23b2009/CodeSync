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

const ContestCardSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
    {[...Array(6)].map((_, i) => (
      <div key={i} className="p-6 bg-white rounded-3xl border border-gray-100 shadow-card space-y-6 animate-pulse">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gray-100 rounded-2xl" />
          <div className="space-y-2 flex-1">
            <div className="h-3 w-16 bg-gray-100 rounded-full" />
            <div className="h-5 w-3/4 bg-gray-100 rounded-lg" />
          </div>
        </div>
        <div className="space-y-3">
          <div className="h-10 w-full bg-gray-50 rounded-xl" />
          <div className="h-10 w-full bg-gray-50 rounded-xl" />
        </div>
        <div className="pt-3 border-t border-gray-100 flex gap-3">
          <div className="h-10 flex-1 bg-gray-100 rounded-xl" />
          <div className="h-10 w-10 bg-gray-100 rounded-xl" />
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
      case 'codechef': return { badge: 'text-amber-700 border border-amber-200 bg-amber-50', name: 'CodeChef' };
      case 'codeforces': return { badge: 'text-blue-600 border border-blue-200 bg-blue-50', name: 'CodeForces' };
      case 'leetcode': return { badge: 'text-amber-600 border border-amber-200 bg-amber-50', name: 'LeetCode' };
      default: return { badge: 'text-gray-600 border border-gray-200 bg-gray-50', name: platform };
    }
  };

  if (isLoading) {
    return <ContestCardSkeleton />;
  }

  if (!contests || contests.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No contests found</p>
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {contests.map((contest) => {
          const contestId = contest.id || contest.name;
          const isBookmarked = bookmarkedContestIds.includes(contestId.toString());
          const platformStyle = getPlatformStyle(contest.platform);

          return (
            <div
              key={contestId}
              className="group relative bg-white border border-gray-100 rounded-3xl shadow-card hover:shadow-lg transition-all duration-300 hover:border-blue-200 h-full flex flex-col p-6 overflow-hidden"
            >
              <div className="relative z-10 flex flex-col h-full">
                <div className="flex items-center gap-4 mb-5">
                  <div className="w-14 h-14 bg-gray-50 border border-gray-100 rounded-2xl flex items-center justify-center">
                    <PlatformLogo platform={contest.platform} size={28} />
                  </div>

                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wider", platformStyle.badge)}>
                        {platformStyle.name}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wider text-green-700 border border-green-200 bg-green-50">
                        Upcoming
                      </span>
                    </div>
                    <h3 className="text-base font-semibold text-gray-900 line-clamp-2 leading-tight">
                      {contest.name}
                    </h3>
                  </div>
                </div>

                <div className="space-y-3 flex-1">
                  <div className="flex items-center gap-3 text-gray-600 text-sm bg-gray-50 p-3 rounded-xl">
                    <Calendar size={16} className="text-blue-600" />
                    <span className="font-medium text-xs">{formatDateClient(contest.startTime)}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-600 text-sm bg-gray-50 p-3 rounded-xl">
                    <Clock size={16} className="text-purple-600" />
                    <span className="font-medium text-xs">{contest.duration}</span>
                  </div>
                </div>

                <div className="mt-5 space-y-3">
                  <div className="flex gap-3">
                    <a
                      href={contest.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-2 h-10 bg-blue-600 text-white font-semibold rounded-xl transition-all hover:bg-blue-700 active:scale-[0.98]"
                    >
                      View Contest <ExternalLink size={14} />
                    </a>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={(e) => handleSendReminder(e, contest)}
                      className="flex-1 flex items-center justify-center gap-2 h-10 bg-gray-50 border border-gray-200 rounded-xl text-gray-600 hover:text-gray-900 hover:border-gray-300 transition-all font-semibold text-xs"
                    >
                      Set Reminder <Mail size={14} />
                    </button>
                    <button
                      onClick={(e) => handleBookmark(e, contest)}
                      className={cn(
                        "w-10 h-10 flex items-center justify-center border rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98]",
                        isBookmarked
                          ? "bg-amber-50 border-amber-200 text-amber-600"
                          : "bg-gray-50 border-gray-200 text-gray-400 hover:text-gray-600"
                      )}
                    >
                      <Bookmark size={16} className={cn(isBookmarked && "fill-current")} />
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