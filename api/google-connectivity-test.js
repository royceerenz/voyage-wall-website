const https = require("https");

function testGoogleConnectivity() {
  return new Promise((resolve) => {
    const request = https.request("https://oauth2.googleapis.com/", {
      method: "GET",
      timeout: 10000
    }, (googleResponse) => {
      googleResponse.resume();
      resolve({
        reachable: true,
        error: ""
      });
    });

    request.on("timeout", () => {
      request.destroy(new Error("Request timed out."));
    });

    request.on("error", (error) => {
      resolve({
        reachable: false,
        error: error.message || "Connection failed."
      });
    });

    request.end();
  });
}

module.exports = async function handler(request, response) {
  if (request.method !== "GET") {
    response.setHeader("Allow", "GET");
    response.status(405).json({ ok: false });
    return;
  }

  const result = await testGoogleConnectivity();
  response.status(200).json({
    reachable: result.reachable ? "reachable" : "unreachable",
    error: result.error || ""
  });
};
