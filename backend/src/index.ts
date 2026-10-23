// index.ts
import dotenv from 'dotenv';
import App from './app';
import validateEnv from './utils/validateEnv';
import ControllerRegistry from './controller';
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
  new ControllerRegistry(),
  Number(process.env.PORT)
);

app.listen();