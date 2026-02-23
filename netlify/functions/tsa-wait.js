exports.handler = async (event) => {
  const airport = event.queryStringParameters.airport;

  if (!airport) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Airport code required" })
    };
  }

  try {
    const res = await fetch(
      `https://apps.tsa.dhs.gov/MyTSAWebService/GetConfirmedWaitTimes.ashx?ap=${airport}&output=json`
    );

    const data = await res.json();

    return {
      statusCode: 200,
      body: JSON.stringify(data)
    };

  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "TSA fetch failed" })
    };
  }
};
