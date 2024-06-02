import { Router } from "express";
import { checkSchema } from "express-validator";
import AuctionController from "@controllers/auction_controller";
import AccessControl from "@middlewares/access_control";
import AuctionRequestValidator from "@request_schemas/auction_request_validator";
import RequestFormatValidator from "@middlewares/request_format_validator";
import DefaultValuesInjector from "@middlewares/default_values_injector";
import { UserRoles } from "@ts/enums";

const AuctionRouter = Router();

AuctionRouter.get("/",
    AccessControl.checkTokenValidity,
    checkSchema(AuctionRequestValidator.auctionsListSchema()),
    RequestFormatValidator.validateRequestFormat,
    DefaultValuesInjector.setSearchAuctionDefaultParams,
    AuctionController.searchAuction
);

AuctionRouter.get("/:idAuction",
    AccessControl.checkTokenValidity,
    checkSchema(AuctionRequestValidator.auctionByIdSchema()),
    RequestFormatValidator.validateRequestFormat,
    AuctionController.getAuctionById
);

AuctionRouter.post("/",
    AccessControl.checkTokenValidity,
    checkSchema(AuctionRequestValidator.createAuctionSchema()), 
    RequestFormatValidator.validateRequestFormat, 
    AuctionController.createAuction
);

AuctionRouter.post("/:auid/user-blocking",
    AccessControl.checkTokenValidity,
    AccessControl.allowRoles([UserRoles.AUCTIONEER]),
    checkSchema(AuctionRequestValidator.userOnBlackListSchema()), 
    RequestFormatValidator.validateRequestFormat, 
    AuctionController.blockUserInAnAuction
);

AuctionRouter.get("/:auid/offers",
    AccessControl.checkTokenValidity,
    AccessControl.allowRoles([UserRoles.AUCTIONEER]),
    checkSchema(AuctionRequestValidator.offersByAuctionIdSchema()), 
    RequestFormatValidator.validateRequestFormat, 
    DefaultValuesInjector.setOffersAuctionDefaultParams,
    AuctionController.getUserAuctionOffersByAuctionId
);

export default AuctionRouter;