import express, { Application } from 'express';
import mongoose from 'mongoose';
import compression from 'compression';
import cors from 'cors';
import morgan from 'morgan';
import IController from './interfaces/controller.interface';
import IAppControllerRegistry from './interfaces/registry.interface';
import { apiLimiter } from './middleware/rateLimit.middleware';
import ErrorMiddleware from './middleware/error.middleware';
import helmet from 'helmet';
import swaggerDocs from './utils/swagger';
import logger, { requestResponseLogger, errorLogger } from './utils/logger';

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
    logger.info("Connecting to MongoDB...");
    const { MONGO_URI } = process.env;
    mongoose.set('strictQuery', true);
    mongoose.connect(`${MONGO_URI}`);
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