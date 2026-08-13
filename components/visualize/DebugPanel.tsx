import type { Visualization } from "@/lib/types/visualization";

type DebugPanelProps = {
  visualization: Visualization;
};

/**
 * Temporary developer tooling for inspecting what the AI actually understood
 * before we connect an image model. Not part of the product UI — stripped
 * from production builds.
 */
export function DebugPanel({ visualization }: DebugPanelProps) {
  if (process.env.NODE_ENV === "production") return null;

  return (
    <details className="mx-auto mt-16 max-w-4xl border border-dashed border-accent bg-paper-warm/40 p-4 text-xs text-ink-soft">
      <summary className="cursor-pointer select-none text-xs uppercase tracking-[0.08em] text-ink">
        Dev debug — {visualization.source === "ai" ? "real AI" : "mock development mode"}
      </summary>

      <div className="mt-4 space-y-4 font-mono">
        {visualization.panelCountReason && (
          <p>
            <span className="text-ink">Panel count reason:</span> {visualization.panelCountReason}
          </p>
        )}

        {visualization.sceneAnalysis && (
          <div>
            <p className="text-ink">Scene analysis</p>
            <pre className="mt-1 max-h-96 overflow-auto border border-accent/60 bg-paper p-3 whitespace-pre-wrap">
              {JSON.stringify(visualization.sceneAnalysis, null, 2)}
            </pre>
          </div>
        )}

        <div>
          <p className="text-ink">Storyboard panels ({visualization.panels.length})</p>
          <ol className="mt-1 space-y-2">
            {visualization.panels.map((panel, index) => (
              <li key={panel.id} className="border border-accent/60 bg-paper p-3">
                <p className="text-ink">
                  Panel {index + 1} — {panel.shotType ?? panel.shot}
                </p>
                <p>{panel.description}</p>
                {panel.characters && panel.characters.length > 0 && (
                  <p>Characters: {panel.characters.join(", ")}</p>
                )}
                {panel.location && <p>Location: {panel.location}</p>}
                {panel.emotion && <p>Emotion: {panel.emotion}</p>}
                {panel.lighting && <p>Lighting: {panel.lighting}</p>}
                {panel.composition && <p>Composition: {panel.composition}</p>}
                {panel.dialogue && <p>Dialogue: “{panel.dialogue}”</p>}
                {panel.narration && <p>Narration: {panel.narration}</p>}
                {panel.transition && <p>Transition: {panel.transition}</p>}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </details>
  );
}
