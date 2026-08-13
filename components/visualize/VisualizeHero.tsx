import { Kicker } from "@/components/ui/Kicker";

export function VisualizeHero() {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <Kicker className="justify-center">Visualize a passage</Kicker>
      <h1 className="mt-4 font-display text-4xl leading-tight text-ink sm:text-5xl">
        See the story.
      </h1>
      <p className="mt-4 text-ink-soft">
        Paste a passage from a book and imagine how Bookfy could transform the scene into
        manga.
      </p>
    </div>
  );
}
