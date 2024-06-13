import { CreateUserCodes, DeleteUserCodes, HttpStatusCodes, UpdateUserCodes } from "@ts/enums";
import { NextFunction, Request, Response } from "express";
import { DataContextException } from "@exceptions/services";
import UserService from "services/user_service";
import { GetUsersQueryType, userBodyType } from "@ts/controllers";

class UserController {
    public static async getUsersList(req: Request, res: Response, next: NextFunction): Promise<void>  {
         /*
            #swagger.auto = false

            #swagger.path = '/api/users/'
            #swagger.method = 'get'
            #swagger.produces = ['application/json']
            #swagger.consumes = ['application/json']
            #swagger.tags = ['Users']
            #swagger.summary = 'Recover all users'
            #swagger.parameters['limit'] = {
                in: 'query',
                description: 'Limit of users to recover',
                required: false,
                type: 'integer',
                example: '10'
            }
            #swagger.parameters['offset'] = {
                in: 'query',
                description: 'Number of users to skip',
                required: false,
                type: 'integer',
                example: '15'
            }
            #swagger.parameters['query'] = {
                in: 'query',
                description: 'Search query to match user full name',
                required: false,
                type: 'string',
                example: 'juan'
            }
            #swagger.security = [{
                BearerAuth: []
            }]
            #swagger.responses[200] = {
                description: 'List of users',
                schema: { $ref: '#/definitions/UsersList' }
            }
            #swagger.responses[400] = {
                description: 'Bad request',
                schema:{ $ref: "#/definitions/BadRequestErrorWithApiError" }
            }
            #swagger.responses[500] = {
                description: 'Server error',
                schema: { $ref: '#/definitions/ServerError' }
            }
        */
        try {
            const { query, limit, offset } = req.query as GetUsersQueryType;
            const users = await UserService.getUsersList(query!, offset!, limit!);
            res.status(HttpStatusCodes.OK).json(users);
        } catch (error: any) {
            next(error);
        }
    }

    public static async createUser(req: Request, res: Response, next: NextFunction): Promise<void> {
        /*
            #swagger.tags = ['Users']
            #swagger.summary = 'Create a new user'
            #swagger.parameters['body'] = {
                in: 'body',
                required: true,
                schema: { $ref: '#/definitions/User' }
            }
            #swagger.responses[201] = {
                description: 'User created successfully'
            }
            #swagger.responses[400] = {
                description: 'Bad request',
                schema:{ $ref: "#/definitions/BadRequestErrorWithApiError" }
            }
            #swagger.responses[500] = {
                description: 'Server error',
                schema: { $ref: '#/definitions/ServerError' }
            }
        */
        try {
            const { fullName, email, phoneNumber, avatar, password } = req.body as userBodyType;
            const avatarBuffer = avatar ? Buffer.from(avatar, 'base64') : null;

            const errorMessages = {
                [CreateUserCodes.EMAIL_ALREADY_EXISTS]: `Email already exists`,
                [CreateUserCodes.CUSTOMER_ROLE_NOT_FOUND]: `Customer role not found`
            };

            let createUserResult: CreateUserCodes | null = 
            await UserService.createUser(fullName, email, phoneNumber!, avatarBuffer!, password);
            if(createUserResult !== null){
                const errorBody = {
                    error: true,
                    statusCode: HttpStatusCodes.BAD_REQUEST,
                    details: errorMessages[createUserResult],
                    apiErrorCode: createUserResult
                }
    
                res.status(errorBody.statusCode).json(errorBody);
                return;
            }
    
            res.status(HttpStatusCodes.CREATED).json();
        } catch (error: any) {
            next(error);
        }
    }

    public static async updateUser(req: Request, res: Response, next: NextFunction): Promise<void> {
        /*
            #swagger.tags = ['Users']
            #swagger.summary = 'Update an user'
            #swagger.security = [{
                BearerAuth: []
            }]
            #swagger.parameters['body'] = {
                in: 'body',
                required: true,
                schema: { $ref: '#/definitions/User' }
            }
            #swagger.responses[204] = {
                description: 'User updated successfully'
            }
            #swagger.responses[400] = {
                description: 'Bad request',
                schema:{ $ref: "#/definitions/BadRequestErrorWithApiError" }
            }
            #swagger.responses[500] = {
                description: 'Server error',
                schema: { $ref: '#/definitions/ServerError' }
            }
        */
        try {
            const idProfile = req.user.id;
            const { fullName, email, phoneNumber, avatar, password } = req.body as userBodyType;
            const avatarBuffer = avatar ? Buffer.from(avatar, 'base64') : null;

            const errorMessages = {
                [UpdateUserCodes.PROFILE_NOT_FOUND]: `The profile with ID ${idProfile} was not found`,
                [UpdateUserCodes.ACCOUNT_NOT_FOUND]: `There is no account associated with the profile with the id ${idProfile}`,
                [UpdateUserCodes.EMAIL_ALREADY_EXISTS]: `Email already exists`
            };

            let updateUserResult: UpdateUserCodes | null = 
            await UserService.updateUser(idProfile, fullName, email, phoneNumber!, avatarBuffer!, password);
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
    
            res.status(HttpStatusCodes.NO_CONTENT).json();
        } catch (error: any) {
            next(error);
        }
    }

    public static async deleteUser(req: Request, res: Response, next: NextFunction): Promise<void> {
        /*
            #swagger.tags = ['Users']
            #swagger.summary = 'Delete an user'
            #swagger.security = [{
                BearerAuth: []
            }]
            #swagger.parameters['idProfile'] = {
                in: 'path',
                description: 'Id of the profile',
                required: true,
                type: 'integer',
                example: '10'
            }
            #swagger.responses[204] = {
                description: 'User deleted successfully'
            }
            #swagger.responses[400] = {
                description: 'Bad request',
                schema:{ $ref: "#/definitions/BadRequestErrorWithApiError" }
            }
            #swagger.responses[500] = {
                description: 'Server error',
                schema: { $ref: '#/definitions/ServerError' }
            }
        */
        const { idProfile } = req.params;
        
        try {
            const errorMessages = {
                [DeleteUserCodes.USER_NOT_FOUND]: `The profile with ID ${idProfile} was not found`,
                [DeleteUserCodes.USER_IS_NOT_REMOVABLE]: `The profile with ID ${idProfile} cannot be deleted`
            };

            let deleteUserResult: DeleteUserCodes | null = await UserService.deleteUser(Number(idProfile));
            if(deleteUserResult !== null){
                const errorBody = {
                    error: true,
                    statusCode: HttpStatusCodes.BAD_REQUEST,
                    details: errorMessages[deleteUserResult],
                    apiErrorCode: deleteUserResult
                }
    
                res.status(errorBody.statusCode).json(errorBody);
                return;
            }
    
            res.status(HttpStatusCodes.NO_CONTENT).json();
        } catch (error: any) {
            next(error);
        }
    }
}

export default UserController;