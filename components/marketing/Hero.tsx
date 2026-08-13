import { Button } from "@/components/ui/Button";
import { Kicker } from "@/components/ui/Kicker";
import { MangaPanel } from "@/components/ui/MangaPanel";

export function Hero() {
  return (
    <section className="bg-paper pt-14 pb-16 sm:pt-20 sm:pb-20 lg:pt-28 lg:pb-28">
      <div className="mx-auto grid w-full max-w-6xl items-center gap-12 px-6 sm:px-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16 lg:px-10">
        <div>
          <Kicker>A visual reading companion</Kicker>
          <h1 className="mt-6 max-w-xl font-display text-4xl leading-[1.1] text-ink sm:text-5xl lg:text-6xl">
            Turn the books you love into <em className="italic">visual stories</em>.
          </h1>
          <p className="mt-6 max-w-md text-lg leading-relaxed text-ink-soft">
            Bookfy transforms passages from your favorite books into manga-style scenes
            while keeping the original story intact.
          </p>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
            <Button href="/visualize">Start Reading</Button>
            <Button href="#how-it-works" variant="ghost">
              See how it works
            </Button>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-sm">
          <MangaPanel className="aspect-[3/4] w-full" rotate="right">
            <ReadingFigure />
          </MangaPanel>
          <span className="absolute -bottom-4 -left-4 border border-ink bg-paper px-3 py-1.5 font-display text-sm italic text-ink">
            Ch. 1 — The Alley
          </span>
        </div>
      </div>
    </section>
  );
}

function ReadingFigure() {
  return (
    <svg viewBox="0 0 140 180" className="h-3/4 w-3/4 text-ink" fill="none">
      <path
        d="M30 170c0-24 2-40 8-52s4-22-2-30-4-24 6-32"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <ellipse cx="46" cy="26" rx="14" ry="15" stroke="currentColor" strokeWidth="2" />
      <path
        d="M40 90c8 10 24 10 34 2"
        stroke="currentColor"
        strokeWidth="1.4"
        opacity="0.7"
      />
      <path
        d="M18 108c14-10 30-12 44-4 8 4 16 4 24-2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path d="M40 100v18M64 96v20" stroke="currentColor" strokeWidth="1.4" opacity="0.6" />
      <line x1="10" y1="170" x2="130" y2="170" stroke="currentColor" strokeWidth="1.4" opacity="0.5" />
    </svg>
  );
}
