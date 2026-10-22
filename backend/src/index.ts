// index.ts
import dotenv from 'dotenv';
import App from './app';
import validateEnv from './utils/validateEnv';
import TrackController from './controller/track.controller';
import UserController from './controller/user.controller';
import SoundkitController from './controller/soundkit.controller';
import CommentController from './controller/comment.controller';
import CurrencyController from './controller/currency.controller';
import CartController from './controller/cart.controller';
import ExploreController from './controller/explore.controller';
import logger from './utils/logger';

// NODE_ENV'e göre doğru .env dosyasını yükle
const envFile =
  process.env.NODE_ENV === 'production' ? '.env.production' : '.env.development';
dotenv.config({ path: envFile });

if (process.env.NODE_ENV === 'production') {
  console.log = () => {};
  console.info = () => {};
  console.debug = () => {};
}

logger.info(`Running in ${process.env.NODE_ENV} mode`);

validateEnv();

const app = new App(
  // Register Controllers
  [
    new TrackController(),
    new UserController(),
    new SoundkitController(),
    new CommentController(),
    new CurrencyController(),
    new CartController(),
    new ExploreController(),
  ],
  // Register server port number
  Number(process.env.PORT)
);

app.listen();