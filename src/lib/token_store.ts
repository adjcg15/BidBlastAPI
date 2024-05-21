import { IJWTPayload } from "@ts/jwt";
import { SignOptions, sign, verify } from "jsonwebtoken";

class TokenStore {
    public sign(user: IJWTPayload): string {
        var privateKey = process.env.JWT_SECRET;

        if(!privateKey) {
            throw new Error("JWT_SECRET enviroment variable not defined");
        }

        const signOptions: SignOptions = {
            expiresIn: 60 * 20
        }

        return sign(user, privateKey, signOptions);
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