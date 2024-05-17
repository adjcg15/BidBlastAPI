import { SearchActionQueryType } from "@ts/controllers";
import { NextFunction, Request, Response } from "express";

class DefaultValuesInjector {
    public static setSearchAuctionDefaultParams(req: Request, res: Response, next: NextFunction) {
        const DEFAULT_QUERY_SEARCH = "";
        const DEFAULT_LIMIT = 10;
        const DEFAULT_OFFSET = 0;
        const DEFAULT_MINIMUM_PRICE = 0;
        const DEFAULT_MAXIMUM_PRICE = Number.MAX_SAFE_INTEGER;
        const query = req.query as SearchActionQueryType;

        if(!query.query) {
            query.query = DEFAULT_QUERY_SEARCH;
        }

        if(!query.limit) {
            query.limit = DEFAULT_LIMIT;
        }

        if(!query.offset) {
            query.offset = DEFAULT_OFFSET;
        }

        if(!query.categories) {
            query.categories = [];
        }

        if(!query.minimumPrice) {
            query.minimumPrice = DEFAULT_MINIMUM_PRICE;
        }

        if(!query.maximumPrice) {
            query.maximumPrice = DEFAULT_MAXIMUM_PRICE;
        }

        next();
    }

    public static setGetUserAuctionsDefaultParams(req: Request, res: Response, next: NextFunction) {
        const DEFAULT_START_DATE = "";
        const DEFAULT_END_DATE = "";
        const query = req.query as {startDate?: string, endDate?: string};

        if(!query.startDate){
            query.startDate = DEFAULT_START_DATE;
        }

        if(!query.endDate){
            query.endDate = DEFAULT_END_DATE;
        }

        next();
    }
}

export default DefaultValuesInjector;