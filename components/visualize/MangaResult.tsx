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

type MangaResultProps = {
  visualization: Visualization;
  onRegenerate: () => void;
};

export function MangaResult({ visualization, onRegenerate }: MangaResultProps) {
  return (
    <div className="animate-[fade-in_0.5s_ease] motion-reduce:animate-none">
      <div className="flex flex-wrap items-end justify-between gap-4 border-t border-accent pt-8">
        <div>
          <Kicker>Your scene</Kicker>
          <h2 className="mt-3 font-display text-2xl text-ink sm:text-3xl">
            The scene, panel by panel.
          </h2>
        </div>
        <p className="text-xs uppercase tracking-[0.08em] text-ink-soft">
          {visualization.panelCount} panels · {COLOR_LABEL[visualization.colorMode]}{" "}
          {STYLE_LABEL[visualization.style]}
        </p>
      </div>

      <div className="mt-8">
        <MangaPage panels={visualization.panels} colorMode={visualization.colorMode} />
      </div>

      <div className="mt-10 flex justify-center">
        <Button type="button" variant="secondary" onClick={onRegenerate}>
          Regenerate
        </Button>
      </div>

      <div className="mx-auto mt-16 max-w-2xl border-t border-accent/60 pt-8">
        <p className="text-xs uppercase tracking-[0.08em] text-ink-soft">Original text</p>
        <p className="mt-3 text-lg leading-relaxed text-ink">{visualization.paragraph}</p>
      </div>
    </div>
  );
}
