# Chromatik

*Chromatic Scale*’den esinlenilmiş modern bir **beat pazaryeri** — esnek, ifade özgürlüğü yüksek, üreticiyi öne çıkaran bir platform.

---

## Monorepo Yapısı
```
chromatik/
  frontend/    # Vue 3 + Vite + Vuetify + Pinia
  backend/     # Node.js + Express + MongoDB
  docker-compose.dev.yml
```

---

## 🚀 Hızlı Başlangıç — Docker (geliştirme)
1. **8080** (frontend) ve **5000** (backend) portlarının boş olduğundan emin ol.  
2. Bu repoda gereken dosyalar hazır:  
   - `docker-compose.dev.yml`  
   - `frontend/Dockerfile.dev` (Vite dev server, HMR destekli)  
   - `backend/Dockerfile.dev`  (Express dev server, hot-reload destekli)  
   - `frontend/vite.config.js` (proxy ayarı 5000’e yönlendirilmiş)  
3. Çalıştır:  
   ```bash
   docker compose -f docker-compose.dev.yml up --build
   ```
4. Aç:  
   - **Frontend:** http://localhost:8080  
   - **Backend:** http://localhost:5000/api  

> Eğer frontend API’ye ulaşamazsa şu ayarları kontrol et:  
> - `frontend/.env.development` içinde `VITE_API_ADDRESS=/api`  
> - `backend/.env.development` içinde `PORT=5000` ve CORS ayarları

---

## 💻 Hızlı Başlangıç — Yerel (Docker olmadan)
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
Sonra **http://localhost:8080** adresini aç.

---

## 🛠️ Teknoloji Yığını
- **Frontend:** Vue 3 · Vite · Vuetify · Pinia · Vuex  
- **Backend:** Node.js · Express · MongoDB · JWT · ts-node-dev  

---

## 🎶 Neden “Chromatik”?
Chromatic scale tüm sesler arasında yarım tonlarla ilerler — bu da üretim ve lisanslamada **özgürlük ve ince nüansları** temsil eder.