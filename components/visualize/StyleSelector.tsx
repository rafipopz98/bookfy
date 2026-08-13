import { OptionChip } from "@/components/visualize/OptionChip";
import type { VisualStyle } from "@/lib/types/visualization";

const STYLE_OPTIONS: Array<{ value: VisualStyle; label: string }> = [
  { value: "manga", label: "Manga" },
  { value: "manhwa", label: "Manhwa" },
  { value: "comic", label: "Comic" },
];

type StyleSelectorProps = {
  value: VisualStyle;
  onChange: (value: VisualStyle) => void;
  disabled?: boolean;
};

export function StyleSelector({ value, onChange, disabled }: StyleSelectorProps) {
  return (
    <fieldset>
      <legend className="text-sm uppercase tracking-[0.08em] text-ink-soft">Style</legend>
      <div className="mt-3 flex flex-wrap gap-2">
        {STYLE_OPTIONS.map((option) => (
          <OptionChip
            key={option.value}
            name="visual-style"
            value={option.value}
            checked={value === option.value}
            disabled={disabled}
            onSelect={() => onChange(option.value)}
          >
            {option.label}
          </OptionChip>
        ))}
      </div>
    </fieldset>
  );
}
