import { Application } from "express";
import swaggerUi from "swagger-ui-express";
import swaggerFile from "../swagger-output.json";

const swaggerDocs = (app: Application, port?: string) => {
    app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerFile));
    console.log(`Docs are available on ${process.env.HOST_URL}:${port}/api/docs`)
};

export { swaggerDocs };