"use client";

import { Textarea } from "@/components/ui/Textarea";
import { MAX_PARAGRAPH_LENGTH } from "@/lib/mock/visualization";
import { cn } from "@/lib/utils/cn";

type PassageEditorProps = {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
};

export function PassageEditor({ value, onChange, disabled }: PassageEditorProps) {
  const atLimit = value.length >= MAX_PARAGRAPH_LENGTH;

  return (
    <div>
      <Textarea
        id="paragraph"
        label="Your paragraph"
        placeholder="Paste a paragraph from a book…"
        value={value}
        maxLength={MAX_PARAGRAPH_LENGTH}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        className="min-h-64 text-lg leading-relaxed sm:min-h-72"
      />
      <div className="mt-2 flex items-center justify-between text-xs text-ink-soft">
        <span className={cn(atLimit && "text-ink")}>
          {value.length.toLocaleString()} / {MAX_PARAGRAPH_LENGTH.toLocaleString()} characters
        </span>
        {atLimit && <span className="text-ink">You&rsquo;ve reached the character limit.</span>}
      </div>
    </div>
  );
}
