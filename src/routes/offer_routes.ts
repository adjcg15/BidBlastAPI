import { Router } from "express";
import AccessControl from "@middlewares/access_control";
import OfferController from "@controllers/offer_controller";
import { checkSchema } from "express-validator";
import OfferRequestValidator from "@request_schemas/offer_request_validator";
import RequestFormatValidator from "@middlewares/request_format_validator";

const OfferRouter = Router();

OfferRouter.post("/", 
    AccessControl.checkTokenValidity,
    checkSchema(OfferRequestValidator.createOfferSchema()),
    RequestFormatValidator.validateRequestFormat,
    OfferController.createOffer
);

export default OfferRouter;