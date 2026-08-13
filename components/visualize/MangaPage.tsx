import Image from "next/image";
import { MangaPanel } from "@/components/ui/MangaPanel";
import { PANEL_ART } from "@/components/visualize/panel-art";
import type { ColorMode, Panel, PanelLayout } from "@/lib/types/visualization";
import { cn } from "@/lib/utils/cn";

type MangaPageProps = {
  panels: Panel[];
  colorMode: ColorMode;
  /** The panel currently being drawn, if a generation run is in progress. */
  generatingPanelId?: string | null;
  /** The panel currently being retried individually, if any. */
  retryingPanelId?: string | null;
  onRetryPanel?: (panelId: string) => void;
};

const layoutClasses: Record<PanelLayout, string> = {
  large: "aspect-[16/10] md:col-span-2 lg:col-span-4",
  tall: "aspect-[3/4] md:col-span-1 lg:col-span-2",
  wide: "aspect-[16/9] md:col-span-1 lg:col-span-3",
  small: "aspect-square md:col-span-1 lg:col-span-1",
  medium: "aspect-[4/3] md:col-span-1 lg:col-span-2",
  cinematic: "aspect-[21/9] md:col-span-2 lg:col-span-6",
};

const rotations: Array<"none" | "left" | "right"> = ["left", "right", "none", "left", "right", "none"];

export function MangaPage({
  panels,
  colorMode,
  generatingPanelId,
  retryingPanelId,
  onRetryPanel,
}: MangaPageProps) {
  const tone = colorMode === "color" ? "warm" : "mono";

  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-6">
      {panels.map((panel, index) => {
        const Art = PANEL_ART[panel.id];
        const isGenerating = generatingPanelId === panel.id;
        const isRetrying = retryingPanelId === panel.id;

        return (
          <MangaPanel
            key={panel.id}
            tone={tone}
            rotate={rotations[index % rotations.length]}
            className={cn(
              layoutClasses[panel.layout],
              "animate-[reveal_0.4s_ease_backwards] motion-reduce:animate-none"
            )}
            style={{ animationDelay: `${index * 90}ms` }}
          >
            {panel.image ? (
              <Image
                src={panel.image}
                alt={panel.description}
                fill
                sizes="(min-width: 1024px) 480px, 100vw"
                className="object-cover"
              />
            ) : panel.imageError ? (
              <PanelErrorState
                onRetry={onRetryPanel ? () => onRetryPanel(panel.id) : undefined}
                retrying={isRetrying}
              />
            ) : isGenerating ? (
              <PanelDrawingState />
            ) : Art ? (
              <Art />
            ) : (
              <PanelPlaceholder panel={panel} />
            )}

            {panel.dialogue && (
              <span className="absolute bottom-2 right-2 border border-ink bg-paper px-2 py-1 text-xs italic text-ink">
                {panel.dialogue}
              </span>
            )}
          </MangaPanel>
        );
      })}
    </div>
  );
}

// AI-generated panels have no hand-drawn art yet before image generation
// runs — show the shot the storyboard called for and what it describes, so
// the panel is still legible while text-only.
function PanelPlaceholder({ panel }: { panel: Panel }) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-2 p-3 text-center sm:p-4">
      <span className="text-[10px] uppercase tracking-[0.1em] text-ink-soft">
        {formatShotLabel(panel.shotType ?? panel.shot)}
      </span>
      <p className="line-clamp-4 font-display text-sm italic leading-snug text-ink sm:text-base">
        {panel.description}
      </p>
    </div>
  );
}

function PanelDrawingState() {
  return (
    <div
      className="flex h-full w-full flex-col items-center justify-center gap-2 p-3 text-center"
      role="status"
    >
      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-ink motion-reduce:animate-none" />
      <span className="text-[10px] uppercase tracking-[0.1em] text-ink-soft">Drawing…</span>
    </div>
  );
}

function PanelErrorState({ onRetry, retrying }: { onRetry?: () => void; retrying?: boolean }) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-2 p-3 text-center">
      <p className="text-[10px] uppercase tracking-[0.1em] text-ink-soft">
        Panel couldn&rsquo;t be generated
      </p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          disabled={retrying}
          className="border border-ink px-3 py-1.5 text-[10px] uppercase tracking-[0.08em] text-ink transition-colors hover:bg-ink hover:text-paper disabled:opacity-50"
        >
          {retrying ? "Retrying…" : "Retry panel"}
        </button>
      )}
    </div>
  );
}

function formatShotLabel(shot: string): string {
  return shot
    .replace(/-/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}
