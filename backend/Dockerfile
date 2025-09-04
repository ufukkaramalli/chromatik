# Node 16 tabanlı backend
FROM node:16-bullseye

WORKDIR /app

# Build tools ekle (bcrypt gibi native addon'lar için)
RUN apt-get update && apt-get install -y python3 make g++ \
    && rm -rf /var/lib/apt/lists/*

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