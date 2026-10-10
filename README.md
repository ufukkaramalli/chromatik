# Chromatik 🎛️⚡

> A cutting-edge **beat marketplace and producer ecosystem** inspired by the *Chromatic Scale* — studio-grade Web Audio architecture, uncompromised playback loudness, interactive 3D components, and an end-to-end showcase for modern creators.

---

## 💎 Platform Capabilities & Architecture

Chromatik is far beyond a simple music catalogue; it is an in-browser digital audio workstation crafted for producers to showcase their sound at its highest fidelity, and for MCs/vocalists to audition, practice, and customize beats in real time.

---

## 🎛️ I. Audio Engineering & DSP Architecture

### 🔊 1. Club-Ready Loudness Normalization (-9 LUFS)
* **Sales-Optimized Loudness Target:** While consumer streaming platforms pull playback down to -14 (Spotify) or -16 LUFS (Apple Music), Chromatik powers every track at **-9 LUFS** so beats hit hard, punchy, and sales-ready right out of the gate.
* **Smart Dynamic Boost (+8 dB Ceiling):** Quieter masters receive up to +8 dB of clean boost, while excessively loud tracks are transparently brought down to the target.
* **Look-Ahead Brickwall Limiter:** Custom AudioWorklet processor featuring a 5ms look-ahead buffer, exponential release (120ms), and a -1 dBFS ceiling to eliminate clipping and distortion during high gain boosts.
* **Automated EBU R128 Loudness Pipeline:** Every uploaded beat is analyzed via FFmpeg's `ebur128` filter for integrated LUFS and True Peak metrics.

---

### 🧬 2. Next-Gen Pitch Shifter & Dynamic Key Transposition (Signalsmith Stretch WASM)
* **Signalsmith Stretch (C++ WASM & AudioWorklet):** High-fidelity, phase-coherent, transient-preserving real-time pitch shifting (-12 to +12 semitones) without chipmunk artifacts.
* **Latency-Compensated Dry Path (Zero-Glitch):** The engine is bypassed at 0 semitones for zero CPU overhead; when engaged, dry and wet paths remain sample-aligned with no phase smearing or audio hiccups.
* **Low-Power Adaptive Mode:** Automatically detects mobile devices or lower-tier CPUs to tune STFT block parameters, ensuring stutter-free playback without battery drain.
* **Dynamic Key Transposition:** Real-time musical key recalculation (e.g., `C# Min` ➔ `+2 st` ➔ `D# / Eb Min`). Vocalists can effortlessly transpose beats to match their exact vocal range before licensing.

---

### ⏱️ 3. Live Tempo / BPM Scaling & Independent Vocal Rehearsal Mode
* **Live BPM Recalculation:** Adjusting playback speed immediately updates the displayed BPM (e.g., 140 BPM @ 1.1x ➔ *154 Live BPM*).
* **Speed Presets & Fine-Tuning:** Quick-select `0.8x`, `0.9x`, `1.0x (Normal)`, `1.1x`, `1.25x` chips, or use the slider for continuous control from 0.5x to 1.5x.
* **Decoupled Pitch & Tempo:** Speeding up or slowing down never affects pitch, giving vocalists a true rehearsal platform.

---

### 🥁 4. Intelligent Dual-Band Auto-BPM Detection (Client & Server DSP)
* **Instant Client-Side Pre-Fill (Web Audio API):** When a producer selects a `.wav` or `.mp3` file, the browser instantly computes the BPM locally before uploading finishes, auto-populating the form with zero server overhead.
* **Dual-Band Rhythmic Fusion:** Merges broad-frequency kick/warm bass onsets with high-frequency snare/clap attacks (`fluxCombined = fluxFull + fluxSnare * 1.5`), ensuring warm R&B rimshots and crisp trap snares are accurately captured.
* **20ms Sub-Bass Smoothing:** Averages out 50-70Hz 808 sub-bass waveform ripples and 32nd-note hi-hat roll comb interference (preventing false peaks in heavy Hood Trap and Drill).
* **Trap Half-Time & Triplet Snare Resolution:** Detects Beat 3 half-time snares ($76\text{ BPM snare} \rightarrow 152\text{ BPM}$) and triplet sub-harmonics ($50.6\text{ BPM} \rightarrow 152\text{ BPM}$).
* **Tresillo 3:2 Syncopation Resolution:** Intelligently corrects dotted kick syncopations in Reggaeton, Afrobeats, and Trap ($86.6 \rightarrow 130\text{ BPM}$, $89.1 \rightarrow 133.5\text{ BPM}$).
* **Batch Migration CLI:** Run `npm run bpm:backfill` (`--force`, `--dry-run`) to automatically analyze and update historical tracks directly from disk.

