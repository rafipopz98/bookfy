import { MangaPanel } from "@/components/ui/MangaPanel";
import { PANEL_ART } from "@/components/visualize/panel-art";
import type { ColorMode, Panel, PanelLayout } from "@/lib/types/visualization";
import { cn } from "@/lib/utils/cn";

type MangaPageProps = {
  panels: Panel[];
  colorMode: ColorMode;
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

export function MangaPage({ panels, colorMode }: MangaPageProps) {
  const tone = colorMode === "color" ? "warm" : "mono";

  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-6">
      {panels.map((panel, index) => {
        const Art = PANEL_ART[panel.id];
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
            {Art ? <Art /> : <PanelPlaceholder panel={panel} />}
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

// AI-generated panels have no hand-drawn art yet (image generation is a
// future phase) — show the shot the storyboard called for and what it
// describes, so the panel is still legible while text-only.
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

function formatShotLabel(shot: string): string {
  return shot
    .replace(/-/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}
