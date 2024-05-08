import { HttpStatusCodes } from "@ts/enums";
import { Request, Response } from "express";
import Logger from "@lib/logger";
import AuctionCategoryService from "services/auction_category_service";
import { DataContextException } from "@exceptions/services";

class AuctionCategoryController{
    public static async getAuctionCategory(req: Request, res: Response): Promise<void> {
        try {
            const idCategoryString: string = req.params.catid;
            const idCategory: number = parseInt(idCategoryString, 10);

            const auctionCategory = await AuctionCategoryService.getAuctionCategoryById(idCategory);

            if(auctionCategory == null){
                res.status(HttpStatusCodes.BAD_REQUEST).json({
                    error: true,
                    statusCode: HttpStatusCodes.BAD_REQUEST,
                    details: "Auction category doesn't exist with this id"
                });
                return;
            }
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
}

export default AuctionCategoryController;