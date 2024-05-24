import { HttpStatusCodes } from "@ts/enums";
import { NextFunction, Request, Response } from "express";
import AuctionReviewService from "services/auction_review_service";
import AuctionService from "services/auction_service";

class AuctionReviewController {
    public static async approveAuction(req: Request, res: Response, next: NextFunction) {
        try {
            const { idAuction } = req.body;

            await AuctionService.publishAuction(idAuction);
            await AuctionService.convertAuctionAuthorToAuctioneer(idAuction);

            res.status(HttpStatusCodes.CREATED).send();
        } catch(error) {
            next(error);
        }
    }

    public static async rejectAuction(req: Request, res: Response, next: NextFunction) {
        try {
            const { idAuction, comments } = req.body;
            const { id: idModerator } = req.user;

            await AuctionService.rejectAuction(idAuction);
            await AuctionReviewService.createAuctionReview(comments, idAuction, idModerator);

            res.status(HttpStatusCodes.CREATED).send();
        } catch(error) {
            next(error);
        }
    }
}

export default AuctionReviewController;