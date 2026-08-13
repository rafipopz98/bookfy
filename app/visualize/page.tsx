import type { Metadata } from "next";
import { Kicker } from "@/components/ui/Kicker";
import { VisualizeForm } from "@/components/marketing/VisualizeForm";

export const metadata: Metadata = {
  title: "Visualize",
  description: "Paste a paragraph and preview how Bookfy will turn it into manga panels.",
};

export default function VisualizePage() {
  return (
    <section className="bg-paper py-16 sm:py-20 lg:py-24">
      <div className="mx-auto w-full max-w-6xl px-6 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-2xl text-center">
          <Kicker className="justify-center">Visualize</Kicker>
          <h1 className="mt-4 font-display text-4xl leading-tight text-ink sm:text-5xl">
            Bring a paragraph to life.
          </h1>
          <p className="mt-4 text-ink-soft">
            This is an early look at the Bookfy workspace. Paste a passage below to see how
            it will feel — the visual engine itself is coming in a future phase.
          </p>
        </div>

        <div className="mt-12">
          <VisualizeForm />
        </div>
      </div>
    </section>
  );
}
