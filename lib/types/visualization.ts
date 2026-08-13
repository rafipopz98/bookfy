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
  /** A served image URL once generated locally. Null until image generation runs. */
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

  // Image-generation debug/status metadata — set once this panel's artwork
  // has been attempted. imageError is set instead of image on failure, so
  // the UI can offer a per-panel retry without touching sibling panels.
  imageSeed?: number;
  imageWidth?: number;
  imageHeight?: number;
  imageGenerationTimeMs?: number;
  imagePrompt?: string;
  imageNegativePrompt?: string;
  imageError?: string;
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
