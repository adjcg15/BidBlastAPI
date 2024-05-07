import { UserRoles } from "./enums";

type IUserData = {
    id: number;
    fullName: string;
    phoneNumber: string | null;
    avatar: Buffer | null;
    email: string;
    password?: string;
    roles: UserRoles[];
}

export type {
    IUserData
}