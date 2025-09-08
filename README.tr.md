# Chromatik

*Kromatik Dizi*’den ilham alan modern bir **beat pazaryeri** — esnek, ifade gücü yüksek, üretici odaklı.

> ⚠️ **Docker notu:** Önceki Docker yapılandırması doğru değildi. Aşağıda **çalışan, minimal bir geliştirme kurulumu** (monorepo) yer alıyor: **frontend 8080**, **backend 5000**. Sorun yaşarsanız Lokal Başlangıç’ı kullanın ve loglarla issue açın.

**Monorepo yapısı**
```
chromatik/
  apps/
    frontend/   # Vue 3 + Vite + Pinia
    backend/    # Node.js + Express + MongoDB
  docker-compose.yml
```

## Hızlı Başlangıç — Docker (geliştirme) ✅
1) **8080** ve **5000** portlarının boş olduğundan emin olun.  
2) Bu depoda bulunan dosyalar (gerekirse aşağıdaki linklerden indirin):
   - `docker-compose.yml`
   - `apps/frontend/Dockerfile` (Vite dev 8080, HMR hazır)
   - `apps/backend/Dockerfile`  (Express dev 5000)
   - `apps/frontend/vite.config.ts` (8080 ve host sabit)
3) Çalıştırın:
```bash
docker compose up --build
```
**http://localhost:8080** (frontend) ve **http://localhost:5000/api** (backend temel path) adreslerine gidin.

> Frontend API’ye bağlanamıyorsa şunları doğrulayın: `VITE_API_BASE_URL=http://localhost:5000/api` ve backend’te CORS `CLIENT_ORIGIN=http://localhost:8080`.

## Hızlı Başlangıç — Lokal
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
Ardından **http://localhost:8080** adresini açın.

## Teknoloji
**Frontend:** Vue 3 · Vite · Pinia  
**Backend:** Node.js · Express · MongoDB · JWT

## Neden “Chromatik”?
Kromatik dizi, yarım seslerle tüm tonlara geçer; üretimde **özgürlük ve nüans** için basit bir metafor.
