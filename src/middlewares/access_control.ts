import TokenStore from "@lib/token_store";
import { HttpStatusCodes, UserRoles } from "@ts/enums";
import { NextFunction, Request, Response } from "express";

class AccessControl {
    public static checkTokenValidity(req: Request, res: Response, next: NextFunction): void {
        const authorizationHeader = String(req.headers.authorization);
        if(!authorizationHeader) {
            res.status(HttpStatusCodes.UNAUTHORIZED).send();
            return;
        }

        const token = authorizationHeader.substring(authorizationHeader.indexOf(' ') + 1);
        const tokenStore = new TokenStore();
        const payload = tokenStore.verify(token); 

        if(!payload) {
            res.status(HttpStatusCodes.UNAUTHORIZED).send();
            return;
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
}

export default AccessControl;