import { DataContextException } from "@exceptions/services";
import Logger from "@lib/logger";
import { SearchActionQueryType } from "@ts/controllers";
import { HttpStatusCodes } from "@ts/enums";
import { NextFunction, Request, Response } from "express";
import AuctionService from "services/auction_service";

class AuctionController {
    public static async searchAuction(req: Request, res: Response, next: NextFunction) {
        /*  
            #swagger.auto = false

            #swagger.path = '/api/auctions'
            #swagger.method = 'get'
            #swagger.produces = ['application/json']
            #swagger.consumes = ['application/json']
            #swagger.tags = ['Auctions']
            #swagger.summary = 'Recovers all auctions given particular filters'
            #swagger.parameters['limit'] = {
                in: 'query',
                description: 'Limit of auctions to recover',
                required: false,
                type: 'integer',
                example: '10'
            }
            #swagger.parameters['offset'] = {
                in: 'query',
                description: 'Number of actions to skip',
                required: false,
                type: 'integer',
                example: '15'
            }
            #swagger.parameters['query'] = {
                in: 'query',
                description: 'Search query to match auction title or description',
                required: false,
                type: 'string',
                example: 'car'
            }
            #swagger.parameters['categories'] = {
                in: 'query',
                description: 'Comma-separated list of categories ID to filter auctions',
                required: false,
                type: 'string',
                example: '1,2,8'
            }
            #swagger.parameters['minimumPrice'] = {
                in: 'query',
                description: 'Minimum price to apply in search over auction base price',
                required: false,
                type: 'float',
                example: '300'
            }
            #swagger.parameters['maximumPrice'] = {
                in: 'query',
                description: 'Maximum price to apply in search over auction base price',
                required: false,
                type: 'float',
                example: '1000'
            }
            #swagger.security = [{
                BearerAuth: []
            }]
            #swagger.responses[200] = {
                description: 'List of auctions',
                schema: { $ref: '#/definitions/AuctionsListInSearch' }
            }
            #swagger.responses[400] = {
                description: 'Query values validation error',
                schema: { $ref: "#/definitions/ValidationError" }
            }
            #swagger.responses[500] = {
                description: 'Server error',
                schema: { $ref: '#/definitions/ServerError' }
            }
        */
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
            next(error);
        }
    }

    public static async getUserSalesAuctionsList(req: Request, res: Response): Promise<void> {
        try {
            const { startDate, endDate } = req.query as { startDate?: string, endDate?: string };
            const idProfile = req.user.id;
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
    public static async createAuction(req: Request, res: Response): Promise<void> {
        const auctionData = {
            title: req.body.title,
            description: req.body.description,
            basePrice: req.body.basePrice,
            minimumBid: req.body.minimumBid,
            approvalDate: req.body.approvalDate,
            daysAvailable: req.body.daysAvailable,
            idItemCondition: req.body.idItemCondition,
            idAuctionCategory: req.body.idAuctionCategory
        };
        const mediaFiles = req.body.mediaFiles;
        const userProfileId: number = req.user.id;

        if (!auctionData || !mediaFiles) {
            res.status(HttpStatusCodes.BAD_REQUEST).json({
                error: true,
                message: "Invalid request data"
            });
            return;
        }

        console.log("Received auction data:", auctionData);
        console.log("Received media files:", mediaFiles);

        try {
            const auction = await AuctionService.createAuction(auctionData, mediaFiles, userProfileId);
            res.status(HttpStatusCodes.CREATED).json({ message: "Auction created successfully", auction });
        } catch (error: any) {
            console.error("Error type:", error.constructor.name);
            console.error("Error message:", error.message);

            res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
                error: true,
                message: "There was an unexpected error, please try again later"
            });
        }
    }
    public static async searchCompletedAuction(req: Request, res: Response) {
        try {
            const { query, limit, offset } = req.query as SearchActionQueryType;
            const idProfile = req.user.id;

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

    public static async searchCreatedAuction(req: Request, res: Response) {
        try {
            const { query, limit, offset } = req.query as SearchActionQueryType;
            const idProfile = req.user.id;

            const response = await AuctionService.getCreatedAuctions(idProfile, query!, offset!, limit!);

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
                responseDetails.details = "It was not possible to recover the created auctions, please try it again later";
            } else {
                Logger.error(error.name, error.message);
            }

            res.status(statusCode).json(responseDetails);
        }
    }

    public static async getUserAuctionWithOffersById(req: Request, res: Response): Promise<void> {
        try {
            const { idAuction } = req.params;

            const auction = await AuctionService.getUserAuctionWithOffersById(Number(idAuction));
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

    public static async blockUserInAnAuction(req: Request, res: Response): Promise<void> {
        try {
            const { auid } = req.params;
            const id_auction = parseInt(auid);
            const { id_profile } = req.body;

            await AuctionService.blockUserInAnAuction(id_profile, id_auction);

            res.status(HttpStatusCodes.OK).json({
                error: false,
                statusCode: HttpStatusCodes.OK,
                details: "User was blocked for the auction"
            });
        } catch (error: any) {
            let statusCode = HttpStatusCodes.INTERNAL_SERVER_ERROR;
            const responseDetails = {
                error: true,
                statusCode: HttpStatusCodes.INTERNAL_SERVER_ERROR,
                details: "There was an unexpeted error, please try it again later"
            };

            if(error instanceof DataContextException) {
                Logger.error(error.name, error.message);
                responseDetails.details = "It was not possible to block user, please try it again later";
            } else {
                Logger.error(error.name, error.message);
            }

            res.status(statusCode).json(responseDetails);
        }
    }
}

export default AuctionController;