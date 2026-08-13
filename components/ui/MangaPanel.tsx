import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

type MangaPanelProps = {
  children: ReactNode;
  className?: string;
  rotate?: "none" | "left" | "right";
  /** "warm" gives the panel a sepia-tinted read, used for Bookfy's color mode. */
  tone?: "mono" | "warm";
  style?: CSSProperties;
};

const rotation: Record<NonNullable<MangaPanelProps["rotate"]>, string> = {
  none: "",
  left: "-rotate-1",
  right: "rotate-1",
};

const dotColor: Record<NonNullable<MangaPanelProps["tone"]>, string> = {
  mono: "rgba(33,29,25,0.4)",
  warm: "rgba(182,176,159,0.55)",
};

export function MangaPanel({
  children,
  className,
  rotate = "none",
  tone = "mono",
  style,
}: MangaPanelProps) {
  return (
    <div
      className={cn(
        "relative flex items-center justify-center overflow-hidden border",
        tone === "warm" ? "border-accent bg-paper-warm" : "border-ink bg-paper",
        rotation[rotate],
        className
      )}
      style={{
        backgroundImage: `radial-gradient(circle, ${dotColor[tone]} 0.7px, transparent 1px)`,
        backgroundSize: "7px 7px",
        ...style,
      }}
    >
      {children}
    </div>
  );
}
