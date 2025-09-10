# Chromatik

A modern **beat marketplace** inspired by the *Chromatic Scale* — flexible, expressive, creator-first.

---

## Monorepo Layout
```
chromatik/
  frontend/    # Vue 3 + Vite + Vuetify + Pinia
  backend/     # Node.js + Express + MongoDB
  docker-compose.dev.yml
```

---

## 🚀 Quickstart — Docker (dev)
1. Make sure ports **8080** (frontend) and **5000** (backend) are free.  
2. Required files already exist in this repo:  
   - `docker-compose.dev.yml`  
   - `frontend/Dockerfile.dev` (Vite dev server with HMR)  
   - `backend/Dockerfile.dev`  (Express dev server with hot-reload)  
   - `frontend/vite.config.js` (fixed port/proxy to backend)  
3. Run:
   ```bash
   docker compose -f docker-compose.dev.yml up --build
   ```
4. Open:  
   - **Frontend:** http://localhost:8080  
   - **Backend:** http://localhost:5000/api  

> If the frontend cannot reach the API, confirm:  
> - `VITE_API_ADDRESS=/api` in `frontend/.env.development`  
> - `PORT=5000` and `CORS` config in `backend/.env.development`

---

## 💻 Quickstart — Local (without Docker)
```bash
# Backend (terminal A)
cd backend
npm install
npm run dev

# Frontend (terminal B)
cd frontend
npm install
npm run dev -- --host --port 8080
```
Then open **http://localhost:8080**.

---

## 🛠️ Tech Stack
- **Frontend:** Vue 3 · Vite · Vuetify · Pinia · Vuex  
- **Backend:** Node.js · Express · MongoDB · JWT · ts-node-dev  

---

## 🎶 Why “Chromatik”?
The chromatic scale moves in half-steps across all tones — a metaphor for **freedom and nuance** in creation and licensing.
