import { IJWTPayload } from "@ts/jwt";
import User from "@models/User";
import { SignOptions, sign, verify } from "jsonwebtoken";

class TokenStore {
    public sign(user: User): string {
        var privateKey = process.env.JWT_SECRET;

        if(!privateKey) {
            throw new Error("JWT_SECRET enviroment variable not defined");
        }

        const payload = {
            id: user.id,
            email: user.email,
            userRoles: user.roles
        } as IJWTPayload;
        const signOptions: SignOptions = {
            expiresIn: 60 * 60 * 24
        }

        return sign(payload, privateKey, signOptions);
    } 

    public verify(token: string): IJWTPayload | undefined {
        try {
            const payload = verify(token, String(process.env.JWT_SECRET)) as IJWTPayload;

            return payload;
        } catch (error) {
            return undefined;
        }
    }
}

export default TokenStore;