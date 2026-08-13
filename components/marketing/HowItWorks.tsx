import { Kicker } from "@/components/ui/Kicker";

const steps = [
  {
    number: "01",
    title: "Choose a passage",
    body: "Paste a paragraph from whatever you're reading — a novel, a short story, your own writing.",
  },
  {
    number: "02",
    title: "Bookfy reads the scene",
    body: "It identifies the characters, setting, mood, and action hiding inside the prose.",
  },
  {
    number: "03",
    title: "See it as manga panels",
    body: "The scene is laid out as a dynamic, manga-style page — as many panels as the moment needs.",
  },
] as const;

export function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-paper py-16 sm:py-20 lg:py-28">
      <div className="mx-auto w-full max-w-6xl px-6 sm:px-8 lg:px-10">
        <div className="max-w-xl">
          <Kicker>How it works</Kicker>
          <h2 className="mt-4 font-display text-3xl leading-tight text-ink sm:text-4xl">
            Three steps from paragraph to panel.
          </h2>
        </div>

        <ol className="mt-12 grid gap-10 sm:grid-cols-3 sm:gap-8">
          {steps.map((step) => (
            <li key={step.number} className="border-t border-accent pt-6">
              <span className="font-display text-sm italic text-ink-soft">{step.number}</span>
              <h3 className="mt-3 font-display text-xl text-ink">{step.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-ink-soft">{step.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