---

### 🔀 5. Apple Music-Style Smart Automix & Live Drop/Onset Detection
* **Dynamic Musical Phrase Alignment (4-8 Bars / 16-32 Beats):** Rather than arbitrary fixed-second cutoffs, the engine autonomously computes intro and outro lengths based on BPM and musical phrases (e.g., 25.6s @ 75 BPM, 21.3s @ 90 BPM, 16.0s @ 120 BPM) for authentic bar-aligned DJ mixing.
* **Equal-Power 64-Point S-Curve:** Trigonometric `cos/sin` energy-preserving curve that eliminates center dips or loudness drops during transitions, delivering a seamless acoustic blend.
* **280Hz Dynamic Low-Shelf Bass Swap (Club DJ Style):** As the incoming track fades in, its low frequencies are smoothly engaged while the outgoing track's low-end is filtered out, completely avoiding muddy double-bass collisions.
* **Dynamic Tempo / BPM Morphing:** Gradually glides the playback speed between two tracks if their tempos differ, creating a fluid, professional DJ mix.
* **Zero-Glitch Anti-Click Hardware Protection:** Initial zero-gain clamping, `<audio>` `playing` event synchronization, and an asynchronous 20ms soft ramp-down cleanup, completely eliminating audio click and pop artifacts.
* **Persistent Preferences:** Automix mode, loudness normalization toggle, and volume levels are remembered in the browser.

---

### ✂️ 6. Hybrid Intelligent Silence Trimming (Auto-Cue & Server DSP)
* **Pioneer CDJ-Style Auto-Cue & Outro Silence Guard (Frontend):**
  * **Outro Silence Guard:** During the final 25 seconds of a track, the Web Audio FFT analyser monitors signal levels; if audio decays into digital dead air for ~800ms, playback immediately triggers track end and seamlessly initiates the next song or Smart Automix transition without dead air lag.
  * **Zero-Lag Lead-In (Auto-Cue):** Eliminates silent lead-in delay so the first beat transient sounds immediately on play.
* **Upload Pipeline DSP Trimming:**
  * Every uploaded audio file (`taggedAudio` or `untaggedAudio`) is automatically cleansed of leading and trailing digital silence (`-50dB`, sample-accurate peak detection) prior to HLS segmentation and loudness analysis.
  * A minimum 0.5s sustained silence duration is required before trimming the tail, preserving natural reverb decays and fading room acoustics.
* **Real File Migration CLI (`npm run silence:trim`):**
  * Scans existing master files in disk storage (`/srv/chromatik/media`), trimming head/tail silence in-place.
  * Preserves raw master safety with automatic `.orig.bak` backups.
  * Rebuilds HLS VOD streams (`index.m3u8` and AAC `.ts` segments) with voice watermark loop integrity (`TAG_MIX_FILTER`).
  * Re-computes EBU R128 integrated loudness (LUFS) and writes updated metadata to MongoDB.
  * Supports `--dry-run`, `--force`, and `--no-backup` CLI flags.

---

## 🎨 II. Visual Design, Workstation & User Experience

