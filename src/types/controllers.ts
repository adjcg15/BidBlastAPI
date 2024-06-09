type userBodyType = {
    id_profile: number;
    fullName: string;
    email: string;
    phoneNumber?: string;
    avatar?: Buffer;
    password: string;
}

type SearchActionQueryType = {
    query?: string;
    limit?: number;
    offset?: number;
    categories?: number[];
    minimumPrice?: number;
    maximumPrice?: number;
};

type OffersAuctionQueryType = {
    limit?: number;
    offset?: number;
}

export type {
    userBodyType,
    SearchActionQueryType,
    OffersAuctionQueryType
};