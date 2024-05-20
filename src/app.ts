import express from "express";
import dotenv from "dotenv";
import cors from "cors";
dotenv.config();

import DataBase from "@lib/db";
import configureModel from "@models/associations";
import { swaggerDocs } from "swagger";
import MainRouter from "./routes";

const database = DataBase.getInstance();
database.startConnection()
    .then(() => {
        const app = express();
        const APP_PORT = process.env.PORT;
        configureModel();

        app.use(express.json());
        app.use(cors());
        app.use(MainRouter);

        app.listen(process.env.PORT, () => {
            console.log(`Server is running on ${process.env.HOST_URL}:${APP_PORT}`);
            swaggerDocs(app, APP_PORT);
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