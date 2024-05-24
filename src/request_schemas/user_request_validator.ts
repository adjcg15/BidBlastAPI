import { Schema } from "express-validator";

class UserRequestValidator {
    public static userSalesAuctionsListSchema() : Schema{
        return {
            startDate: {
                in: ["query"],
                isISO8601: {
                    errorMessage: "Invalid start date format. Date should be in ISO8601 format (YYYY-MM-DD)"
                },
                optional: { options: { nullable: true } }
            },
            endDate: {
                in: ["query"],
                isISO8601: {
                    errorMessage: "Invalid end date format. Date should be in ISO8601 format (YYYY-MM-DD)"
                },
                optional: { options: { nullable: true } }
            },
        };
    }

    public static userAuctionsListSchema() : Schema{
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
            }
        };
    }

    public static userAuctionByIdSchema(): Schema{
        return {
            idAuction: {
                in: ["params"],
                isInt: {
                    options: { min: 1 },
                    errorMessage: "Invalid auction Id"
                },
                toInt: true
            }
        }
    }
}

export default UserRequestValidator;