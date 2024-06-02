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
    SearchActionQueryType,
    OffersAuctionQueryType
};