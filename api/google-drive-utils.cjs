const crypto = require("crypto");

const DRIVE_SCOPE = "https://www.googleapis.com/auth/drive.file";
const TOKEN_URL = "https://oauth2.googleapis.com/token";
const DRIVE_UPLOAD_URL =
  "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,webViewLink,webContentLink";

let cachedToken = null;

function base64Url(input) {
  return Buffer.from(input)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function normalizePrivateKey(privateKey) {
  return privateKey.replace(/\\n/g, "\n");
}

function getGoogleConfig() {
  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY;
  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;

  if (!clientEmail || !privateKey || !folderId) {
    throw new Error("Google Drive upload is not configured.");
  }

  return {
    clientEmail,
    privateKey: normalizePrivateKey(privateKey),
    folderId
  };
}

function createServiceAccountJwt() {
  const { clientEmail, privateKey } = getGoogleConfig();
  const now = Math.floor(Date.now() / 1000);
  const header = {
    alg: "RS256",
    typ: "JWT"
  };
  const claimSet = {
    iss: clientEmail,
    scope: DRIVE_SCOPE,
    aud: TOKEN_URL,
    exp: now + 3600,
    iat: now
  };
  const unsignedJwt = `${base64Url(JSON.stringify(header))}.${base64Url(JSON.stringify(claimSet))}`;
  const signer = crypto.createSign("RSA-SHA256");
  signer.update(unsignedJwt);
  signer.end();
  return `${unsignedJwt}.${base64Url(signer.sign(privateKey))}`;
}

async function getAccessToken() {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 60000) {
    return cachedToken.value;
  }

  const assertion = createServiceAccountJwt();
  const response = await fetch(TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion
    })
  });

  if (!response.ok) {
    throw new Error(`Google auth failed with status ${response.status}`);
  }

  const token = await response.json();
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
  parseDriveFileId,
  uploadOriginalImageToDrive
};
