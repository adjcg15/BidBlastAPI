import express from "express";
import dotenv from "dotenv";
dotenv.config();

import SessionRouter from "@routes/session_routes";
import DataBase from "@lib/db";

const database = DataBase.getInstance();
database.startConnection()
    .then(() => {
        const app = express();
        const APP_PORT = process.env.PORT;

        app.use(express.json());
        app.use("/api/sessions", SessionRouter);

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