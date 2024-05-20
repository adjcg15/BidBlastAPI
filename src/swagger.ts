import { Application } from "express";
import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const options: swaggerJSDoc.Options = {
    definition: {
        openapi: "3.0.0",
        info: { title: "BidBlast API", version: "1.0.0" }
    },
    apis: [
        "src/routes/account_routes.ts",
        "src/routes/auction_category_routes.ts",
        "src/routes/auction_routes.ts",
        "src/routes/session_routes.ts",
        "src/routes/user_routes.ts",
    ]
};

const swaggerSpec = swaggerJSDoc(options);

const swaggerDocs = (app: Application, port?: string) => {
    app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
    console.log(`Docs are available on ${process.env.HOST_URL}:${port}/api/docs`)
};

export { swaggerDocs };