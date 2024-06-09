import { Schema } from "express-validator";

class UserRequestValidator {
    public static userSchema(): Schema {
        return {
            fullName: {
                in: ["body"],
                trim: true,
                notEmpty: true,
                errorMessage: "Full name is required"
            },
            email: {
                in: ["body"],
                trim: true,
                isEmail: true,
                errorMessage: "Invalid email address"
            },
            phoneNumber: {
                in: ["body"],
                optional: { options: { nullable: true } },
                trim: true,
                isNumeric: true,
                isLength: {
                    options: { min: 10, max: 10 },
                    errorMessage: "Phone number must be 10 digits long"
                }
            },
            avatar: {
                in: ["body"],
                optional: { options: { nullable: true } },
                trim: true
            },
            password: {
                in: ["body"],
                trim: true,
                notEmpty: true,
                errorMessage: "Password is required"
            }
        };
    }
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