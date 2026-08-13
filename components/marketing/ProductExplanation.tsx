import { Card } from "@/components/ui/Card";
import { Kicker } from "@/components/ui/Kicker";

const principles = [
  {
    title: "Text stays the source",
    body: "Bookfy never rewrites the author's words. Visuals interpret the scene; the story stays exactly as written.",
  },
  {
    title: "Scenes, not templates",
    body: "Panel count and pacing follow the story's own rhythm — a quiet paragraph and a chase scene shouldn't look the same.",
  },
  {
    title: "Style is yours",
    body: "Manga or manhwa, black-and-white or color — the visual language adapts to how you want to read.",
  },
] as const;

export function ProductExplanation() {
  return (
    <section className="bg-paper-warm py-16 sm:py-20 lg:py-28">
      <div className="mx-auto w-full max-w-6xl px-6 sm:px-8 lg:px-10">
        <div className="max-w-xl">
          <Kicker>What Bookfy is</Kicker>
          <h2 className="mt-4 font-display text-3xl leading-tight text-ink sm:text-4xl">
            A reading companion, not a replacement for reading.
          </h2>
          <p className="mt-4 text-ink-soft">
            Bookfy sits beside the page. Paste a passage, and it reads the scene the way an
            illustrator would — the people, the place, the mood — then lays it out as a manga
            page you can look at without ever losing your place in the story.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          {principles.map((principle) => (
            <Card key={principle.title} className="bg-paper">
              <h3 className="font-display text-xl text-ink">{principle.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-ink-soft">{principle.body}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
