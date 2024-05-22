import { NextFunction, Request, Response } from "express";

class AuctionClosingController {
    public static async closeAuctions(req: Request, res: Response, next: NextFunction) {
        try {
            res.send();
        } catch(error: any) {
            next(error);
        }
    }
}

export default AuctionClosingController;