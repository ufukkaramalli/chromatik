# Chromatik

A modern **beat marketplace** inspired by the *Chromatic Scale* — flexible, expressive, creator‑first.

> ⚠️ **Docker note:** The previous Docker config wasn’t correct. Below is a **minimal, working dev setup** (monorepo) for **frontend @ 8080** and **backend @ 5000**. If you hit an edge‑case, use the Local Quickstart and open an issue with logs.

**Monorepo layout**
```
chromatik/
  apps/
    frontend/   # Vue 3 + Vite + Pinia
    backend/    # Node.js + Express + MongoDB
  docker-compose.yml
```

## Quickstart — Docker (dev) ✅
1) Make sure ports **8080** and **5000** are free.  
2) Files included in this repo (download from links below if needed):
   - `docker-compose.yml`
   - `apps/frontend/Dockerfile` (Vite dev on 8080, HMR ready)
   - `apps/backend/Dockerfile`  (Express dev on 5000)
   - `apps/frontend/vite.config.ts` (locks 8080 + host)
3) Run:
```bash
docker compose up --build
```
Open **http://localhost:8080** (frontend) and **http://localhost:5000/api** (backend base path).

> If your frontend can’t reach the API, confirm: `VITE_API_BASE_URL=http://localhost:5000/api` and CORS `CLIENT_ORIGIN=http://localhost:8080` on backend.

## Quickstart — Local
```bash
# Backend (terminal A)
cd apps/backend
npm i
npm run dev

# Frontend (terminal B)
cd apps/frontend
npm i
npm run dev -- --host --port 8080
```
Then open **http://localhost:8080**.

## Tech
**Frontend:** Vue 3 · Vite · Pinia  
**Backend:** Node.js · Express · MongoDB · JWT

## Why “Chromatik”?
The chromatic scale moves in half‑steps across all tones — a simple metaphor for **freedom and nuance** in creation and licensing.
