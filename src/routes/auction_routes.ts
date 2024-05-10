import AuctionController from "@controllers/auction_controller";
import { Router } from "express";

const AuctionRouter = Router();

AuctionRouter.get("/",
    AuctionController.searchAuction);

export default AuctionRouter;