import { OffersAuctionQueryType, SearchActionQueryType } from "@ts/controllers";
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

    public static setSearchUserAuctionsDefaultParams(req: Request, res: Response, next: NextFunction) {
        const DEFAULT_QUERY_SEARCH = "";
        const DEFAULT_LIMIT = 5;
        const DEFAULT_OFFSET = 0;
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

        next();
    }

    public static setOffersAuctionDefaultParams(req: Request, res: Response, next: NextFunction) {
        const DEFAULT_LIMIT = 5;
        const DEFAULT_OFFSET = 0;
        const query = req.query as OffersAuctionQueryType;

        if(!query.limit) {
            query.limit = DEFAULT_LIMIT;
        }

        if(!query.offset) {
            query.offset = DEFAULT_OFFSET;
        }

        next();
    }
}

export default DefaultValuesInjector;