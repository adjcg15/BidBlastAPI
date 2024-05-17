import { Schema } from "express-validator";

class AccountRequestValidator {
    public static registerSchema(): Schema {
        return {
            full_name: {
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
            phone_number: {
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
}

export default AccountRequestValidator;
