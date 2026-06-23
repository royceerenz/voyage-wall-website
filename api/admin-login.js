module.exports = async function handler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    response.status(405).json({ ok: false });
    return;
  }

  const expectedUsername = process.env.ADMIN_USERNAME;
  const expectedPassword = process.env.ADMIN_PASSWORD;

  if (!expectedUsername || !expectedPassword) {
    response.status(500).json({ ok: false });
    return;
  }

  let body = {};
  try {
    body = typeof request.body === "string"
      ? JSON.parse(request.body || "{}")
      : request.body || {};
  } catch {
    response.status(400).json({ ok: false });
    return;
  }

  const isValid =
    body.username === expectedUsername &&
    body.password === expectedPassword;

  if (!isValid) {
    response.status(401).json({ ok: false });
    return;
  }

  response.status(200).json({ ok: true });
};
