import AuctionController from "@controllers/auction_controller";
import AccessControl from "@middlewares/access_control";
import { Router } from "express";

const AuctionRouter = Router();

AuctionRouter.get("/",
    AccessControl.checkTokenValidity,
    AuctionController.searchAuction);

export default AuctionRouter;