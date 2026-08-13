import type { SceneAnalysis, ShotType } from "@/lib/ai/schema";

export type VisualStyle = "manga" | "manhwa" | "comic";

export type ColorMode = "bw" | "color";

export type PanelLayout = "large" | "tall" | "wide" | "small" | "medium" | "cinematic";

export type PanelShot = "establishing" | "close-up" | "action" | "detail" | "atmosphere";

export type Panel = {
  id: string;
  layout: PanelLayout;
  shot: PanelShot;
  description: string;
  /** Future: a generated image URL. Always null while generation is mocked or text-only. */
  image: string | null;
  dialogue?: string;
  narration?: string;

  // Populated for real AI-generated panels; absent for the demo/mock storyboard.
  shotType?: ShotType;
  characters?: string[];
  location?: string | null;
  action?: string;
  emotion?: string;
  importantObjects?: string[];
  lighting?: string;
  composition?: string;
  transition?: string | null;
};

export type Visualization = {
  id: string;
  paragraph: string;
  style: VisualStyle;
  colorMode: ColorMode;
  panelCount: number;
  panels: Panel[];
  /** Whether this came from the real AI pipeline or the offline demo fallback. */
  source: "ai" | "mock";
  /** Full scene analysis, kept for the developer debug view. Only set for real AI results. */
  sceneAnalysis?: SceneAnalysis;
  panelCountReason?: string;
};

export type GenerationStage = {
  id: string;
  label: string;
};

export type GenerateVisualizationInput = {
  paragraph: string;
  style: VisualStyle;
  colorMode: ColorMode;
};
