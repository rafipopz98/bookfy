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
            {Art ? <Art /> : null}
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
