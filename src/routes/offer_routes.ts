import { Router } from "express";
import AccessControl from "@middlewares/access_control";
import OfferController from "@controllers/offer_controller";

const OfferRouter = Router();

OfferRouter.post("/", 
    AccessControl.checkTokenValidity,
    OfferController.createOffer
);

export default OfferRouter;