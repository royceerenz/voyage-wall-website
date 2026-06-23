const { downloadDriveFile, parseDriveFileId } = require("./google-drive-utils.cjs");

module.exports = async function handler(request, response) {
  if (request.method !== "GET") {
    response.setHeader("Allow", "GET");
    response.status(405).json({ ok: false });
    return;
  }

  const fileId = parseDriveFileId(request.query?.id || request.query?.url);
  if (!fileId) {
    response.status(400).json({ ok: false, error: "Missing Google Drive file ID." });
    return;
  }

  try {
    const file = await downloadDriveFile(fileId);
    response.setHeader("Content-Type", file.contentType);
    response.setHeader("Cache-Control", "no-store");
    response.status(200).send(file.buffer);
  } catch (error) {
    console.error("[Voyage Wall] Google Drive download failed.", error);
    response.status(500).json({ ok: false, error: "Google Drive download failed." });
  }
};
