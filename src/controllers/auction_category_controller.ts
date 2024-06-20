import { CreateAuctionCategoryCodes, HttpStatusCodes, ModifyAuctionCategoryCodes } from "@ts/enums";
import { NextFunction, Request, Response } from "express";
import Logger from "@lib/logger";
import AuctionCategoryService from "services/auction_category_service";
import { DataContextException } from "@exceptions/services";

class AuctionCategoryController{
    public static async getAuctionCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
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
            next(error);
        }
    }    

    public static async registerAuctionCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
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
            #swagger.responses[201] = {
                description: 'Auction category is registered',
                schema: {
                    error: false,
                    statusCode: 201,
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
    
            const errorMessages = {
                [CreateAuctionCategoryCodes.TITLE_ALREADY_EXISTS]: `Category title already exists`
            };
    
            let createCategoryResult: CreateAuctionCategoryCodes | null = 
                await AuctionCategoryService.registerAuctionCategory(title, description, keywords);
            if(createCategoryResult !== null){
                const errorBody = {
                    error: true,
                    statusCode: HttpStatusCodes.BAD_REQUEST,
                    details: errorMessages[createCategoryResult],
                    apiErrorCode: createCategoryResult
                }
    
                res.status(errorBody.statusCode).json(errorBody);
                return;
            }
    
            res.status(HttpStatusCodes.CREATED).json();
        } catch (error: any) {
            next(error);
        }
    }    

    public static async updateAuctionCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
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
            #swagger.responses[204] = {
                description: 'Auction category is updated',
                schema: {
                    error: false,
                    statusCode: 204,
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
    
            const errorMessages = {
                [ModifyAuctionCategoryCodes.CATEGORY_NOT_FOUND]: `The auction category with ID ${idCategory} was not found`,
                [ModifyAuctionCategoryCodes.TITLE_ALREADY_EXISTS]: `Category title already exists`
            };
    
            let modifyCategoryResult: ModifyAuctionCategoryCodes | null = 
                await AuctionCategoryService.updateAuctionCategory(idCategory, title, description, keywords);
            if(modifyCategoryResult !== null) {
                const errorBody = {
                    error: true,
                    statusCode: HttpStatusCodes.BAD_REQUEST,
                    details: errorMessages[modifyCategoryResult],
                    apiErrorCode: modifyCategoryResult
                }
    
                res.status(errorBody.statusCode).json(errorBody);
                return;
            }
    
            res.status(HttpStatusCodes.NO_CONTENT).send();
        } catch (error: any) {
            next(error);
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
    public static async searchCategory(req: Request, res: Response, next: NextFunction) {
        try {
            const { query, limit, offset } = req.query;
            const categories = await AuctionCategoryService.getManyCategories(
                query as string,
                parseInt(limit as string),
                parseInt(offset as string)
            );
            res.status(200).json(categories);
        } catch (error) {
            next(error);
        }
    }
}

export default AuctionCategoryController;