import { DataContextException } from "@exceptions/services";
import Logger from "@lib/logger";
import { HttpStatusCodes } from "@ts/enums";
import { Request, Response } from "express";
import AuctionService from "services/auction_service";

class AuctionController {
    public static async searchAuction(req: Request, res: Response) {
        try {
            const { query, limit, offset } = req.query as { query?: string, limit?: number, offset?: number };
            const requesterId = req.user.id;

            const response = await AuctionService.getAuctionsList(requesterId, query!, offset!, limit!);
            res.status(HttpStatusCodes.OK).json(response);
        } catch(error: any) {
            let statusCode = HttpStatusCodes.INTERNAL_SERVER_ERROR;
            const responseDetails = {
                error: true,
                statusCode: HttpStatusCodes.INTERNAL_SERVER_ERROR,
                details: "There was an unexpeted error, please try it again later"
            };

            if(error instanceof DataContextException) {
                Logger.error(error.name, error.message);
                responseDetails.details = "It was not possible to recover the auctions, please try it again later";
            } else {
                Logger.error(error.name, error.message);
            }

            res.status(statusCode).json(responseDetails);
        }
    }
}

export default AuctionController;