# Bookfy Image Service

A local FastAPI service that turns a storyboard panel into one manga-style
PNG using Stable Diffusion 1.5 through Diffusers, running on Apple Silicon's
Metal backend (MPS). No API keys, no external inference — everything after
the initial model download runs entirely on this machine.

## Model

- **Checkpoint**: [`genai-archive/anything-v5`](https://huggingface.co/genai-archive/anything-v5) — `anything-v5.safetensors` (2.13 GB)
- **License**: [CreativeML OpenRAIL-M](https://huggingface.co/spaces/CompVis/stable-diffusion-license) — permits local, personal, research, and most commercial use, subject to the license's use-restrictions (no generating illegal content, no impersonation/defamation, etc.). Fine for this local prototype.
- **Provenance**: re-uploaded to Hugging Face from ModelScope under the terms of the OpenRAIL-M license, checksum-verified. Anything V5 doesn't have one canonical "official" HF repo — informal re-uploads/archives are the norm for this checkpoint family — so this specific repo was checked directly (license field, file listing, Diffusers compatibility) before downloading, rather than trusted from search results alone.
- **Format**: safetensors (no arbitrary pickle code execution)
- **Why this model**: see the Phase 4 planning discussion — SD1.5-class models fit comfortably in 8 GB unified memory where SDXL/SD3/Flux would not; Anything V5 is a well-established anime/manga-style SD1.5 finetune with a large compatible LoRA ecosystem if you want to extend it later.

Only the single `.safetensors` file is downloaded — **not** the full repo (which is ~13 GB total due to a redundant Diffusers-split copy of the same weights). See the download command below.

## Setup

```bash
cd image-service
python3 -m venv --system-site-packages .venv   # reuses your system torch/MPS install — saves ~2-3GB vs a fresh torch download
source .venv/bin/activate
pip install -r requirements.txt

python -c "
from huggingface_hub import hf_hub_download
hf_hub_download(repo_id='genai-archive/anything-v5', filename='anything-v5.safetensors', local_dir='models')
"
```

`--system-site-packages` only helps if you already have a working `torch` with MPS
support installed system-wide (`python3 -c "import torch; print(torch.backends.mps.is_available())"`).
If not, drop that flag and let `pip install -r requirements.txt` install torch fresh
(expect a larger download and more disk usage).

## Running

```bash
source .venv/bin/activate
python app.py
```

Starts on `http://127.0.0.1:8000` and loads the model at startup (~10s). Check readiness:

```bash
curl http://127.0.0.1:8000/health
# {"status":"ok","modelLoaded":true,"device":"mps"}
```

## Configuration

All optional — see `.env.example`. Copy to `.env` to override:

| Variable | Default | Purpose |
| --- | --- | --- |
| `BOOKFY_IMAGE_MODEL` | `models/anything-v5.safetensors` | Path to the checkpoint |
| `BOOKFY_IMAGE_WIDTH` / `BOOKFY_IMAGE_HEIGHT` | `512` / `512` | Output resolution |
| `BOOKFY_IMAGE_STEPS` | `20` | Inference steps |
| `BOOKFY_IMAGE_GUIDANCE` | `7.0` | Classifier-free guidance scale |
| `BOOKFY_NEGATIVE_PROMPT_EXTRA` | unset | Appended to the default negative prompt |
| `BOOKFY_MANGA_LORA` | unset | Optional style LoRA (not required — base model works alone) |
| `BOOKFY_LCM_LORA` | unset | Optional speed LoRA for few-step inference |
| `BOOKFY_GENERATED_DIR` | `../generated` (repo root) | Where panel PNGs are written |
| `PORT` | `8000` | Service port |

## Memory behavior (M2, 8 GB unified memory)

- Model loads once per process (~10s) and stays resident — never reloaded per panel.
- `float16` on MPS, attention slicing (`enable_attention_slicing("max")`), and VAE slicing are all enabled by default — this is what makes SD1.5 practical in 8GB shared with the OS, Ollama, and the Next dev server.
- Panels are generated **strictly sequentially** — one `pipe(...)` call completes, its tensors are released (`gc.collect()` + `torch.mps.empty_cache()`), before the next panel starts. No batching, no concurrent pipelines, no parallel generation — see `memory.py`.
- CPU offload is intentionally **not** used — it's built around CUDA streams and is unreliable on MPS.
- Measured on this machine: ~90s per 512×512/20-step panel (first panel of a run costs a few extra seconds for Metal shader warm-up).

## API

- `GET /health` → `{ status, modelLoaded, device }`
- `POST /generate` → generate exactly one panel, returns its metadata (used for retry/regenerate-one-panel)
- `POST /generate-storyboard` → generates every panel in a storyboard **sequentially**, streaming one NDJSON line per completed (or failed) panel as it finishes, so the caller gets real progress rather than a single blocking response. A failed panel doesn't stop the rest.

The browser never calls this service directly — only the Next.js server does, via `app/api/visualize/generate-images` and `app/api/visualize/generate-images/panel`.

## Local-only

This service never makes an outbound network call at inference time — `generate()`
and the prompt builder only touch the local checkpoint and the local filesystem.
Verify with `lsof -i` while a generation is running if you want to double-check.

One honest caveat: `from_single_file()` resolves a handful of small auxiliary
config files (tokenizer/scheduler JSON, not model weights) against the Hugging
Face Hub **at service startup**, not just on the very first run. `huggingface_hub`
falls back to its local cache automatically when offline, so this doesn't block
startup without internet — but if you want to guarantee zero network activity
even at startup once everything's cached, set `HF_HUB_OFFLINE=1` before running
`python app.py`.
