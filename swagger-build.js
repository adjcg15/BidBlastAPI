const swaggerAutogen = require("swagger-autogen")();
const dotenv = require("dotenv");
dotenv.config();

const doc = {
    info: {
        title: "BidBlast API", 
        version: "1.0.0"
    },
    host: `${process.env.HOST_URL}:${process.env.PORT}`,
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
        NewOffer: {
            auctionId: 2,
	        amount: 550.5
        },
        AuctionsListInSearch: [
            {
                id: 1,
                title: "MIKEL'S Soporte para Motor 500 kg",
                closesAt: "2024-06-11T13:55:08.000Z",
                auctioneer: {
                    id: 15,
                    fullName: "Penélope Camacho Castro",
                    avatar: "/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAwMDQsNCxAODBANEA4QExYRDRASGR..."
                },
                mediaFiles: [
                    { $ref: '#/definitions/MediaFile' }
                ]
            }
        ],
        AuctionApproval: {
            idAuction: 136,
	        idAuctionCategory: 108
        },
        AuctionRejection: {
            idAuction: 136,
	        comments: "La subasta no cumple las políticas de venta de BidBlast"
        },
        MediaFile: {
            id: 2,
            name: "tool2",
            content: "/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAwMDQsNCxAODBANEA4QExYRDRASGR..."
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
        BadRequestErrorWithApiError: {
            error: true,
            statusCode: 400,
            details: "Explanation about bad request failure",
            apiErrorCode: "XXXX-40000X"
        },
        ValidationError: {
            error: true,
            statusCode: 400,
            details: ["Validation error 1", "Validation error 2", "Validation error 3"]
        }
    }
};

const outputFile = "./src/swagger-output.json";
const routes = [
    "./src/routes/index.ts"
];

swaggerAutogen(outputFile, routes, doc);