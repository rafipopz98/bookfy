import type { CharacterAnalysis, DescribedField, LocationAnalysis } from "@/lib/ai/schema";
import type { Panel, Visualization } from "@/lib/types/visualization";
import type {
  CharacterBibleEntry,
  ImageStoryboardPanel,
  LocationBibleEntry,
} from "@/lib/ai/image/schema";

/**
 * Turns a visualization's scene analysis into persistent character/location
 * descriptions, then resolves each panel's character/location ID references
 * against that bible — so the same character's appearance/clothing/etc. gets
 * injected into every panel prompt the same way, rather than the image model
 * re-imagining them from scratch each panel.
 */

function resolveDescribed(field: DescribedField | undefined): string {
  if (!field || field.confidence === "unknown") return "unknown";
  return field.value.trim() || "unknown";
}

function toCharacterBibleEntry(character: CharacterAnalysis): CharacterBibleEntry {
  return {
    id: character.id,
    name: character.name.trim() || "unknown",
    age: resolveDescribed(character.age),
    gender: resolveDescribed(character.gender),
    appearance: resolveDescribed(character.appearance),
    clothing: resolveDescribed(character.clothing),
  };
}

function toLocationBibleEntry(location: LocationAnalysis): LocationBibleEntry {
  return {
    id: location.id,
    name: location.name.trim() || "unknown",
    architecture: resolveDescribed(location.architecture),
    environment: resolveDescribed(location.environment),
    era: resolveDescribed(location.era),
    lighting: resolveDescribed(location.lighting),
    atmosphere: resolveDescribed(location.atmosphere),
  };
}

type ImageSourcePanel = Pick<
  Panel,
  | "id"
  | "description"
  | "shotType"
  | "layout"
  | "action"
  | "emotion"
  | "location"
  | "importantObjects"
  | "lighting"
  | "composition"
  | "characters"
  | "dialogue"
>;

function buildImagePanel(
  panel: ImageSourcePanel,
  index: number,
  characterById: Map<string, CharacterBibleEntry>,
  locationById: Map<string, LocationBibleEntry>
): ImageStoryboardPanel {
  const characters = (panel.characters ?? [])
    .map((id) => characterById.get(id))
    .filter((entry): entry is CharacterBibleEntry => Boolean(entry));

  const locationDetail = panel.location ? (locationById.get(panel.location) ?? null) : null;

  return {
    id: panel.id,
    index,
    shotType: panel.shotType ?? "medium",
    layout: panel.layout,
    visualDescription: panel.description,
    action: panel.action ?? "",
    emotion: panel.emotion ?? "",
    importantObjects: panel.importantObjects ?? [],
    lighting: panel.lighting ?? "",
    composition: panel.composition ?? "",
    characters,
    locationDetail,
    dialogue: panel.dialogue,
  };
}

function buildBibleMaps(sceneAnalysis: Visualization["sceneAnalysis"] | undefined) {
  const characterById = new Map(
    (sceneAnalysis?.characters ?? []).map((character) => [character.id, toCharacterBibleEntry(character)])
  );
  const locationById = new Map(
    (sceneAnalysis?.locations ?? []).map((location) => [location.id, toLocationBibleEntry(location)])
  );
  return { characterById, locationById };
}

export function buildImagePanels(source: {
  panels: ImageSourcePanel[];
  sceneAnalysis?: Visualization["sceneAnalysis"];
}): ImageStoryboardPanel[] {
  const { characterById, locationById } = buildBibleMaps(source.sceneAnalysis);
  return source.panels.map((panel, index) =>
    buildImagePanel(panel, index, characterById, locationById)
  );
}

/**
 * Same as buildImagePanels but for exactly one panel at a known position —
 * used for single-panel retry/regenerate, where the index must match the
 * panel's original place in the storyboard (it determines the output
 * filename), not its position in a one-element array.
 */
export function buildImagePanelAt(
  panel: ImageSourcePanel,
  index: number,
  sceneAnalysis?: Visualization["sceneAnalysis"]
): ImageStoryboardPanel {
  const { characterById, locationById } = buildBibleMaps(sceneAnalysis);
  return buildImagePanel(panel, index, characterById, locationById);
}
