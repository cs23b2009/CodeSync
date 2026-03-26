"use client";

import { useSearchParams } from "next/navigation";
import VideoCard from "./VideoCard";

// Mock data - in a real app this could come from an API or config file
const ALL_VIDEOS = [
    // CodeChef - TLE Eliminators (Priyansh)
    {
        id: "dqoQq9cCN9s",
        title: "CodeChef Starters 216 | Video Solutions - A to D",
        channel: "TLE Eliminators - by Priyansh",
        platform: "codechef",
        duration: "1:30:00"
    },
    {
        id: "tN49fk4zbLs",
        title: "CodeChef Starters 215 | Video Solutions - A to E",
        channel: "TLE Eliminators - by Priyansh",
        platform: "codechef",
        duration: "1:45:20"
    },
    {
        id: "01frkz6Kvrs",
        title: "CodeChef Starters 214 | Video Solutions - A to D",
        channel: "TLE Eliminators - by Priyansh",
        platform: "codechef",
        duration: "1:12:15"
    },
    {
        id: "xl0vt1UpREU",
        title: "CodeChef Starters 213 | Video Solutions - A to E",
        channel: "TLE Eliminators - by Priyansh",
        platform: "codechef",
        duration: "1:25:30"
    },
    // LeetCode - TLE Eliminators (Vibhaas/Suvrat)
    {
        id: "1nvyOR4YnEs",
        title: "Leetcode Weekly Contest 480 | Video Solutions - A to D",
        channel: "TLE Eliminators - by Priyansh",
        platform: "leetcode",
        duration: "1:35:00"
    },
    {
        id: "krfgr6EidjI",
        title: "Leetcode Weekly Contest 479 | Video Solutions - A to D",
        channel: "TLE Eliminators - by Priyansh",
        platform: "leetcode",
        duration: "1:25:00"
    },
    {
        id: "DPL-u8AB2T8",
        title: "Leetcode Weekly Contest 477 | Video Solutions - A to D",
        channel: "TLE Eliminators - by Priyansh",
        platform: "leetcode",
        duration: "1:40:00"
    },
    {
        id: "g_kZZF7r69E",
        title: "Leetcode Biweekly Contest 171 | Video Solutions - A to D",
        channel: "TLE Eliminators - by Priyansh",
        platform: "leetcode",
        duration: "1:10:00"
    }
];

export default function RecommendedVideos() {
    const searchParams = useSearchParams();
    const platform = searchParams.get("platform")?.toLowerCase();

    if (!platform || platform === "all platforms" || platform === "bookmarks") return null;

    const videos = ALL_VIDEOS.filter(v => v.platform === platform);

    if (videos.length === 0) return null;

    return (
        <div className="w-full">
            <div className="flex items-center gap-2 mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Recommended Videos
                </h2>
                <span className="px-2 py-0.5 rounded text-xs font-semibold bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-white/10 uppercase tracking-wider">
                    {platform}
                </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {videos.map((video) => (
                    <VideoCard
                        key={video.id}
                        videoId={video.id}
                        title={video.title}
                        channelName={video.channel}
                        duration={video.duration}
                    />
                ))}
            </div>
        </div>
    );
}
