import { Contest } from "@/types/contest";
import { getDate } from "@/lib/parser";
import { NextResponse, NextRequest } from "next/server";
import { baseUrl } from "@/lib/constant";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1");
  let contests: Contest[] = [];

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

  const [codechefData, codeforcesData, leetcodeData] = await Promise.all([
    fetch(`${apiBaseUrl}/api/codechef`).then((res) => res.json()),
    fetch(`${apiBaseUrl}/api/codeforces`).then((res) => res.json()),
    fetch(`${apiBaseUrl}/api/leetcode`, {
      cache: "no-store",
      headers: {
        "Cache-Control": "no-cache",
      },
    })
      .then((res) => res.json())
      .catch((err) => {
        console.log(err);
        return [];
      }),
  ]);

  contests = [
    ...(Array.isArray(codechefData) ? codechefData : []),
    ...(Array.isArray(codeforcesData) ? codeforcesData : []),
    ...(Array.isArray(leetcodeData) ? leetcodeData : []),
  ];
  // console.log(typeof contests[0].startTime);
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
}
