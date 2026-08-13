"""Loads the SD1.5 checkpoint once per process and generates one image at a
time. No batching, no parallel pipelines — see memory.py for why.
"""

from __future__ import annotations

import logging
import os
import time
from dataclasses import dataclass
from pathlib import Path

import torch
from diffusers import StableDiffusionPipeline

from memory import configure_pipeline_for_low_memory, describe_device, release_generation_memory

logger = logging.getLogger("bookfy.generator")

DEFAULT_MODEL_PATH = "models/anything-v5.safetensors"
DEFAULT_WIDTH = 512
DEFAULT_HEIGHT = 512
DEFAULT_STEPS = 20
DEFAULT_GUIDANCE_SCALE = 7.0


@dataclass
class GenerationResult:
    image: "object"  # PIL.Image.Image, typed loosely to avoid importing PIL here
    seed: int
    width: int
    height: int
    steps: int
    guidance_scale: float
    generation_time_ms: int


class ImageGenerator:
    """Owns exactly one loaded pipeline for the lifetime of the process."""

    def __init__(self, model_path: str | None = None) -> None:
        self.model_path = model_path or os.environ.get("BOOKFY_IMAGE_MODEL", DEFAULT_MODEL_PATH)
        self.device = describe_device()
        self.dtype = torch.float16 if self.device == "mps" else torch.float32
        self.pipe = None
        self._manga_lora = os.environ.get("BOOKFY_MANGA_LORA", "").strip() or None
        self._lcm_lora = os.environ.get("BOOKFY_LCM_LORA", "").strip() or None

    def load(self) -> None:
        if self.pipe is not None:
            return

        model_file = Path(self.model_path)
        if not model_file.exists():
            raise FileNotFoundError(
                f"Image model not found at {model_file}. See the download steps in README.md."
            )

        logger.info("Loading %s on %s (%s)...", model_file.name, self.device, self.dtype)
        start = time.time()

        pipe = StableDiffusionPipeline.from_single_file(
            str(model_file),
            torch_dtype=self.dtype,
            safety_checker=None,
            requires_safety_checker=False,
        )
        pipe = pipe.to(self.device)
        configure_pipeline_for_low_memory(pipe)

        # Optional LoRAs — never required. Loaded once at startup, alongside
        # the base model, so per-panel generation never touches disk again.
        if self._manga_lora:
            logger.info("Loading style LoRA: %s", self._manga_lora)
            pipe.load_lora_weights(self._manga_lora, adapter_name="manga_style")
        if self._lcm_lora:
            logger.info("Loading speed LoRA: %s", self._lcm_lora)
            pipe.load_lora_weights(self._lcm_lora, adapter_name="lcm_speed")
        if self._manga_lora or self._lcm_lora:
            # Activate both adapters at equal weight if more than one is present.
            names = []
            if self._manga_lora:
                names.append("manga_style")
            if self._lcm_lora:
                names.append("lcm_speed")
            pipe.set_adapters(names, adapter_weights=[1.0] * len(names))

        self.pipe = pipe
        logger.info("Model ready in %.1fs", time.time() - start)

    def generate(
        self,
        prompt: str,
        negative_prompt: str,
        width: int = DEFAULT_WIDTH,
        height: int = DEFAULT_HEIGHT,
        steps: int = DEFAULT_STEPS,
        guidance_scale: float = DEFAULT_GUIDANCE_SCALE,
        seed: int | None = None,
    ) -> GenerationResult:
        if self.pipe is None:
            self.load()

        if seed is None:
            seed = int(torch.randint(0, 2**31 - 1, (1,)).item())

        generator = torch.Generator(device="cpu").manual_seed(seed)

        start = time.time()
        try:
            output = self.pipe(
                prompt=prompt,
                negative_prompt=negative_prompt,
                width=width,
                height=height,
                num_inference_steps=steps,
                guidance_scale=guidance_scale,
                generator=generator,
            )
            image = output.images[0]
        finally:
            release_generation_memory()

        elapsed_ms = int((time.time() - start) * 1000)
        logger.info("Generated %dx%d in %dms (seed=%d)", width, height, elapsed_ms, seed)

        return GenerationResult(
            image=image,
            seed=seed,
            width=width,
            height=height,
            steps=steps,
            guidance_scale=guidance_scale,
            generation_time_ms=elapsed_ms,
        )
