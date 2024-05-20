import { HttpStatusCodes } from "@ts/enums";
import { Request, Response } from "express";
import Logger from "@lib/logger";
import { DataContextException } from "@exceptions/services";
import UserService from "services/user_service";

class UserController {
    public static async blockUserInAnAuction(req: Request, res: Response): Promise<void> {
        try {
            const { id_profile, id_auction } = req.body;

            await UserService.blockUserInAnAuction(id_profile, id_auction);

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
}

export default UserController;