import { HttpStatusCodes, UpdateUserCodes } from "@ts/enums";
import { NextFunction, Request, Response } from "express";
import { DataContextException } from "@exceptions/services";
import UserService from "services/user_service";
import { userBodyType } from "@ts/controllers";

class UserController {
    public static async createUser(req: Request, res: Response, next: NextFunction): Promise<void> {
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
        try {
            const { fullName, email, phoneNumber, avatar, password } = req.body;

            const avatarBuffer = avatar ? Buffer.from(avatar, 'base64') : null;
            const account = await UserService.createUser(fullName, email, phoneNumber, avatarBuffer, password);
            res.status(HttpStatusCodes.CREATED).json({ message: "Account created successfully", account });
        } catch (error: any) {
            if (error.message === "Email already exists") {
                res.status(HttpStatusCodes.UNAUTHORIZED).json({
                    error: true,
                    statusCode: HttpStatusCodes.UNAUTHORIZED,
                    details: "The email address is already in use. Please use a different email address."
                });
            } else if (error instanceof DataContextException) {
                res.status(HttpStatusCodes.BAD_REQUEST).json({
                    error: true,
                    statusCode: HttpStatusCodes.BAD_REQUEST,
                    details: "It was not possible to create the account, please try again later"
                });
            } else {
                next(error);
            }
        }
    }

    public static async updateUser(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const idProfile = req.user.id;
            const { fullName, email, phoneNumber, avatar, password } = req.body as userBodyType;

            const errorMessages = {
                [UpdateUserCodes.PROFILE_NOT_FOUND]: `The profile with ID ${idProfile} was not found`,
                [UpdateUserCodes.ACCOUNT_NOT_FOUND]: `There is no account associated with the profile with the id ${idProfile}`,
                [UpdateUserCodes.EMAIL_ALREADY_EXISTS]: `Email already exists`
            };

            let updateUserResult: UpdateUserCodes | null = 
            await UserService.updateUser(idProfile, fullName, email, phoneNumber!, avatar!, password);
            if(updateUserResult !== null){
                const errorBody = {
                    error: true,
                    statusCode: HttpStatusCodes.BAD_REQUEST,
                    details: errorMessages[updateUserResult],
                    apiErrorCode: updateUserResult
                }
    
                res.status(errorBody.statusCode).json(errorBody);
                return;
            }
    
            res.status(HttpStatusCodes.CREATED).json();
        } catch (error: any) {
            next(error);
        }
    }
}

export default UserController;