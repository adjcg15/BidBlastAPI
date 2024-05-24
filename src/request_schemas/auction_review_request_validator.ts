import { Schema } from "express-validator";

class AuctionReviewRequestValidator {
    public static auctionReviewSchema(): Schema {
        return {
            idAuction: {
                in: ["body"],
                isInt: {
                    options: { min: 1 },
                    errorMessage: "The body attribute 'idAuction' is an invalid ID for an auction"
                },
                toInt: true
            },
            isApproved: {
                in: ["body"],
                isBoolean: true,
                errorMessage: "The body attribute 'isApproved' must be a boolean value",
                toBoolean: true
            },
            comments: {
                in: ["body"],
                isString: {
                    errorMessage: "The body attribute 'comments' should be a string value"
                },
                trim: true,
                optional: { options: { nullable: true } }
            }
        };
    }
}

export default AuctionReviewRequestValidator;