### 🎨 7. Customizable Artist Profile Hero & 3D Interactive Themes
* **3 Immersive WebGL / Canvas Themes:**
  * **Ribbons:** Warm neon reds, fluid streaming ribbons, and high-energy pulses.
  * **Flowfield:** Organic particle vector fields and deep futuristic purples.
  * **Pillars:** Cyberpunk blue-violet neon pillars, futuristic perspective grids, and low-end bass resonance.
* **Unified Design Tokens:** The producer’s chosen theme automatically permeates their cards, BoxPlayer conic borders, buttons, and ambient highlights via dynamic CSS variables.
* **Creator Identity:** Profile banners, avatars, social links, bio, play/like counters, and curated showcase tracks.

---

### 🧊 8. Cyberpunk 3D BoxPlayer (Interactive Beat Cards)
* **Gyroscopic & Cursor-Aware 3D Tilt:** 60 FPS perspective tilt that dynamically tracks mouse movement.
* **Chroma Split & Scanlines:** Retro-futuristic RGB shift and subtle CRT scanlines on art hover.
* **Spinning Conic Gradient Border:** 360-degree flowing border glow harmonized with the artist's palette.
* **Dynamic BPM Badge & In-Card Playback:** Live tempo tag, instant play/pause, cover art fallbacks, and optimistic like reactions without leaving the page.

---

### 🎛️ 9. Bottom Player Audio Workstation & Glassmorphic Playlists
* **Pixel-Perfect Custom Seeker:** Separate buffer and progress tracks with smooth drag-to-seek interaction.
* **Comprehensive "Tune" Menu:**
  * One-click "Reset All" button and active modifier indicator dot.
  * Tempo, Pitch, Smart Automix, and Normalization controls neatly organized in one compact dock.
  * Live display of the exact dB gain applied to the current track (e.g. `+3.0 dB` or `Not analysed yet`).
* **Glassmorphic Playlist Workstation (`Playlist.vue`):** Ambient top glow lines, responsive track lists with artist links, duration, BPM chips, quick play, and queue integration.
* **MediaSession API Integration:** System lock screen art, track info, and hardware multimedia key support.
* **Queue Management:** Shuffle, repeat (one/all), and playlist reordering.

---

### 🌊 10. Sonic Hero Stage & Interactive Timestamped Comments
* **Sonic Hero Stage with WaveField (`Home.vue`):** Audio-reactive canvas background, cyberpunk `GlitchTitle`, genre/vibe chips, and a featured spotlight beat showcase.
* **Visual Waveform Display:** Interactive dynamic visualizer with exact click-to-seek playback.
* **Pinned Timestamp Comments:** Artists and fans can pin feedback to exact seconds on the beat (e.g. *01:14 "This bass drop is insane!"*).
* **Instant Jump:** Clicking any comment smooth-scrolls playback directly to that timestamp.

---

## 🛡️ III. Infrastructure, Security & Monetization

### 🛡️ 11. Audio Protection, Robust Logging & HLS Streaming
* **Winston Daily Rotate File Engine:** Daily rotating audit logs (`requests-YYYY-MM-DD.log` and `error-YYYY-MM-DD.log` with a 14-day retention cycle) active across development and production.
* **Configurable Timezone via Environment (`TZ`):** Server logs can be aligned to any target local timezone via the `TZ` environment variable (e.g. `TZ=Europe/Istanbul`) regardless of the host machine's system clock.
* **Production Sanitization (Zero-Leakage Build):** Vite strips all `console.log` and `debugger` statements from production bundles; backend production mode silences developer logs and strips comments (`removeComments: true`).
* **Centralized Media Pipeline (`MEDIA_DIR`):** All upload destinations, audio segmentation paths, and static media serving are dynamically configured via `.env` and validated with `envalid`.
* **Automated Voice Tagging:** Untagged audio uploads are seamlessly mixed with an infinite-loop voice tag.
* **HLS (.m3u8) VOD Segmentation:** Streamed audio is served via segmented HTTP Live Streaming instead of raw MP3s, preventing unauthorized browser downloads and scraper bots.
* **Vault-Secured Masters:** Clean uncompressed master WAVs and multi-track Stems are encrypted and accessible only upon license purchase.

