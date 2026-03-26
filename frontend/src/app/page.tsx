import { Metadata } from "next";
import RecommendedVideos from "@/components/RecommendedVideos";
import ContestCalendar from "@/components/ContestCalendar";
import InfiniteScrollContestList from "@/components/InfiniteScrollContestList";
import ContestsSearch from "@/components/ContestsSearch";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PlatformFilters from "@/components/PlatformFilters";
import ToggleTheme from "@/components/ToggleTheme";
import ProfileLink from "@/components/ProfileLink";
import GlobalStats from "@/components/GlobalStats";

import { Suspense } from "react";

export const metadata: Metadata = {
  title: "CodeSync Pro",
  description: "Stay updated with the latest competitive programming contests from Codeforces, LeetCode, and CodeChef.",
};

type PageProps = {
  params: Promise<Record<string, never>>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function Home({ params, searchParams }: PageProps) {
  const searchParamsResolved = await searchParams;
  const platform = searchParamsResolved?.platform?.toString().toLowerCase() || "";
  const searchQuery = searchParamsResolved?.contest?.toString() || "";
  // Bookmarks is now a platform filter, not a separate tab
  const isBookmarksPage = platform === "bookmarks";

  return (
    <div className="min-h-screen bg-zinc-950 text-foreground font-[family-name:var(--font-geist-sans)] selection:bg-blue-500/30 relative overflow-x-hidden pt-32">
      <div className="absolute inset-0 -z-10 h-full w-full bg-[radial-gradient(#ffffff05_1px,transparent_1px)] [background-size:32px_32px]"></div>

      <div className="w-full max-w-7xl mx-auto px-6 py-12 flex flex-col items-center">
        {/* Header Section */}
        <Header />

        <div className="w-full mt-12 space-y-12">
          {/* Dashboard Stats */}
          <GlobalStats />



          <div className="flex flex-col items-center gap-12">
            {/* Contextual Recommendation Area */}
            <div className="w-full space-y-6">
              <PlatformFilters />
              <RecommendedVideos />
            </div>

            {/* Visual Timeline (Always shown for 'all' or by default) */}
            {(!platform || platform === "all platforms") && (
              <div className="w-full">
                <ContestCalendar />
              </div>
            )}

            {/* Search and List */}
            <div className="w-full space-y-8">
              <div className="flex justify-center">
                <ContestsSearch />
              </div>

              <InfiniteScrollContestList
                platform={platform}
                searchQuery={searchQuery}
                isBookmarksPage={isBookmarksPage}
              />
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </div>
  );
}
