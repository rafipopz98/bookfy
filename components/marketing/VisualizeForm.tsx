"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";

export function VisualizeForm() {
  const [paragraph, setParagraph] = useState("");
  const wordCount = paragraph.trim().length === 0 ? 0 : paragraph.trim().split(/\s+/).length;

  return (
    <div className="mx-auto w-full max-w-2xl">
      <Textarea
        id="paragraph"
        label="Your paragraph"
        placeholder="Paste a passage from the book you're reading…"
        value={paragraph}
        onChange={(event) => setParagraph(event.target.value)}
        className="min-h-64"
      />
      <div className="mt-2 flex items-center justify-between text-xs text-ink-soft">
        <span>{wordCount} words</span>
        <span>No text is stored — this is a preview screen.</span>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <Button type="button" disabled className="w-full sm:w-auto">
          Visualize
        </Button>
        <p className="text-sm text-ink-soft">
          The visualization engine arrives in the next phase of Bookfy.
        </p>
      </div>
    </div>
  );
}
