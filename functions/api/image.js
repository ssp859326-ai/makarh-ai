export async function onRequestPost({ request, env }) {
  try {
    if (!env.AI) return Response.json({ error: "Image generation is not enabled for this deployment yet." }, { status: 503 });
    const body = await request.json();
    const prompt = String(body.prompt || "").trim();
    if (!prompt) return Response.json({ error: "Please describe the image you want." }, { status: 400 });
    if (prompt.length > 1800) return Response.json({ error: "Please shorten the image description to 1,800 characters or less." }, { status: 413 });
    const result = await env.AI.run("@cf/black-forest-labs/flux-1-schnell", {
      prompt: "Create a highly photorealistic, lifelike image based on the user's description. For animals and people, use realistic anatomy, natural proportions, authentic skin or fur texture, lifelike eyes, fine individual hair/fur detail, realistic camera optics, natural lighting, physically plausible shadows, and subtle real-world imperfections. Make it look like a professional DSLR photograph, not a cartoon, illustration, 3D render, animation, toy, painting, or game asset. Preserve the requested subject, setting, composition, and mood. Only use an obviously stylized or cartoon look if the user explicitly asks for it. No text, watermark, signature, border, or logo unless requested. Description: " + prompt,
      steps: 4
    });
    if (!result?.image) return Response.json({ error: "The image model did not return an image. Please try again." }, { status: 502 });
    const binary = atob(result.image);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return new Response(bytes, {
      headers: {
        "Content-Type": "image/jpeg",
        "Cache-Control": "no-store",
        "Content-Disposition": 'inline; filename="makarh-ai-image.png"',
        "X-Content-Type-Options": "nosniff"
      }
    });
  } catch (error) {
    return Response.json({ error: "Image generation failed. Try a shorter or clearer description.", detail: String(error?.message || error).slice(0, 160) }, { status: 500 });
  }
}
