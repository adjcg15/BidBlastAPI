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