import express from "express";
import dotenv from "dotenv";
import SessionRouter from "@routes/session_routes";

dotenv.config();

const app = express();
const APP_PORT = process.env.PORT;

app.use(express.json());

app.use("/api/sessions", SessionRouter);

app.listen(process.env.PORT, () => {
    console.log(`Server is running on http://localhost:${APP_PORT}`)
});