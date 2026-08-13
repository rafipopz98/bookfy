import type { GenerateVisualizationInput, Visualization } from "@/lib/types/visualization";

/**
 * Generation abstraction boundary. The UI only ever calls
 * `generateVisualization` — it doesn't know or care whether the result came
 * from the real AI pipeline or the offline mock fallback (see
 * app/api/visualize/storyboard/route.ts). A future phase can add image
 * generation behind this same boundary without touching any component.
 */
export async function generateVisualization(
  input: GenerateVisualizationInput
): Promise<Visualization> {
  const response = await fetch("/api/visualize/storyboard", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(body?.error ?? "Bookfy couldn't compose this scene. Please try again.");
  }

  return (await response.json()) as Visualization;
}
