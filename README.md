This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

### Local AI pipeline (`/visualize`)

Both the scene-analysis/storyboard step and the manga panel artwork run entirely
locally — no API keys, no external inference service. Three processes, three
terminals:

**Terminal 1 — Ollama (scene analysis / storyboard, `qwen2.5:3b-instruct`):**

```bash
brew install ollama
brew services start ollama   # or: ollama serve
ollama pull qwen2.5:3b-instruct
```

**Terminal 2 — image service (manga panel artwork, Stable Diffusion via Diffusers/MPS):**

```bash
cd image-service
source .venv/bin/activate    # see image-service/README.md for first-time setup
python app.py
```

**Terminal 3 — Next.js:**

```bash
npm run dev
```

Copy `.env.example` to `.env.local` to override defaults (`OLLAMA_BASE_URL`, `BOOKFY_AI_MODEL`,
`IMAGE_SERVICE_URL`). Either local service can be down without breaking the app:

- No Ollama → `/visualize` falls back to a fixed offline demo storyboard (tagged "mock" instead of "ai").
- No image service → generating manga panels shows a clear "isn't running" message with the exact command to start it, instead of a confusing error.

See `app/api/visualize/storyboard/route.ts`, `app/api/visualize/generate-images/route.ts`, and
`image-service/README.md` (model source, license, memory behavior) for details.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
