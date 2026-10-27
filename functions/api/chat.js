export async function onRequestPost({ request, env }) {
  try {
    if (!env.AI) return Response.json({ error: "AI service is not enabled for this deployment yet." }, { status: 503 });
    const body = await request.json();
    const prompt = String(body.prompt || "").trim();
    if (!prompt) return Response.json({ error: "Please enter a question." }, { status: 400 });
    if (prompt.length > 24000) return Response.json({ error: "Please shorten the request to 24,000 characters or less." }, { status: 413 });
    const history = Array.isArray(body.history) ? body.history.slice(-10).map(m => ({
      role: m.role === "assistant" ? "assistant" : "user",
      content: String(m.content || "").slice(0, 5000)
    })) : [];
    const messages = [
      { role: "system", content: "You are Makarh AI, a capable, thoughtful assistant. Give specific, professional, useful answers rather than generic filler. Match the user's language, including natural Punjabi/Hinglish when appropriate. For scripts, create a strong hook, detailed body, visuals/timing and CTA when relevant. Be honest about uncertainty. Do not invent facts, citations, or guaranteed medical/financial outcomes. Keep answers clear and actionable." },
      ...history,
      { role: "user", content: prompt }
    ];
    const result = await env.AI.run("@cf/meta/llama-3.1-8b-fast-v2", { messages, max_tokens: 1200 });
    const text = result?.response || result?.choices?.[0]?.message?.content || "";
    if (!text) return Response.json({ error: "The AI model returned an empty response. Please try again." }, { status: 502 });
    return Response.json({ text }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return Response.json({ error: "AI request failed. Please retry shortly.", detail: String(error?.message || error).slice(0, 180) }, { status: 500 });
  }
}
