"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { ColorSelector } from "@/components/visualize/ColorSelector";
import { GenerationProgress } from "@/components/visualize/GenerationProgress";
import { MangaResult } from "@/components/visualize/MangaResult";
import { PassageEditor } from "@/components/visualize/PassageEditor";
import { StyleSelector } from "@/components/visualize/StyleSelector";
import { generateVisualization } from "@/lib/services/visualization";
import { DEMO_PARAGRAPH } from "@/lib/mock/visualization";
import type { ColorMode, VisualStyle, Visualization } from "@/lib/types/visualization";

type Status = "idle" | "generating" | "success" | "error";

export function VisualizeWorkspace() {
  const [paragraph, setParagraph] = useState("");
  const [style, setStyle] = useState<VisualStyle>("manga");
  const [colorMode, setColorMode] = useState<ColorMode>("bw");
  const [status, setStatus] = useState<Status>("idle");
  const [stageIndex, setStageIndex] = useState(0);
  const [visualization, setVisualization] = useState<Visualization | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const generationId = useRef(0);
  const canVisualize = paragraph.trim().length > 0 && status !== "generating";

  async function runGeneration() {
    const id = generationId.current + 1;
    generationId.current = id;

    setStatus("generating");
    setStageIndex(0);
    setErrorMessage(null);

    try {
      const result = await generateVisualization(
        { paragraph, style, colorMode },
        {
          onStage: (_stage, index) => {
            if (generationId.current === id) setStageIndex(index);
          },
        }
      );

      if (generationId.current !== id) return;
      setVisualization(result);
      setStatus("success");
    } catch (error) {
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
            This is a prototype — panels are a demo, not a real reading of your passage yet.
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
          <MangaResult visualization={visualization} onRegenerate={handleVisualize} />
        </div>
      )}
    </div>
  );
}
