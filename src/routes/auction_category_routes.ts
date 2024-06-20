import { Router } from "express";
import { checkSchema } from "express-validator";
import AuctionCategoryController from "@controllers/auction_category_controller";
import AuctionCategoriesRequestValidator from "@request_schemas/auction_category_request_validator";
import RequestFormatValidator from "@middlewares/request_format_validator";
import AccessControl from "@middlewares/access_control";
import { UserRoles } from "@ts/enums";
import DefaultValuesInjector from "@middlewares/default_values_injector";

const AuctionCategoryRouter = Router();

AuctionCategoryRouter.get("/",
    AccessControl.checkTokenValidity,
    AuctionCategoryController.getAuctionCategoriesList
);
AuctionCategoryRouter.get("/search",
    AccessControl.checkTokenValidity,
    checkSchema(AuctionCategoriesRequestValidator.categoriesListSchema()),
    RequestFormatValidator.validateRequestFormat,
    DefaultValuesInjector.setSearchCategoryDefaultParams,
    AuctionCategoryController.searchCategory
);

AuctionCategoryRouter.get("/:catid",
    AccessControl.checkTokenValidity,
    checkSchema(AuctionCategoriesRequestValidator.auctionCategorySchema()),
    RequestFormatValidator.validateRequestFormat,
    AuctionCategoryController.getAuctionCategory
);

AuctionCategoryRouter.put("/:catid",
    AccessControl.checkTokenValidity,
    AccessControl.allowRoles([UserRoles.MODERATOR]),
    checkSchema(AuctionCategoriesRequestValidator.auctionCategoryModificationSchema()),
    RequestFormatValidator.validateRequestFormat,
    AuctionCategoryController.updateAuctionCategory
);

AuctionCategoryRouter.post("/",
    AccessControl.checkTokenValidity,
    AccessControl.allowRoles([UserRoles.MODERATOR]),
    checkSchema(AuctionCategoriesRequestValidator.auctionCategoryRegistrationSchema()),
    RequestFormatValidator.validateRequestFormat,
    AuctionCategoryController.registerAuctionCategory
);

export default AuctionCategoryRouter;