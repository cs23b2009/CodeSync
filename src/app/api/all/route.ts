import { Contest } from "@/types/contest";
import { getDate } from "@/lib/parser";
import { NextRequest } from "next/server";
import { fetchCodeChefContests } from "@/services/codechef";
import { fetchCodeForcesContests } from "@/services/codeforces";
import { fetchLeetCodeContests } from "@/services/leetcode";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1");
  let contests: Contest[] = [];

  try {
    const [codechefData, codeforcesData, leetcodeData] = await Promise.all([
      fetchCodeChefContests(),
      fetchCodeForcesContests(),
      fetchLeetCodeContests(),
    ]);

    contests = [
      ...(Array.isArray(codechefData) ? codechefData : []),
      ...(Array.isArray(codeforcesData) ? codeforcesData : []),
      ...(Array.isArray(leetcodeData) ? leetcodeData : []),
    ];

    const x = contests
      .filter((contest) => contest.status === "upcoming")
      .sort((a, b) => {
        const da = getDate(a.startTimeISO);
        const db = getDate(b.startTimeISO);
        return da - db;
      });
    const y = contests.filter((contest) => contest.status !== "upcoming");
    contests = [...x, ...y];

    const limitParam = searchParams.get("limit");
    const contests_per_page = limitParam ? parseInt(limitParam) : 9;

    const total_contests = contests.length;
    const no_of_pages = Math.ceil(total_contests / contests_per_page);

    let start = (page - 1) * contests_per_page;
    // Handle case where start is out of bounds (e.g. limit changed)
    if (start < 0) start = 0;

    let end = start + contests_per_page;

    const paginatedContests = contests.slice(start, end);

    return Response.json({
      contests: paginatedContests,
      pagination: {
        current_page: page,
        no_of_pages: no_of_pages,
        total_contests: total_contests,
        contests_per_page: contests_per_page,
      },
    });
  } catch (error) {
    console.error("Error fetching all contests:", error);
    return Response.json({
      contests: [],
      pagination: {
        current_page: 1,
        no_of_pages: 0,
        total_contests: 0,
        contests_per_page: 9
      }
    });
  }
}
