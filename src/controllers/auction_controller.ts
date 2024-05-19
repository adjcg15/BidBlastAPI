import { DataContextException } from "@exceptions/services";
import Logger from "@lib/logger";
import { SearchActionQueryType } from "@ts/controllers";
import { HttpStatusCodes } from "@ts/enums";
import { Request, Response } from "express";
import AuctionService from "services/auction_service";

class AuctionController {
    public static async searchAuction(req: Request, res: Response) {
        try {
            const { 
                query, limit, offset, 
                categories, minimumPrice, maximumPrice } = req.query as SearchActionQueryType;
            const requesterId = req.user.id;

            const response = await AuctionService.getManyAuctions({
                requesterId, 
                query: query!, 
                offset: offset!, 
                limit: limit!,
                categoriesAllowed: categories!,
                minimumPrice: minimumPrice!,
                maximumPrice: maximumPrice!
            });
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

    public static async getUserSalesAuctionsList(req: Request, res: Response): Promise<void> {
        try {
            const { startDate, endDate } = req.query as { startDate?: string, endDate?: string };
            const { usid } = req.params;
            const idProfile: number = parseInt(usid);
            const response = await AuctionService.getUserSalesAuctionsList(idProfile, startDate!, endDate!);

            res.status(HttpStatusCodes.OK).json(response);
        } catch (error: any) {
            let statusCode = HttpStatusCodes.INTERNAL_SERVER_ERROR;
            const responseDetails = {
                error: true,
                statusCode: HttpStatusCodes.INTERNAL_SERVER_ERROR,
                details: "There was an unexpeted error, please try it again later"
            };

            if(error instanceof DataContextException) {
                Logger.error(error.name, error.message);
                responseDetails.details = "It was not possible to recover sales auctions, please try it again later";
            } else {
                Logger.error(error.name, error.message);
            }

            res.status(statusCode).json(responseDetails);
        }
    }

    public static async searchCompletedAuction(req: Request, res: Response) {
        try {
            const { query, limit, offset } = req.query as SearchActionQueryType;
            const { usid } = req.params;
            const idProfile: number = parseInt(usid);

            const response = await AuctionService.getCompletedAuctions(idProfile, query!, offset!, limit!);

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
                responseDetails.details = "It was not possible to recover the completed auctions, please try it again later";
            } else {
                Logger.error(error.name, error.message);
            }

            res.status(statusCode).json(responseDetails);
        }
    }

    public static async getAuctionById(req: Request, res: Response): Promise<void> {
        try {
            const { idAuction } = req.params;

            const auction = await AuctionService.getAuctionById(Number(idAuction));
            if(auction === null) {
                res.status(HttpStatusCodes.NOT_FOUND).send({
                    error: true,
                    statusCode: HttpStatusCodes.BAD_REQUEST,
                    details: "It was not possible to find the auction with the ID " + idAuction
                });
            } else {
                res.status(HttpStatusCodes.OK).json(auction);
            }
        } catch(error: any) {
            let statusCode = HttpStatusCodes.INTERNAL_SERVER_ERROR;
            const responseDetails = {
                error: true,
                statusCode: HttpStatusCodes.INTERNAL_SERVER_ERROR,
                details: "There was an unexpeted error, please try it again later"
            };

            if(error instanceof DataContextException) {
                Logger.error(error.name, error.message);
                responseDetails.details = "It was not possible to get the information of the auction, please try it again later";
            } else {
                Logger.error(error.name, error.message);
            }

            res.status(statusCode).json(responseDetails);
        }
    }
}

export default AuctionController;