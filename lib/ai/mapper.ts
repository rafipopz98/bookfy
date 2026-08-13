import type { SceneAnalysisResult, ShotType } from "@/lib/ai/schema";
import type {
  GenerateVisualizationInput,
  Panel,
  PanelLayout,
  PanelShot,
  Visualization,
} from "@/lib/types/visualization";

// Maps the rich cinematic shot vocabulary down to the manga-page composer's
// size classes, so the grid stays visually varied regardless of panel count.
const LAYOUT_BY_SHOT_TYPE: Record<ShotType, PanelLayout> = {
  establishing: "large",
  atmospheric: "cinematic",
  wide: "wide",
  action: "wide",
  overShoulder: "medium",
  lowAngle: "medium",
  highAngle: "medium",
  reaction: "medium",
  medium: "medium",
  closeUp: "tall",
  extremeCloseUp: "tall",
  detail: "small",
};

const SHOT_BY_SHOT_TYPE: Record<ShotType, PanelShot> = {
  establishing: "establishing",
  wide: "action",
  medium: "detail",
  closeUp: "close-up",
  extremeCloseUp: "close-up",
  overShoulder: "detail",
  lowAngle: "action",
  highAngle: "action",
  detail: "detail",
  reaction: "close-up",
  action: "action",
  atmospheric: "atmosphere",
};

export function mapSceneAnalysisResultToVisualization(
  result: SceneAnalysisResult,
  input: GenerateVisualizationInput
): Visualization {
  const panels: Panel[] = result.storyboard.panels
    .slice()
    .sort((a, b) => a.index - b.index)
    .map((panel) => ({
      id: panel.id,
      layout: LAYOUT_BY_SHOT_TYPE[panel.shotType],
      shot: SHOT_BY_SHOT_TYPE[panel.shotType],
      description: panel.visualDescription,
      image: null,
      dialogue: panel.dialogue[0]?.text,
      narration: panel.narration ?? undefined,
      shotType: panel.shotType,
      characters: panel.characters,
      location: panel.location,
      action: panel.action,
      emotion: panel.emotion,
      importantObjects: panel.importantObjects,
      lighting: panel.lighting,
      composition: panel.composition,
      transition: panel.transition,
    }));

  return {
    id: `viz-${Date.now()}`,
    paragraph: input.paragraph,
    style: input.style,
    colorMode: input.colorMode,
    panelCount: panels.length,
    panels,
    source: "ai",
    sceneAnalysis: result.sceneAnalysis,
    panelCountReason: result.sceneAnalysis.panelCountReason,
  };
}
