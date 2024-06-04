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
                lastOffer: {
                    id: 23,
                    amount: 134.5,
                    creationDate: "2024-06-4T18:59:15.000Z"
                },
                mediaFiles: [
                    { $ref: "#/definitions/MediaFile" }
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
        CompleteMediaFile: {
            id: 2,
            name: "tool2",
            content: "/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAwMDQsNCxAODBANEA4QExYRDRASGR...",
            mimeType: "image/png"
        },
        MediaFile: {
            id: 2,
            name: "tool2",
            content: "/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAwMDQsNCxAODBANEA4QExYRDRASGR..."
        },
        Auction: {
            id: 160,
            title: "Fortnite Marvel: Iron Man Zero War Rare Bundle Skin Outfit",
            closesAt: "2024-06-09T11:12:07.000Z",
            description: "Código totalmente legal. No lo utilicé porque ya no juego.",
            basePrice: 15000,
            minimumBid: 200,
            itemCondition: "Nuevo",
            mediaFiles: [
                { $ref: "#/definitions/CompleteMediaFile" }
            ]
        },
        AuctionInSalesList: {
            id: 160,
            title: "Fortnite Marvel: Iron Man Zero War Rare Bundle Skin Outfit",
            category: {
                id: 25,
                title: "Videojuegos"
            },
            lastOffer: {
                id: 23,
                amount: 134.5,
                creationDate: "2024-06-4T18:59:15.000Z"
            },
            updatedDate: "2024-06-09T11:12:07.000Z"
        },
        AuctionCategory: {
            id: 126,
            title: "Videojuegos",
            description: "En esta categoría de subastas podrás encontrar todo tipo de juegos de video, sin importar su tipo o plataforma.",
            keywords: "pc, xbox, playstation, discos"
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
        NotFoundError: {
            error: true,
            statusCode: 404,
            details: "Explanation about element not found failure"
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