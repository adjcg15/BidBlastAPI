import { DataContextException } from "@exceptions/services";
import Logger from "@lib/logger";
import { OffersAuctionQueryType, SearchActionQueryType } from "@ts/controllers";
import { IOfferData } from "@ts/data";
import { BlockUserCodes, GetOffersCodes, HttpStatusCodes, CreateAuctionCodes } from "@ts/enums";
import { NextFunction, Request, Response } from "express";
import AuctionService from "services/auction_service";
import videoClient from 'grpcClient';

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
    public static async createAuction(req: Request, res: Response, next: NextFunction): Promise<void> {
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
                code: [CreateAuctionCodes.INVALID_REQUEST_DATA],
                message: "Invalid request data"
            });
            return;
        }

        try {
            const auction = await AuctionService.createAuction(auctionData, mediaFiles, userProfileId);

            for (const file of mediaFiles) {
                if (file.mimeType.startsWith('video/')) {
                    await AuctionController.uploadVideo(auction.id_auction, file.mimeType, file.content, file.name);
                }
            }

            res.status(HttpStatusCodes.CREATED).send();
        } catch (error: any) { 
            res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
                error: true,
                statusCode: HttpStatusCodes.INTERNAL_SERVER_ERROR,
                details: "It was not possible to process your request, please try it again later"
            });
        }
    }

    private static uploadVideo(auctionId: number, mimeType: string, content: string, name: string): Promise<any> {
        return new Promise((resolve, reject) => {
            const call = videoClient.uploadVideo((error: any, response: any) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(response);
                }
            });
    
            call.write({ auctionId, mimeType, content: Buffer.from(content, 'base64'), name });
            call.end();
        });
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
        /*  
            #swagger.auto = false

            #swagger.path = '/api/auctions/:auid/offers'
            #swagger.method = 'get'
            #swagger.produces = ['application/json']
            #swagger.consumes = ['application/json']
            #swagger.tags = ['Auctions']
            #swagger.summary = 'Recovers all offers for an auction'
            #swagger.parameters['auid'] = {
                in: 'path',
                description: 'Id of the auction',
                required: true,
                type: 'integer',
                example: '10'
            }
            #swagger.parameters['limit'] = {
                in: 'query',
                description: 'Limit of offers to recover',
                required: false,
                type: 'integer',
                example: '10'
            }
            #swagger.parameters['offset'] = {
                in: 'query',
                description: 'Number of offers to skip',
                required: false,
                type: 'integer',
                example: '15'
            }
            #swagger.security = [{
                BearerAuth: []
            }]
            #swagger.responses[200] = {
                description: 'Auction offers',
                schema: { $ref: '#/definitions/AuctionOffersList' }
            }
            #swagger.responses[400] = {
                description: 'Parameters values validation error',
                schema: { $ref: "#/definitions/ValidationError" }
            }
            #swagger.responses[500] = {
                description: 'Server error',
                schema: { $ref: '#/definitions/ServerError' }
            }
        */
        try {
            const { offset, limit } = req.query as OffersAuctionQueryType;
            const { auid } = req.params;

            const errorMessages = {
                [GetOffersCodes.AUCTION_NOT_FOUND]: `The auction  with ID ${auid} was not found`,
            };

            let offersResult: IOfferData[] | GetOffersCodes = 
                await AuctionService.getUserAuctionOffersByAuctionId(Number(auid), offset!, limit!);
            if (offersResult === GetOffersCodes.AUCTION_NOT_FOUND) {
                const errorBody = {
                    error: true,
                    statusCode: HttpStatusCodes.BAD_REQUEST,
                    details: errorMessages[offersResult],
                    apiErrorCode: offersResult
                }

                res.status(errorBody.statusCode).json(errorBody);
            } else {
                res.status(HttpStatusCodes.OK).json(offersResult);
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

    public static async blockUserInAnAuctionAndDeleteHisOffers(req: Request, res: Response, next: NextFunction): Promise<void> {
        /*
            #swagger.tags = ['Auctions']
            #swagger.summary = 'Block an user in an auction'
            #swagger.security = [{
                BearerAuth: []
            }]
            #swagger.parameters['auid'] = {
                in: 'path',
                description: 'Id of the profile',
                required: true,
                type: 'integer',
                example: '10'
            }
            #swagger.parameters['body'] = {
                in: 'body',
                required: true,
                schema: { 
                    idProfile: 17
                }
            }
            #swagger.responses[201] = {
                description: 'User blocked successfully'
            }
            #swagger.responses[400] = {
                description: 'Bad request',
                schema:{ $ref: "#/definitions/BadRequestErrorWithApiError" }
            }
            #swagger.responses[500] = {
                description: 'Server error',
                schema: { $ref: '#/definitions/ServerError' }
            }
        */
        try {
            const { auid } = req.params;
            const idAuction = parseInt(auid);
            const { idProfile } = req.body;

            const errorMessages = {
                [BlockUserCodes.AUCTION_NOT_FOUND]: `The auction  with ID ${idAuction} was not found`,
                [BlockUserCodes.USER_NOT_FOUND]: `The profile with ID ${idProfile} was not found`,
                [BlockUserCodes.USER_BID_ON_AUCTION_NOT_FOUND]: `The profile with ID ${idProfile} was not found bidding at the auction`,
                [BlockUserCodes.USER_ALREADY_BLOCKED]: `The profile with ID ${idProfile} has already been blocked`
            };

            let blockUserResult: BlockUserCodes | null = 
                await AuctionService.blockUserInAnAuctionAndDeleteHisOffers(idProfile, idAuction);
            if(blockUserResult !== null){
                const errorBody = {
                    error: true,
                    statusCode: HttpStatusCodes.BAD_REQUEST,
                    details: errorMessages[blockUserResult],
                    apiErrorCode: blockUserResult
                }

                res.status(errorBody.statusCode).json(errorBody);
                return;
            }

            res.status(HttpStatusCodes.CREATED).json();
        } catch (error: any) {
            next(error);
        }
    }
    public static async getPublishedAuctions(req: Request, res: Response, next: NextFunction) {
        /*  
            #swagger.auto = false
    
            #swagger.path = '/api/auctions'
            #swagger.method = 'get'
            #swagger.produces = ['application/json']
            #swagger.consumes = ['application/json']
            #swagger.tags = ['Auctions']
            #swagger.summary = 'Recovers all published auctions'
            #swagger.security = [{
                BearerAuth: []
            }]
            #swagger.responses[200] = {
                description: 'List of auctions',
                schema: { $ref: '#/definitions/AuctionsList' }
            }
            #swagger.responses[500] = {
                description: 'Server error',
                schema: { $ref: '#/definitions/ServerError' }
            }
        */
        try {
            const response = await AuctionService.publishedAuctions();
            res.status(HttpStatusCodes.OK).json(response);
        } catch(error: any) {
            next(error);
        }
    }
}

export default AuctionController;

function uploadVideoViaGrpc(id_auction: number, mimeType: any, content: any) {
    throw new Error("Function not implemented.");
}
