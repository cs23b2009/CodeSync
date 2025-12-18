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
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 text-foreground font-[family-name:var(--font-geist-sans)] selection:bg-blue-500/30 relative overflow-x-hidden">
      <div className="absolute inset-0 -z-10 h-full w-full dark:bg-[radial-gradient(#ffffff1a_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_100%,transparent_100%)]"></div>
      {/* Top Right Theme Toggle */}
      <div className="absolute top-4 right-4 z-50 flex items-center gap-3">
        <ProfileLink />
        <ToggleTheme />
      </div>

      <div className="w-full px-4 md:px-8 py-8 md:py-12 flex flex-col items-center">
        {/* Header Section */}
        <Header />

        <div className="w-full mt-8">
          {/* Filters and Search */}
          <div className="flex flex-col items-center gap-6">
            <PlatformFilters />

            <RecommendedVideos />

            {(!platform || platform === "all platforms") && (
              <div className="w-full mt-4 mb-4">
                <ContestCalendar />
              </div>
            )}

            <ContestsSearch />
          </div>

          {/* Main Content Grid */}
          <div className="w-full mt-8">
            <InfiniteScrollContestList
              platform={platform}
              searchQuery={searchQuery}
              isBookmarksPage={isBookmarksPage}
            />
          </div>
        </div>

        <Footer />
      </div>
    </div>
  );
}
