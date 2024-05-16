import { UserRoles } from "./enums";

interface IUserData {
    id: number;
    fullName: string;
    phoneNumber?: string | null;
    avatar?: string;
    email?: string;
    password?: string;
    roles?: UserRoles[];
}

interface IAuctionCategory {
    id: number;
    title: string;
    description?: string;
    keywords?: string;
}

interface IHypermediaFileData {
    id: number;
    content: string;
    mimeType?: string;
    name?: string;
}

interface IOfferData {
    id: number;
    amount: number;
    creationDate: Date;
    customer?: IUserData;
}

interface IAuctionApplicationState {
    id: number;
    applicationDate: Date;
}

interface IAuctionData {
    id: number;
    title: string;
    description?: string;
    basePrice?: number;
    minimumBid?: number;
    approvalDate?: Date;
    closesAt?: Date;
    daysAvailable?: number;
    category?: IAuctionCategory;
    auctioneer?: IUserData;
    mediaFiles?: IHypermediaFileData[];
    lastOffer?: IOfferData;
    updatedDate?: Date;
}

export type {
    IUserData,
    IAuctionCategory,
    IAuctionData,
    IHypermediaFileData
}