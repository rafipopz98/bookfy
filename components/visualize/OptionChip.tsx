import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

type OptionChipProps = {
  name: string;
  value: string;
  checked: boolean;
  disabled?: boolean;
  onSelect: () => void;
  children: ReactNode;
};

export function OptionChip({ name, value, checked, disabled, onSelect, children }: OptionChipProps) {
  return (
    <label
      className={cn(
        "cursor-pointer border px-4 py-2 text-sm transition-colors duration-150 has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ink",
        checked
          ? "border-ink bg-ink text-paper"
          : "border-accent text-ink-soft hover:border-ink hover:text-ink",
        disabled && "pointer-events-none opacity-50"
      )}
    >
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        disabled={disabled}
        onChange={onSelect}
        className="sr-only"
      />
      {children}
    </label>
  );
}
