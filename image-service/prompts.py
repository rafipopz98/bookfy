"""Builds Stable Diffusion prompts from a storyboard panel.

Anything V5 (like most SD1.5-era anime checkpoints) was trained on
Danbooru-style tag captions, not flowing prose — so the prompt is built as a
comma-separated sequence of short phrases rather than a sentence, even
though the underlying content is the same thing a natural-language prompt
would say: style, shot, character bible, action, emotion, location bible,
objects, lighting, atmosphere.

Dialogue and narration are never included here — image models are
unreliable at rendering text, and Bookfy overlays that in HTML/CSS later.
"""

from __future__ import annotations

from typing import Optional

from models import CharacterBibleEntry, LocationBibleEntry, StoryboardPanelInput

STYLE_TOKENS = {
    "manga": "black and white manga panel, expressive ink linework, screentone shading, high contrast, manga illustration",
    "manhwa": "manhwa panel, clean digital linework, webtoon illustration style, soft cel shading",
    "comic": "western comic book panel, bold inked linework, graphic illustration, dynamic comic art",
}

COLOR_TOKENS = {
    "bw": "monochrome, black and white, grayscale, no color",
    "color": "restrained muted color palette, subtle manga coloring, not oversaturated",
}

SHOT_TYPE_TOKENS = {
    "establishing": "wide establishing shot, full environment visible, small figures for scale",
    "wide": "wide shot, full scene and setting visible",
    "medium": "medium shot, waist-up view of the character within the setting",
    "closeUp": "close-up shot, head and shoulders, focus on facial expression",
    "extremeCloseUp": "extreme close-up, tight focus on eyes or a small detail",
    "overShoulder": "over-the-shoulder shot, viewed from behind one character toward another",
    "lowAngle": "low angle shot, camera looking up at the subject, imposing perspective",
    "highAngle": "high angle shot, camera looking down at the subject",
    "detail": "detail shot, tight focus on a single important object",
    "reaction": "reaction shot, close on the character's emotional expression",
    "action": "dynamic action shot, motion and movement emphasized",
    "atmospheric": "atmospheric shot, mood and environment emphasized over character detail",
}

DEFAULT_NEGATIVE_PROMPT = (
    "text, letters, words, watermark, logo, signature, extra fingers, extra limbs, "
    "deformed hands, bad anatomy, duplicate character, blurry, low quality, worst quality, "
    "photorealistic, 3d render, oversaturated, neon colors"
)


def _described(label: str, value: str, unknown_value: str = "unknown") -> Optional[str]:
    """Skip fields the scene analysis marked unknown rather than inventing detail."""
    if not value or value.strip().lower() == unknown_value:
        return None
    return f"{label}: {value.strip()}"


def build_character_bible_phrase(character: CharacterBibleEntry) -> str:
    parts = [character.name or "a character"]
    for label, value in (
        ("age", character.age),
        ("gender", character.gender),
        ("appearance", character.appearance),
        ("clothing", character.clothing),
    ):
        described = _described(label, value)
        if described:
            parts.append(described)
    return ", ".join(parts)


def build_location_bible_phrase(location: LocationBibleEntry) -> str:
    parts = [location.name or "a location"]
    for label, value in (
        ("architecture", location.architecture),
        ("environment", location.environment),
        ("era", location.era),
        ("lighting", location.lighting),
        ("atmosphere", location.atmosphere),
    ):
        described = _described(label, value)
        if described:
            parts.append(described)
    return ", ".join(parts)


def build_prompts(
    panel: StoryboardPanelInput,
    style: str,
    color_mode: str,
    negative_prompt_extra: Optional[str] = None,
) -> tuple[str, str]:
    """Returns (positive_prompt, negative_prompt) for a single panel.

    CLIP (SD1.5's text encoder) hard-truncates at 77 tokens — a fully
    populated character + location bible can exceed that. Segments are
    ordered most- to least-critical so anything cut off is decorative
    (the generic composition filler), never the style/color mode that make
    this a "manga panel" at all, or the subject of the panel itself.
    """
    segments: list[str] = [
        STYLE_TOKENS.get(style, STYLE_TOKENS["manga"]),
        COLOR_TOKENS.get(color_mode, COLOR_TOKENS["bw"]),
        SHOT_TYPE_TOKENS.get(panel.shot_type, SHOT_TYPE_TOKENS["medium"]),
    ]

    for character in panel.characters:
        segments.append(build_character_bible_phrase(character))

    if panel.action:
        segments.append(panel.action)
    if panel.emotion:
        segments.append(f"{panel.emotion} expression")

    if panel.location_detail:
        segments.append(build_location_bible_phrase(panel.location_detail))

    if panel.important_objects:
        segments.append(", ".join(panel.important_objects))

    if panel.lighting:
        segments.append(f"{panel.lighting} lighting")
    if panel.composition:
        segments.append(panel.composition)

    segments.append("cinematic composition, strong readable silhouette, restrained background")

    positive_prompt = ", ".join(segment for segment in segments if segment)

    negative_prompt = DEFAULT_NEGATIVE_PROMPT
    if negative_prompt_extra:
        negative_prompt = f"{negative_prompt}, {negative_prompt_extra}"

    return positive_prompt, negative_prompt
