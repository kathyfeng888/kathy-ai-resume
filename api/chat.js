export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.DIFY_API_KEY;
  const apiUrl = process.env.DIFY_API_URL || "https://api.dify.ai/v1";

  if (!apiKey) {
    return res.status(500).json({ error: "DIFY_API_KEY is not configured" });
  }

  const { query, conversation_id } = req.body || {};

  if (!query || typeof query !== "string") {
    return res.status(400).json({ error: "query is required" });
  }

  try {
    const difyRes = await fetch(`${apiUrl.replace(/\/$/, "")}/chat-messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: {},
        query,
        response_mode: "blocking",
        conversation_id: conversation_id || "",
        user: "portfolio-visitor",
      }),
    });

    const data = await difyRes.json();

    if (!difyRes.ok) {
      return res.status(difyRes.status).json({
        error: data.message || data.error || "Dify request failed",
      });
    }

    return res.status(200).json({
      answer: data.answer || "",
      conversation_id: data.conversation_id || conversation_id || "",
      message_id: data.message_id || "",
    });
  } catch (error) {
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Unknown server error",
    });
  }
}
