require("dotenv").config({ path: require("path").join(__dirname, ".env"), quiet: true });

const http = require("http");
const https = require("https");
const fs = require("fs");
const path = require("path");
const {
  downloadDriveFile,
  exchangeOAuthCodeForTokens,
  getGoogleOAuthDiagnostics,
  getGoogleOAuthStartUrl,
  getOAuthRedirectUri,
  parseDriveFileId,
  uploadOriginalImageToDrive
} = require("./api/google-drive-utils.cjs");

const root = __dirname;
const port = 4173;
const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".mp4": "video/mp4",
  ".webp": "image/webp",
  ".svg": "image/svg+xml"
};

function readBody(request) {
  return new Promise((resolve, reject) => {
    let body = "";
    request.on("data", (chunk) => {
      body += chunk;
      if (body.length > 30 * 1024 * 1024) {
        reject(new Error("Request body is too large."));
        request.destroy();
      }
    });
    request.on("end", () => resolve(body));
    request.on("error", reject);
  });
}

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, { "Content-Type": "application/json; charset=utf-8" });
  response.end(JSON.stringify(payload));
}

function testGoogleConnectivity() {
  return new Promise((resolve) => {
    const request = https.request("https://oauth2.googleapis.com/", {
      method: "GET",
      timeout: 10000
    }, (googleResponse) => {
      googleResponse.resume();
      resolve({
        reachable: true,
        status: googleResponse.statusCode || 0,
        error: ""
      });
    });

    request.on("timeout", () => {
      request.destroy(new Error("Request timed out."));
    });

    request.on("error", (error) => {
      resolve({
        reachable: false,
        status: 0,
        error: error.message || "Connection failed."
      });
    });

    request.end();
  });
}

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function sendRefreshTokenPage(response, refreshToken) {
  response.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
  response.end(`<!doctype html>
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
    <code>${escapeHtml(refreshToken)}</code>
  </body>
</html>`);
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

const server = http.createServer(async (request, response) => {
  const requestUrl = new URL(request.url, "http://localhost");
  const urlPath = decodeURIComponent(requestUrl.pathname);
  if (urlPath === "/api/admin-login") {
    if (request.method !== "POST") {
      response.writeHead(405, {
        "Allow": "POST",
        "Content-Type": "application/json; charset=utf-8"
      });
      response.end(JSON.stringify({ ok: false }));
      return;
    }

    try {
      const body = await readBody(request);
      const expectedUsername = process.env.ADMIN_USERNAME;
      const expectedPassword = process.env.ADMIN_PASSWORD;

      if (!expectedUsername || !expectedPassword) {
        sendJson(response, 500, { ok: false });
        return;
      }

      const credentials = JSON.parse(body || "{}");
      const isValid =
        credentials.username === expectedUsername &&
        credentials.password === expectedPassword;

      sendJson(response, isValid ? 200 : 401, { ok: isValid });
    } catch {
      sendJson(response, 400, { ok: false });
    }
    return;
  }

  if (urlPath === "/api/google-connectivity-test") {
    if (request.method !== "GET") {
      response.writeHead(405, {
        "Allow": "GET",
        "Content-Type": "application/json; charset=utf-8"
      });
      response.end(JSON.stringify({ ok: false }));
      return;
    }

    const result = await testGoogleConnectivity();
    sendJson(response, 200, {
      reachable: result.reachable ? "reachable" : "unreachable",
      error: result.error || ""
    });
    return;
  }

  if (urlPath === "/api/google-oauth-start") {
    if (request.method !== "GET") {
      response.writeHead(405, {
        "Allow": "GET",
        "Content-Type": "application/json; charset=utf-8"
      });
      response.end(JSON.stringify({ ok: false }));
      return;
    }

    try {
      response.writeHead(302, {
        Location: getGoogleOAuthStartUrl(request)
      });
      response.end();
    } catch (error) {
      console.error("[Voyage Wall] Google OAuth start failed.", error);
      sendJson(response, 500, {
        ok: false,
        error: "Google OAuth is not configured.",
        diagnostics: getGoogleOAuthDiagnostics(request)
      });
    }
    return;
  }

  if (urlPath === "/api/google-oauth-callback") {
    if (request.method !== "GET") {
      response.writeHead(405, {
        "Allow": "GET",
        "Content-Type": "application/json; charset=utf-8"
      });
      response.end(JSON.stringify({ ok: false }));
      return;
    }

    const code = requestUrl.searchParams.get("code");
    if (!code) {
      sendJson(response, 400, { ok: false, error: "Missing OAuth code." });
      return;
    }

    try {
      const tokens = await exchangeOAuthCodeForTokens({
        code,
        redirectUri: getOAuthRedirectUri(request)
      });

      if (!tokens.refresh_token) {
        response.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
        response.end(`<!doctype html>
<html lang="en">
  <head><meta charset="utf-8"><title>Voyage Wall Google OAuth</title></head>
  <body>
    <h1>No refresh token returned</h1>
    <p>Try the setup link again. The OAuth request uses offline access and consent prompt, but Google may skip a refresh token if access was already granted.</p>
  </body>
</html>`);
        return;
      }

      sendRefreshTokenPage(response, tokens.refresh_token);
    } catch (error) {
      const diagnostics = getSafeTokenExchangeDiagnostics(error, request, code);
      console.error("[Voyage Wall] Google OAuth callback failed.", diagnostics);
      sendJson(response, 500, {
        ok: false,
        error: "Google OAuth token exchange failed.",
        diagnostics
      });
    }
    return;
  }

  if (urlPath === "/api/google-drive-upload") {
    if (request.method !== "POST") {
      response.writeHead(405, {
        "Allow": "POST",
        "Content-Type": "application/json; charset=utf-8"
      });
      response.end(JSON.stringify({ ok: false }));
      return;
    }

    try {
      const body = JSON.parse(await readBody(request) || "{}");
      const result = await uploadOriginalImageToDrive({
        filename: body.filename,
        mimeType: body.mimeType,
        data: body.data
      });
      sendJson(response, 200, { ok: true, ...result });
    } catch (error) {
      console.error("[Voyage Wall] Google Drive upload failed.", error);
      sendJson(response, 500, { ok: false, error: "Google Drive upload failed." });
    }
    return;
  }

  if (urlPath === "/api/google-drive-download") {
    if (request.method !== "GET") {
      response.writeHead(405, {
        "Allow": "GET",
        "Content-Type": "application/json; charset=utf-8"
      });
      response.end(JSON.stringify({ ok: false }));
      return;
    }

    const fileId = parseDriveFileId(requestUrl.searchParams.get("id") || requestUrl.searchParams.get("url"));
    if (!fileId) {
      sendJson(response, 400, { ok: false, error: "Missing Google Drive file ID." });
      return;
    }

    try {
      const file = await downloadDriveFile(fileId);
      response.writeHead(200, {
        "Content-Type": file.contentType,
        "Cache-Control": "no-store"
      });
      response.end(file.buffer);
    } catch (error) {
      console.error("[Voyage Wall] Google Drive download failed.", error);
      sendJson(response, 500, { ok: false, error: "Google Drive download failed." });
    }
    return;
  }

  const routes = {
    "/": "index.html",
    "/admin-login-client": "admin-login-client.html",
    "/admin/wall": "admin/wall.html"
  };
  const requestedPath = routes[urlPath] || urlPath.slice(1);
  const filePath = path.resolve(root, requestedPath);

  if (!filePath.startsWith(root)) {
    response.writeHead(403);
    response.end("Forbidden");
    return;
  }

  fs.readFile(filePath, (error, data) => {
    if (error) {
      response.writeHead(404);
      response.end("Not found");
      return;
    }

    response.writeHead(200, {
      "Content-Type": types[path.extname(filePath).toLowerCase()] || "application/octet-stream"
    });
    response.end(data);
  });
});

server.listen(port, "127.0.0.1", () => {
  console.log(`Voyage Wall running at http://127.0.0.1:${port}`);
});
