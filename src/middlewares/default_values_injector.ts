import { NextFunction, Request, Response } from "express";

class DefaultValuesInjector {
    public static setSearchAuctionDefaultParams(req: Request, res: Response, next: NextFunction) {
        const DEFAULT_QUERY_SEARCH = "";
        const DEFAULT_LIMIT = 10;
        const DEFAULT_OFFSET = 0;
        const query = req.query as { query?: string, limit?: number, offset?: number };

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
}

export default DefaultValuesInjector;