"""Pydantic request/response models for the image service.

Field names are snake_case in Python and camelCase on the wire (matching
the TypeScript side's existing zod schemas), via a shared alias generator.
"""

from __future__ import annotations

from typing import List, Optional

from pydantic import BaseModel, ConfigDict


def to_camel(field_name: str) -> str:
    first, *rest = field_name.split("_")
    return first + "".join(word.title() for word in rest)


class CamelModel(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)


class CharacterBibleEntry(CamelModel):
    """A character's persistent visual description, resolved from the scene
    analysis on the Next.js side and injected into every panel it appears in.
    """

    id: str
    name: str
    age: str = "unknown"
    gender: str = "unknown"
    appearance: str = "unknown"
    clothing: str = "unknown"


class LocationBibleEntry(CamelModel):
    id: str
    name: str
    architecture: str = "unknown"
    environment: str = "unknown"
    era: str = "unknown"
    lighting: str = "unknown"
    atmosphere: str = "unknown"


class StoryboardPanelInput(CamelModel):
    id: str
    index: int
    shot_type: str
    visual_description: str
    action: str = ""
    emotion: str = ""
    important_objects: List[str] = []
    lighting: str = ""
    composition: str = ""
    characters: List[CharacterBibleEntry] = []
    location_detail: Optional[LocationBibleEntry] = None


class GenerateRequest(CamelModel):
    visualization_id: str
    panel: StoryboardPanelInput
    style: str
    color_mode: str
    seed: Optional[int] = None


class PanelResult(CamelModel):
    panel_id: str
    image_path: str
    seed: int
    width: int
    height: int
    generation_time_ms: int
    prompt: str
    negative_prompt: str


class PanelFailure(CamelModel):
    panel_id: str
    error: str


class GenerateResponse(PanelResult):
    pass


class GenerateStoryboardRequest(CamelModel):
    visualization_id: str
    style: str
    color_mode: str
    panels: List[StoryboardPanelInput]


class GenerateStoryboardResponse(CamelModel):
    visualization_id: str
    panels: List[PanelResult]
    failures: List[PanelFailure] = []
    total_generation_time_ms: int


class HealthResponse(CamelModel):
    status: str
    model_loaded: bool
    device: str
