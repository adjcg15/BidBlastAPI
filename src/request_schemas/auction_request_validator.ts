import { Schema } from "express-validator";

class AuctionRequestValidator {
    public static auctionsListSchema(): Schema {
        return {
            limit: {
                in: ["query"],
                isInt: {
                    options: { min: 1 },
                    errorMessage: "The  query parameter 'limit' must be an INTEGER value grater or equal 1"
                },
                optional: { options: { nullable: true } },
                toInt: true
            },
            offset: {
                in: ["query"],
                isInt: {
                    options: { min: 0 },
                    errorMessage: "The query parameter 'offset' must be an INTEGER value grater or equal 0"
                },
                optional: { options: { nullable: true } },
                toInt: true
            },
            query: {
                in: ["query"],
                trim: true,
                optional: { options: { nullable: true } },
                toLowerCase: true
            },
            categories: {
                in: ["query"],
                optional: { options: { nullable: true } },
                custom: {
                    options: (value) => {
                        if (!/^\d+(,\d+)*$/.test(value) && value !== "") {
                            throw new Error("The query parameter 'categories' must be a comma-separated list of integers");
                        }
                        return true;
                    }
                },
                customSanitizer: {
                    options: (value) => {
                        return value ? value.split(',').map(Number) : [];
                    }
                }
            },
            minimumPrice: {
                in: ["query"],
                isFloat: {
                    options: { min: 0 },
                    errorMessage: "The query parameter 'minimumPrice' must be a FLOAT value grater or equal 0"
                },
                optional: { options: { nullable: true } },
                toFloat: true
            },
            maximumPrice: {
                in: ["query"],
                isFloat: {
                    options: { min: 0 },
                    errorMessage: "The query parameter 'maximumPrice' must be a FLOAT value grater or equal 0"
                },
                optional: { options: { nullable: true } },
                toFloat: true
            }
        };
    }

    public static auctionByIdSchema(): Schema {
        return {
            idAuction: {
                in: ["params"],
                isInt: {
                    options: { min: 1 },
                    errorMessage: "Invalid auction ID"
                },
                toInt: true
            }
        }
    }
}

export default AuctionRequestValidator;