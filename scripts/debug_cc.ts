
async function test() {
    const username = "indra45919";
    try {
        const response = await fetch(`https://www.codechef.com/users/${username}`, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
            }
        });

        if (!response.ok) {
            console.log("Response not ok:", response.status);
            return;
        }

        const text = await response.text();
        console.log("Page fetched. Length:", text.length);

        // Test Regexes
        const ratingMatch = text.match(/<div class="rating-number">(\d+)<\/div>/);
        console.log("Rating:", ratingMatch ? ratingMatch[1] : "Not found");

        const solvedMatch = text.match(/Fully Solved\s*\((\d+)\)/);
        console.log("Solved:", solvedMatch ? solvedMatch[1] : "Not found");

        const historyMatch = text.match(/(?:var\s+|window\.)?all_rating\s*=\s*(\[[\s\S]*?\]);/);
        console.log("History found:", !!historyMatch);
        if (historyMatch) {
            console.log("History Snippet:", historyMatch[1].substring(0, 100));
        }

        const pointsMatch = text.match(/points\s*=\s*(\[[\s\S]*?\]);/);
        console.log("Heatmap Points found:", !!pointsMatch);

    } catch (e) {
        console.error(e);
    }
}

test();
