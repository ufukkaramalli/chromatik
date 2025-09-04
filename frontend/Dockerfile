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

# 2) Serve with Nginx
FROM nginx:stable-alpine AS production-stage
COPY --from=build-stage /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]