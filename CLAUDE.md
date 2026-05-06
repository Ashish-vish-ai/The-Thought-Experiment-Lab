# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

**Thought Experiment Lab** — a guided clarity tool for people stuck in decision dilemmas. Users input a dilemma → pick philosophical/practical lenses → receive structured LLM-generated insights → optionally go deeper → end with intentional closure. Not a chatbot or therapy tool; it's a *structured reflection system*.

## Commands

### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn server:app --reload        # dev on port 8001
```

### Frontend
```bash
cd frontend
yarn install
yarn start    # dev on port 3000
yarn build    # production build
yarn test
```

### Docker (production)
```bash
docker build -t thought-lab .
docker run -p 8080:8080 \
  -e MONGO_URL=mongodb://... \
  -e GROQ_API_KEY=... \
  thought-lab
```

## Architecture

```
Browser (React 19)
    ↓ axios
Nginx :8080  ──→  static React build
    └─ /api/ ──→  FastAPI :8001
                    ├─ Safety detection (pre-LLM)
                    ├─ Lens suggestion (keyword scoring)
                    ├─ Rate limiting (in-memory sliding window)
                    ├─ MongoDB via Motor (async)
                    └─ Groq API → llama-3.3-70b-versatile
```

**Request lifecycle:**
1. `POST /api/experiments/preflight` — safety check + suggest 3 lenses
2. `POST /api/experiments/run` — user picks 2-5 lenses → LLM returns `{frames, summary, synthesis}`
3. `POST /api/experiments/{id}/followup` — up to 4 follow-ups (deeper/counter/decide)
4. `POST /api/experiments/{id}/resolve` — close session (clarity | sit_with_it)

## Environment Variables

Backend (`.env` in `backend/`):
```
MONGO_URL=mongodb://localhost:27017
DB_NAME=thought_lab
GROQ_API_KEY=<required>
GROQ_MODEL=llama-3.3-70b-versatile
CORS_ORIGINS=*
MAX_DILEMMA_CHARS=1600
MAX_FOLLOWUPS=4
RATE_LIMIT_WINDOW_SECONDS=900
```

Frontend: `REACT_APP_BACKEND_URL` — optional; defaults to `/api` (production) or auto-detects `localhost:8001/api` in dev.

## Key Implementation Details

**LLM calls** always request JSON-only responses (no markdown, no code fences). Prompts are tuned to avoid generic advice and stay specific to the user's exact dilemma.

**Safety detection** runs before any LLM call. Patterns for self-harm/violence trigger `status: "safety_hold"` — no further AI analysis is allowed on that session.

**Rate limiting** is in-memory per `(scope, IP)` with a 15-minute sliding window. Not persisted across restarts.

**Lens catalog** has ~10 lenses across categories (Quick & fun, Deep, Practical). Suggestions come from keyword matching in `preflight`, not LLM.

**MongoDB collection** is `experiments`. Each document represents one session. Indexed on `id` (unique UUID) and `created_at`.

**Frontend routing** uses React Router 7. Nginx serves `index.html` for all non-`/api` paths (SPA fallback).

**Frontend path alias**: `@` → `src/` (configured in `craco.config.js` and `jsconfig.json`).

## Hard Product Constraints

From `PRODUCT_CONTEXT.md` (source of truth for product decisions):
- No accounts, no login, no long-term user memory — sessions are ephemeral from user perspective
- Preserve the premium editorial aesthetic (Cormorant Garamond headers, cream/muted palette, glassmorphism cards)
- Safety routing must remain intact and non-clinical in tone
- Keep the current tech stack

## Deployment

Hosted on Railway. Healthcheck: `GET /api/ready`. Restart policy: on failure. The `Dockerfile` is a two-stage build (Node 20 builds frontend → Python 3.11 + Nginx runs everything). `start.sh` launches both Nginx and Uvicorn.
