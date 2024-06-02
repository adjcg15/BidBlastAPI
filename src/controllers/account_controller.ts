import { Request, Response } from "express";
import AccountService from "services/account_service";
import { DataContextException } from "@exceptions/services";
import { HttpStatusCodes } from "@ts/enums";

class AccountController {
    public static async createAccount(req: Request, res: Response): Promise<void> {
        /*
            #swagger.tags = ['Accounts']
            #swagger.summary = 'Creates a new account'
            #swagger.parameters['body'] = {
                in: 'body',
                required: true,
                schema: { 
                    type: 'object',
                    required: ['fullName', 'email', 'phoneNumber', 'password'],
                    properties: {
                        fullName: { type: 'string' },
                        email: { type: 'string' },
                        phoneNumber: { type: 'string' },
                        avatar: { type: 'string', format: 'byte' },
                        password: { type: 'string' }
                    }
                }
            }
            #swagger.responses[201] = {
                description: 'Account created successfully',
                schema: {
                    message: 'Account created successfully',
                    account: {
                        type: 'object',
                        properties: {
                            id: { type: 'string' },
                            fullName: { type: 'string' },
                            email: { type: 'string' },
                            phoneNumber: { type: 'string' },
                            avatar: { type: 'string', format: 'byte' }
                        }
                    }
                }
            }
            #swagger.responses[400] = {
                description: 'Bad request',
                schema: {
                    error: true,
                    statusCode: 400,
                    details: 'Bad request'
                }
            }
            #swagger.responses[401] = {
                description: 'Email already exists',
                schema: {
                    error: true,
                    statusCode: 401,
                    details: 'The email address is already in use. Please use a different email address.'
                }
            }
            #swagger.responses[500] = {
                description: 'Server error',
                schema: {
                    error: true,
                    statusCode: 500,
                    details: 'There was an unexpected error, please try again later'
                }
            }
        */
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
                statusCode = HttpStatusCodes.UNAUTHORIZED;
                responseDetails.statusCode = statusCode;
                responseDetails.details = "The email address is already in use. Please use a different email address.";
            }

            res.status(statusCode).json(responseDetails);
        }
    }
}

export default AccountController;
