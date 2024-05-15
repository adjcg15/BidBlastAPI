type GetManyAuctionsConfigParamType = {
    requesterId: number;
    query: string;
    offset: number;
    limit: number;
    categoriesAllowed: number[];
    minimumPrice: number;
    maximumPrice: number;
};

export type {
    GetManyAuctionsConfigParamType
};