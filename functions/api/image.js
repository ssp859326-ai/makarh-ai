async function currentUser(request,env){
 const token=(request.headers.get("Cookie")||"").split(";").map(x=>x.trim()).find(x=>x.startsWith("makarh_session="))?.slice(15);
 if(!token)return null;
 const b=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(token)),h=[...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,"0")).join("");
 return env.DB.prepare("SELECT u.id,u.username FROM auth_sessions s JOIN auth_users u ON u.id=s.user_id WHERE s.token_hash=? AND s.expires_at>datetime('now')").bind(h).first();
}
export async function onRequestPost({ request, env }) {
  try {
    if (!env.AI) return Response.json({ error: "Image generation is not enabled for this deployment yet." }, { status: 503 });
    if (!env.DB) return Response.json({ error: "Account database is not configured." }, { status: 503 });
    const user=await currentUser(request,env);
    if(!user)return Response.json({error:"Please log in to generate images."},{status:401});
    const body = await request.json();
    const prompt = String(body.prompt || "").trim();
    if (!prompt) return Response.json({ error: "Please describe the image you want." }, { status: 400 });
    if (prompt.length > 1800) return Response.json({ error: "Please shorten the image description to 1,800 characters or less." }, { status: 413 });

    // Keep the user's requested visual medium: photorealistic, 2D cartoon, or TV-anime.
    // FLUX.1 Schnell is the lower-cost option; use its supported short step count.
    const lowerPrompt = prompt.toLowerCase();
    const animeStyle = /\\b(anime|manga|goku|dragon ball|gojo|jujutsu kaisen|naruto|one piece|demon slayer)\\b/.test(lowerPrompt);
    const cartoonStyle = /\\b(cartoon|3d cartoon|pixar style|animated cartoon)\\b/.test(lowerPrompt);
    const photoStyle = /\\b(realistic|photorealistic|real photo|lifelike|cinematic photo)\\b/.test(lowerPrompt);
    let styleGuide = "Create a polished image matching the user's description. Preserve the requested subject, pose, composition, setting, lighting, and mood. No unwanted text, watermark, signature, or border.";
    if (animeStyle) {
      styleGuide = "Create a high-quality 2D Japanese TV-anime frame, with clean confident line art, expressive anime eyes, cel shading, vivid but balanced colors, detailed anime background, and professional animation-series composition. Keep the character clearly animated; do not make it photorealistic. " + styleGuide;
    } else if (cartoonStyle) {
      styleGuide = "Create a high-quality animated cartoon illustration with clear stylized shapes, appealing expressive features, polished shading, and a cohesive cartoon environment. Do not make it photorealistic. " + styleGuide;
    } else if (photoStyle) {
      styleGuide = "Create a photorealistic image that looks like a real professional photograph, with believable anatomy, natural skin or fur texture, physically plausible lighting, realistic materials, and a lifelike environment. Avoid illustration, anime, cartoon, and plastic CGI appearance. " + styleGuide;
    } else {
      styleGuide = "Follow the visual medium implied by the user's request. For real-world subjects, prefer natural photorealism; for explicitly animated subjects, preserve their animated style. " + styleGuide;
    }
    const detailedPrompt = styleGuide + " User description: " + prompt;}