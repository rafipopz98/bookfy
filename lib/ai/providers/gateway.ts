import { generateText, Output } from "ai";
import { sceneAnalysisResultSchema, type SceneAnalysisResult } from "@/lib/ai/schema";
import { buildSceneAnalysisPrompt, SCENE_ANALYSIS_SYSTEM_PROMPT } from "@/lib/ai/prompt";
import type { AnalyzeSceneInput, SceneAnalysisProvider } from "@/lib/ai/providers/types";

const DEFAULT_MODEL = "anthropic/claude-sonnet-5";
const REQUEST_TIMEOUT_MS = 30_000;

/**
 * Real scene-analysis provider backed by an LLM through the Vercel AI
 * Gateway. Model is a plain "provider/model" gateway string, configurable via
 * BOOKFY_AI_MODEL so the underlying model can change without code edits.
 */
export function createGatewayProvider(): SceneAnalysisProvider {
  const model = process.env.BOOKFY_AI_MODEL?.trim() || DEFAULT_MODEL;

  return {
    id: `gateway:${model}`,
    async analyzeScene(input: AnalyzeSceneInput): Promise<SceneAnalysisResult> {
      const { output } = await generateText({
        model,
        system: SCENE_ANALYSIS_SYSTEM_PROMPT,
        prompt: buildSceneAnalysisPrompt(input),
        output: Output.object({ schema: sceneAnalysisResultSchema }),
        maxRetries: 2,
        abortSignal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });

      return output;
    },
  };
}
