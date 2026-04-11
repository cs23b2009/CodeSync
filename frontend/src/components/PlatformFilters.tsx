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
      className: "border-blue-200",
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
      className: "border-gray-200",
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
        return "bg-blue-50 text-blue-700 border-blue-300 shadow-sm";
      case "codechef":
        return "bg-amber-50 text-amber-700 border-amber-300 shadow-sm";
      case "leetcode":
        return "bg-amber-50 text-amber-700 border-amber-300 shadow-sm";
      case "bookmarks":
        return "bg-gray-900 text-white border-gray-900";
      default:
        return "bg-blue-50 text-blue-700 border-blue-300 shadow-sm";
    }
  };

  const fetchInActiveStyles = (button: any): string => {
    return "bg-white text-gray-500 border-gray-200 hover:bg-gray-50 hover:text-gray-700 hover:border-gray-300";
  };

  const createQueryString = (newPlatform: string) => {
    const params = new URLSearchParams(searchParams.toString());
    const contest = params.get("contest");

    const newParams = new URLSearchParams();

    if (newPlatform.toLowerCase() !== "all platforms") {
      newParams.set("platform", newPlatform.toLowerCase());
    }

    if (contest) {
      newParams.set("contest", contest);
    }

    return newParams.toString();
  };

  return (
    <div className="flex items-center w-full justify-center gap-2 mb-6 overflow-x-auto no-scrollbar py-1">
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
                `cursor-pointer flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-full border transition-all duration-200`,
                styles
              )}
              href={href}
              replace={true}
            >
              <span className="text-base">{button.icon}</span>
              <span>{button.title}</span>
            </Link>
          </div>
        );
      })}
    </div>
  );
}