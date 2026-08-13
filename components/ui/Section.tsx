import type { ElementType, ReactNode } from "react";
import { cn } from "@/lib/utils/cn";
import { Container } from "@/components/ui/Container";

type SectionProps = {
  as?: ElementType;
  id?: string;
  tone?: "paper" | "warm";
  divider?: boolean;
  className?: string;
  containerClassName?: string;
  children: ReactNode;
};

export function Section({
  as: Tag = "section",
  id,
  tone = "paper",
  divider = false,
  className,
  containerClassName,
  children,
}: SectionProps) {
  return (
    <Tag
      id={id}
      className={cn(
        "py-16 sm:py-20 lg:py-28",
        tone === "warm" ? "bg-paper-warm" : "bg-paper",
        divider && "border-t border-accent/40",
        className
      )}
    >
      <Container className={containerClassName}>{children}</Container>
    </Tag>
  );
}
