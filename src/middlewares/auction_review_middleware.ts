import { HttpStatusCodes } from "@ts/enums";
import { NextFunction, Request, Response } from "express";

class AuctionReviewMiddleware {
    public static conditionalCommentsValidation(req: Request, res: Response, next: NextFunction) {
        let { comments, isApproved } = req.body;

        if(!isApproved && !comments) {
            res.status(HttpStatusCodes.BAD_REQUEST).json({
                error: true,
                statusCode: HttpStatusCodes.BAD_REQUEST,
                details: "When 'isApproved' is false, you must specify a reason in 'comments' field"
            });
            return;
        }

        next();
    }
}

export default AuctionReviewMiddleware;