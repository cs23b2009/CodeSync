"use client";
import { cn } from "@/lib/utils";
import { Globe, Bookmark, Youtube } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CodeforcesLogo, LeetCodeLogo, CodeChefLogo } from "./Icons";

export default function PlatformFilters() {
  const buttons = [
    {
      icon: <Globe size={14} />,
      title: "All Platforms",
      className: "border-blue-500/50",
    },
    {
      icon: <CodeforcesLogo size={16} />,
      title: "Codeforces",
      className: "border-cf/20",
    },
    {
      icon: <LeetCodeLogo size={16} />,
      title: "LeetCode",
      className: "border-lc/20",
    },
    {
      icon: <CodeChefLogo size={16} />,
      title: "CodeChef",
      className: "border-cc/20",
    },
    {
      icon: <Bookmark size={14} />,
      title: "Bookmarks",
      className: "border-blue-500/20",
    }
  ];

  const searchParams = useSearchParams();
  const platform = searchParams.get("platform");

  const isActive = (currPlatform: string) => {
    if (currPlatform === "all platforms") {
      return !platform;
    }
    return platform === currPlatform;
  };

  const fetchActiveStyles = (platform: string): string => {
    switch (platform) {
      case "codeforces":
        return "bg-blue-500/20 text-blue-400 border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.3)]";
      case "codechef":
        return "bg-amber-500/20 text-amber-400 border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.3)]";
      case "leetcode":
        return "bg-yellow-500/20 text-yellow-500 border-yellow-500/50 shadow-[0_0_15px_rgba(234,179,8,0.3)]";
      case "bookmarks":
        return "bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.3)]";
      default:
        return "bg-blue-600 text-white border-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.4)]";
    }
  };

  const fetchInActiveStyles = (button: any): string => {
    return "bg-zinc-900/60 text-zinc-500 border-zinc-800/80 hover:bg-zinc-800 hover:text-white hover:border-zinc-700";
  };

  const createQueryString = (newPlatform: string) => {
    const params = new URLSearchParams(searchParams.toString());
    const contest = params.get("contest");

    const newParams = new URLSearchParams();

    // If it's an action button like "Upload YT Link", we might handle it differently.
    // For now treating it as a link, but it might need to open a modal.
    if (newPlatform === "Upload YT Link") {
      return "modal=upload"; // Or just return null if it's a button not a link? 
      // For now let's assume it navigates or does nothing.
    }

    if (newPlatform.toLowerCase() !== "all platforms") {
      newParams.set("platform", newPlatform.toLowerCase());
    }

    if (contest) {
      newParams.set("contest", contest);
    }

    return newParams.toString();
  };

  return (
    <div className="flex items-center w-full justify-center gap-3 mb-8 overflow-x-auto no-scrollbar py-2">
      {buttons.map((button) => {
        const queryString = createQueryString(button.title);
        const href = queryString ? `/?${queryString}` : "/";

        const styles = isActive(button.title.toLowerCase())
          ? fetchActiveStyles(button.title.toLowerCase())
          : fetchInActiveStyles(button);

        return (
          <div
            key={button.title}
          >
            <Link
              className={cn(
                `cursor-pointer flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-full border transition-all duration-300`,
                styles
              )}
              href={href}
              replace={true}
            >
              <span className="text-lg">{button.icon}</span>
              <span>{button.title}</span>
            </Link>
          </div>
        );
      })}
    </div>
  );
}
