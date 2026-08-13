import { Kicker } from "@/components/ui/Kicker";
import { MangaPanel } from "@/components/ui/MangaPanel";

const paragraph =
  "The rain had not let up since morning. Mira pulled her coat tight and stepped into the alley, where the lamplight flickered like a nervous idea. Somewhere behind her, a door closed. She did not turn around.";

export function ScenePreview() {
  return (
    <section id="scene-preview" className="bg-paper py-16 sm:py-20 lg:py-28">
      <div className="mx-auto w-full max-w-6xl px-6 sm:px-8 lg:px-10">
        <div className="mb-12 max-w-xl">
          <Kicker>From page to panel</Kicker>
          <h2 className="mt-4 font-display text-3xl leading-tight text-ink sm:text-4xl">
            See a paragraph become a scene.
          </h2>
          <p className="mt-4 text-ink-soft">
            The words stay exactly as the author wrote them. Bookfy reads the scene beneath
            them and sketches it out, panel by panel.
          </p>
        </div>

        <div className="grid items-center gap-8 lg:grid-cols-[1fr_auto_1.2fr]">
          <figure className="border border-accent bg-paper-warm/60 p-6 sm:p-8">
            <figcaption className="mb-4 text-sm uppercase tracking-[0.08em] text-ink-soft">
              Original paragraph
            </figcaption>
            <p className="text-lg leading-relaxed text-ink">{paragraph}</p>
          </figure>

          <div
            className="flex items-center justify-center text-ink-soft lg:rotate-0"
            aria-hidden="true"
          >
            <svg
              className="h-8 w-8 rotate-90 lg:rotate-0"
              viewBox="0 0 32 32"
              fill="none"
            >
              <path
                d="M4 16h22M18 8l8 8-8 8"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <div className="relative">
            <span className="absolute -top-3 right-0 z-10 bg-ink px-2 py-1 text-[10px] uppercase tracking-[0.12em] text-paper">
              Concept preview
            </span>
            <div className="grid aspect-[4/3] grid-cols-2 grid-rows-2 gap-2">
              <MangaPanel className="row-span-2" rotate="left">
                <AlleyScene />
              </MangaPanel>
              <MangaPanel rotate="right">
                <FaceCloseUp />
              </MangaPanel>
              <MangaPanel>
                <RainDetail />
              </MangaPanel>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function AlleyScene() {
  return (
    <svg viewBox="0 0 120 160" className="h-4/5 w-4/5 text-ink" fill="none">
      <line x1="10" y1="10" x2="0" y2="30" stroke="currentColor" strokeWidth="1" opacity="0.5" />
      <line x1="30" y1="5" x2="18" y2="30" stroke="currentColor" strokeWidth="1" opacity="0.5" />
      <line x1="95" y1="8" x2="85" y2="34" stroke="currentColor" strokeWidth="1" opacity="0.5" />
      <line x1="112" y1="14" x2="102" y2="38" stroke="currentColor" strokeWidth="1" opacity="0.5" />
      <rect x="70" y="30" width="18" height="24" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="79" cy="42" r="3" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M55 150c0-30 4-52 10-64s6-24 0-34-2-24 6-30"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <ellipse cx="61" cy="18" rx="9" ry="10" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function FaceCloseUp() {
  return (
    <svg viewBox="0 0 100 100" className="h-4/5 w-4/5 text-ink" fill="none">
      <path
        d="M50 12c-20 0-32 16-32 36 0 22 14 40 32 40s32-18 32-40c0-20-12-36-32-36Z"
        stroke="currentColor"
        strokeWidth="2"
      />
      <circle cx="38" cy="48" r="2.4" fill="currentColor" />
      <circle cx="62" cy="48" r="2.4" fill="currentColor" />
      <path d="M42 66c4 3 12 3 16 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M18 40l6-2M82 40l-6-2" stroke="currentColor" strokeWidth="1" opacity="0.6" />
    </svg>
  );
}

function RainDetail() {
  return (
    <svg viewBox="0 0 100 60" className="h-4/5 w-4/5 text-ink" fill="none">
      {[8, 24, 40, 56, 72, 88].map((x, i) => (
        <line
          key={x}
          x1={x}
          y1={i % 2 === 0 ? 4 : 12}
          x2={x - 8}
          y2={i % 2 === 0 ? 40 : 48}
          stroke="currentColor"
          strokeWidth="1.2"
          opacity="0.65"
        />
      ))}
    </svg>
  );
}
