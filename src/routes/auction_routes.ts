import { Router } from "express";
import { checkSchema } from "express-validator";
import AuctionController from "@controllers/auction_controller";
import AccessControl from "@middlewares/access_control";
import AuctionRequestValidator from "@request_schemas/auction_request_validator";
import RequestFormatValidator from "@middlewares/request_format_validator";

const AuctionRouter = Router();

AuctionRouter.get("/",
    AccessControl.checkTokenValidity,
    checkSchema(AuctionRequestValidator.auctionsListSchema()),
    RequestFormatValidator.validateRequestFormat,
    AuctionController.searchAuction);

export default AuctionRouter;