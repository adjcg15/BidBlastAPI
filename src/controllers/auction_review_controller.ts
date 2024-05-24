import { NextFunction, Request, Response } from "express";

class AuctionReviewController {
    public static async createAuctionReview(req: Request, res: Response, next: NextFunction) {
        try {
            res.send();
        } catch(error) {
            next(error);
        }
    }
}

export default AuctionReviewController;