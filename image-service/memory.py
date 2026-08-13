"""Memory-conscious helpers for running Stable Diffusion on an 8GB M2.

Panels are generated strictly one at a time (see generator.py / app.py) —
there is no batching and no parallel pipelines. These helpers exist to keep
each individual generation as light as possible and to release everything
it touched before the next panel starts.
"""

from __future__ import annotations

import gc
import logging

import torch

logger = logging.getLogger("bookfy.memory")


def configure_pipeline_for_low_memory(pipe) -> None:
    """Apply the Diffusers memory optimizations that actually help on MPS.

    Attention slicing and VAE slicing both measurably reduce peak memory for
    SD1.5-sized models with a real (if modest) speed cost. VAE tiling is
    aimed at very large images (>1024px) — irrelevant at our 512x512
    default, so it's left off. CPU offload is intentionally NOT used: it's
    built around CUDA streams and is unreliable/counterproductive on MPS.
    """
    pipe.enable_attention_slicing("max")
    logger.info("attention slicing enabled")

    if hasattr(pipe, "vae") and pipe.vae is not None:
        pipe.vae.enable_slicing()
        logger.info("VAE slicing enabled")


def release_generation_memory() -> None:
    """Free whatever the last generation touched before starting the next one.

    Called after every single panel — this is what makes sequential
    generation safe on 8GB unified memory instead of accumulating tensors
    across panels.
    """
    gc.collect()
    if torch.backends.mps.is_available():
        torch.mps.empty_cache()


def describe_device() -> str:
    if torch.backends.mps.is_available():
        return "mps"
    logger.warning("MPS not available — falling back to CPU (generation will be much slower)")
    return "cpu"
