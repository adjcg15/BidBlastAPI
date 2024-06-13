import { Schema } from "express-validator";

class AuctionReviewRequestValidator {
    public static approvalSchema(): Schema {
        return {
            idAuction: {
                in: ["body"],
                isInt: {
                    options: { min: 1 },
                    errorMessage: "The body attribute 'idAuction' is an invalid ID for an auction"
                },
                toInt: true
            },
            idAuctionCategory: {
                in: ["body"],
                isInt: {
                    options: { min: 1 },
                    errorMessage: "The body attribute 'idAuctionCategory' is an invalid ID for an auction category"
                },
                toInt: true
            }
        };
    }

    public static rejectionSchema(): Schema {
        return {
            idAuction: {
                in: ["body"],
                isInt: {
                    options: { min: 1 },
                    errorMessage: "The body attribute 'idAuction' is an invalid ID for an auction"
                },
                toInt: true
            },
            comments: {
                in: ["body"],
                notEmpty: {
                    errorMessage: "The body attribute 'comments' must be non-empty value"
                },
                isString: {
                    errorMessage: "The body attribute 'comments' must be a string value"
                },
                trim: true
            }
        };
    }
}

export default AuctionReviewRequestValidator;