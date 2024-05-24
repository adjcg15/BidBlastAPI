import AuctionReviewController from "@controllers/auction_review_controller";
import AccessControl from "@middlewares/access_control";
import { UserRoles } from "@ts/enums";
import { Router } from "express";

const AuctionReviewRouter = Router();

AuctionReviewRouter.post("/",
    AccessControl.checkTokenValidity,
    AccessControl.allowRoles([UserRoles.MODERATOR]),
    AuctionReviewController.createAuctionReview
);

export default AuctionReviewRouter;