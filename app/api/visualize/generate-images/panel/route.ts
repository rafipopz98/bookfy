import { buildImagePanelAt } from "@/lib/ai/image/characterBible";
import { generateSinglePanelImage, checkImageServiceHealth } from "@/lib/ai/image/client";
import { generateSinglePanelRequestSchema } from "@/lib/ai/image/schema";

export const runtime = "nodejs";

const SERVICE_UNAVAILABLE_ERROR =
  "Local image generation service isn't running. Start it with: cd image-service && source .venv/bin/activate && python app.py";
const GENERIC_ERROR = "Bookfy couldn't generate that panel. Please try again.";

/** Regenerates a single panel — "Retry panel" / "Regenerate this panel". */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Please send a valid request body." }, { status: 400 });
  }

  const parsed = generateSinglePanelRequestSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "Please provide a valid panel." }, { status: 400 });
  }

  const input = parsed.data;

  const health = await checkImageServiceHealth();
  if (!health || !health.modelLoaded) {
    return Response.json({ error: SERVICE_UNAVAILABLE_ERROR }, { status: 503 });
  }

  const imagePanel = buildImagePanelAt(input.panel, input.panelIndex, input.sceneAnalysis);

  try {
    const result = await generateSinglePanelImage({
      visualizationId: input.visualizationId,
      style: input.style,
      colorMode: input.colorMode,
      panel: imagePanel,
      seed: input.seed,
    });

    return Response.json(result);
  } catch (error) {
    console.error("Bookfy single-panel generation failed:", error);
    return Response.json({ error: GENERIC_ERROR }, { status: 502 });
  }
}
