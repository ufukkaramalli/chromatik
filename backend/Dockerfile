# Node 16 tabanlı backend
FROM node:16-bullseye

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

EXPOSE 5000
CMD ["npm", "start"]
