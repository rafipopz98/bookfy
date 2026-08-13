import { z } from "zod";
import { buildMockVisualization, MAX_PARAGRAPH_LENGTH } from "@/lib/mock/visualization";
import { mapSceneAnalysisResultToVisualization } from "@/lib/ai/mapper";
import { createGatewayProvider } from "@/lib/ai/providers/gateway";

export const runtime = "nodejs";

const requestSchema = z.object({
  paragraph: z.string().trim().min(1).max(MAX_PARAGRAPH_LENGTH),
  style: z.enum(["manga", "manhwa", "comic"]),
  colorMode: z.enum(["bw", "color"]),
});

function hasGatewayCredentials(): boolean {
  return Boolean(process.env.AI_GATEWAY_API_KEY || process.env.VERCEL_OIDC_TOKEN);
}

const GENERIC_ERROR = "Bookfy couldn't compose this scene. Please try again.";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Please send a valid request body." }, { status: 400 });
  }

  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "Please provide a valid passage." }, { status: 400 });
  }

  const input = parsed.data;

  // Deterministic failure trigger for QA — exercises the error/retry UI on demand.
  if (input.paragraph.toLowerCase() === "failtest") {
    return Response.json({ error: GENERIC_ERROR }, { status: 502 });
  }

  if (!hasGatewayCredentials()) {
    return Response.json(buildMockVisualization(input));
  }

  try {
    const provider = createGatewayProvider();
    const result = await provider.analyzeScene(input);
    const visualization = mapSceneAnalysisResultToVisualization(result, input);
    return Response.json(visualization);
  } catch (error) {
    console.error("Bookfy storyboard generation failed:", error);
    return Response.json({ error: GENERIC_ERROR }, { status: 502 });
  }
}
