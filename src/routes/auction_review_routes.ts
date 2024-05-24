import AuctionReviewController from "@controllers/auction_review_controller";
import AccessControl from "@middlewares/access_control";
import RequestFormatValidator from "@middlewares/request_format_validator";
import AuctionReviewRequestValidator from "@request_schemas/auction_review_request_validator";
import { UserRoles } from "@ts/enums";
import { Router } from "express";
import { checkSchema } from "express-validator";

const AuctionReviewRouter = Router();

AuctionReviewRouter.post("/approval",
    AccessControl.checkTokenValidity,
    AccessControl.allowRoles([UserRoles.MODERATOR]),
    checkSchema(AuctionReviewRequestValidator.approvalSchema()),
    RequestFormatValidator.validateRequestFormat,
    AuctionReviewController.approveAuction
);

AuctionReviewRouter.post("/rejection", 
    AccessControl.checkTokenValidity,
    AccessControl.allowRoles([UserRoles.MODERATOR]),
    checkSchema(AuctionReviewRequestValidator.rejectionSchema()),
    RequestFormatValidator.validateRequestFormat,
    AuctionReviewController.rejectAuction
);

export default AuctionReviewRouter;