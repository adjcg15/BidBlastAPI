import { SQLException } from "@exceptions/services";
import { InvalidCredentialsException } from "@exceptions/session";
import User from "@models/User";
import { HttpStatusCodes } from "@ts/enums";
import { Request, Response } from "express";
import Logger from "@lib/logger";
import TokenStore from "@lib/token_store";

class SessionController {
    public static async login(req: Request, res: Response): Promise<void> {
        try {
            const { email, password } = req.body;

            const user = new User();
            user.email = email;
            user.password = password;
            await user.login();

            const tokenStore = new TokenStore();
            const token = tokenStore.sign(user);
            res.status(HttpStatusCodes.CREATED)
                .send({
                    token,
                    user: user.parse()
                });
        } catch(error: any) {
            let statusCode = HttpStatusCodes.INTERNAL_SERVER_ERROR;
            const responseDetails = {
                error: true,
                details: "There was an unexpeted error, please try it again later"
            }

            if(error instanceof InvalidCredentialsException) {
                statusCode = HttpStatusCodes.BAD_REQUEST;
                responseDetails.details = error.message;
            } else if(error instanceof SQLException) {
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