import { HttpStatusCodes } from "@ts/enums";
import { NextFunction, Request, Response } from "express";
import TokenStore from "@lib/token_store";
import UserService from "services/user_service";
import SecurityService from "@lib/security_service";

class SessionController {
    public static async login(req: Request, res: Response, next: NextFunction): Promise<void> {
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
            next(error);
        }
    }
}

export default SessionController;