import { OptionChip } from "@/components/visualize/OptionChip";
import type { ColorMode } from "@/lib/types/visualization";

const COLOR_OPTIONS: Array<{ value: ColorMode; label: string }> = [
  { value: "bw", label: "Black & White" },
  { value: "color", label: "Color" },
];

type ColorSelectorProps = {
  value: ColorMode;
  onChange: (value: ColorMode) => void;
  disabled?: boolean;
};

export function ColorSelector({ value, onChange, disabled }: ColorSelectorProps) {
  return (
    <fieldset>
      <legend className="text-sm uppercase tracking-[0.08em] text-ink-soft">Color</legend>
      <div className="mt-3 flex flex-wrap gap-2">
        {COLOR_OPTIONS.map((option) => (
          <OptionChip
            key={option.value}
            name="color-mode"
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
