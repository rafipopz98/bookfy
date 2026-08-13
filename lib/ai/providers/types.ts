import type { SceneAnalysisResult } from "@/lib/ai/schema";
import type { ColorMode, VisualStyle } from "@/lib/types/visualization";

export type AnalyzeSceneInput = {
  paragraph: string;
  style: VisualStyle;
  colorMode: ColorMode;
};

/**
 * A scene-analysis + storyboard backend. Implementations are interchangeable —
 * the rest of the app only ever depends on this interface.
 */
export interface SceneAnalysisProvider {
  readonly id: string;
  analyzeScene(input: AnalyzeSceneInput): Promise<SceneAnalysisResult>;
}
