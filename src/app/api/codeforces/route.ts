import { fetchCodeForcesContests } from "@/services/codeforces";

export async function GET() {
  try {
    const contests = await fetchCodeForcesContests();

    return new Response(JSON.stringify(contests), {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, s-maxage=300",
      },
    });
  } catch (error) {
    console.error("Error fetching CodeForces contests:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch contests" }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
}
