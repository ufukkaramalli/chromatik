# Node 16 tabanlı backend
FROM node:16-bullseye

WORKDIR /app

# Paketleri yükle
COPY package*.json ./
RUN npm install

# Kaynak dosyaları kopyala
COPY . .

# Typescript build
RUN npm run build

# Backend portu
EXPOSE 5000

# Start backend
CMD ["node", "dist/index.js"]
