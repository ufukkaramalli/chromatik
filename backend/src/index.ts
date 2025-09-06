// index.ts
import dotenv from 'dotenv';
import App from './app';
import validateEnv from './utils/validateEnv';
import TrackController from './controller/track.controller';
import UserController from './controller/user.controller';
import SoundkitController from './controller/soundkit.controller';

// NODE_ENV'e göre doğru .env dosyasını yükle
const envFile =
  process.env.NODE_ENV === 'production' ? '.env.production' : '.env.development';
dotenv.config({ path: envFile });

console.log(`Running in ${process.env.NODE_ENV} mode`);

validateEnv();

const app = new App(
  // Register Controllers
  [
    new TrackController(),
    new UserController(),
    new SoundkitController(),
  ],
  // Register server port number
  Number(process.env.PORT)
);

app.listen();