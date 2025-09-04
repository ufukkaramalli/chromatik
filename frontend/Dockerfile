# 1) Build aşaması
FROM node:16 as build-stage

WORKDIR /app
COPY package*.json ./
RUN npm install

# Browserslist DB güncelle
RUN npx browserslist@latest --update-db

COPY . .

# Node flag ile Vue build et
ENV NODE_OPTIONS=--openssl-legacy-provider
RUN npm run build

# 2) Production aşaması (sadece statik dosyalar)
FROM nginx:stable-alpine as production-stage
COPY --from=build-stage /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]