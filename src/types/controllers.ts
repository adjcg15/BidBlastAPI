type SearchActionQueryType = {
    query?: string;
    limit?: number;
    offset?: number;
    categories?: number[];
    minimumPrice?: number;
    maximumPrice?: number;
};

export type {
    SearchActionQueryType
};