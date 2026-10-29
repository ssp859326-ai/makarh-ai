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

    const detailedPrompt = "Create a highly detailed, polished image that faithfully follows the user's description. For real-world people, animals, objects, and scenes, prefer natural photorealism: believable anatomy and proportions, realistic skin/fur/material texture, physically plausible lighting, lifelike eyes, natural colors, detailed environment, and a professional camera photograph aesthetic. Avoid plastic skin, artificial CGI appearance, excessive smoothing, and generic stock-photo composition. If the user names an anime or manga character, or requests anime/cartoon/illustration, respect that style and the recognizable character design; do not convert an explicitly animated character into a real person unless requested. For any other subject, follow the requested style. Preserve the requested pose, setting, composition, and mood. Avoid unwanted text, watermarks, signatures, borders, and logos unless requested. User description: " + prompt;

    // FLUX.2 [dev] supports higher-detail image generation and uses multipart input on Workers AI.
    const form = new FormData();
    form.append("prompt", detailedPrompt);
    form.append("steps", "25");
    form.append("width", "1024");
    form.append("height", "1024");
    const formResponse = new Response(form);
    const result = await env.AI.run("@cf/black-forest-labs/flux-2-dev", {
      multipart: {
        body: formResponse.body,
        contentType: formResponse.headers.get("content-type")
      }
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
    await env.DB.prepare("INSERT INTO username_image_usage (user_id,prompt_length,created_at) VALUES (?,?,datetime('now'))").bind(user.id,prompt.length).run();
    return new Response(bytes, {headers: {"Content-Type":"image/png","Cache-Control":"no-store","Content-Disposition":'inline; filename="makarh-ai-image.png"',"X-Content-Type-Options":"nosniff"}});
  } catch (error) {
    return Response.json({ error: "Image generation failed. " + String(error?.message || error).slice(0, 180), detail: String(error?.message || error).slice(0, 180) }, { status: 500 });
  }
}