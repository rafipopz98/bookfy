import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { generateText, Output } from "ai";
import { sceneAnalysisResultSchema, type SceneAnalysisResult } from "@/lib/ai/schema";
import { buildSceneAnalysisPrompt, SCENE_ANALYSIS_SYSTEM_PROMPT } from "@/lib/ai/prompt";
import type { AnalyzeSceneInput, SceneAnalysisProvider } from "@/lib/ai/providers/types";

const DEFAULT_BASE_URL = "http://localhost:11434/v1";
const DEFAULT_MODEL = "qwen2.5:3b-instruct";

// Local 3B-model inference is much slower than a hosted frontier model —
// measured 2-5 minutes for a full scene analysis + storyboard on an M2/8GB
// machine, scaling with how much the passage actually gives the model to
// describe. The ceiling below is a safety margin above that, not a target.
const REQUEST_TIMEOUT_MS = 600_000;

export function getOllamaBaseUrl(): string {
  return process.env.OLLAMA_BASE_URL?.trim() || DEFAULT_BASE_URL;
}

export function getOllamaModel(): string {
  return process.env.BOOKFY_AI_MODEL?.trim() || DEFAULT_MODEL;
}

/**
 * Real scene-analysis provider backed by a local LLM running entirely on
 * this machine via Ollama's OpenAI-compatible endpoint. No API key, no
 * external network call — everything stays on localhost.
 */
export function createOllamaProvider(): SceneAnalysisProvider {
  const baseURL = getOllamaBaseUrl();
  const model = getOllamaModel();

  const ollama = createOpenAICompatible({
    name: "ollama",
    baseURL,
    // Local Ollama needs no credentials — this is never sent anywhere but localhost.
    supportsStructuredOutputs: true,
  });

  return {
    id: `ollama:${model}`,
    async analyzeScene(input: AnalyzeSceneInput): Promise<SceneAnalysisResult> {
      const { output } = await generateText({
        model: ollama(model),
        system: SCENE_ANALYSIS_SYSTEM_PROMPT,
        prompt: buildSceneAnalysisPrompt(input),
        output: Output.object({ schema: sceneAnalysisResultSchema }),
        // Bounded to 1: each retry can cost several more minutes locally.
        maxRetries: 1,
        abortSignal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });

      return output;
    },
  };
}
