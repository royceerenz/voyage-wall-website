require("dotenv").config({ path: require("path").join(__dirname, "..", ".env"), quiet: true });

const readline = require("readline");
const { OAuth2Client } = require("google-auth-library");

const DRIVE_SCOPE = "https://www.googleapis.com/auth/drive.file";
const REDIRECT_URI = "http://127.0.0.1:4173/api/google-oauth-callback";

const clientId = process.env.GOOGLE_CLIENT_ID;
const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

function ask(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

function extractCode(input) {
  if (!input) return "";

  try {
    const url = new URL(input);
    return url.searchParams.get("code") || "";
  } catch {
    return input;
  }
}

async function main() {
  if (!clientId || !clientSecret) {
    console.error("GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET is MISSING.");
    process.exitCode = 1;
    return;
  }

  const oauth2Client = new OAuth2Client(clientId, clientSecret, REDIRECT_URI);
  const consentUrl = oauth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: [DRIVE_SCOPE]
  });

  console.log("Open this URL and approve access:");
  console.log(consentUrl);
  console.log("");

  const pasted = await ask("Paste the full callback URL or authorization code: ");
  const code = extractCode(pasted);

  if (!code) {
    console.error("Authorization code is MISSING.");
    process.exitCode = 1;
    return;
  }

  try {
    const { tokens } = await oauth2Client.getToken(code);

    if (!tokens.refresh_token) {
      console.error("GOOGLE_REFRESH_TOKEN is MISSING. Re-run and approve the consent prompt again.");
      process.exitCode = 1;
      return;
    }

    console.log("");
    console.log(`GOOGLE_REFRESH_TOKEN=${tokens.refresh_token}`);
  } catch (error) {
    console.error("Google OAuth token exchange failed.");
    console.error(`message: ${error.message || ""}`);
    console.error(`status: ${error.response?.status || ""}`);
    console.error(`error: ${error.response?.data?.error || ""}`);
    console.error(`error_description: ${error.response?.data?.error_description || ""}`);
    process.exitCode = 1;
  }
}

main();
