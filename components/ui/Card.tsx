import type { ElementType, ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

type CardProps = {
  as?: ElementType;
  className?: string;
  children: ReactNode;
};

export function Card({ as: Tag = "div", className, children }: CardProps) {
  return (
    <Tag className={cn("border border-accent/50 bg-paper-warm/60 p-6 sm:p-8", className)}>
      {children}
    </Tag>
  );
}
