import { readFile, stat } from "node:fs/promises";
import path from "node:path";

export const runtime = "nodejs";

const GENERATED_ROOT = path.join(process.cwd(), "generated", "visualizations");

const SAFE_ID_PATTERN = /^[a-zA-Z0-9_-]+$/;
const SAFE_FILENAME_PATTERN = /^panel-\d{2}\.png$/;

export async function GET(
  _request: Request,
  context: { params: Promise<{ visualizationId: string; filename: string }> }
) {
  const { visualizationId, filename } = await context.params;

  // Only ever a bare id and a "panel-NN.png" filename — no path separators,
  // no traversal sequences, no arbitrary extensions.
  if (!SAFE_ID_PATTERN.test(visualizationId) || !SAFE_FILENAME_PATTERN.test(filename)) {
    return new Response("Not found", { status: 404 });
  }

  const filePath = path.join(GENERATED_ROOT, visualizationId, filename);

  // Defense in depth: confirm the resolved path is still inside generated/
  // even though the patterns above already rule out traversal.
  if (!filePath.startsWith(GENERATED_ROOT + path.sep)) {
    return new Response("Not found", { status: 404 });
  }

  try {
    const stats = await stat(filePath);
    if (!stats.isFile()) {
      return new Response("Not found", { status: 404 });
    }

    const data = await readFile(filePath);
    return new Response(new Uint8Array(data), {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
