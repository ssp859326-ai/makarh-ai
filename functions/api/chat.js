async function currentUser(request,env){const token=(request.headers.get("Cookie")||"").split(";").map(x=>x.trim()).find(x=>x.startsWith("makarh_session="))?.slice(15);if(!token)return null;const b=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(token)),h=[...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,"0")).join("");return env.DB.prepare("SELECT u.id FROM auth_sessions s JOIN auth_users u ON u.id=s.user_id WHERE s.token_hash=? AND s.expires_at>datetime('now')").bind(h).first()}
export async function onRequestPost({ request, env }) {
  try {
    if (!env.AI) return Response.json({ error: "AI service is not enabled for this deployment yet." }, { status: 503 });
    if (!env.DB) return Response.json({ error: "Account database is not configured." }, { status: 503 });
    if (!await currentUser(request, env)) return Response.json({ error: "Please log in to use Makarh AI chat." }, { status: 401 });
    const body = await request.json();
    const prompt = String(body.prompt || "").trim();
    const imageData = typeof body.imageData === "string" ? body.imageData : null;
    if (imageData && (imageData.length > 7_000_000 || !/^data:image\/(png|jpeg|jpg|webp|gif);base64,/i.test(imageData))) return Response.json({ error: "Please attach a supported image under 5 MB." }, { status: 413 });
    if (!prompt) return Response.json({ error: "Please enter a question." }, { status: 400 });
    if (prompt.length > 24000) return Response.json({ error: "Please shorten the request to 24,000 characters or less." }, { status: 413 });
    const history = Array.isArray(body.history) ? body.history.slice(-10).map(m => ({
      role: m.role === "assistant" ? "assistant" : "user",
      content: String(m.content || "").slice(0, 5000)
    })) : [];
    const messages = [
      { role: "system", content: "You are Makarh AI, a high-quality general-purpose assistant. Solve the user's actual task rather than merely repeating or paraphrasing it. Be specific, accurate, structured, professional, and useful. Match the user's language and writing style. IMPORTANT LANGUAGE RULE: If the user writes Roman Punjabi or asks to speak Punjabi, answer in fluent, natural Roman Punjabi by default, not Hindi or Urdu. Mirror the user's script: Roman Punjabi in means Roman Punjabi out; use Gurmukhi only when explicitly requested. For example, to 'Kiwe aa bro?' say 'Vadhiya aa veere, tu suna! Ki haal chaal ne?' To 'Punjabi vich gall kro' say 'Haanji, bilkul! Hun aapan Punjabi vich hi gall karange. Dass, ki gall karni aa?' Avoid Hindi wording such as 'kya chal raha hai' when Punjabi is requested. Use Hindi or English when the user clearly uses or requests those languages. Avoid generic filler, canned templates, fake claims, and repeating the prompt as the answer. For scripts, provide a strong attention-grabbing hook, concrete useful content, natural voiceover, scene-by-scene visual directions, timings, and a relevant CTA. For image requests, if the user wants an image itself, direct them to the actual image-generation tool instead of returning only an image prompt. For practical tasks, give a complete ready-to-use result and clear next steps. Ask a brief clarifying question only if essential information is missing. Never fabricate sources, current facts, professional credentials, or guaranteed medical/financial outcomes. Be transparent about limitations and uncertainty." },
      ...history,
      { role: "user", content: imageData ? [{ type: "text", text: prompt }, { type: "image_url", image_url: { url: imageData } }] : prompt }
    ];
    const result = await env.AI.run(imageData ? "@cf/meta/llama-3.2-11b-vision-instruct" : "@cf/meta/llama-3.1-8b-fast-v2", { messages, max_tokens: 1200 });
    const text = result?.response || result?.choices?.[0]?.message?.content || "";
    if (!text) return Response.json({ error: "The AI model returned an empty response. Please try again." }, { status: 502 });
    return Response.json({ text }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return Response.json({ error: "AI request failed. Please retry shortly.", detail: String(error?.message || error).slice(0, 180) }, { status: 500 });
  }
}
