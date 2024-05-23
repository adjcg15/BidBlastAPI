import EmailService from "@lib/email_service";
import { HttpStatusCodes } from "@ts/enums";
import { NextFunction, Request, Response } from "express";
import AuctionService from "services/auction_service";

class AuctionClosingController {
    public static async closeAuctions(req: Request, res: Response, next: NextFunction) {
        try {
            const expiredAuctions = await AuctionService.getExpiredAuctions();

            for(const auction of expiredAuctions) {
                if(!auction.lastOffer) {
                    await AuctionService.closeAuction(auction.id);
                } else {
                    await AuctionService.concretizeAuction(auction.id);
                    const emailService = new EmailService();
                    await emailService.notifySaleToAuctioneer(auction);
                    await emailService.notifySaleToCustomer(auction);
                }
            }

            res.status(HttpStatusCodes.CREATED).send();
        } catch(error: any) {
            next(error);
        }
    }
}

export default AuctionClosingController;