import { z } from "zod";

/**
 * How the analyzer arrived at a described value. Keeps the model honest about
 * what the text actually says versus what it's reasonably guessing.
 */
export const confidenceSchema = z.enum(["explicit", "inferred", "unknown"]);

const describedFieldSchema = z.object({
  value: z.string(),
  confidence: confidenceSchema,
});

export const characterSchema = z.object({
  id: z.string(),
  name: z.string(),
  age: describedFieldSchema,
  gender: describedFieldSchema,
  appearance: describedFieldSchema,
  clothing: describedFieldSchema,
  expression: describedFieldSchema,
  emotionalState: describedFieldSchema,
  action: z.string(),
  importance: z.enum(["primary", "secondary", "background"]),
});

export const locationSchema = z.object({
  id: z.string(),
  name: z.string(),
  architecture: describedFieldSchema,
  environment: describedFieldSchema,
  era: describedFieldSchema,
  lighting: describedFieldSchema,
  weather: describedFieldSchema,
  atmosphere: describedFieldSchema,
  visualDetails: z.array(z.string()).max(6),
});

export const dialogueLineSchema = z.object({
  speaker: z.string(),
  text: z.string(),
  tone: z.string(),
  panelId: z.string().nullable(),
});

export const visualBeatSchema = z.object({
  id: z.string(),
  order: z.number().int(),
  description: z.string(),
});

export const sceneAnalysisSchema = z.object({
  sceneSummary: z.string(),
  characters: z.array(characterSchema).max(8),
  locations: z.array(locationSchema).max(4),
  objects: z.array(z.string()).max(10),
  actions: z.array(z.string()).max(10),
  emotions: z.array(z.string()).max(8),
  environment: z.string(),
  weather: z.string(),
  time: z.string(),
  era: z.string(),
  dialogue: z.array(dialogueLineSchema).max(12),
  narration: z.array(z.string()).max(8),
  visualBeats: z.array(visualBeatSchema).min(1).max(16),
  recommendedPanelCount: z.number().int().min(1).max(12),
  panelCountReason: z.string(),
});

export const shotTypeSchema = z.enum([
  "establishing",
  "wide",
  "medium",
  "closeUp",
  "extremeCloseUp",
  "overShoulder",
  "lowAngle",
  "highAngle",
  "detail",
  "reaction",
  "action",
  "atmospheric",
]);

export const storyboardPanelSchema = z.object({
  id: z.string(),
  index: z.number().int().min(0),
  shotType: shotTypeSchema,
  visualDescription: z.string(),
  characters: z.array(z.string()).max(6),
  location: z.string().nullable(),
  action: z.string(),
  emotion: z.string(),
  importantObjects: z.array(z.string()).max(6),
  lighting: z.string(),
  composition: z.string(),
  dialogue: z.array(dialogueLineSchema).max(4),
  narration: z.string().nullable(),
  transition: z.string().nullable(),
  styleNotes: z.string(),
});

export const storyboardSchema = z.object({
  panelCount: z.number().int().min(1).max(12),
  panels: z.array(storyboardPanelSchema).min(1).max(12),
});

export const sceneAnalysisResultSchema = z.object({
  sceneAnalysis: sceneAnalysisSchema,
  storyboard: storyboardSchema,
});

export type Confidence = z.infer<typeof confidenceSchema>;
export type DescribedField = z.infer<typeof describedFieldSchema>;
export type CharacterAnalysis = z.infer<typeof characterSchema>;
export type LocationAnalysis = z.infer<typeof locationSchema>;
export type DialogueLine = z.infer<typeof dialogueLineSchema>;
export type VisualBeat = z.infer<typeof visualBeatSchema>;
export type SceneAnalysis = z.infer<typeof sceneAnalysisSchema>;
export type ShotType = z.infer<typeof shotTypeSchema>;
export type StoryboardPanel = z.infer<typeof storyboardPanelSchema>;
export type Storyboard = z.infer<typeof storyboardSchema>;
export type SceneAnalysisResult = z.infer<typeof sceneAnalysisResultSchema>;
