import { Schema } from "express-validator";

class AuctionCategoriesRequestValidator {
    public static auctionCategorySchema(): Schema {
        return {
            catid: {
                in: ["params"],
                isInt: {
                    options: { min: 1 },
                    errorMessage: "Invalid category ID"
                },
                toInt: true
            },
        };
    }

    public static auctionCategoryModificationSchema(): Schema {
        return {
            catid: {
                in: ["params"],
                isInt: {
                    options: { min: 1 },
                    errorMessage: "Invalid category ID"
                },
                toInt: true
            },
            title: {
                in: ["body"],
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
                trim: true,
                notEmpty: true,
                errorMessage: "Description is required"
            },
            keywords: {
                in: ["body"],
                trim: true,
                notEmpty: {
                    errorMessage: "Keywords is required"
                },
                custom: {
                    options: (value) => {
                        const keywordsArray = value.split(',').map((keyword: string) => keyword.trim());
                        const validKeywords = keywordsArray.filter((keyword: string) => keyword !== '');
                        if (validKeywords.length < 3) {
                            throw new Error("Keywords must have at least three words separated by commas");
                        }
                        return true;
                    }
                }
            }
        };
    }

    public static auctionCategoryRegistrationSchema(): Schema {
        return {
            title: {
                in: ["body"],
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
                trim: true,
                notEmpty: true,
                errorMessage: "Description is required"
            },
            keywords: {
                in: ["body"],
                trim: true,
                notEmpty: {
                    errorMessage: "Keywords is required"
                },
                custom: {
                    options: (value) => {
                        const keywordsArray = value.split(',').map((keyword: string) => keyword.trim());
                        const validKeywords = keywordsArray.filter((keyword: string) => keyword !== '');
                        if (validKeywords.length < 3) {
                            throw new Error("Keywords must have at least three words separated by commas");
                        }
                        return true;
                    }
                }
            }
        };
    }
    public static categoriesListSchema(): Schema {
        return {
            limit: {
                in: ["query"],
                isInt: {
                    options: { min: 1 },
                    errorMessage: "The query parameter 'limit' must be an INTEGER value greater or equal 1"
                },
                optional: { options: { nullable: true } },
                toInt: true
            },
            offset: {
                in: ["query"],
                isInt: {
                    options: { min: 0 },
                    errorMessage: "The query parameter 'offset' must be an INTEGER value greater or equal 0"
                },
                optional: { options: { nullable: true } },
                toInt: true
            },
            query: {
                in: ["query"],
                trim: true,
                optional: { options: { nullable: true } },
                toLowerCase: true
            }
        };
    }
}

export default AuctionCategoriesRequestValidator;