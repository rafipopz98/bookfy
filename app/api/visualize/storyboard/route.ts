import { RetryError } from "ai";
import { z } from "zod";
import { buildMockVisualization, MAX_PARAGRAPH_LENGTH } from "@/lib/mock/visualization";
import { mapSceneAnalysisResultToVisualization } from "@/lib/ai/mapper";
import { createOllamaProvider } from "@/lib/ai/providers/ollama";

export const runtime = "nodejs";

const requestSchema = z.object({
  paragraph: z.string().trim().min(1).max(MAX_PARAGRAPH_LENGTH),
  style: z.enum(["manga", "manhwa", "comic"]),
  colorMode: z.enum(["bw", "color"]),
});

const GENERIC_ERROR = "Bookfy couldn't compose this scene. Please try again.";

// Ollama isn't running / isn't reachable on localhost — treat this exactly
// like "no AI configured" and fall back to the mock, rather than a real
// generation failure. A failed connection surfaces as a RetryError wrapping
// the last APICallError, whose `.cause` chain (several levels deep) bottoms
// out at Node's ECONNREFUSED — so unwrap RetryError first, then walk it.
function isConnectionError(error: unknown): boolean {
  let current: unknown = RetryError.isInstance(error) ? error.lastError : error;

  for (let depth = 0; depth < 6 && current instanceof Error; depth += 1) {
    const code = (current as NodeJS.ErrnoException).code;
    if (code === "ECONNREFUSED" || code === "ENOTFOUND") return true;
    if (current.message.includes("ECONNREFUSED") || current.message.includes("fetch failed")) {
      return true;
    }
    current = current.cause;
  }

  return false;
}

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

  try {
    const provider = createOllamaProvider();
    const result = await provider.analyzeScene(input);
    const visualization = mapSceneAnalysisResultToVisualization(result, input);
    return Response.json(visualization);
  } catch (error) {
    if (isConnectionError(error)) {
      console.warn("Ollama isn't reachable locally — serving the mock storyboard instead.");
      return Response.json(buildMockVisualization(input));
    }

    console.error("Bookfy storyboard generation failed:", error);
    return Response.json({ error: GENERIC_ERROR }, { status: 502 });
  }
}
