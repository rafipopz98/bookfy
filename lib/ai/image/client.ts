import {
  healthResponseSchema,
  panelImageResultSchema,
  type HealthResponse,
  type ImageStoryboardPanel,
  type PanelImageResult,
} from "@/lib/ai/image/schema";
import type { ColorMode, VisualStyle } from "@/lib/types/visualization";

const DEFAULT_BASE_URL = "http://127.0.0.1:8000";
const HEALTH_TIMEOUT_MS = 3_000;
// A single panel at 512x512/20 steps measured ~30-100s on M2/8GB — this is a
// safety ceiling, not a target.
const GENERATE_ONE_TIMEOUT_MS = 5 * 60_000;

export function getImageServiceBaseUrl(): string {
  return process.env.IMAGE_SERVICE_URL?.trim() || DEFAULT_BASE_URL;
}

export async function checkImageServiceHealth(): Promise<HealthResponse | null> {
  try {
    const response = await fetch(`${getImageServiceBaseUrl()}/health`, {
      signal: AbortSignal.timeout(HEALTH_TIMEOUT_MS),
    });
    if (!response.ok) return null;
    return healthResponseSchema.parse(await response.json());
  } catch {
    return null;
  }
}

type GenerateSinglePanelInput = {
  visualizationId: string;
  style: VisualStyle;
  colorMode: ColorMode;
  panel: ImageStoryboardPanel;
  seed?: number;
};

/**
 * Single-panel regeneration — used by "Retry panel" and "Regenerate this
 * panel". Note: /generate-storyboard (the many-panel path) is proxied as a
 * raw stream directly in the route handler rather than through a helper
 * here, since its response is NDJSON, not a single JSON body.
 */
export async function generateSinglePanelImage(
  input: GenerateSinglePanelInput
): Promise<PanelImageResult> {
  const response = await fetch(`${getImageServiceBaseUrl()}/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      visualizationId: input.visualizationId,
      panel: input.panel,
      style: input.style,
      colorMode: input.colorMode,
      seed: input.seed,
    }),
    signal: AbortSignal.timeout(GENERATE_ONE_TIMEOUT_MS),
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { detail?: string } | null;
    throw new Error(body?.detail ?? `Image service returned ${response.status}`);
  }

  return panelImageResultSchema.parse(await response.json());
}
