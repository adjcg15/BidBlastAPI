import { Schema } from "express-validator";

class OfferRequestValidator {
    public static createOfferSchema(): Schema {
        return {
            auctionId: {
                in: "body",
                isInt: {
                    options: { min: 1 },
                    errorMessage: "Invalid 'auctionId' value"
                },
                toInt: true
            },
            amount: {
                in: "body",
                isFloat: {
                    options: { gt: 0 },
                    errorMessage: "Invalid 'amount' value"
                },
                toFloat: true
            }
        }
    }
}

export default OfferRequestValidator;