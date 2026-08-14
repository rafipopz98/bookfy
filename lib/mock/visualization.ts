import type {
  GenerateVisualizationInput,
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

// Generic UI copy shown while a request is in flight, regardless of whether
// it resolves via the real AI pipeline or the offline demo fallback.
export const GENERATION_STAGES: GenerationStage[] = [
  { id: "reading", label: "Reading the passage…" },
  { id: "beats", label: "Finding the important moments…" },
  { id: "panels", label: "Composing the panels…" },
  { id: "ready", label: "Your scene is ready." },
];

// Fixed demo panels — not a real reading of whatever the user actually
// typed (see buildMockVisualization below). Deliberately avoids naming an
// invented character: the demo paragraph mentions no name, so the panels
// don't either. No invented dialogue, no invented narration beyond what the
// demo paragraph's own opening line already states.
const DEMO_PANELS: Array<Omit<Panel, "id" | "image">> = [
  {
    layout: "large",
    shot: "establishing",
    shotType: "establishing",
    description:
      "A cramped attic room under a low, slanted ceiling — heat presses through the walls at dusk.",
    narration: "The attic room had grown unbearable by evening.",
    lighting: "dim dusk light",
  },
  {
    layout: "tall",
    shot: "close-up",
    shotType: "closeUp",
    description: "The young man's face, tense and damp with heat, counting the stairs before he moves.",
    emotion: "anxious",
    lighting: "dim warm light",
  },
  {
    layout: "wide",
    shot: "action",
    shotType: "action",
    description:
      "He descends the narrow staircase, one hand trailing the wall, weight held carefully on each step.",
    lighting: "dim light",
  },
  {
    layout: "small",
    shot: "detail",
    shotType: "detail",
    description: "The seventh step — the one that always groans underfoot.",
  },
  {
    layout: "medium",
    shot: "detail",
    shotType: "detail",
    description: "The landlady's door, shut and silent.",
    lighting: "dim hallway light",
  },
  {
    layout: "cinematic",
    shot: "atmosphere",
    shotType: "atmospheric",
    description: "The stairwell empties into darkness below — heavy, humid, and still.",
    lighting: "near darkness",
  },
];

/**
 * Offline demo storyboard used when no AI Gateway credentials are configured.
 * Always resolves with the same fixed panels — a development fallback, not a
 * real reading of the given passage. `source: "mock"` keeps that honest for
 * both the debug view and the on-page UI.
 */
export function buildMockVisualization(input: GenerateVisualizationInput): Visualization {
  const panels: Panel[] = DEMO_PANELS.map((panel, index) => ({
    ...panel,
    id: `panel-${index + 1}`,
    image: null,
  }));

  return {
    id: `viz-${Date.now()}`,
    paragraph: input.paragraph,
    style: input.style,
    colorMode: input.colorMode,
    panelCount: panels.length,
    panels,
    source: "mock",
  };
}
