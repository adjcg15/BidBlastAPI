import { Request, Response } from "express";
import AccountService from "services/account_service";
import { DataContextException } from "@exceptions/services";
import { HttpStatusCodes } from "@ts/enums";

class AccountController {
    public static async createAccount(req: Request, res: Response): Promise<void> {
        
        const { fullName, email, phoneNumber, avatar, password } = req.body;

        try {
            const avatarBuffer = avatar ? Buffer.from(avatar, 'base64') : null;
            const account = await AccountService.createAccount(fullName, email, phoneNumber, avatarBuffer, password);
            res.status(HttpStatusCodes.CREATED).json({ message: "Account created successfully", account });
        } catch (error: any) {
            console.error("Error type:", error.constructor.name);
            console.error("Error message:", error.message);

            let statusCode = HttpStatusCodes.INTERNAL_SERVER_ERROR;
            const responseDetails = {
                error: true,
                statusCode: HttpStatusCodes.INTERNAL_SERVER_ERROR,
                details: "There was an unexpected error, please try again later"
            };

            if (error instanceof DataContextException) {
                responseDetails.details = "It was not possible to create the account, please try again later";
            } else if (error.message === "Email already exists") {
                statusCode = HttpStatusCodes.BAD_REQUEST;
                responseDetails.statusCode = statusCode;
                responseDetails.details = "The email address is already in use. Please use a different email address.";
            }

            res.status(statusCode).json(responseDetails);
        }
    }
}

export default AccountController;