---

### 💼 12. Multi-Tier Licensing & Producer Dashboard
* **4-Tier License Matrix:** *Basic MP3*, *Premium WAV*, *Unlimited*, and *Exclusive* buyouts.
* **Producer Analytics Dashboard:** Total plays, likes, sales revenue, monthly income, and inventory management.
* **Soundkits Marketplace:** Sell sample packs, drum kits, and presets alongside beats.

---

## 🛠️ Tech Architecture

| Tier | Technologies |
| :--- | :--- |
| **Frontend Framework** | Vue 3 (Composition API / `<script setup>`) · Vite 7 · TypeScript |
| **State & UI System** | Pinia · Vuetify 3 · SCSS (Cyberpunk Glassmorphism Tokens) |
| **Next-Gen Audio Engine** | Web Audio API · AudioWorklet · Signalsmith Stretch (C++ WASM) · HLS.js |
| **BPM Detection Engine** | Dual-Band DSP Autocorrelation (Client Web Audio API + Server FFmpeg PCM) |
| **Backend API** | Node.js · Express · TypeScript · MongoDB · Mongoose |
| **Media Pipeline** | FFmpeg (EBU R128 Loudness, Silence Trimming, Voice Tag Looper Mix, HLS VOD Packager) |
| **Security & Auth** | JWT · Role-based Middleware · Protected Stream Proxy |
| **API Standards** | OpenAPI / Swagger 3.0 JSDoc Documentation |
| **Localization (i18n)** | Dynamic English & Turkish multi-language support |

---

## 📁 Monorepo Structure
```
chromatik/
├── frontend/             # Vue 3 + Pinia + Web Audio Engine
│   ├── src/services/     # AudioEngine, PitchShifter (WASM), Limiter (AudioWorklet), StreamResolver
│   ├── src/components/   # BoxPlayer, BottomPlayer, Waveform, CommentSection, Playlist, Navigation
│   ├── src/views/        # Home (Sonic Hero Stage), TrackPage, Profile (3D Themes), Dashboard
│   ├── src/utils/        # bpmDetector.ts (Client Web Audio DSP), audioMath.ts, themePalette.ts
│   └── src/locales/      # en.json & tr.json translations
├── backend/              # Node.js + Express + TypeScript API
│   ├── src/utils/        # bpm.ts (Native DSP BPM Engine), loudness.ts (EBU R128), silence.ts (Silence Trimming), upload.ts
│   ├── src/scripts/      # backfillBpm.ts, backfillLoudness.ts, backfillSilence.ts (Silence Migration CLI)
│   ├── src/controller/   # Track, User, Soundkit, Comment controllers
│   └── src/model/        # Mongoose data models
└── docker-compose.dev.yml
```

---

## 🚀 Quickstart

### Option 1: Docker (Recommended)
1. Ensure ports **8080** (frontend), **5000** (backend), and **27017** (mongo) are available.
2. Spin up containers:
   ```bash
   docker compose -f docker-compose.dev.yml up --build
   ```
3. Open in your browser:
   * **Frontend:** [http://localhost:8080](http://localhost:8080)
   * **Backend API & Swagger:** [http://localhost:5000/api](http://localhost:5000/api)

---

### Option 2: Local Development (Without Docker)

#### 1. Backend Setup
```bash
cd backend
npm install
npm run dev
```

> **To measure and backfill loudness, BPM, or trim silence on existing tracks:**
> ```bash
> npm run loudness:backfill
> npm run bpm:backfill
> npm run silence:trim       # Trims dead silence from physical master files & rebuilds HLS streams
> ```

#### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev -- --host --port 8080
```
Open **http://localhost:8080**.

---

## 🎶 Why “Chromatik”?
The *Chromatic Scale* traverses the entire musical spectrum in half-step increments, excluding no frequencies. Chromatik represents that same creative freedom — an uncompromising platform where every producer’s sound is delivered in its most vibrant, punchy, and authentic nuance.
