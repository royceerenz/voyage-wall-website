const crypto = require("crypto");
const { OAuth2Client } = require("google-auth-library");

const DRIVE_SCOPE = "https://www.googleapis.com/auth/drive.file";
const AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const TOKEN_URL = "https://oauth2.googleapis.com/token";
const DRIVE_UPLOAD_URL =
  "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,webViewLink,webContentLink";

let cachedToken = null;

function getGoogleConfig() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;

  if (!clientId || !clientSecret || !folderId) {
    throw new Error("Google Drive upload is not configured.");
  }

  return {
    clientId,
    clientSecret,
    folderId
  };
}

function getOAuthConfig() {
  const config = getGoogleConfig();
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;

  if (!refreshToken) {
    throw new Error("Google OAuth refresh token is not configured.");
  }

  return {
    ...config,
    refreshToken
  };
}

function getBaseUrl(request) {
  const host = request.headers?.["x-forwarded-host"] || request.headers?.host;
  const protocol = request.headers?.["x-forwarded-proto"] || "http";

  if (!host) {
    return "http://127.0.0.1:4173";
  }

  return `${protocol}://${host}`;
}

function getOAuthRedirectUri(request) {
  return process.env.GOOGLE_OAUTH_REDIRECT_URI || `${getBaseUrl(request)}/api/google-oauth-callback`;
}

function getGoogleOAuthDiagnostics(request) {
  return {
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ? "PRESENT" : "MISSING",
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET ? "PRESENT" : "MISSING",
    redirectUri: getOAuthRedirectUri(request)
  };
}

function getGoogleOAuthStartUrl(request) {
  const { clientId } = getGoogleConfig();
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: getOAuthRedirectUri(request),
    response_type: "code",
    scope: DRIVE_SCOPE,
    access_type: "offline",
    prompt: "consent"
  });

  return `${AUTH_URL}?${params.toString()}`;
}

async function exchangeOAuthCodeForTokens({ code, redirectUri }) {
  const { clientId, clientSecret } = getGoogleConfig();
  const requestFields = {
    code: code ? "PRESENT" : "MISSING",
    client_id: clientId ? "PRESENT" : "MISSING",
    client_secret: clientSecret ? "PRESENT" : "MISSING",
    redirect_uri: redirectUri ? "PRESENT" : "MISSING",
    grant_type: "authorization_code"
  };

  try {
    const oauth2Client = new OAuth2Client(clientId, clientSecret, redirectUri);
    const { tokens } = await oauth2Client.getToken(code);
    return tokens;
  } catch (tokenError) {
    const error = new Error("Google OAuth token exchange failed.");
    error.googleOAuth = {
      message: tokenError.message || "",
      status: tokenError.response?.status || "",
      error: tokenError.response?.data?.error || "",
      error_description: tokenError.response?.data?.error_description || "",
      requestFields
    };
    error.redirectUri = redirectUri;
    throw error;
  }
}

async function getAccessToken() {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 60000) {
    return cachedToken.value;
  }

  const { clientId, clientSecret, refreshToken } = getOAuthConfig();
  const response = await fetch(TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: "refresh_token"
    })
  });

  const token = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(`Google OAuth refresh failed with status ${response.status}`);
  }

  cachedToken = {
    value: token.access_token,
    expiresAt: Date.now() + Number(token.expires_in || 3600) * 1000
  };
  return cachedToken.value;
}

function parseDriveFileId(source) {
  if (!source) return "";
  const value = String(source).trim();
  if (value.startsWith("gdrive:")) return value.slice("gdrive:".length);
  if (/^[a-zA-Z0-9_-]{20,}$/.test(value)) return value;

  try {
    const url = new URL(value);
    const queryId = url.searchParams.get("id");
    if (queryId) return queryId;
    const fileMatch = url.pathname.match(/\/file\/d\/([^/]+)/);
    if (fileMatch?.[1]) return fileMatch[1];
  } catch {
    return "";
  }

  return "";
}

async function uploadOriginalImageToDrive({ filename, mimeType, data }) {
  const { folderId } = getGoogleConfig();
  const accessToken = await getAccessToken();
  const boundary = `voyage-wall-${crypto.randomUUID()}`;
  const metadata = {
    name: filename || `voyage-wall-original-${Date.now()}`,
    parents: [folderId]
  };
  const fileBuffer = Buffer.from(data || "", "base64");

  if (fileBuffer.length === 0) {
    throw new Error("Original image payload is empty.");
  }

  const multipartBody = Buffer.concat([
    Buffer.from(
      `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(metadata)}\r\n`
    ),
    Buffer.from(`--${boundary}\r\nContent-Type: ${mimeType || "application/octet-stream"}\r\n\r\n`),
    fileBuffer,
    Buffer.from(`\r\n--${boundary}--`)
  ]);

  const response = await fetch(DRIVE_UPLOAD_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": `multipart/related; boundary=${boundary}`,
      "Content-Length": String(multipartBody.length)
    },
    body: multipartBody
  });

  if (!response.ok) {
    throw new Error(`Google Drive upload failed with status ${response.status}`);
  }

  const file = await response.json();
  return {
    fileId: file.id,
    original_image_url: `gdrive:${file.id}`,
    webViewLink: file.webViewLink,
    webContentLink: file.webContentLink
  };
}

async function downloadDriveFile(fileId) {
  const accessToken = await getAccessToken();
  const response = await fetch(
    `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(fileId)}?alt=media`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    }
  );

  if (!response.ok) {
    throw new Error(`Google Drive download failed with status ${response.status}`);
  }

  return {
    buffer: Buffer.from(await response.arrayBuffer()),
    contentType: response.headers.get("content-type") || "application/octet-stream"
  };
}

module.exports = {
  downloadDriveFile,
  exchangeOAuthCodeForTokens,
  getGoogleOAuthDiagnostics,
  getGoogleOAuthStartUrl,
  getOAuthRedirectUri,
  parseDriveFileId,
  uploadOriginalImageToDrive
};
