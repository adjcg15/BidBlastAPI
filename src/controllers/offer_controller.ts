import { NextFunction, Request, Response } from "express";

class OfferController {
    public static async createOffer(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { auctionId, amount } = req.body as { auctionId: number, amount: number };
            
            res.send();
        } catch (error) {
            next(error);
        }
    }
}

export default OfferController;