import { Application, Express, Request, Response } from "express";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { version } from "../../package.json";
import logger from "./logger";

const options: swaggerJsdoc.Options = {
    definition: {
        openapi: "3.0.0",
        info: {
        title: "Chromatik API",
        version
        },
        components: {
            securitySchemes: {
                bearerAuth: {
                type: "http",
                scheme: "bearer",
                bearerFormat: "JWT"
                },
            },
        },
        security: [{ bearerAuth: [] }],
    },
    apis: ['./src/app.ts','./src/controller/*.ts', './src/model/*.ts'], // files containing annotations as above
};

const swaggerSpec = swaggerJsdoc(options);
function swaggerDocs(app: Application, port: number){
    app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
    app.get('docs.json', (req: Request, res: Response) => {
        res.setHeader('Content-Type', 'application/json');
        res.send(swaggerSpec);
    });
    logger.info(`Swagger docs available at http://localhost:${port}/docs`);
}

export default swaggerDocs