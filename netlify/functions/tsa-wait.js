export default async (request) => {
  try {
    const url = new URL(request.url);
    const airport = (url.searchParams.get("airport") || "").trim().toUpperCase();

    if (!/^[A-Z]{3}$/.test(airport)) {
      return new Response(JSON.stringify({ error: "Invalid airport code." }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const tsaRes = await fetch(
      `https://apps.tsa.dhs.gov/MyTSAWebService/GetConfirmedWaitTimes.ashx?ap=${airport}&output=json`,
      {
        headers: {
          "User-Agent": "Mozilla/5.0"
        }
      }
    );

    if (!tsaRes.ok) {
      throw new Error(`TSA upstream error ${tsaRes.status}`);
    }

    const data = await tsaRes.json();

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
