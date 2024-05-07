type IUserData = {
    id: number;
    fullName: string;
    phoneNumber: string | null;
    avatar: Buffer | null;
    email: string;
    password?: string;
}

export type {
    IUserData
}