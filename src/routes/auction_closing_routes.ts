import AuctionClosingController from "@controllers/auction_closing_controller";
import AccessControl from "@middlewares/access_control";
import { Router } from "express";

const AuctionClosingRouter = Router();

AuctionClosingRouter.post("/",
    AccessControl.verifyStaticToken,
    AuctionClosingController.closeAuctions
);

export default AuctionClosingRouter;