FROM node:16-bullseye

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

ENV NODE_ENV=production
ENV JWT_SECRET=your_jwt_secret
ENV MONGO_URI=mongodb://mongo:27017/chromatik

RUN npm run build

EXPOSE 5000

CMD ["node", "dist/index.js"]