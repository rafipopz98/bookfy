import { GENERATION_STAGES } from "@/lib/mock/visualization";
import { cn } from "@/lib/utils/cn";

type GenerationProgressProps = {
  stageIndex: number;
};

export function GenerationProgress({ stageIndex }: GenerationProgressProps) {
  const stage = GENERATION_STAGES[stageIndex] ?? GENERATION_STAGES[0];

  return (
    <div className="mx-auto max-w-md py-10 text-center" role="status" aria-live="polite">
      <div className="flex items-center justify-center gap-2">
        {GENERATION_STAGES.map((item, index) => (
          <span
            key={item.id}
            className={cn(
              "h-1.5 w-1.5 rounded-full transition-colors duration-300 motion-reduce:transition-none",
              index <= stageIndex ? "bg-ink" : "bg-accent"
            )}
            aria-hidden="true"
          />
        ))}
      </div>
      <p
        key={stage.id}
        className="mt-5 font-display text-lg italic text-ink animate-[fade-in_0.4s_ease] motion-reduce:animate-none"
      >
        {stage.label}
      </p>
    </div>
  );
}
