import express from "express";
import dotenv from "dotenv";
import cors from "cors";
dotenv.config();

import SessionRouter from "@routes/session_routes";
import AuctionCategoryRouter from "@routes/auction_category_routes";
import DataBase from "@lib/db";
import configureModel from "@models/associations";
import AuctionRouter from "@routes/auction_routes";

const database = DataBase.getInstance();
database.startConnection()
    .then(() => {
        const app = express();
        const APP_PORT = process.env.PORT;
        configureModel();

        app.use(express.json());
        app.use(cors());
        app.use("/api/sessions", SessionRouter);
        app.use("/api/auction-categories", AuctionCategoryRouter);
        app.use("/api/auctions", AuctionRouter);

        app.listen(process.env.PORT, () => {
            console.log(`Server is running on http://localhost:${APP_PORT}`)
        });
    })
    .catch(error => {
        throw(error);
    });

process.on("exit", () => {
    database.finishConnection()
        .catch(error => {
            throw(error);
        });
});