"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { ColorSelector } from "@/components/visualize/ColorSelector";
import { DebugPanel } from "@/components/visualize/DebugPanel";
import { GenerationProgress } from "@/components/visualize/GenerationProgress";
import { MangaResult, type ImageGenStatus } from "@/components/visualize/MangaResult";
import { PassageEditor } from "@/components/visualize/PassageEditor";
import { StyleSelector } from "@/components/visualize/StyleSelector";
import { generateVisualization } from "@/lib/services/visualization";
import { generateMangaImages, imageUrlFor, regeneratePanelImage } from "@/lib/services/imageGeneration";
import { DEMO_PARAGRAPH, GENERATION_STAGES } from "@/lib/mock/visualization";
import type { ColorMode, Panel, VisualStyle, Visualization } from "@/lib/types/visualization";

type Status = "idle" | "generating" | "success" | "error";

const STAGE_INTERVAL_MS = 700;
const LAST_PROCESSING_STAGE = GENERATION_STAGES.length - 2;
const FINAL_STAGE = GENERATION_STAGES.length - 1;

function wait(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

function clearPanelImage(panel: Panel): Panel {
  return {
    ...panel,
    image: null,
    imageSeed: undefined,
    imageGenerationTimeMs: undefined,
    imagePrompt: undefined,
    imageNegativePrompt: undefined,
    imageError: undefined,
  };
}

export function VisualizeWorkspace() {
  const [paragraph, setParagraph] = useState("");
  const [style, setStyle] = useState<VisualStyle>("manga");
  const [colorMode, setColorMode] = useState<ColorMode>("bw");
  const [status, setStatus] = useState<Status>("idle");
  const [stageIndex, setStageIndex] = useState(0);
  const [visualization, setVisualization] = useState<Visualization | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [imageGenStatus, setImageGenStatus] = useState<ImageGenStatus>("idle");
  const [imageProgress, setImageProgress] = useState<{ completed: number; total: number } | null>(
    null
  );
  const [generatingPanelId, setGeneratingPanelId] = useState<string | null>(null);
  const [retryingPanelId, setRetryingPanelId] = useState<string | null>(null);
  const [imageGenError, setImageGenError] = useState<string | null>(null);

  // Storyboard generations increment this; image-generation work checks it
  // before applying updates, so a superseded storyboard can never have its
  // stale in-flight panel images overwrite a freshly regenerated one.
  const generationId = useRef(0);
  const canVisualize = paragraph.trim().length > 0 && status !== "generating";

  async function runGeneration() {
    const id = generationId.current + 1;
    generationId.current = id;

    setStatus("generating");
    setStageIndex(0);
    setErrorMessage(null);
    setImageGenStatus("idle");
    setImageProgress(null);
    setImageGenError(null);

    // The real backend is a single request/response — this timer just gives
    // the wait a sense of progress. It never claims "ready" before the
    // actual response arrives.
    const timer = setInterval(() => {
      if (generationId.current !== id) return;
      setStageIndex((current) => Math.min(current + 1, LAST_PROCESSING_STAGE));
    }, STAGE_INTERVAL_MS);

    try {
      const result = await generateVisualization({ paragraph, style, colorMode });
      if (generationId.current !== id) return;

      clearInterval(timer);
      setStageIndex(FINAL_STAGE);
      await wait(300);
      if (generationId.current !== id) return;

      setVisualization(result);
      setStatus("success");
    } catch (error) {
      clearInterval(timer);
      if (generationId.current !== id) return;
      setErrorMessage(
        error instanceof Error ? error.message : "Something went wrong composing this scene."
      );
      setStatus("error");
    }
  }

  function handleVisualize() {
    if (!canVisualize) return;
    void runGeneration();
  }

  function updatePanel(id: number, panelId: string, updater: (panel: Panel) => Panel) {
    if (generationId.current !== id) return;
    setVisualization((current) => {
      if (!current) return current;
      return {
        ...current,
        panels: current.panels.map((panel) => (panel.id === panelId ? updater(panel) : panel)),
      };
    });
  }

  async function handleGenerateImages() {
    if (!visualization || imageGenStatus === "generating") return;
    const id = generationId.current;
    const targetVisualization = visualization;

    setImageGenError(null);
    setImageGenStatus("generating");
    setImageProgress({ completed: 0, total: targetVisualization.panels.length });
    setGeneratingPanelId(targetVisualization.panels[0]?.id ?? null);
    setVisualization((current) =>
      current ? { ...current, panels: current.panels.map(clearPanelImage) } : current
    );

    const advanceToNext = (panelId: string) => {
      if (generationId.current !== id) return;
      const index = targetVisualization.panels.findIndex((panel) => panel.id === panelId);
      const next = targetVisualization.panels[index + 1];
      setGeneratingPanelId(next?.id ?? null);
      setImageProgress((current) =>
        current ? { ...current, completed: Math.min(current.completed + 1, current.total) } : current
      );
    };

    try {
      await generateMangaImages(
        {
          visualizationId: targetVisualization.id,
          style: targetVisualization.style,
          colorMode: targetVisualization.colorMode,
          panels: targetVisualization.panels,
          sceneAnalysis: targetVisualization.sceneAnalysis,
        },
        {
          onPanel: (result) => {
            updatePanel(id, result.panelId, (panel) => ({
              ...panel,
              image: imageUrlFor(targetVisualization.id, result.imagePath, result.seed),
              imageSeed: result.seed,
              imageWidth: result.width,
              imageHeight: result.height,
              imageGenerationTimeMs: result.generationTimeMs,
              imagePrompt: result.prompt,
              imageNegativePrompt: result.negativePrompt,
              imageError: undefined,
            }));
            advanceToNext(result.panelId);
          },
          onFailure: (failure) => {
            updatePanel(id, failure.panelId, (panel) => ({
              ...panel,
              imageError: failure.error,
            }));
            advanceToNext(failure.panelId);
          },
        }
      );

      if (generationId.current !== id) return;
      setImageGenStatus("done");
      setGeneratingPanelId(null);
    } catch (error) {
      if (generationId.current !== id) return;
      setImageGenError(
        error instanceof Error ? error.message : "Something went wrong generating the manga panels."
      );
      setImageGenStatus("idle");
      setGeneratingPanelId(null);
    }
  }

  async function handleRetryPanel(panelId: string) {
    if (!visualization || retryingPanelId) return;
    const id = generationId.current;
    const index = visualization.panels.findIndex((panel) => panel.id === panelId);
    const panel = visualization.panels[index];
    if (!panel) return;

    setRetryingPanelId(panelId);

    try {
      const result = await regeneratePanelImage({
        visualizationId: visualization.id,
        style: visualization.style,
        colorMode: visualization.colorMode,
        panel,
        panelIndex: index,
        sceneAnalysis: visualization.sceneAnalysis,
      });

      updatePanel(id, panelId, (current) => ({
        ...current,
        image: imageUrlFor(visualization.id, result.imagePath, result.seed),
        imageSeed: result.seed,
        imageWidth: result.width,
        imageHeight: result.height,
        imageGenerationTimeMs: result.generationTimeMs,
        imagePrompt: result.prompt,
        imageNegativePrompt: result.negativePrompt,
        imageError: undefined,
      }));
    } catch (error) {
      updatePanel(id, panelId, (current) => ({
        ...current,
        imageError: error instanceof Error ? error.message : "Bookfy couldn't generate that panel.",
      }));
    } finally {
      if (generationId.current === id) setRetryingPanelId(null);
    }
  }

  return (
    <div>
      <div className="mx-auto max-w-2xl">
        <PassageEditor value={paragraph} onChange={setParagraph} disabled={status === "generating"} />

        {paragraph.trim().length === 0 && (
          <button
            type="button"
            onClick={() => setParagraph(DEMO_PARAGRAPH)}
            className="mt-3 text-xs uppercase tracking-[0.08em] text-ink-soft underline decoration-accent decoration-2 underline-offset-4 transition-colors hover:text-ink hover:decoration-ink"
          >
            Try a sample passage
          </button>
        )}

        <div className="mt-8 flex flex-col gap-6 sm:flex-row sm:gap-10">
          <StyleSelector value={style} onChange={setStyle} disabled={status === "generating"} />
          <ColorSelector value={colorMode} onChange={setColorMode} disabled={status === "generating"} />
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
          <Button
            type="button"
            onClick={handleVisualize}
            disabled={!canVisualize}
            className="w-full sm:w-auto"
          >
            {status === "generating" ? "Visualizing…" : "Visualize Scene"}
          </Button>
          <p className="text-sm text-ink-soft">
            Bookfy reads your passage and composes a storyboard, then draws each panel locally.
          </p>
        </div>
      </div>

      {status === "generating" && <GenerationProgress stageIndex={stageIndex} />}

      {status === "error" && (
        <div className="mx-auto max-w-md py-10 text-center" role="alert">
          <p className="text-ink">{errorMessage}</p>
          <div className="mt-6 flex justify-center">
            <Button type="button" variant="secondary" onClick={handleVisualize}>
              Try again
            </Button>
          </div>
        </div>
      )}

      {status === "success" && visualization && (
        <div className="mt-16">
          <MangaResult
            visualization={visualization}
            onRegenerate={handleVisualize}
            imageGenStatus={imageGenStatus}
            imageProgress={imageProgress}
            onGenerateImages={handleGenerateImages}
            generatingPanelId={generatingPanelId}
            retryingPanelId={retryingPanelId}
            onRetryPanel={handleRetryPanel}
          />

          {imageGenError && (
            <div className="mx-auto mt-6 max-w-md text-center" role="alert">
              <p className="text-ink">{imageGenError}</p>
              <div className="mt-4 flex justify-center">
                <Button type="button" variant="secondary" onClick={handleGenerateImages}>
                  Try again
                </Button>
              </div>
            </div>
          )}

          <DebugPanel visualization={visualization} />
        </div>
      )}
    </div>
  );
}
