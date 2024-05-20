import { Router } from "express";
import { checkSchema } from "express-validator";
import AccessControl from "@middlewares/access_control";
import UserRequestValidator from "@request_schemas/user_request_validator";
import RequestFormatValidator from "@middlewares/request_format_validator";
import DefaultValuesInjector from "@middlewares/default_values_injector";
import AuctionController from "@controllers/auction_controller";
import UserController from "@controllers/user_controller";

const UserRouter = Router();

UserRouter.get("/:usid/sales-auctions", 
    AccessControl.checkTokenValidity,
    checkSchema(UserRequestValidator.userSalesAuctionsListSchema()),
    RequestFormatValidator.validateRequestFormat,
    AuctionController.getUserSalesAuctionsList
);

UserRouter.get("/:usid/completed-auctions",
    AccessControl.checkTokenValidity,
    checkSchema(UserRequestValidator.userAuctionsListSchema()),
    RequestFormatValidator.validateRequestFormat,
    DefaultValuesInjector.setSearchUserAuctionsDefaultParams,
    AuctionController.searchCompletedAuction
);

UserRouter.get("/:usid/created-auctions",
    AccessControl.checkTokenValidity,
    checkSchema(UserRequestValidator.userAuctionsListSchema()),
    RequestFormatValidator.validateRequestFormat,
    DefaultValuesInjector.setSearchUserAuctionsDefaultParams,
    AuctionController.searchCreatedAuction
);

UserRouter.post("/black-list",
    AccessControl.checkTokenValidity,
    checkSchema(UserRequestValidator.userOnBlackListSchema()), 
    RequestFormatValidator.validateRequestFormat, 
    AuctionController.createAuction
);

export default UserRouter;