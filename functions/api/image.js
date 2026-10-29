async function currentUser(request, env) {
  const token = (request.headers.get("Cookie") || "").split(";").map(x => x.trim()).find(x => x.startsWith("makarh_session="))?.slice(15);
  if (!token) return null;
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(token));
  const hash = [...new Uint8Array(digest)].map(x => x.toString(16).padStart(2, "0")).join("");
  return env.DB.prepare("SELECT u.id,u.username FROM auth_sessions s JOIN auth_users u ON u.id=s.user_id WHERE s.token_hash=? AND s.expires_at>datetime('now')").bind(hash).first();
}

export async function onRequestPost({ request, env }) {
  try {
    if (!env.AI) return Response.json({ error: "Image generation is not enabled for this deployment yet." }, { status: 503 });
    if (!env.DB) return Response.json({ error: "Account database is not configured." }, { status: 503 });
    const user = await currentUser(request, env);
    if (!user) return Response.json({ error: "Please log in to generate images." }, { status: 401 });

    const body = await request.json();
    const prompt = String(body.prompt || "").trim();
    if (!prompt) return Response.json({ error: "Please describe the image you want." }, { status: 400 });
    if (prompt.length > 1800) return Response.json({ error: "Please shorten the image description to 1,800 characters or less." }, { status: 413 });

    const lower = prompt.toLowerCase();
    const hasAny = (words) => words.some(word => lower.includes(word));
    const animeStyle = hasAny(["anime", "manga", "goku", "dragon ball", "gojo", "jujutsu kaisen", "naruto", "one piece", "demon slayer"]);
    const cartoonStyle = hasAny(["cartoon", "3d cartoon", "pixar style", "animated cartoon"]);
    const photoStyle = hasAny(["realistic", "photorealistic", "real photo", "lifelike", "cinematic photo"]);
    const base = "Preserve the requested subject, pose, composition, setting, lighting, and mood. No unwanted text, watermark, signature, or border.";
    let detailedPrompt;
    if (animeStyle) {
      detailedPrompt = "Create a high-quality 2D Japanese TV-anime illustration, clean confident line art, expressive anime eyes, cel shading, vivid balanced colors, detailed anime background, professional animation-series composition. Keep it clearly animated, not photorealistic. " + base + " User description: " + prompt;
    } else if (cartoonStyle) {
      detailedPrompt = "Create a high-quality animated cartoon illustration with clear stylized shapes, expressive features, polished shading, and a cohesive cartoon environment. Do not make it photorealistic. " + base + " User description: " + prompt;
    } else if (photoStyle) {
      detailedPrompt = "Create a photorealistic image like a real professional photograph, believable anatomy, natural skin or fur texture, physically plausible lighting, realistic materials, lifelike environment. Avoid illustration, anime, cartoon, and plastic CGI. " + base + " User description: " + prompt;
    } else {
      detailedPrompt = "Create a polished image matching the user's description. For real-world subjects, prefer natural photorealism; for explicitly animated subjects, preserve their animated style. " + base + " User description: " + prompt;
    }

    // FLUX.1 Schnell uses fewer steps and is intended for faster, lower-cost generation.
    const form = new FormData();
    form.append("prompt", detailedPrompt);
    form.append("steps", "4");
    form.append("width", "1024");
    form.append("height", "1024");
    const formResponse = new Response(form);
    const result = await env.AI.run("@cf/black-forest-labs/flux-1-schnell", {
      multipart: { body: formResponse.body, contentType: formResponse.headers.get("content-type") }
    });

    let bytes;
    if (result instanceof Response) {
      if (!result.ok) throw new Error("Image model returned HTTP " + result.status);
      bytes = await result.arrayBuffer();
    } else if (result instanceof ArrayBuffer) {
      bytes = result;
    } else if (ArrayBuffer.isView(result)) {
      bytes = result.buffer.slice(result.byteOffset, result.byteOffset + result.byteLength);
    } else if (result instanceof ReadableStream) {
      bytes = await new Response(result).arrayBuffer();
    } else if (result && typeof result.image === "string") {
      const encoded = result.image.replace(/^data:image\/[^;]+;base64,/, "");
      const binary = atob(encoded);
      const arr = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) arr[i] = binary.charCodeAt(i);
      bytes = arr.buffer;
    } else if (result && (result.image instanceof ArrayBuffer || ArrayBuffer.isView(result.image))) {
      const image = result.image;
      bytes = image instanceof ArrayBuffer ? image : image.buffer.slice(image.byteOffset, image.byteOffset + image.byteLength);
    } else {
      throw new Error("Image model returned an unsupported response format.");
    }

    if (!bytes || bytes.byteLength < 100) throw new Error("Image model returned empty or incomplete image data.");
    await env.DB.prepare("INSERT INTO username_image_usage (user_id,prompt_length,created_at) VALUES (?,?,datetime('now'))").bind(user.id, prompt.length).run();
    return new Response(bytes, { headers: { "Content-Type": "image/png", "Cache-Control": "no-store", "Content-Disposition": 'inline; filename="makarh-ai-image.png"', "X-Content-Type-Options": "nosniff" } });
  } catch (error) {
    const detail = String(error?.message || error).slice(0, 180);
    return Response.json({ error: "Image generation failed. " + detail, detail }, { status: 500 });
  }
}
