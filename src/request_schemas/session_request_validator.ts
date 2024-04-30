import { Schema } from "express-validator";

class SessionRequestValidator {
    public static loginSchema(): Schema {
        return {
            email: {
                in: ["body"],
                trim: true,
                isEmail: true,
                errorMessage: "Invalid e-mail address"
            },
            password: {
                in: ["body"],
                trim: true,
                notEmpty: true,
                errorMessage: "Password is required"
            }
        }
    }
}

export default SessionRequestValidator;