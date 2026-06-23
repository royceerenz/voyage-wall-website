const http = require("http");
const fs = require("fs");
const path = require("path");
const {
  downloadDriveFile,
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
