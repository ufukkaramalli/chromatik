# 1) Build aşaması
FROM node:16 as build-stage

WORKDIR /app

# Paketleri kopyala ve yükle
COPY package*.json ./
RUN npm install

# Browserslist DB güncellemesi
RUN npx browserslist@latest --update-db

# Kaynak dosyaları kopyala
COPY . .

# Vue projesini build et
RUN npm run build

# 2) Production aşaması (sadece statik dosyalar)
FROM nginx:stable-alpine as production-stage

# Build dosyalarını Nginx'e kopyala
COPY --from=build-stage /app/dist /usr/share/nginx/html

# Port ayarı
EXPOSE 80

# Nginx başlat
CMD ["nginx", "-g", "daemon off;"]