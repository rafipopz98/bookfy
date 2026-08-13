import type {
  GenerateVisualizationInput,
  GenerateVisualizationOptions,
  GenerationStage,
  Panel,
  Visualization,
} from "@/lib/types/visualization";

export const MAX_PARAGRAPH_LENGTH = 2000;

export const DEMO_PARAGRAPH =
  "The attic room had grown unbearable by evening, heat pressing down through the low " +
  "ceiling until the air itself felt used. Pyotr counted the stairs in his head before he " +
  "took them — thirteen, uneven, and the seventh always groaned. He listened for the " +
  "landlady's door, waited for silence, then went down anyway, one hand trailing the wall, " +
  "feeling for the turn in the dark.";

export const GENERATION_STAGES: GenerationStage[] = [
  { id: "reading", label: "Reading the passage…" },
  { id: "beats", label: "Finding the important moments…" },
  { id: "panels", label: "Composing the panels…" },
  { id: "ready", label: "Your scene is ready." },
];

const STAGE_DELAYS = [650, 750, 750, 400];

const DEMO_PANELS: Array<Omit<Panel, "id" | "image">> = [
  {
    layout: "large",
    shot: "establishing",
    description:
      "A cramped attic room under a low, slanted ceiling — heat presses through the walls at dusk.",
    narration: "The attic room had grown unbearable by evening.",
  },
  {
    layout: "tall",
    shot: "close-up",
    description: "Pyotr's face, tense and damp with heat, counting the stairs before he moves.",
  },
  {
    layout: "wide",
    shot: "action",
    description:
      "He descends the narrow staircase, one hand trailing the wall, weight held carefully on each step.",
  },
  {
    layout: "small",
    shot: "detail",
    description: "The seventh step — the one that always groans underfoot.",
  },
  {
    layout: "medium",
    shot: "detail",
    description: "The landlady's door, shut and silent.",
    dialogue: "…",
  },
  {
    layout: "cinematic",
    shot: "atmosphere",
    description: "The stairwell empties into darkness below — heavy, humid, and still.",
  },
];

function buildPanels(): Panel[] {
  return DEMO_PANELS.map((panel, index) => ({
    ...panel,
    id: `panel-${index + 1}`,
    image: null,
  }));
}

function wait(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

/**
 * Simulates the future AI generation pipeline. Always resolves with the same
 * demo storyboard — this is a frontend prototype, not a real analyzer. Typing
 * "failtest" as the whole passage triggers the mock failure state for QA.
 */
export async function mockGenerateVisualization(
  input: GenerateVisualizationInput,
  options: GenerateVisualizationOptions = {}
): Promise<Visualization> {
  const { onStage } = options;
  const shouldFail = input.paragraph.trim().toLowerCase() === "failtest";

  for (let index = 0; index < GENERATION_STAGES.length; index += 1) {
    onStage?.(GENERATION_STAGES[index], index);
    await wait(STAGE_DELAYS[index] ?? 600);

    if (shouldFail && index === 1) {
      throw new Error("Bookfy couldn't compose this scene. Please try again.");
    }
  }

  const panels = buildPanels();

  return {
    id: `viz-${Date.now()}`,
    paragraph: input.paragraph,
    style: input.style,
    colorMode: input.colorMode,
    panelCount: panels.length,
    panels,
  };
}
