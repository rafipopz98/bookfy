import type { ColorMode, Panel, VisualStyle } from "@/lib/types/visualization";
import type { SceneAnalysis } from "@/lib/ai/schema";

export type PanelImageResult = {
  panelId: string;
  imagePath: string;
  seed: number;
  width: number;
  height: number;
  generationTimeMs: number;
  prompt: string;
  negativePrompt: string;
};

export type PanelImageFailure = {
  panelId: string;
  error: string;
};

type StreamEvent =
  | { type: "panel"; panel: PanelImageResult }
  | { type: "failure"; failure: PanelImageFailure }
  | { type: "done"; totalGenerationTimeMs: number };

type GenerateMangaImagesInput = {
  visualizationId: string;
  style: VisualStyle;
  colorMode: ColorMode;
  panels: Panel[];
  sceneAnalysis?: SceneAnalysis;
};

type GenerateMangaImagesCallbacks = {
  onPanel?: (panel: PanelImageResult) => void;
  onFailure?: (failure: PanelImageFailure) => void;
};

// Panels can be regenerated in place (same filename, new content) — the
// seed query param busts both the browser cache and Next's image optimizer
// cache, since neither would otherwise notice the file changed.
export function imageUrlFor(visualizationId: string, imagePath: string, seed: number): string {
  return `/api/visualize/images/${visualizationId}/${imagePath}?v=${seed}`;
}

async function readNdjsonBody(
  body: ReadableStream<Uint8Array>,
  onEvent: (event: StreamEvent) => void
): Promise<void> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    let newlineIndex = buffer.indexOf("\n");
    while (newlineIndex !== -1) {
      const line = buffer.slice(0, newlineIndex).trim();
      buffer = buffer.slice(newlineIndex + 1);
      if (line) onEvent(JSON.parse(line) as StreamEvent);
      newlineIndex = buffer.indexOf("\n");
    }
  }

  const trailing = buffer.trim();
  if (trailing) onEvent(JSON.parse(trailing) as StreamEvent);
}

/**
 * Streams manga panel generation progress from the local image pipeline.
 * Resolves once every panel has either succeeded or failed — never rejects
 * for individual panel failures, only for the request itself failing.
 */
export async function generateMangaImages(
  input: GenerateMangaImagesInput,
  callbacks: GenerateMangaImagesCallbacks = {}
): Promise<{ panels: PanelImageResult[]; failures: PanelImageFailure[]; totalGenerationTimeMs: number }> {
  const response = await fetch("/api/visualize/generate-images", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      visualizationId: input.visualizationId,
      style: input.style,
      colorMode: input.colorMode,
      panels: input.panels,
      sceneAnalysis: input.sceneAnalysis,
    }),
  });

  if (!response.ok || !response.body) {
    const body = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(body?.error ?? "Bookfy couldn't generate the manga panels. Please try again.");
  }

  const panels: PanelImageResult[] = [];
  const failures: PanelImageFailure[] = [];
  let totalGenerationTimeMs = 0;

  await readNdjsonBody(response.body, (event) => {
    if (event.type === "panel") {
      panels.push(event.panel);
      callbacks.onPanel?.(event.panel);
    } else if (event.type === "failure") {
      failures.push(event.failure);
      callbacks.onFailure?.(event.failure);
    } else if (event.type === "done") {
      totalGenerationTimeMs = event.totalGenerationTimeMs;
    }
  });

  return { panels, failures, totalGenerationTimeMs };
}

type RegeneratePanelInput = {
  visualizationId: string;
  style: VisualStyle;
  colorMode: ColorMode;
  panel: Panel;
  panelIndex: number;
  sceneAnalysis?: SceneAnalysis;
  seed?: number;
};

export async function regeneratePanelImage(input: RegeneratePanelInput): Promise<PanelImageResult> {
  const response = await fetch("/api/visualize/generate-images/panel", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      visualizationId: input.visualizationId,
      style: input.style,
      colorMode: input.colorMode,
      panel: input.panel,
      panelIndex: input.panelIndex,
      sceneAnalysis: input.sceneAnalysis,
      seed: input.seed,
    }),
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(body?.error ?? "Bookfy couldn't generate that panel. Please try again.");
  }

  return (await response.json()) as PanelImageResult;
}
