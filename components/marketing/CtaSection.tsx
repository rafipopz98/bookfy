import { Button } from "@/components/ui/Button";

export function CtaSection() {
  return (
    <section className="bg-paper-warm py-16 sm:py-20 lg:py-28">
      <div className="mx-auto w-full max-w-6xl px-6 text-center sm:px-8 lg:px-10">
        <h2 className="mx-auto max-w-2xl font-display text-3xl leading-tight text-ink sm:text-4xl">
          Ready to see the next paragraph you read?
        </h2>
        <p className="mx-auto mt-4 max-w-md text-ink-soft">
          Bring a passage to Bookfy and watch the scene take shape, panel by panel.
        </p>
        <div className="mt-8 flex justify-center">
          <Button href="/visualize">Start Reading</Button>
        </div>
      </div>
    </section>
  );
}
