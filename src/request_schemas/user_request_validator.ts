import { Schema } from "express-validator";

class UserRequestValidator {
    public static userSalesAuctionsListSchema() : Schema{
        return {
            usid: {
                in: ["params"],
                isInt: true,
                errorMessage: "Invalid user id"
            },
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
            usid: {
                in: ["params"],
                isInt: true,
                errorMessage: "Invalid user id"
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
            },
            query: {
                in: ["query"],
                trim: true,
                optional: { options: { nullable: true } },
                toLowerCase: true
            }
        };
    }

    public static userOnBlackListSchema() : Schema{
        return {
            id_profile: {
                in: ["body"],
                notEmpty: true,
                isInt: true,
                errorMessage: "Invalid profile id"
            },
            id_pauction: {
                in: ["body"],
                notEmpty: true,
                isInt: true,
                errorMessage: "Invalid auction id"
            }
        }
    }
}

export default UserRequestValidator;