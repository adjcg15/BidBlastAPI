import { HttpStatusCodes } from "@ts/enums";
import { NextFunction, Request, Response } from "express";
import Logger from "@lib/logger";
import AuctionCategoryService from "services/auction_category_service";
import { DataContextException } from "@exceptions/services";

class AuctionCategoryController{
    public static async getAuctionCategory(req: Request, res: Response): Promise<void> {
        /*
            #swagger.tags = ['Auction categories']
            #swagger.summary = 'Gets a specific auction category by ID'
            #swagger.parameters['catid'] = {
                in: 'path',
                required: true,
                type: 'integer',
                description: 'ID of the auction category'
            }
            #swagger.responses[200] = {
                description: 'Auction category retrieved successfully',
                schema: { $ref: '#/definitions/AuctionCategory' }
            }
            #swagger.responses[400] = {
                description: 'Bad request',
                schema: {
                    error: true,
                    statusCode: 400,
                    details: "Auction category doesn't exist with this id"
                }
            }
            #swagger.responses[500] = {
                description: 'Server error',
                schema: { $ref: '#/definitions/ServerError' }
            }
        */
        try {
            const { catid } = req.params;
            const idCategory: number = parseInt(catid);

            const auctionCategory = await AuctionCategoryService.getAuctionCategoryById(idCategory);

            if(auctionCategory == null){
                res.status(HttpStatusCodes.BAD_REQUEST).json({
                    error: true,
                    statusCode: HttpStatusCodes.BAD_REQUEST,
                    details: "Auction category doesn't exist with this id"
                });
                return;
            }

            res.status(HttpStatusCodes.OK).json(auctionCategory);
        } catch (error: any) {
            let statusCode = HttpStatusCodes.INTERNAL_SERVER_ERROR;
            const responseDetails = {
                error: true,
                statusCode: HttpStatusCodes.INTERNAL_SERVER_ERROR,
                details: "There was an unexpeted error, please try it again later"
            };

            if(error instanceof DataContextException) {
                Logger.error(error.name, error.message);
                responseDetails.details = "It was not possible to recover category, please try it again later";
            } else {
                Logger.error(error.name, error.message);
            }

            res.status(statusCode).json(responseDetails);
        }
    }

    public static async registerAuctionCategory(req: Request, res: Response): Promise<void> {
        /*
            #swagger.tags = ['Auction categories']
            #swagger.summary = 'Registers a new auction category'
            #swagger.parameters['body'] = {
                in: 'body',
                required: true,
                schema: {
                    type: 'object',
                    required: ['title', 'description', 'keywords'],
                    properties: {
                        title: { type: 'string' },
                        description: { type: 'string' },
                        keywords: { type: 'array', items: { type: 'string' } }
                    }
                }
            }
            #swagger.responses[200] = {
                description: 'Auction category is registered',
                schema: {
                    error: false,
                    statusCode: 200,
                    details: 'Auction category is registered'
                }
            }
            #swagger.responses[400] = {
                description: 'Bad request',
                schema: {
                    error: true,
                    statusCode: 400,
                    details: 'The title exists in another auction category'
                }
            }
            #swagger.responses[500] = {
                description: 'Server error',
                schema: { $ref: '#/definitions/ServerError' }
            }
        */
        try {
            const { title, description, keywords } = req.body;

            const isRegistered = await AuctionCategoryService.registerAuctionCategory(title, description, keywords);
            if(!isRegistered){
                res.status(HttpStatusCodes.BAD_REQUEST).json({
                    error: true,
                    statusCode: HttpStatusCodes.BAD_REQUEST,
                    details: "The title exists in another auction category"
                });
                return;
            }

            res.status(HttpStatusCodes.OK).json({
                error: false,
                statusCode: HttpStatusCodes.OK,
                details: "Auction category is registered"
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
                responseDetails.details = "It was not possible to update category, please try it again later";
            } else {
                Logger.error(error.name, error.message);
            }

            res.status(statusCode).json(responseDetails);
        }
    }

    public static async updateAuctionCategory(req: Request, res: Response): Promise<void> {
        /*
            #swagger.tags = ['Auction categories']
            #swagger.summary = 'Updates an existing auction category'
            #swagger.parameters['catid'] = {
                in: 'path',
                required: true,
                type: 'integer',
                description: 'ID of the auction category'
            }
            #swagger.parameters['body'] = {
                in: 'body',
                required: true,
                schema: {
                    type: 'object',
                    required: ['title', 'description', 'keywords'],
                    properties: {
                        title: { type: 'string' },
                        description: { type: 'string' },
                        keywords: { type: 'array', items: { type: 'string' } }
                    }
                }
            }
            #swagger.responses[200] = {
                description: 'Auction category is updated',
                schema: {
                    error: false,
                    statusCode: 200,
                    details: 'Auction category is updated'
                }
            }
            #swagger.responses[400] = {
                description: 'Bad request',
                schema: {
                    error: true,
                    statusCode: 400,
                    details: 'verify that the id exists and the title is unique'
                }
            }
            #swagger.responses[500] = {
                description: 'Server error',
                schema: { $ref: '#/definitions/ServerError' }
            }
        */
        try {
            const { catid } = req.params;
            const idCategory: number = parseInt(catid);

            const { title, description, keywords } = req.body;

            const isUpdated = await AuctionCategoryService.updateAuctionCategory(idCategory, title, description, keywords);
            if(!isUpdated){
                res.status(HttpStatusCodes.BAD_REQUEST).json({
                    error: true,
                    statusCode: HttpStatusCodes.BAD_REQUEST,
                    details: "verify that the id exists and the title is unique"
                });
                return;
            }

            res.status(HttpStatusCodes.OK).json({
                error: false,
                statusCode: HttpStatusCodes.OK,
                details: "Auction category is updated"
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
                responseDetails.details = "It was not possible to update category, please try it again later";
            } else {
                Logger.error(error.name, error.message);
            }

            res.status(statusCode).json(responseDetails);
        }
    }

    public static async getAuctionCategoriesList(req: Request, res: Response, next: NextFunction): Promise<void> {
        /*  
            #swagger.tags = ['Auction categories']
            #swagger.summary = 'Recovers all the auction categories'
            #swagger.security = [{
                BearerAuth: []
            }]
            #swagger.responses[200] = {
                description: 'Auction categories list',
                schema: [{ $ref: '#/definitions/AuctionCategory' }]
            }
            #swagger.responses[500] = {
                description: 'Server error',
                schema: { $ref: '#/definitions/ServerError' }
            }
        */
        try {
            const auctionCategories = await AuctionCategoryService.getManyAuctionCategories();
            res.status(HttpStatusCodes.OK).json(auctionCategories);
        } catch (error: any) {
            next(error);
        }
    }
}

export default AuctionCategoryController;