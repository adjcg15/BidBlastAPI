import { Router } from "express";
import { checkSchema } from "express-validator";
import AuctionCategoryController from "@controllers/auction_category_controller";
import AuctionCategoriesRequestValidator from "@request_schemas/auction_category_request_validator";
import RequestFormatValidator from "@middlewares/request_format_validator";

const AuctionCategoryRouter = Router();

AuctionCategoryRouter.get("/:catid",
    //TODO verify token
    checkSchema(AuctionCategoriesRequestValidator.auctionCategorySchema()),
    RequestFormatValidator.validateRequestFormat,
    AuctionCategoryController.getAuctionCategory
);

AuctionCategoryRouter.put("/:catid",
    //TODO verify token
    checkSchema(AuctionCategoriesRequestValidator.changeAuctionCategorySchema()),
    RequestFormatValidator.validateRequestFormat,
    AuctionCategoryController.updateAuctionCategory
);

export default AuctionCategoryRouter;