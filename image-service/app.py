"""Bookfy local image-generation service.

Runs entirely on localhost. The browser never talks to this service
directly — only the Next.js server does (see app/api/visualize/generate-images
in the main project). Panels are always generated strictly one at a time;
see memory.py for why.
"""

from __future__ import annotations

import json
import logging
import os
import time
from contextlib import asynccontextmanager
from pathlib import Path
from typing import Iterator

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.responses import StreamingResponse

from generator import DEFAULT_GUIDANCE_SCALE, DEFAULT_HEIGHT, DEFAULT_STEPS, DEFAULT_WIDTH, ImageGenerator
from models import (
    GenerateRequest,
    GenerateStoryboardRequest,
    HealthResponse,
    PanelFailure,
    PanelResult,
    StoryboardPanelInput,
)
from prompts import build_prompts

load_dotenv()

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(name)s %(levelname)s %(message)s")
logger = logging.getLogger("bookfy.app")

# generated/ lives at the repo root, shared with the Next.js side, regardless
# of what directory this process is launched from.
GENERATED_DIR = Path(os.environ.get("BOOKFY_GENERATED_DIR") or (Path(__file__).resolve().parent.parent / "generated"))

IMAGE_WIDTH = int(os.environ.get("BOOKFY_IMAGE_WIDTH", DEFAULT_WIDTH))
IMAGE_HEIGHT = int(os.environ.get("BOOKFY_IMAGE_HEIGHT", DEFAULT_HEIGHT))
IMAGE_STEPS = int(os.environ.get("BOOKFY_IMAGE_STEPS", DEFAULT_STEPS))
IMAGE_GUIDANCE = float(os.environ.get("BOOKFY_IMAGE_GUIDANCE", DEFAULT_GUIDANCE_SCALE))
NEGATIVE_PROMPT_EXTRA = os.environ.get("BOOKFY_NEGATIVE_PROMPT_EXTRA", "").strip() or None

generator = ImageGenerator()


@asynccontextmanager
async def lifespan(_app: FastAPI):
    logger.info("Loading image model at startup...")
    try:
        generator.load()
    except FileNotFoundError as error:
        # Service still starts — /health reports modelLoaded: false so the
        # Next.js side can show a clear "isn't running/ready" message rather
        # than every request failing with a confusing 500.
        logger.error("Model failed to load: %s", error)
    yield


app = FastAPI(title="Bookfy Image Service", lifespan=lifespan)


def panel_dir(visualization_id: str) -> Path:
    safe_id = "".join(ch for ch in visualization_id if ch.isalnum() or ch in ("-", "_"))
    if not safe_id:
        raise HTTPException(status_code=400, detail="Invalid visualizationId.")
    directory = GENERATED_DIR / "visualizations" / safe_id
    directory.mkdir(parents=True, exist_ok=True)
    return directory


def panel_filename(index: int) -> str:
    return f"panel-{index + 1:02d}.png"


def generate_one_panel(
    visualization_id: str,
    panel: StoryboardPanelInput,
    style: str,
    color_mode: str,
    seed: int | None,
) -> PanelResult:
    positive_prompt, negative_prompt = build_prompts(
        panel, style, color_mode, negative_prompt_extra=NEGATIVE_PROMPT_EXTRA
    )

    result = generator.generate(
        prompt=positive_prompt,
        negative_prompt=negative_prompt,
        width=IMAGE_WIDTH,
        height=IMAGE_HEIGHT,
        steps=IMAGE_STEPS,
        guidance_scale=IMAGE_GUIDANCE,
        seed=seed,
    )

    filename = panel_filename(panel.index)
    destination = panel_dir(visualization_id) / filename
    result.image.save(destination)

    return PanelResult(
        panel_id=panel.id,
        image_path=filename,  # filename only — Next.js builds the served URL
        seed=result.seed,
        width=result.width,
        height=result.height,
        generation_time_ms=result.generation_time_ms,
        prompt=positive_prompt,
        negative_prompt=negative_prompt,
    )


@app.get("/health")
def health() -> HealthResponse:
    return HealthResponse(
        status="ok",
        model_loaded=generator.pipe is not None,
        device=generator.device,
    )


@app.post("/generate")
def generate_panel(request: GenerateRequest) -> PanelResult:
    if generator.pipe is None:
        raise HTTPException(status_code=503, detail="Image model is not loaded yet.")

    try:
        return generate_one_panel(
            request.visualization_id, request.panel, request.style, request.color_mode, request.seed
        )
    except Exception as error:  # noqa: BLE001 — surfaced as a generic 500, logged with detail
        logger.exception("Panel generation failed")
        raise HTTPException(status_code=500, detail=f"Panel generation failed: {error}") from error


def _stream_storyboard_events(request: GenerateStoryboardRequest) -> Iterator[str]:
    """One NDJSON event per completed (or failed) panel, in order, as it
    actually finishes — not a simulated progress. The Next.js route proxies
    this stream through unmodified so the browser gets real "panel X of N"
    updates instead of a fake timer.
    """
    start = time.time()

    for panel in request.panels:
        try:
            panel_result = generate_one_panel(
                request.visualization_id, panel, request.style, request.color_mode, seed=None
            )
            event = {"type": "panel", "panel": panel_result.model_dump(by_alias=True)}
        except Exception as error:  # noqa: BLE001 — one bad panel must not stop the rest
            logger.exception("Panel %s failed, continuing with the rest", panel.id)
            failure = PanelFailure(panel_id=panel.id, error=str(error))
            event = {"type": "failure", "failure": failure.model_dump(by_alias=True)}

        yield json.dumps(event) + "\n"

    yield json.dumps({"type": "done", "totalGenerationTimeMs": int((time.time() - start) * 1000)}) + "\n"


@app.post("/generate-storyboard")
def generate_storyboard(request: GenerateStoryboardRequest) -> StreamingResponse:
    if generator.pipe is None:
        raise HTTPException(status_code=503, detail="Image model is not loaded yet.")

    # Strictly sequential — one panel finishes (image saved, memory released)
    # before the next one starts. No batching, no concurrency.
    return StreamingResponse(_stream_storyboard_events(request), media_type="application/x-ndjson")


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="127.0.0.1", port=int(os.environ.get("PORT", 8000)))
