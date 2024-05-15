import { Schema } from "express-validator";

class UserRequestValidator {
    public static userAuctionsListSchema() : Schema{
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
            }
        };
    }
}

export default UserRequestValidator;