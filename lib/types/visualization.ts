export type VisualStyle = "manga" | "manhwa" | "comic";

export type ColorMode = "bw" | "color";

export type PanelLayout = "large" | "tall" | "wide" | "small" | "medium" | "cinematic";

export type PanelShot = "establishing" | "close-up" | "action" | "detail" | "atmosphere";

export type Panel = {
  id: string;
  layout: PanelLayout;
  shot: PanelShot;
  description: string;
  /** Future: a generated image URL. Always null while generation is mocked. */
  image: string | null;
  dialogue?: string;
  narration?: string;
};

export type Visualization = {
  id: string;
  paragraph: string;
  style: VisualStyle;
  colorMode: ColorMode;
  panelCount: number;
  panels: Panel[];
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

export type GenerateVisualizationOptions = {
  onStage?: (stage: GenerationStage, index: number) => void;
};
