const { uploadOriginalImageToDrive } = require("./google-drive-utils.cjs");

module.exports = async function handler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    response.status(405).json({ ok: false });
    return;
  }

  let body = {};
  try {
    body = typeof request.body === "string"
      ? JSON.parse(request.body || "{}")
      : request.body || {};
  } catch {
    response.status(400).json({ ok: false, error: "Invalid request body." });
    return;
  }

  try {
    const result = await uploadOriginalImageToDrive({
      filename: body.filename,
      mimeType: body.mimeType,
      data: body.data
    });

    response.status(200).json({ ok: true, ...result });
  } catch (error) {
    console.error("[Voyage Wall] Google Drive upload failed.", error);
    response.status(500).json({ ok: false, error: "Google Drive upload failed." });
  }
};
