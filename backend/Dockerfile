FROM node:18

# Konteyner içinde çalışma dizinini ayarla
WORKDIR /usr/src/app

# Sadece package.json ve package-lock.json kopyala
COPY package*.json ./

# Bağımlılıkları yükle, ama postinstall scriptlerini atla
RUN npm install --ignore-scripts

# Projenin geri kalanını kopyala
COPY . .

# Artık build edebiliriz
RUN npm run build

# Servis hangi portu dinleyecekse
EXPOSE 5000

# Konteyner çalıştığında başlatılacak komut
CMD ["npm", "start"]