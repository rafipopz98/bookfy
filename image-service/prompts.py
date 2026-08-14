"""Builds Stable Diffusion prompts from a storyboard panel.

The panel's own `visual_description` is the core of the prompt — it's the
one thing that actually tells the model what THIS panel shows, as opposed
to any other panel in the same storyboard. Everything else (shot type,
layout, character/location bible, mood) is a modifier layered around that
core, not a replacement for it. Anything derived purely from `style`/
`color_mode` stays short and near the front, since it's the one thing that
must survive CLIP's 77-token truncation even when a rich panel's character
+ location bible would otherwise push it out — but it should never crowd
out the actual subject.

Anything V5 (like most SD1.5-era anime checkpoints) was trained on
Danbooru-style tag captions, not flowing prose — so the prompt is a
comma-separated sequence of short phrases rather than a sentence, even
where the source content (the panel description) is itself a sentence.

Dialogue's literal text is never included — image models are unreliable at
rendering text, and Bookfy overlays that in HTML/CSS later. Its presence is
still a useful cue (a mid-speech pose/expression), so only that is used.
Narration and transition are read but deliberately not rendered: narration
is caption text for the reader, not a description of what's on the page,
and transition ("fade in", "cut") only means something across panels — a
single static image can't express it.
"""

from __future__ import annotations

from typing import Optional

from models import CharacterBibleEntry, LocationBibleEntry, StoryboardPanelInput

# Deliberately short: every extra token here is a token not spent on what
# the panel actually shows.
STYLE_TOKENS = {
    "manga": "manga style, ink linework, screentone shading",
    "manhwa": "manhwa style, clean digital linework",
    "comic": "comic book style, bold inked linework",
}

COLOR_TOKENS = {
    "bw": "black and white",
    "color": "muted color palette",
}

SHOT_TYPE_TOKENS = {
    "establishing": "wide establishing shot showing the environment and subject in context",
    "wide": "wide shot showing the character and surrounding environment",
    "medium": "medium shot, character from approximately waist up",
    "closeUp": "close-up shot focused on the face and expression",
    "extremeCloseUp": "extreme close-up on a specific facial or object detail",
    "overShoulder": "over-the-shoulder shot",
    "lowAngle": "low-angle shot, camera looking upward",
    "highAngle": "high-angle shot, camera looking downward",
    "detail": "detail shot focused on the specified object",
    "reaction": "reaction shot, close on the character's expression",
    "action": "dynamic shot showing the described physical action",
    "atmospheric": "atmospheric environment shot, minimal character emphasis",
}

# Layout is a manga-PAGE composition concept (how big this panel is on the
# printed page), independent of shot type (what the camera is doing within
# the panel). A "large" panel and a "closeUp" shot can coexist — layout just
# nudges how expansive vs. tight the framing should read.
LAYOUT_FRAMING_TOKENS = {
    "large": "expansive framing",
    "cinematic": "ultra-wide cinematic framing",
    "wide": "wide horizontal framing",
    "tall": "vertical framing",
    "small": "tight compact framing",
    "medium": "",  # no accent needed — this is the neutral default
}

DEFAULT_NEGATIVE_PROMPT = (
    "text, letters, words, watermark, logo, signature, extra fingers, extra limbs, "
    "deformed hands, bad anatomy, duplicate character, blurry, low quality, worst quality, "
    "photorealistic, 3d render, oversaturated, neon colors"
)

# Style/description keywords that would nudge the model toward inventing
# fantasy/action content the source text never described. Bookfy visualizes
# literary passages, not generic anime — the storyboard's own words are the
# only source of truth for what's in a panel.
_INVENTION_GUARD = "no fantasy elements, no weapons, no magical effects, no costumes"


def _described(label: str, value: str, unknown_value: str = "unknown") -> Optional[str]:
    """Skip fields the scene analysis marked unknown rather than inventing detail."""
    if not value or value.strip().lower() == unknown_value:
        return None
    return f"{label}: {value.strip()}"


def build_character_bible_phrase(character: CharacterBibleEntry) -> str:
    name = character.name.strip()
    parts = [name if name and name.lower() != "unknown" else "a character"]
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
    name = location.name.strip()
    parts = [name if name and name.lower() != "unknown" else "a location"]
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

    Order (most to least important, per panel):
    1. shot type — what kind of shot this is
    2. the panel's own description — what it actually shows
    3. style + color — short, so this survives even if later content is cut
    4. character bible — only characters this panel actually references
    5. location bible — only if this panel references a location
    6. important objects, emotion, lighting, layout framing, speaking cue
    """
    segments: list[str] = [
        SHOT_TYPE_TOKENS.get(panel.shot_type, SHOT_TYPE_TOKENS["medium"]),
        panel.visual_description.strip().rstrip("."),
        STYLE_TOKENS.get(style, STYLE_TOKENS["manga"]),
        COLOR_TOKENS.get(color_mode, COLOR_TOKENS["bw"]),
    ]

    # Only the characters THIS panel actually involves — never the full cast.
    for character in panel.characters:
        segments.append(build_character_bible_phrase(character))

    if panel.location_detail:
        segments.append(build_location_bible_phrase(panel.location_detail))

    if panel.important_objects:
        segments.append(", ".join(panel.important_objects[:3]))

    if panel.action and panel.action.strip().lower() not in panel.visual_description.lower():
        segments.append(panel.action.strip())

    if panel.emotion:
        segments.append(f"{panel.emotion} mood")

    if panel.lighting:
        segments.append(panel.lighting.strip())

    layout_phrase = LAYOUT_FRAMING_TOKENS.get(panel.layout, "")
    if layout_phrase:
        segments.append(layout_phrase)

    if panel.composition:
        segments.append(panel.composition.strip())

    # Presence only — never the literal words. See module docstring.
    if panel.dialogue:
        segments.append("mid-speech expression")

    segments.append(_INVENTION_GUARD)

    positive_prompt = ", ".join(segment.strip() for segment in segments if segment and segment.strip())

    negative_prompt = DEFAULT_NEGATIVE_PROMPT
    if negative_prompt_extra:
        negative_prompt = f"{negative_prompt}, {negative_prompt_extra}"

    return positive_prompt, negative_prompt
