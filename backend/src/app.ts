import express, { Application, Express } from 'express';
import mongoose from 'mongoose';
import compression from 'compression';
import cors from 'cors';
import morgan from 'morgan';
import IController from './interfaces/controller.interface';
import ErrorMiddleware from './middleware/error.middleware';
import helmet from 'helmet';
import swaggerDocs from './utils/swagger';
class App {
    public express: Application;
    public port: number;
    public swagger: any; 
    constructor(controllers: IController[], port: number){
        this.express = express();
        this.port = port
        this.initializeSwagger(this.express, this.port);
        this.initialiseDatabaseConnection();
        this.initialiseMiddleware();
        this.initialiseControllers(controllers);
        this.initialiseErrorHandling();

    }

    private initialiseMiddleware(): void {
        console.log("Setting up Middleware...");
        this.express.use(helmet());
        this.express.use(cors());
        this.express.use(morgan('dev'));
        this.express.use(express.json());
        this.express.use(express.urlencoded({ extended: false }));
        this.express.use(compression());
        console.log("Middleware setup complete.");
    }

    private initialiseControllers(controllers: IController[]): void {
        console.log("Setting up Controllers...");
        /**
         * @openapi
         * /api:
         *   get:
         *     tags:
         *      - "API Root"
         *     description: "API Root Endpoint"
         * 
         */
        controllers.forEach((controller: IController) =>{   
            this.express.use('/api', controller.router);
            console.log(`Controller ${controller.constructor.name} initialized.`);
        })
        console.log("All controllers have been set up.");
    }

    private initialiseErrorHandling(): void {
        console.log("Setting up Error Handling...");
        this.express.use(ErrorMiddleware);
        console.log("Error Handling setup complete.");
    }

    private initialiseDatabaseConnection(): void {
        console.log("Connecting to MongoDB...");  
        const { MONGO_URI } = process.env;
        mongoose.set('strictQuery', true);
        mongoose.connect(`${MONGO_URI}`)
    }

    private initializeSwagger(app: Application, port: number): void {
        console.log("Setting up Swagger...");
        swaggerDocs(app, port);
        console.log("Swagger setup complete.");
    }

    public listen(): void {
        this.express.listen(this.port, () => {
            console.log(`App listening on port http://localhost:${this.port}`);
        })
    }
}


export default App