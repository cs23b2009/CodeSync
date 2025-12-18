import { fetchLeetCodeContests } from "@/services/leetcode";

export async function GET() {
  try {
    const contests = await fetchLeetCodeContests();

    return new Response(JSON.stringify(contests), {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    });
  } catch (error) {
    console.error("Error fetching LeetCode contests:", error);

    return new Response(JSON.stringify([]), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
}
