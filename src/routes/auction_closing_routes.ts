import AuctionClosingController from "@controllers/auction_closing_controller";
import { Router } from "express";

const AuctionClosingRouter = Router();

AuctionClosingRouter.post("/",
    AuctionClosingController.closeAuctions
);

export default AuctionClosingRouter;