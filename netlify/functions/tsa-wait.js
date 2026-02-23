export default async (request) => {
  try {
    const url = new URL(request.url);
    const airport = (url.searchParams.get("airport") || "").trim().toUpperCase();

    if (!/^[A-Z]{3}$/.test(airport)) {
      return new Response(JSON.stringify({ error: "Invalid airport code. Use 3 letters (e.g., CLT)." }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // TODO: Replace this with your real TSA feed endpoint.
    // Common failure here is: wrong endpoint, blocked by TSA, missing API key, or CORS issues.
    // If the TSA endpoint requires a key, set it in Netlify env vars and read it here.
    const TSA_API_KEY = process.env.TSA_API_KEY; // if needed
    // if (!TSA_API_KEY) throw new Error("Missing TSA_API_KEY env var");

    // Example placeholder response (so the UI works even before you wire the feed):
    const demo = {
      airport,
      WaitTimes: [
        { Checkpoint: "Main Checkpoint", Lane: "PreCheck", WaitTime: "5–10 min", Created: "Live (demo)" },
        { Checkpoint: "Main Checkpoint", Lane: "Standard", WaitTime: "15–25 min", Created: "Live (demo)" },
      ],
    };

    return new Response(JSON.stringify(demo), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
      },
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err?.message || "Unhandled error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
