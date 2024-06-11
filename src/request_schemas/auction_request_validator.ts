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
    public static createAuctionSchema(): Schema {
        return {
            title: {
                in: ["body"],
                isString: true,
                trim: true,
                notEmpty: {
                    errorMessage: "Title is required"
                },
                isLength: {
                    options: { max: 60 },
                    errorMessage: "Title cannot be longer than 60 characters"
                }
            },
            description: {
                in: ["body"],
                isString: true,
                notEmpty: {
                    errorMessage: "Description is required"
                },
                isLength: {
                    options: { max: 255 },
                    errorMessage: "Description cannot be longer than 255 characters"
                }
            },
            basePrice: {
                in: ["body"],
                isFloat: {
                    options: { min: 0 },
                    errorMessage: "Base price must be a positive number"
                },
                toFloat: true
            },
            minimumBid: {
                in: ["body"],
                isFloat: {
                    options: { min: 0 },
                    errorMessage: "Minimum bid must be a positive number"
                },
                optional: { options: { nullable: true } },
                toFloat: true
            },
            approvalDate: {
                in: ["body"],
                isISO8601: {
                    errorMessage: "Approval date must be a valid date"
                },
                optional: { options: { nullable: true } },
                toDate: true
            },
            daysAvailable: {
                in: ["body"],
                isInt: {
                    options: { min: 1 },
                    errorMessage: "Days available must be at least 1"
                },
                toInt: true
            },
            idItemCondition: {
                in: ["body"],
                isInt: {
                    errorMessage: "Item condition ID must be an integer"
                },
                toInt: true
            },
            idAuctionCategory: {
                in: ["body"],
                isInt: {
                    errorMessage: "Auction category ID must be an integer"
                },
                toInt: true,
                optional: { options: { nullable: true } }
            },
            mediaFiles: {
                in: ["body"],
                isArray: {
                    errorMessage: "Media files must be an array"
                },
                optional: { options: { nullable: true } }
            },
            "mediaFiles.*.mimeType": {
                in: ["body"],
                isString: true,
                notEmpty: {
                    errorMessage: "Each media file must have a mimeType"
                }
            },
            "mediaFiles.*.content": {
                in: ["body"],
                isString: true,
                notEmpty: {
                    errorMessage: "Each media file must have content"
                }
            },
            "mediaFiles.*.name": {
                in: ["body"],
                isString: true,
                optional: { options: { nullable: true } }
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

    public static userOnBlackListSchema() : Schema{
        return {
            auid: {
                in: ["params"],
                isInt: {
                    options: { min: 1 },
                    errorMessage: "Invalid auction ID"
                },
                toInt: true
            },
            idProfile: {
                in: ["body"],
                isInt: {
                    options: { min: 1 },
                    errorMessage: "Invalid profile ID"
                },
                toInt: true
            }
        }
    }

    public static offersByAuctionIdSchema() : Schema{
        return {
            auid: {
                in: ["params"],
                isInt: {
                    options: { min: 1 },
                    errorMessage: "Invalid auction ID"
                },
                toInt: true
            },
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
            }
        }
    }
}

export default AuctionRequestValidator;