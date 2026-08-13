import { z } from "zod";
import { sceneAnalysisSchema, shotTypeSchema } from "@/lib/ai/schema";

/**
 * Wire contract with the local Python image service (image-service/models.py).
 * Field names match exactly — camelCase on both sides.
 */

// The subset of the UI-mapped Panel shape (lib/types/visualization.ts) the
// image pipeline needs from a client request. No pre-existing zod schema
// covers Panel itself, since it's derived UI state, not raw AI output.
export const panelRequestSchema = z.object({
  id: z.string(),
  description: z.string(),
  shotType: shotTypeSchema.optional(),
  action: z.string().optional(),
  emotion: z.string().optional(),
  location: z.string().nullable().optional(),
  importantObjects: z.array(z.string()).optional(),
  lighting: z.string().optional(),
  composition: z.string().optional(),
  characters: z.array(z.string()).optional(),
});

export const characterBibleEntrySchema = z.object({
  id: z.string(),
  name: z.string(),
  age: z.string(),
  gender: z.string(),
  appearance: z.string(),
  clothing: z.string(),
});

export const locationBibleEntrySchema = z.object({
  id: z.string(),
  name: z.string(),
  architecture: z.string(),
  environment: z.string(),
  era: z.string(),
  lighting: z.string(),
  atmosphere: z.string(),
});

export const imageStoryboardPanelSchema = z.object({
  id: z.string(),
  index: z.number().int(),
  shotType: z.string(),
  visualDescription: z.string(),
  action: z.string(),
  emotion: z.string(),
  importantObjects: z.array(z.string()),
  lighting: z.string(),
  composition: z.string(),
  characters: z.array(characterBibleEntrySchema),
  locationDetail: locationBibleEntrySchema.nullable(),
});

export const panelImageResultSchema = z.object({
  panelId: z.string(),
  imagePath: z.string(),
  seed: z.number(),
  width: z.number(),
  height: z.number(),
  generationTimeMs: z.number(),
  prompt: z.string(),
  negativePrompt: z.string(),
});

export const panelImageFailureSchema = z.object({
  panelId: z.string(),
  error: z.string(),
});

export const generateStoryboardImagesResponseSchema = z.object({
  visualizationId: z.string(),
  panels: z.array(panelImageResultSchema),
  failures: z.array(panelImageFailureSchema),
  totalGenerationTimeMs: z.number(),
});

export const generateSinglePanelRequestSchema = z.object({
  visualizationId: z.string().min(1),
  style: z.enum(["manga", "manhwa", "comic"]),
  colorMode: z.enum(["bw", "color"]),
  panel: panelRequestSchema,
  /** The panel's position in the full storyboard — determines the output filename. */
  panelIndex: z.number().int().min(0),
  sceneAnalysis: sceneAnalysisSchema.optional(),
  seed: z.number().int().optional(),
});

export type GenerateSinglePanelRequest = z.infer<typeof generateSinglePanelRequestSchema>;

export const healthResponseSchema = z.object({
  status: z.string(),
  modelLoaded: z.boolean(),
  device: z.string(),
});

export type CharacterBibleEntry = z.infer<typeof characterBibleEntrySchema>;
export type LocationBibleEntry = z.infer<typeof locationBibleEntrySchema>;
export type ImageStoryboardPanel = z.infer<typeof imageStoryboardPanelSchema>;
export type PanelImageResult = z.infer<typeof panelImageResultSchema>;
export type PanelImageFailure = z.infer<typeof panelImageFailureSchema>;
export type GenerateStoryboardImagesResponse = z.infer<typeof generateStoryboardImagesResponseSchema>;
export type HealthResponse = z.infer<typeof healthResponseSchema>;
