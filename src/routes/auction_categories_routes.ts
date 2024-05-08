import { Router } from "express";
import { checkSchema } from "express-validator";
import AuctionCategoryController from "@controllers/auction_category_controller";
import AuctionCategoriesRequestValidator from "@request_schemas/auction_categories_request_validator";
import RequestFormatValidator from "@middlewares/request_format_validator";

const AuctionCategoryRouter = Router();

AuctionCategoryRouter.get("/",
    //TODO verify token
    //checkSchema(AuctionCategoriesRequestValidator.auctionCategorySchema()),
    //RequestFormatValidator.validateRequestFormat,
    AuctionCategoryController.getAuctionCategory
);

export default AuctionCategoryRouter;