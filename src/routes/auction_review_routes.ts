import AuctionReviewController from "@controllers/auction_review_controller";
import AccessControl from "@middlewares/access_control";
import AuctionReviewMiddleware from "@middlewares/auction_review_middleware";
import RequestFormatValidator from "@middlewares/request_format_validator";
import AuctionReviewRequestValidator from "@request_schemas/auction_review_request_validator";
import { UserRoles } from "@ts/enums";
import { Router } from "express";
import { checkSchema } from "express-validator";

const AuctionReviewRouter = Router();

AuctionReviewRouter.post("/",
    AccessControl.checkTokenValidity,
    AccessControl.allowRoles([UserRoles.MODERATOR]),
    checkSchema(AuctionReviewRequestValidator.auctionReviewSchema()),
    RequestFormatValidator.validateRequestFormat,
    AuctionReviewMiddleware.conditionalCommentsValidation,
    AuctionReviewController.createAuctionReview
);

export default AuctionReviewRouter;