import { HttpStatusCodes } from "@ts/enums";
import { Request, Response } from "express";
import Logger from "@lib/logger";
import TokenStore from "@lib/token_store";
import UserService from "services/user_service";
import SecurityService from "@lib/security_service";
import { DataContextException } from "@exceptions/services";

class SessionController {
    public static async login(req: Request, res: Response): Promise<void> {
        /*  
            #swagger.tags = ['Authentication']
            #swagger.summary = 'Start a session for a particular user (log in)...'
            #swagger.parameters['body'] = {
                in: 'body',
                required: true,
                schema: { $ref: '#/definitions/UserCredentials' }
            } 
            #swagger.responses[201] = {
                description: 'Successful login',
                schema: { $ref: '#/definitions/UserSession' }
            }
            #swagger.responses[400] = {
                description: 'Bad request',
                schema:{ $ref: "#/definitions/ValidationError" }
            }
            #swagger.responses[500] = {
                description: 'Server error',
                schema: { $ref: '#/definitions/ServerError' }
            }
        */
        try {
            const { email, password } = req.body;

            const user = await UserService.getUserByEmail(email);
            
            if(user == null) {
                res.status(HttpStatusCodes.BAD_REQUEST).json({
                    error: true,
                    statusCode: HttpStatusCodes.BAD_REQUEST,
                    details: "Invalid credentials. Check your email and password and try it again"
                });
                return;
            }

            const securityService = new SecurityService();
            const validCredentials = await securityService.comparePassword(password, user.password!);
            if(!validCredentials) {
                res.status(HttpStatusCodes.BAD_REQUEST).json({
                    error: true,
                    statusCode: HttpStatusCodes.BAD_REQUEST,
                    details: "Invalid credentials. Check your email and password and try it again"
                });
                return;
            }

            const tokenStore = new TokenStore();
            const token = tokenStore.sign({
                id: user.id,
                email: user.email!,
                userRoles: user.roles!
            });
            
            delete user.password;
            res.status(HttpStatusCodes.CREATED)
                .json({
                    token,
                    ...user
                });
        } catch(error: any) {
            let statusCode = HttpStatusCodes.INTERNAL_SERVER_ERROR;
            const responseDetails = {
                error: true,
                statusCode: HttpStatusCodes.INTERNAL_SERVER_ERROR,
                details: "There was an unexpeted error, please try it again later"
            };

            if(error instanceof DataContextException) {
                Logger.error(error.name, error.message);
                responseDetails.details = "It was not possible to login, please try it again later";
            } else {
                Logger.error(error.name, error.message);
            }

            res.status(statusCode).json(responseDetails);
        }
    }
}

export default SessionController;