import { HttpStatusCodes } from "@ts/enums";
import { Request, Response } from "express";
import Logger from "@lib/logger";
import AuctionCategoryService from "services/auction_category_service";
import { DataContextException } from "@exceptions/services";
import { error } from "winston";

class AuctionCategoryController{
    public static async getAuctionCategory(req: Request, res: Response): Promise<void> {
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

    public static async updateAuctionCategory(req: Request, res: Response): Promise<void> {
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

            res.status(HttpStatusCodes.CREATED).json({
                error: false,
                statusCode: HttpStatusCodes.CREATED,
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
}

export default AuctionCategoryController;