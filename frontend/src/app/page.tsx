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
  title: "CodeSync",
  description: "Track the latest competitive programming contests from Codeforces, LeetCode, and CodeChef.",
};

type PageProps = {
  params: Promise<Record<string, never>>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function Home({ params, searchParams }: PageProps) {
  const searchParamsResolved = await searchParams;
  const platform = searchParamsResolved?.platform?.toString().toLowerCase() || "";
  const searchQuery = searchParamsResolved?.contest?.toString() || "";
  const isBookmarksPage = platform === "bookmarks";

  return (
    <div className="min-h-screen bg-background text-foreground font-[family-name:var(--font-geist-sans)] selection:bg-blue-100 relative overflow-x-hidden pt-24">
      <div className="absolute inset-0 -z-10 h-full w-full bg-grid-cream"></div>

      <div className="w-full max-w-6xl mx-auto px-6 py-8 flex flex-col items-center">
        <Header />

        <div className="w-full mt-8 space-y-8">
          <GlobalStats />

          <div className="flex flex-col items-center gap-8">
            <div className="w-full space-y-6">
              <PlatformFilters />
              <RecommendedVideos />
            </div>

            {(!platform || platform === "all platforms") && (
              <div className="w-full">
                <ContestCalendar />
              </div>
            )}

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