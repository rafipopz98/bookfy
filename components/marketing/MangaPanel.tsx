import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

type MangaPanelProps = {
  children: ReactNode;
  className?: string;
  rotate?: "none" | "left" | "right";
};

const rotation: Record<NonNullable<MangaPanelProps["rotate"]>, string> = {
  none: "",
  left: "-rotate-1",
  right: "rotate-1",
};

export function MangaPanel({ children, className, rotate = "none" }: MangaPanelProps) {
  return (
    <div
      className={cn(
        "relative flex items-center justify-center overflow-hidden border border-ink bg-paper",
        rotation[rotate],
        className
      )}
      style={{
        backgroundImage:
          "radial-gradient(circle, rgba(33,29,25,0.4) 0.7px, transparent 1px)",
        backgroundSize: "7px 7px",
      }}
    >
      {children}
    </div>
  );
}
