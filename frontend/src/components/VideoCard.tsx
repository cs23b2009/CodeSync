import React, { useState } from "react";
import Image from "next/image";
import { Play } from "lucide-react";

interface VideoCardProps {
    videoId: string;
    title: string;
    channelName: string;
    duration?: string;
}

export default function VideoCard({ videoId, title, channelName, duration }: VideoCardProps) {
    const [imgError, setImgError] = useState(false);
    const thumbnailUrl = imgError ? "/file.svg" : `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;

    return (
        <a
            href={videoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group block bg-white rounded-xl overflow-hidden border border-gray-200 hover:border-blue-500/50 transition-all hover:shadow-lg shadow-sm"
        >
            <div className="relative aspect-video w-full overflow-hidden bg-gray-100">
                <Image
                    src={thumbnailUrl}
                    alt={title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    onError={() => setImgError(true)}
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transform scale-75 group-hover:scale-100 transition-all duration-300">
                        <Play className="w-5 h-5 text-gray-900 fill-current ml-0.5" />
                    </div>
                </div>
                {duration && (
                    <div className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-black/70 text-white text-[10px] font-bold rounded">
                        {duration}
                    </div>
                )}
            </div>
            <div className="p-4">
                <h3 className="font-semibold text-gray-900 line-clamp-2 mb-1.5 group-hover:text-blue-600 transition-colors">
                    {title}
                </h3>
                <p className="text-sm text-gray-500">{channelName}</p>
            </div>
        </a>
    );
}
