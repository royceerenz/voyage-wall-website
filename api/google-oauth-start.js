const {
  getGoogleOAuthDiagnostics,
  getGoogleOAuthStartUrl
} = require("./google-drive-utils.cjs");

module.exports = async function handler(request, response) {
  if (request.method !== "GET") {
    response.setHeader("Allow", "GET");
    response.status(405).json({ ok: false });
    return;
  }

  try {
    response.writeHead(302, {
      Location: getGoogleOAuthStartUrl(request)
    });
    response.end();
  } catch (error) {
    console.error("[Voyage Wall] Google OAuth start failed.", error);
    response.status(500).json({
      ok: false,
      error: "Google OAuth is not configured.",
      diagnostics: getGoogleOAuthDiagnostics(request)
    });
  }
};
