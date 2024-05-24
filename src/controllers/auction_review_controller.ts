import { ApproveAuctionCodes, HttpStatusCodes, RejectAuctionCodes } from "@ts/enums";
import { NextFunction, Request, Response } from "express";
import AuctionReviewService from "services/auction_review_service";
import AuctionService from "services/auction_service";

class AuctionReviewController {
    public static async approveAuction(req: Request, res: Response, next: NextFunction) {
        try {
            const { idAuction, idAuctionCategory } = req.body;
            
            const errorMessages = {
                [ApproveAuctionCodes.AUCTION_NOT_FOUND]: `The auction with ID ${idAuction} was not found`,
                [ApproveAuctionCodes.CATEGORY_NOT_FOUND]: `The auction category with ID ${idAuctionCategory} was not found`,
                [ApproveAuctionCodes.AUCTION_ALREADY_EVALUATED]: `The auction with ID ${idAuction} has been already evaluated`,
                [ApproveAuctionCodes.DB_MALFORMED]: "It was not possible to process your request, please try it later"
            };

            let approveAuctionResult: ApproveAuctionCodes | null = 
                await AuctionService.publishAuction(idAuction, idAuctionCategory);
            if(approveAuctionResult !== null) {
                const errorBody = {
                    error: true,
                    statusCode: HttpStatusCodes.BAD_REQUEST,
                    details: errorMessages[approveAuctionResult]
                }

                if(approveAuctionResult === ApproveAuctionCodes.DB_MALFORMED) {
                    errorBody.statusCode = HttpStatusCodes.INTERNAL_SERVER_ERROR
                }

                res.status(errorBody.statusCode).json(errorBody);
                return;
            }
            
            approveAuctionResult = await AuctionService.convertAuctionAuthorToAuctioneer(idAuction);
            if(approveAuctionResult !== null) {
                const errorBody = {
                    error: true,
                    statusCode: HttpStatusCodes.BAD_REQUEST,
                    details: errorMessages[approveAuctionResult]
                }

                if(approveAuctionResult === ApproveAuctionCodes.DB_MALFORMED) {
                    errorBody.statusCode = HttpStatusCodes.INTERNAL_SERVER_ERROR
                }

                res.status(errorBody.statusCode).json(errorBody);
                return;
            }

            res.status(HttpStatusCodes.CREATED).send();
        } catch(error) {
            next(error);
        }
    }

    public static async rejectAuction(req: Request, res: Response, next: NextFunction) {
        try {
            const { idAuction, comments } = req.body;
            const { id: idModerator } = req.user;

            const errorMessages = {
                [RejectAuctionCodes.AUCTION_NOT_FOUND]: `The auction with ID ${idAuction} was not found`,
                [RejectAuctionCodes.AUCTION_ALREADY_EVALUATED]: `The auction with ID ${idAuction} has been already evaluated`,
                [RejectAuctionCodes.DB_MALFORMED]: "It was not possible to process your request, please try it later"
            };

            let rejectAuctionResult: RejectAuctionCodes | null = 
                await AuctionService.rejectAuction(idAuction);
            if(rejectAuctionResult !== null) {
                const errorBody = {
                    error: true,
                    statusCode: HttpStatusCodes.BAD_REQUEST,
                    details: errorMessages[rejectAuctionResult]
                }

                if(rejectAuctionResult === RejectAuctionCodes.DB_MALFORMED) {
                    errorBody.statusCode = HttpStatusCodes.INTERNAL_SERVER_ERROR
                }

                res.status(errorBody.statusCode).json(errorBody);
                return;
            }

            rejectAuctionResult = await AuctionReviewService.createAuctionReview(comments, idAuction, idModerator);
            if(rejectAuctionResult !== null) {
                const errorBody = {
                    error: true,
                    statusCode: HttpStatusCodes.BAD_REQUEST,
                    details: errorMessages[rejectAuctionResult]
                }

                if(rejectAuctionResult === RejectAuctionCodes.DB_MALFORMED) {
                    errorBody.statusCode = HttpStatusCodes.INTERNAL_SERVER_ERROR
                }

                res.status(errorBody.statusCode).json(errorBody);
                return;
            }

            res.status(HttpStatusCodes.CREATED).send();
        } catch(error) {
            next(error);
        }
    }
}

export default AuctionReviewController;