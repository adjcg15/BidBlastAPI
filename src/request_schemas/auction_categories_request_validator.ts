import { Schema } from "express-validator";

class AuctionCategoriesRequestValidator {
    public static auctionCategorySchema(): Schema {
        return {
            catid: {
                in: ["params"],
                isNumeric: true,
                errorMessage: "Invalid category id"
            },
        };
    }
}

export default AuctionCategoriesRequestValidator;