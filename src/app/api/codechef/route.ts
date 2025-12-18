import { fetchCodeChefContests } from "@/services/codechef";

export async function GET() {
  try {
    const contests = await fetchCodeChefContests();
    return Response.json(contests);
  } catch (error) {
    console.error("Error fetching CodeChef contests:", error);
    return Response.json(
      { error: "Failed to fetch contests" },
      { status: 500 }
    );
  }
}
