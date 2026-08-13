# Bookfy

## Product

Bookfy turns literary passages into manga-style visual reading experiences. A reader
pastes a passage; Bookfy understands the scene, breaks it into visual beats, turns
those beats into a manga/manhwa/comic storyboard, generates the required panel
artwork locally, and presents it as a manga-style page — without losing the
original text.

## Core principle

Local-first. No paid AI inference.

Every model in the pipeline runs on this machine. Internet is only used to
download models/packages once; runtime inference never leaves localhost.

## Architecture

```
Next.js (localhost:3000)
  ↓ /api/visualize/storyboard
Ollama (localhost:11434) — qwen2.5:3b-instruct
  ↓ structured scene analysis + storyboard (zod-validated)
Next.js
  ↓ /api/visualize/generate-images
FastAPI image service (localhost:8000)
  ↓ Diffusers + MPS
Anything V5 (SD1.5) — sequential, one panel at a time
  ↓ PNG files on the local filesystem
Next.js (/api/visualize/images/:visualizationId/:filename)
  ↓
Manga page (browser)
```

## Current status

Phase 1 — Foundation
DONE

Phase 2 — Visualization UI
DONE

Phase 3 — Local Scene Analysis / Storyboard
DONE

Phase 4 — Local Image Generation
DONE

## Phase 4 checklist

- [x] image model verified (Anything V5, CreativeML OpenRAIL-M, HF `genai-archive/anything-v5`)
- [x] Diffusers environment (`image-service/.venv`, `--system-site-packages` to reuse the existing MPS-enabled torch)
- [x] MPS inference (confirmed `torch.backends.mps.is_available()`, float16)
- [x] single panel generation (standalone test, then via `/generate`)
- [x] prompt builder (`image-service/prompts.py` — style + shot type + character/location bible → tag-style SD prompt)
- [x] character bible (`lib/ai/image/characterBible.ts`, resolved from `SceneAnalysis` server-side)
- [x] location bible (same module)
- [x] sequential generation (one panel at a time, memory released between panels — see `image-service/memory.py`)
- [x] dynamic panel count (no hardcoded 6 — the storyboard's actual panel count drives generation)
- [x] progress UI (real per-panel progress via NDJSON streaming, not a simulated timer)
- [x] image serving (`/api/visualize/images/:visualizationId/:filename`, path-traversal guarded)
- [x] partial failure (failed panels don't discard successful ones)
- [x] panel retry (`/api/visualize/generate-images/panel`, preserves other panels)
- [x] seed metadata (stored per panel, shown in the dev debug panel)
- [x] style switching (style/colorMode flow into the prompt builder, not separate models)
- [x] manga page integration (`MangaPage` renders real images, falling back to text placeholders pre-generation)
- [x] full local verification (see Local-only verification in the phase report)

## Future Phase 5

Character consistency improvements

Possible techniques:

- IP-Adapter
- reference images
- ControlNet
- character LoRA
- stronger models
- face consistency
- pose conditioning

Do NOT implement these now.

## Future Phase 6

Image quality and speed optimization.

Potential:

- LCM
- Turbo models
- Core ML
- optimized MPS
- lower precision
- caching

Do NOT implement these now.

## Future Phase 7

Book reader experience.

- chapters
- pages
- reading mode
- original paragraph alongside panels
- page navigation
- panel zoom
- captions
- dialogue overlays

## Future Phase 8

Persistence.

- database
- users
- saved books
- generated scenes
- history

## Future Phase 9

Production infrastructure.

Do NOT implement now.
