const swaggerAutogen = require("swagger-autogen")();
const dotenv = require("dotenv");
dotenv.config();

const doc = {
    info: {
        title: "BidBlast API", 
        version: "1.0.0"
    },
    host: `${process.env.HOST_URL}:${process.env.PORT}`,
    basePath: "/api",
    schemes: ["http", "https"],
    consumes: ["application/json"],
    produces: ["application/json"],
    securityDefinitions: {
        BearerAuth: {
            type: "apiKey",
            name: "Authorization",
            scheme: "bearer",
            in: "header",
        },
    },
    "@definitions": {
        ValidationError: {
            type: "object",
            properties: {
                error: { type: "boolean", example: true },
                statusCode: { type: "integer", example: 400 },
                details: {
                    oneOf: [
                        { type: "string", example: "Bad reques error explanation" },
                        {
                            type: "array",
                            items: {
                                type: "string",
                                example: ["Validation error 1", "Validation error 2", "Validation error 3"]
                            },
                        },
                    ],
                },
            },
        }
    },
    definitions: {
        UserCredentials: {
            email: "John Doe",
            password: "johnd03_"
        },
        UserSession: {
            token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MjcsImVtYWlsI...",
            id: 1,
            fullName: "John Doe",
            phoneNumber: "2288888888",
            avatar: "iVBORw0KGgoAAAANSUhEUgAAAIIAAADACAMAAAD/TUuoAAADAFBMVEXW1d...",
            email: "johndoe@mail.com",
            roles: ["AUCTIONEER", "CUSTOMER", "MODERATOR"]
        },
        ServerError: {
            error: true,
            statusCode: 500,
            details: "There was an unexpeted error, please try it again later"
        },
        BadRequestError: {
            error: true,
            statusCode: 400,
            details: "Explanation about bad request failure"
        },
        ValidationError: {
            error: true,
            statusCode: 400,
            details: ["Validation error 1", "Validation error 2", "Validation error 3"]
        }
    }
};

const outputFile = "./swagger-output.json";
const routes = [
    "./src/routes/index.ts"
];

swaggerAutogen(outputFile, routes, doc);