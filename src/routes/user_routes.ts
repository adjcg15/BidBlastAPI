import { Router } from "express";
import { checkSchema } from "express-validator";
import AccessControl from "@middlewares/access_control";
import UserRequestValidator from "@request_schemas/user_request_validator";
import RequestFormatValidator from "@middlewares/request_format_validator";
import DefaultValuesInjector from "@middlewares/default_values_injector";
import AuctionController from "@controllers/auction_controller";
import { UserRoles } from "@ts/enums";
import RateLimiter from "@middlewares/rate_limiter";
import UserController from "@controllers/user_controller";

const UserRouter = Router();

UserRouter.get("/",
    AccessControl.checkTokenValidity,
    AccessControl.allowRoles([UserRoles.ADMINISTRATOR]),
    checkSchema(UserRequestValidator.usersListSchema()),
    RequestFormatValidator.validateRequestFormat,
    DefaultValuesInjector.setSearchUsersDefaultParams,
    UserController.getUsersList
);

UserRouter.post("/", 
    RateLimiter.limitPublicEndpointUse(),
    checkSchema(UserRequestValidator.userSchema()),
    RequestFormatValidator.validateRequestFormat,
    UserController.createUser
);

UserRouter.delete("/:idProfile",
    AccessControl.checkTokenValidity,
    AccessControl.allowRoles([UserRoles.ADMINISTRATOR]),
    checkSchema(UserRequestValidator.userSchemaForDeletion()),
    RequestFormatValidator.validateRequestFormat,
    UserController.deleteUser
)

UserRouter.put("/",
    AccessControl.checkTokenValidity,
    AccessControl.allowRoles([UserRoles.AUCTIONEER, UserRoles.CUSTOMER]),
    checkSchema(UserRequestValidator.userSchema()),
    RequestFormatValidator.validateRequestFormat,
    UserController.updateUser
);

UserRouter.get("/sold-auctions", 
    AccessControl.checkTokenValidity,
    AccessControl.allowRoles([UserRoles.AUCTIONEER]),
    checkSchema(UserRequestValidator.userSalesAuctionsListSchema()),
    RequestFormatValidator.validateRequestFormat,
    AuctionController.getUserSalesAuctionsList
);

UserRouter.get("/completed-auctions",
    AccessControl.checkTokenValidity,
    AccessControl.allowRoles([UserRoles.CUSTOMER]),
    checkSchema(UserRequestValidator.userAuctionsListSchema()),
    RequestFormatValidator.validateRequestFormat,
    DefaultValuesInjector.setSearchUserAuctionsDefaultParams,
    AuctionController.searchCompletedAuction
);

UserRouter.get("/auctions",
    AccessControl.checkTokenValidity,
    AccessControl.allowRoles([UserRoles.AUCTIONEER]),
    checkSchema(UserRequestValidator.userAuctionsListSchema()),
    RequestFormatValidator.validateRequestFormat,
    DefaultValuesInjector.setSearchUserAuctionsDefaultParams,
    AuctionController.searchCreatedAuction
);

export default UserRouter;