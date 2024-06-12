import { Schema } from "express-validator";

class UserRequestValidator {
    public static userRegistrationSchema(): Schema {
        return {
            fullName: {
                in: ["body"],
                trim: true,
                notEmpty: {
                    errorMessage: "fullName is required"
                },
                isLength: {
                    options: { max: 255 },
                    errorMessage: "Title cannot be longer than 255 characters"
                }

            },
            email: {
                in: ["body"],
                trim: true,
                isEmail: true,
                notEmpty: {
                    errorMessage: "Email is required"
                },
                isLength: {
                    options: { max: 60 },
                    errorMessage: "Email cannot be longer than 60 characters"
                }

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
                notEmpty: {
                    errorMessage: "Password is required"
                },
                isLength: {
                    options: { min: 8 },
                    errorMessage: "Password must be at least 8 characters long"
                },
                matches: {
                    options: /^(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/,
                    errorMessage: "Password must contain at least one uppercase letter, one number, and one special character"
                }
            }            
        };
    }

    public static userUpdateSchema(): Schema {
        return {
            fullName: {
                in: ["body"],
                trim: true,
                notEmpty: {
                    errorMessage: "fullName is required"
                },
                isLength: {
                    options: { max: 255 },
                    errorMessage: "Title cannot be longer than 255 characters"
                }
            },
            email: {
                in: ["body"],
                trim: true,
                isEmail: true,
                notEmpty: {
                    errorMessage: "Email is required"
                },
                isLength: {
                    options: { max: 60 },
                    errorMessage: "Email cannot be longer than 60 characters"
                }
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
                optional: { options: { nullable: true } },
                trim: true,
                notEmpty: {
                    errorMessage: "Password is required"
                },
                isLength: {
                    options: { min: 8 },
                    errorMessage: "Password must be at least 10 characters long"
                },
                matches: {
                    options: /^(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/,
                    errorMessage: "Password must contain at least one uppercase letter, one number, and one special character"
                }
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

    public static userSchemaForDeletion(): Schema{
        return {
            idProfile: {
                in: ["params"],
                isInt: {
                    options: { min: 1 },
                    errorMessage: "Invalid profile Id"
                },
                toInt: true
            }
        }
    }

    public static usersListSchema() : Schema{
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
}

export default UserRequestValidator;