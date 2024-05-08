import { UserRoles } from "./enums";

interface IUserData {
    id: number;
    fullName: string;
    phoneNumber: string | null;
    avatar: string;
    email: string;
    password?: string;
    roles: UserRoles[];
}

export type {
    IUserData
}