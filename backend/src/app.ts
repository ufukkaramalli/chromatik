import express, { Application } from 'express';
import mongoose from 'mongoose';
import compression from 'compression';
import cors from 'cors';
import morgan from 'morgan';
import IController from './interfaces/controller.interface';
import IAppControllerRegistry from './interfaces/registry.interface';
import { apiLimiter } from './middleware/rateLimit.middleware';
import dbReadinessMiddleware from './middleware/dbReadiness.middleware';
import ErrorMiddleware from './middleware/error.middleware';
import helmet from 'helmet';
import swaggerDocs from './utils/swagger';
import logger, { requestResponseLogger, errorLogger } from './utils/logger';

const DB_RETRY_BASE_DELAY_MS = 1000;
const DB_RETRY_MAX_DELAY_MS = 30000;
const DB_SERVER_SELECTION_TIMEOUT_MS = 5000;

class App {
  public express: Application;
  public port: number;

  constructor(registry: IAppControllerRegistry, port: number) {
    this.express = express();
    this.port = port;

    // Logger initialization
    this.initializeLogger();

    this.initializeSwagger(this.express, this.port);
    this.initialiseDatabaseConnection();
    this.initialiseMiddleware();
    this.initialiseControllers(registry);
    this.initialiseErrorHandling();
  }

  private initializeLogger(): void {
    logger.info(`Logger initialized in ${process.env.NODE_ENV || 'development'} mode.`);

    // Request + Response logging middleware
    this.express.use(requestResponseLogger);
  }

  private initialiseMiddleware(): void {
    logger.info("Setting up Middleware...");
    this.express.use(helmet());
    this.express.use(cors());
    this.express.use(morgan('dev')); // mevcut bırakıldı
    this.express.use(express.json());
    this.express.use(express.urlencoded({ extended: false }));
    this.express.use(compression());
    
    // Serve uploaded files statically (from central media dir)
    this.express.use('/uploads', express.static(process.env.MEDIA_DIR || '/srv/chromatik/media'));
    
    // Trust reverse proxy (Vite / Docker / Nginx) so client IP and rate limit headers resolve accurately
    this.express.set('trust proxy', 1);

    logger.info("Middleware setup complete.");
  }

  private initialiseControllers(registry: IAppControllerRegistry): void {
    logger.info("Setting up Controllers...");

    // Apply global rate limiter to the /api domain namespace
    this.express.use('/api', apiLimiter);

    // Fail fast with 503 while MongoDB is unavailable (/health stays reachable)
    this.express.use('/api', dbReadinessMiddleware);

    // 1. Mount API domain controllers under /api
    registry.apiControllers.forEach((controller: IController) => {
      this.express.use('/api', controller.router);
      logger.info(`[API] Controller ${controller.constructor.name} mounted at /api`);
    });

    // 2. Mount System / Infrastructure controllers directly at root '/'
    // and also alias under '/api' so clients can call /api/health
    registry.systemControllers.forEach((controller: IController) => {
      this.express.use('/', controller.router);
      this.express.use('/api', controller.router);
      logger.info(`[SYSTEM] Controller ${controller.constructor.name} mounted at / and /api`);
    });

    logger.info("All controllers have been set up.");
  }

  private initialiseErrorHandling(): void {
    logger.info("Setting up Error Handling...");
    // Error logging middleware must be registered after controllers to intercept errors
    this.express.use(errorLogger);
    this.express.use(ErrorMiddleware);
    logger.info("Error Handling setup complete.");
  }

  private initialiseDatabaseConnection(): void {
    mongoose.set('strictQuery', true);
    this.registerDatabaseEvents();
    void this.connectWithRetry();
  }

  /**
   * Mongoose does not retry a failed *initial* connection on its own, so we
   * retry with exponential backoff. Once connected, the driver handles
   * reconnection and the lifecycle events below keep the logs informative.
   */
  private async connectWithRetry(attempt: number = 1): Promise<void> {
    const { MONGO_URI } = process.env;
    logger.info(`Connecting to MongoDB... (attempt ${attempt})`);

    try {
      await mongoose.connect(`${MONGO_URI}`, {
        serverSelectionTimeoutMS: DB_SERVER_SELECTION_TIMEOUT_MS
      });
    } catch (error: any) {
      const delay = Math.min(DB_RETRY_BASE_DELAY_MS * 2 ** (attempt - 1), DB_RETRY_MAX_DELAY_MS);
      logger.error(
        `MongoDB connection failed (attempt ${attempt}): ${error?.message || error}. Retrying in ${delay}ms`
      );
      setTimeout(() => void this.connectWithRetry(attempt + 1), delay);
    }
  }

  private registerDatabaseEvents(): void {
    const { connection } = mongoose;
    connection.on('connected', () => logger.info('MongoDB connected'));
    connection.on('disconnected', () => logger.warn('MongoDB disconnected'));
    connection.on('reconnected', () => logger.info('MongoDB reconnected'));
    connection.on('error', (error) => logger.error(`MongoDB connection error: ${error?.message || error}`));
  }

  private initializeSwagger(app: Application, port: number): void {
    logger.info("Setting up Swagger...");
    swaggerDocs(app, port);
    logger.info("Swagger setup complete.");
  }

  public listen(): void {
    const server = this.express.listen(this.port, () => {
      logger.info(`App listening on port http://localhost:${this.port}`);
    });
  }
}

export default App;