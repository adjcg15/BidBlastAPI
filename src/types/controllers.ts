type userBodyType = {
    id_profile: number;
    fullName: string;
    email: string;
    phoneNumber?: string;
    avatar?: string;
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

type GetUsersQueryType = {
    query?: string;
    limit?: number;
    offset?: number;
}

type OffersAuctionQueryType = {
    limit?: number;
    offset?: number;
}

export type {
    userBodyType,
    GetUsersQueryType,
    SearchActionQueryType,
    OffersAuctionQueryType
};