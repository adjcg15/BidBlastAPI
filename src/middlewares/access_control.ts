import TokenStore from "@lib/token_store";
import { HttpStatusCodes, UserRoles } from "@ts/enums";
import { NextFunction, Request, Response } from "express";

class AccessControl {
    private static readonly TOKEN_RENEWAL_LIMIT = 60 * 5;

    public static checkTokenValidity(req: Request, res: Response, next: NextFunction): void {
        const authorizationHeader = String(req.headers.authorization);
        if(!authorizationHeader.startsWith("Bearer ")) {
            res.status(HttpStatusCodes.UNAUTHORIZED).send();
            return;
        }

        const token = authorizationHeader.split(' ')[1];
        const tokenStore = new TokenStore();
        const payload = tokenStore.verify(token); 

        if(!payload) {
            res.status(HttpStatusCodes.UNAUTHORIZED).send();
            return;
        }

        const tokenValiditySeconds = (payload.exp ?? 0) - (new Date().getTime() / 1000);
        if(tokenValiditySeconds < AccessControl.TOKEN_RENEWAL_LIMIT) {
            const { id, email, userRoles } = payload;
            const tokenStore = new TokenStore();
            const newToken = tokenStore.sign({ id, email, userRoles });

            res.header("Set-Authorization", newToken);
        }

        req.user = payload;
        next();
    }

    public static allowRoles(allowedRoles: UserRoles[]) {
        return function(req: Request, res: Response, next: NextFunction) {
            const { userRoles } = req.user;

            if(Array.isArray(userRoles) && userRoles.some(role => allowedRoles.includes(role))) {
                next();
            } else {
                res.status(HttpStatusCodes.FORBIDDEN).send();
            }
        }
    }

    public static verifyStaticToken(req: Request, res: Response, next: NextFunction) {
        const { staticToken } = req.query;
        if(staticToken !== process.env.STATIC_TOKEN) {
            res.status(HttpStatusCodes.UNAUTHORIZED).send();
        } else {
            next();
        }
    }
}

export default AccessControl;