import { CreateOfferCodes, HttpStatusCodes } from "@ts/enums";
import { NextFunction, Request, Response } from "express";
import OfferService from "services/offer_service";

class OfferController {
    public static async createOffer(req: Request, res: Response, next: NextFunction): Promise<void> {
        /*  
            #swagger.tags = ['Offers']
            #swagger.summary = 'Makes an offer for a particular auction'
            #swagger.parameters['body'] = {
                in: 'body',
                required: true,
                schema: { $ref: '#/definitions/NewOffer' }
            } 
            #swagger.security = [{
                BearerAuth: []
            }]
            #swagger.responses[201] = {
                description: 'Successful offer creation'
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
            const { auctionId, amount } = req.body as { auctionId: number, amount: number };
            const { id: userId } = req.user;
            
            const offerCreationResult = await OfferService.createOffer(auctionId, userId, amount);
            if(offerCreationResult !== null) {
                const errorMessages = {
                    [CreateOfferCodes.AUCTION_BLOCKED]: "You are not able to make offers to this auction. The auctioneer has blocked you",
                    [CreateOfferCodes.AUCTION_FINISHED]: "This auction is not public anymore, it can't receive more offers",
                    [CreateOfferCodes.AUCTION_NOT_FOUND]: `The auction with ID ${auctionId} does not exists`,
                    [CreateOfferCodes.BASE_PRICE_NOT_FULLFILLED]: "Your offer is lower than the base auction price",
                    [CreateOfferCodes.EARLY_OFFER]: "You must wait before making an offer again",
                    [CreateOfferCodes.MINIMUM_BID_NOT_FULFILLED]: "Your offer is lower than the minimum bid allowed for this auction",
                    [CreateOfferCodes.OFFER_OVERCOMED]: "There is a better offer for this auction, improve yours",
                    [CreateOfferCodes.AUCTION_OWNER]: "You can't make an offer on one auction where you are the owner"
                }

                res.status(HttpStatusCodes.BAD_REQUEST).json({
                    error: true,
                    statusCode: HttpStatusCodes.BAD_REQUEST,
                    details: errorMessages[offerCreationResult],
                    apiErrorCode: offerCreationResult
                });
                return;
            }

            res.status(HttpStatusCodes.CREATED).send();
        } catch (error) {
            next(error);
        }
    }
}

export default OfferController;