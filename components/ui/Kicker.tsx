import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

type KickerProps = {
  children: ReactNode;
  className?: string;
};

export function Kicker({ children, className }: KickerProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 text-sm uppercase tracking-[0.2em] text-ink-soft",
        className
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden="true" />
      {children}
    </span>
  );
}
