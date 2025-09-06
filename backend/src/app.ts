import express, { Application } from 'express';
import mongoose from 'mongoose';
import compression from 'compression';
import cors from 'cors';
import morgan from 'morgan';
import IController from './interfaces/controller.interface';
import ErrorMiddleware from './middleware/error.middleware';
import helmet from 'helmet';
import swaggerDocs from './utils/swagger';
import logger, { requestResponseLogger, errorLogger } from './utils/logger';

class App {
  public express: Application;
  public port: number;

  constructor(controllers: IController[], port: number) {
    this.express = express();
    this.port = port;

    // Logger initialization
    this.initializeLogger();

    this.initializeSwagger(this.express, this.port);
    this.initialiseDatabaseConnection();
    this.initialiseMiddleware();
    this.initialiseControllers(controllers);
    this.initialiseErrorHandling();
  }

  private initializeLogger(): void {
    logger.info(`Logger initialized in ${process.env.NODE_ENV || 'development'} mode.`);

    // Request + Response logging middleware
    this.express.use(requestResponseLogger);

    // Error logging middleware
    this.express.use(errorLogger);
  }

  private initialiseMiddleware(): void {
    logger.info("Setting up Middleware...");
    this.express.use(helmet());
    this.express.use(cors());
    this.express.use(morgan('dev')); // mevcut bırakıldı
    this.express.use(express.json());
    this.express.use(express.urlencoded({ extended: false }));
    this.express.use(compression());
    logger.info("Middleware setup complete.");
  }

  private initialiseControllers(controllers: IController[]): void {
    logger.info("Setting up Controllers...");
    controllers.forEach((controller: IController) => {
      this.express.use('/api', controller.router);
      logger.info(`Controller ${controller.constructor.name} initialized.`);
    });
    logger.info("All controllers have been set up.");
  }

  private initialiseErrorHandling(): void {
    logger.info("Setting up Error Handling...");
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
    this.express.listen(this.port, () => {
      logger.info(`App listening on port http://localhost:${this.port}`);
    });
  }
}

export default App;