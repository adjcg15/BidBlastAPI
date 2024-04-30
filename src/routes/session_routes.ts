import SessionController from "@controllers/session_controller";
import { Router } from "express";

const SessionRouter = Router();

SessionRouter.post("/", SessionController.login);

export default SessionRouter;