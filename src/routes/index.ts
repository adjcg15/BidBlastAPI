import { Router } from "express";
import SessionRouter from "./session_routes";
import AuctionCategoryRouter from "./auction_category_routes";
import AuctionRouter from "./auction_routes";
import AccountRouter from "./account_routes";
import UserRouter from "./user_routes";
import OfferRouter from "./offer_routes";
import AuctionReviewRouter from "./auction_review_routes";

const MainRouter = Router();

MainRouter.use("/api/sessions", SessionRouter);
MainRouter.use("/api/auction-categories", AuctionCategoryRouter);
MainRouter.use("/api/auctions", AuctionRouter);
MainRouter.use("/api/accounts", AccountRouter);
MainRouter.use("/api/users", UserRouter);
MainRouter.use("/api/offers", OfferRouter);
MainRouter.use("/api/auction-reviews", AuctionReviewRouter);

export default MainRouter;