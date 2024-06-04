import { DataContextException } from "@exceptions/services";
import Logger from "@lib/logger";
import { OffersAuctionQueryType, SearchActionQueryType } from "@ts/controllers";
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

    public static async getUserSalesAuctionsList(req: Request, res: Response, next: NextFunction): Promise<void> {
        /*
            #swagger.auto = false

            #swagger.path = '/api/users/sold-auctions'
            #swagger.method = 'get'
            #swagger.produces = ['application/json']
            #swagger.consumes = ['application/json']
            #swagger.tags = ['Users']
            #swagger.summary = 'Recovers all sold auctions by an auctioneer'
            #swagger.parameters['startDate'] = {
                in: 'query',
                description: 'Date filter that indicates when to filter the results in YYYY-MM-DD format',
                required: false,
                type: 'string',
                example: '2024-06-03'
            }
            #swagger.parameters['endDate'] = {
                in: 'query',
                description: 'Date filter that indicates until when to filter the results in YYYY-MM-DD format',
                required: false,
                type: 'string',
                example: '2024-06-05'
            }
            #swagger.security = [{
                BearerAuth: []
            }]
            #swagger.responses[200] = {
                description: 'List of auctions',
                schema: { $ref: '#/definitions/AuctionSalesList' }
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
            const { startDate, endDate } = req.query as { startDate?: string, endDate?: string };
            const idProfile = req.user.id;
            const response = await AuctionService.getUserSalesAuctionsList(idProfile, startDate!, endDate!);

            res.status(HttpStatusCodes.OK).json(response);
        } catch (error: any) {
            next(error);
        }
    }

    public static async createAuction(req: Request, res: Response): Promise<void> {
        /*
            #swagger.tags = ['Auctions']
            #swagger.summary = 'Creates a new auction'
            #swagger.parameters['body'] = {
                in: 'body',
                required: true,
                schema: {
                    type: 'object',
                    required: [
                        'title', 
                        'description', 
                        'basePrice', 
                        'minimumBid', 
                        'approvalDate', 
                        'daysAvailable', 
                        'idItemCondition', 
                        'mediaFiles'
                    ],
                    properties: {
                        title: { type: 'string' },
                        description: { type: 'string' },
                        basePrice: { type: 'number' },
                        minimumBid: { type: 'number' },
                        approvalDate: { type: 'string', format: 'date-time' },
                        daysAvailable: { type: 'integer' },
                        idItemCondition: { type: 'integer' },
                        idAuctionCategory: {
                            type: 'integer',
                            nullable: true,
                            description: 'Auction category ID (can be null)'
                        },
                        mediaFiles: {
                            type: 'array',
                            items: { 
                                type: 'object',
                                properties: {
                                    mimeType: { type: 'string' },
                                    content: { type: 'string' },
                                    name: { type: 'string', nullable: true }
                                }
                            }
                        }
                    }
                }
            }
            #swagger.security = [{
                BearerAuth: []
            }]
            #swagger.responses[201] = {
                description: 'Auction created successfully',
                schema: {
                    message: 'Auction created successfully',
                    auction: { $ref: '#/definitions/Auction' }
                }
            }
            #swagger.responses[400] = {
                description: 'Invalid request data',
                schema: {
                    error: true,
                    message: 'Invalid request data'
                }
            }
            #swagger.responses[500] = {
                description: 'Server error',
                schema: { $ref: '#/definitions/ServerError' }
            }
        */
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
    public static async searchCompletedAuction(req: Request, res: Response, next: NextFunction) {
        /*
            #swagger.auto = false

            #swagger.path = '/api/users/completed-auctions'
            #swagger.method = 'get'
            #swagger.produces = ['application/json']
            #swagger.consumes = ['application/json']
            #swagger.tags = ['Users']
            #swagger.summary = 'Recovers all completed auctions for a customer'
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
            #swagger.security = [{
                BearerAuth: []
            }]
            #swagger.responses[200] = {
                description: 'List of auctions',
                schema: { $ref: '#/definitions/CompletedAuctionsList' }
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
            const { query, limit, offset } = req.query as SearchActionQueryType;
            const idProfile = req.user.id;

            const response = await AuctionService.getCompletedAuctions(idProfile, query!, offset!, limit!);

            res.status(HttpStatusCodes.OK).json(response);
        } catch(error: any) {
            next(error);
        }
    }

    public static async searchCreatedAuction(req: Request, res: Response, next: NextFunction) {
        /*
            #swagger.auto = false

            #swagger.path = '/api/users/auctions'
            #swagger.method = 'get'
            #swagger.produces = ['application/json']
            #swagger.consumes = ['application/json']
            #swagger.tags = ['Users']
            #swagger.summary = 'Recovers all created auctions for an auctioneer'
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
            #swagger.security = [{
                BearerAuth: []
            }]
            #swagger.responses[200] = {
                description: 'List of auctions',
                schema: { $ref: '#/definitions/CreatedAuctionsList' }
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
            const { query, limit, offset } = req.query as SearchActionQueryType;
            const idProfile = req.user.id;

            const response = await AuctionService.getCreatedAuctions(idProfile, query!, offset!, limit!);

            res.status(HttpStatusCodes.OK).json(response);
        } catch(error: any) {
            next(error);
        }
    }

    public static async getUserAuctionOffersByAuctionId(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { offset, limit } = req.query as OffersAuctionQueryType;
            const { auid } = req.params;

            const auction = await AuctionService.getUserAuctionOffersByAuctionId(Number(auid), offset!, limit!);
            if(auction === null) {
                res.status(HttpStatusCodes.NOT_FOUND).send({
                    error: true,
                    statusCode: HttpStatusCodes.BAD_REQUEST,
                    details: "It was not possible to find the offers with the auction ID " + auid
                });
            } else {
                res.status(HttpStatusCodes.OK).json(auction);
            }
        } catch(error: any) {
            next(error);
        }
    }

    public static async getAuctionById(req: Request, res: Response, next: NextFunction): Promise<void> {
        /*  
            #swagger.tags = ['Auctions']
            #swagger.summary = 'Recovers an auction by its ID'
            #swagger.parameters['idAuction'] = {
                in: 'path',
                description: 'Id of the requested auction',
                required: true,
                type: 'integer',
                example: '10'
            }
            #swagger.security = [{
                BearerAuth: []
            }]
            #swagger.responses[200] = {
                description: 'Auction',
                schema: { $ref: '#/definitions/Auction' }
            }
            #swagger.responses[400] = {
                description: 'Parameters values validation error',
                schema: { $ref: "#/definitions/ValidationError" }
            }
            #swagger.responses[404] = {
                description: 'Auction not found',
                schema: { $ref: '#/definitions/NotFoundError' }
            }
            #swagger.responses[500] = {
                description: 'Server error',
                schema: { $ref: '#/definitions/ServerError' }
            }
        */
        try {
            const { idAuction } = req.params;

            const auction = await AuctionService.getAuctionById(Number(idAuction));
            if(auction === null) {
                res.status(HttpStatusCodes.NOT_FOUND).send({
                    error: true,
                    statusCode: HttpStatusCodes.NOT_FOUND,
                    details: "It was not possible to find the auction with the ID " + idAuction
                });
            } else {
                res.status(HttpStatusCodes.OK).json(auction);
            }
        } catch(error: any) {
            next(error);
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