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

interface IAuctionCategory {
    id: number;
    title: string;
    description: string;
    keywords: string;
}

export type {
    IUserData,
    IAuctionCategory
}