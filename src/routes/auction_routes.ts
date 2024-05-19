import { Router } from "express";
import { checkSchema } from "express-validator";
import AuctionController from "@controllers/auction_controller";
import AccessControl from "@middlewares/access_control";
import AuctionRequestValidator from "@request_schemas/auction_request_validator";
import RequestFormatValidator from "@middlewares/request_format_validator";
import DefaultValuesInjector from "@middlewares/default_values_injector";

const AuctionRouter = Router();

AuctionRouter.get("/",
    AccessControl.checkTokenValidity,
    checkSchema(AuctionRequestValidator.auctionsListSchema()),
    RequestFormatValidator.validateRequestFormat,
    DefaultValuesInjector.setSearchAuctionDefaultParams,
    AuctionController.searchAuction
);

AuctionRouter.get("/:auctionId",
    AccessControl.checkTokenValidity,
    AuctionController.getAuctionById
);

export default AuctionRouter;