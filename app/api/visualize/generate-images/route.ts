import { z } from "zod";
import { sceneAnalysisSchema } from "@/lib/ai/schema";
import { buildImagePanels } from "@/lib/ai/image/characterBible";
import { checkImageServiceHealth, getImageServiceBaseUrl } from "@/lib/ai/image/client";
import { panelRequestSchema } from "@/lib/ai/image/schema";

export const runtime = "nodejs";

const requestSchema = z.object({
  visualizationId: z.string().min(1),
  style: z.enum(["manga", "manhwa", "comic"]),
  colorMode: z.enum(["bw", "color"]),
  panels: z.array(panelRequestSchema).min(1).max(12),
  sceneAnalysis: sceneAnalysisSchema.optional(),
});

const SERVICE_UNAVAILABLE_ERROR =
  "Local image generation service isn't running. Start it with: cd image-service && source .venv/bin/activate && python app.py";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Please send a valid request body." }, { status: 400 });
  }

  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "Please provide a valid storyboard." }, { status: 400 });
  }

  const input = parsed.data;

  const health = await checkImageServiceHealth();
  if (!health || !health.modelLoaded) {
    return Response.json({ error: SERVICE_UNAVAILABLE_ERROR }, { status: 503 });
  }

  const imagePanels = buildImagePanels(input);

  let upstream: Response;
  try {
    upstream = await fetch(`${getImageServiceBaseUrl()}/generate-storyboard`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        visualizationId: input.visualizationId,
        style: input.style,
        colorMode: input.colorMode,
        panels: imagePanels,
      }),
    });
  } catch (error) {
    console.error("Bookfy image generation request failed:", error);
    return Response.json({ error: SERVICE_UNAVAILABLE_ERROR }, { status: 503 });
  }

  if (!upstream.ok || !upstream.body) {
    const errorBody = (await upstream.json().catch(() => null)) as { detail?: string } | null;
    return Response.json(
      { error: errorBody?.detail ?? "Bookfy couldn't generate the manga panels. Please try again." },
      { status: 502 }
    );
  }

  // Stream the Python service's NDJSON progress events straight through to
  // the browser — this is what gives the UI real "panel X of N" updates
  // instead of a simulated timer.
  return new Response(upstream.body, {
    headers: {
      "Content-Type": "application/x-ndjson",
      "Cache-Control": "no-store",
    },
  });
}
