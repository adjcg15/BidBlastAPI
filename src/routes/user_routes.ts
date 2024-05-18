import { Router } from "express";
import { checkSchema } from "express-validator";
import AccessControl from "@middlewares/access_control";
import UserRequestValidator from "@request_schemas/user_request_validator";
import RequestFormatValidator from "@middlewares/request_format_validator";
import DefaultValuesInjector from "@middlewares/default_values_injector";
import AuctionController from "@controllers/auction_controller";

const UserRouter = Router();

UserRouter.get("/:usid/sales-auctions", 
    AccessControl.checkTokenValidity,
    checkSchema(UserRequestValidator.userSalesAuctionsListSchema()),
    RequestFormatValidator.validateRequestFormat,
    AuctionController.getUserSalesAuctionsList
);

UserRouter.get("/:usid/completed-auctions",
    AccessControl.checkTokenValidity,
    checkSchema(UserRequestValidator.userCompletedAuctionsListSchema()),
    RequestFormatValidator.validateRequestFormat,
    DefaultValuesInjector.setSearchCompletedAuctionsDefaultParams,
    AuctionController.searchCompletedAuction
);

export default UserRouter;