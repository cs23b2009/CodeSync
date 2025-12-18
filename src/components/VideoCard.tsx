import React from "react";
import Image from "next/image";
import { Play } from "lucide-react";

interface VideoCardProps {
    videoId: string;
    title: string;
    channelName: string;
    duration?: string;
}

export default function VideoCard({ videoId, title, channelName, duration }: VideoCardProps) {
    const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;

    return (
        <a
            href={videoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group block bg-white dark:bg-[#111] rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800 hover:border-blue-500/50 dark:hover:border-blue-500/50 transition-all hover:shadow-lg dark:hover:shadow-blue-900/10"
        >
            <div className="relative aspect-video w-full overflow-hidden bg-gray-100 dark:bg-gray-800">
                <Image
                    src={thumbnailUrl}
                    alt={title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-white/90 dark:bg-black/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transform scale-75 group-hover:scale-100 transition-all duration-300">
                        <Play className="w-5 h-5 text-gray-900 dark:text-white fill-current ml-0.5" />
                    </div>
                </div>
                {duration && (
                    <div className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-black/70 text-white text-[10px] font-bold rounded">
                        {duration}
                    </div>
                )}
            </div>
            <div className="p-4">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 line-clamp-2 mb-1.5 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {title}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{channelName}</p>
            </div>
        </a>
    );
}
