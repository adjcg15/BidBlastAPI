import { Router } from "express";
import { checkSchema } from "express-validator";
import AuctionCategoryController from "@controllers/auction_category_controller";
import AuctionCategoriesRequestValidator from "@request_schemas/auction_category_request_validator";
import RequestFormatValidator from "@middlewares/request_format_validator";
import AccessControl from "@middlewares/access_control";

const AuctionCategoryRouter = Router();

AuctionCategoryRouter.get("/",
    AccessControl.checkTokenValidity,
    AuctionCategoryController.getAuctionCategoriesList
);

AuctionCategoryRouter.get("/:catid",
    AccessControl.checkTokenValidity,
    checkSchema(AuctionCategoriesRequestValidator.auctionCategorySchema()),
    RequestFormatValidator.validateRequestFormat,
    AuctionCategoryController.getAuctionCategory
);

AuctionCategoryRouter.put("/:catid",
    AccessControl.checkTokenValidity,
    checkSchema(AuctionCategoriesRequestValidator.auctionCategoryModificationSchema()),
    RequestFormatValidator.validateRequestFormat,
    AuctionCategoryController.updateAuctionCategory
);

AuctionCategoryRouter.post("/",
    AccessControl.checkTokenValidity,
    checkSchema(AuctionCategoriesRequestValidator.auctionCategoryRegistrartionSchema()),
    RequestFormatValidator.validateRequestFormat,
    AuctionCategoryController.registerAuctionCategory
);

export default AuctionCategoryRouter;