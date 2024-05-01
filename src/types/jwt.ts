import { JwtPayload } from "jsonwebtoken";
import { UserRoles } from "./enums";

interface IJWTPayload extends JwtPayload {
    id: number;
    email: string;
    userRoles: UserRoles[];
};

declare module "express-serve-static-core" {
    interface Request {
      user: IJWTPayload;
    }
}

export {
    IJWTPayload
};