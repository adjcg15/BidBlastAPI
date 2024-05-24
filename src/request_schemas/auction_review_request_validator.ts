import { Schema } from "express-validator";

class AuctionReviewRequestValidator {
    public static auctionReviewSchema(): Schema {
        return {
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