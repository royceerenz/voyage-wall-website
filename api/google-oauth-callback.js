const {
  exchangeOAuthCodeForTokens,
  getOAuthRedirectUri
} = require("./google-drive-utils.cjs");

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function renderTokenPage(refreshToken) {
  const token = escapeHtml(refreshToken);
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Voyage Wall Google OAuth</title>
    <style>
      body { font-family: system-ui, sans-serif; max-width: 760px; margin: 48px auto; padding: 0 20px; line-height: 1.5; }
      code { display: block; overflow-wrap: anywhere; white-space: pre-wrap; padding: 16px; border: 1px solid #ccd3df; border-radius: 8px; background: #f6f8fb; }
    </style>
  </head>
  <body>
    <h1>Google refresh token</h1>
    <p>Copy this value into <strong>GOOGLE_REFRESH_TOKEN</strong> in your local environment and Vercel. Treat it like a password.</p>
    <code>${token}</code>
  </body>
</html>`;
}

function renderMissingTokenPage() {
  return `<!doctype html>
<html lang="en">
  <head><meta charset="utf-8"><title>Voyage Wall Google OAuth</title></head>
  <body>
    <h1>No refresh token returned</h1>
    <p>Try the setup link again. The OAuth request uses offline access and consent prompt, but Google may skip a refresh token if access was already granted.</p>
  </body>
</html>`;
}

function getSafeTokenExchangeDiagnostics(error, request, code) {
  return {
    redirectUri: error.redirectUri || getOAuthRedirectUri(request),
    googleError: {
      message: error.googleOAuth?.message || "",
      status: error.googleOAuth?.status || "",
      error: error.googleOAuth?.error || "",
      error_description: error.googleOAuth?.error_description || ""
    },
    requestFields: error.googleOAuth?.requestFields || {
      code: code ? "PRESENT" : "MISSING",
      client_id: process.env.GOOGLE_CLIENT_ID ? "PRESENT" : "MISSING",
      client_secret: process.env.GOOGLE_CLIENT_SECRET ? "PRESENT" : "MISSING",
      redirect_uri: getOAuthRedirectUri(request) ? "PRESENT" : "MISSING",
      grant_type: "authorization_code"
    }
  };
}

module.exports = async function handler(request, response) {
  if (request.method !== "GET") {
    response.setHeader("Allow", "GET");
    response.status(405).json({ ok: false });
    return;
  }

  const code = request.query?.code;
  if (!code) {
    response.status(400).json({ ok: false, error: "Missing OAuth code." });
    return;
  }

  try {
    const tokens = await exchangeOAuthCodeForTokens({
      code,
      redirectUri: getOAuthRedirectUri(request)
    });

    response.setHeader("Content-Type", "text/html; charset=utf-8");
    response.status(200).send(
      tokens.refresh_token ? renderTokenPage(tokens.refresh_token) : renderMissingTokenPage()
    );
  } catch (error) {
    const diagnostics = getSafeTokenExchangeDiagnostics(error, request, code);
    console.error("[Voyage Wall] Google OAuth callback failed.", diagnostics);
    response.status(500).json({
      ok: false,
      error: "Google OAuth token exchange failed.",
      diagnostics
    });
  }
};
