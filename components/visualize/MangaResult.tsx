import { Button } from "@/components/ui/Button";
import { Kicker } from "@/components/ui/Kicker";
import { MangaPage } from "@/components/visualize/MangaPage";
import type { Visualization } from "@/lib/types/visualization";

const STYLE_LABEL: Record<Visualization["style"], string> = {
  manga: "Manga",
  manhwa: "Manhwa",
  comic: "Comic",
};

const COLOR_LABEL: Record<Visualization["colorMode"], string> = {
  bw: "Black & White",
  color: "Color",
};

export type ImageGenStatus = "idle" | "generating" | "done";

type MangaResultProps = {
  visualization: Visualization;
  onRegenerate: () => void;
  imageGenStatus: ImageGenStatus;
  imageProgress: { completed: number; total: number } | null;
  onGenerateImages: () => void;
  generatingPanelId: string | null;
  retryingPanelId: string | null;
  onRetryPanel: (panelId: string) => void;
};

export function MangaResult({
  visualization,
  onRegenerate,
  imageGenStatus,
  imageProgress,
  onGenerateImages,
  generatingPanelId,
  retryingPanelId,
  onRetryPanel,
}: MangaResultProps) {
  return (
    <div className="animate-[fade-in_0.5s_ease] motion-reduce:animate-none">
      <div className="flex flex-wrap items-end justify-between gap-4 border-t border-accent pt-8">
        <div>
          <Kicker>Your scene</Kicker>
          <h2 className="mt-3 font-display text-2xl text-ink sm:text-3xl">
            {imageGenStatus === "idle" ? "Your storyboard is ready." : "The scene, panel by panel."}
          </h2>
        </div>
        <div className="text-right text-xs uppercase tracking-[0.08em] text-ink-soft">
          <p>
            {visualization.panelCount} panels · {COLOR_LABEL[visualization.colorMode]}{" "}
            {STYLE_LABEL[visualization.style]}
          </p>
          {visualization.source === "mock" && (
            <p className="mt-1 text-ink">Demo storyboard — not a real reading of this passage</p>
          )}
        </div>
      </div>

      <div className="mt-8 flex flex-col items-center gap-3 text-center" role="status" aria-live="polite">
        {imageGenStatus === "idle" && (
          <>
            <Button type="button" onClick={onGenerateImages}>
              Generate Manga
            </Button>
            <p className="max-w-sm text-sm text-ink-soft">
              Bookfy draws each panel locally, one at a time. This can take several minutes.
            </p>
          </>
        )}
        {imageGenStatus === "generating" && imageProgress && (
          <p className="font-display text-lg italic text-ink">
            Generating panel {Math.min(imageProgress.completed + 1, imageProgress.total)} of{" "}
            {imageProgress.total}…
          </p>
        )}
        {imageGenStatus === "done" && (
          <p className="font-display text-lg italic text-ink">Your manga scene is ready.</p>
        )}
      </div>

      <div className="mt-8">
        <MangaPage
          panels={visualization.panels}
          colorMode={visualization.colorMode}
          generatingPanelId={generatingPanelId}
          retryingPanelId={retryingPanelId}
          onRetryPanel={onRetryPanel}
        />
      </div>

      <div className="mt-10 flex flex-wrap justify-center gap-3">
        {imageGenStatus === "done" && (
          <Button type="button" variant="secondary" onClick={onGenerateImages}>
            Regenerate all images
          </Button>
        )}
        <Button type="button" variant="ghost" onClick={onRegenerate}>
          Regenerate storyboard
        </Button>
      </div>

      <div className="mx-auto mt-16 max-w-2xl border-t border-accent/60 pt-8">
        <p className="text-xs uppercase tracking-[0.08em] text-ink-soft">Original text</p>
        <p className="mt-3 text-lg leading-relaxed text-ink">{visualization.paragraph}</p>
      </div>
    </div>
  );
}
