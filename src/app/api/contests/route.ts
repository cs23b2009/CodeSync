import { Contest } from "@/types/contest";
import { fetchCodeChefContests } from "@/services/codechef";
import { fetchCodeForcesContests } from "@/services/codeforces";
import { fetchLeetCodeContests } from "@/services/leetcode";

export async function GET() {
  try {
    const [codechefData, codeforcesData, leetcodeData] = await Promise.all([
      fetchCodeChefContests(),
      fetchCodeForcesContests(),
      fetchLeetCodeContests(),
    ]);

    const sortByStartTime = (a: Contest, b: Contest) =>
      new Date(a.startTimeISO).getTime() - new Date(b.startTimeISO).getTime();

    const sortedCodechef = codechefData.sort(sortByStartTime);
    const sortedCodeforces = codeforcesData.sort(sortByStartTime);
    const sortedLeetcode = leetcodeData.sort(sortByStartTime);

    const allContests: Contest[] = [
      ...sortedCodechef,
      ...sortedCodeforces,
      ...sortedLeetcode,
    ];

    return Response.json(allContests);
  } catch (error) {
    console.error("Error fetching contests:", error);
    return Response.json(
      { error: "Failed to fetch contests" },
      { status: 500 }
    );
  }
}
