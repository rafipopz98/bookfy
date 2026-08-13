import { mockGenerateVisualization } from "@/lib/mock/visualization";

/**
 * Generation abstraction boundary. The UI only ever calls
 * `generateVisualization` — a future phase can swap this implementation for
 * a real scene-analysis/storyboard backend without touching any component.
 */
export const generateVisualization = mockGenerateVisualization;
