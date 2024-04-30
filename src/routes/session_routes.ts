import { Router } from "express";
import { checkSchema } from "express-validator";
import SessionController from "@controllers/session_controller";
import SessionRequestValidator from "@request_schemas/session_request_validator";
import RequestFormatValidator from "@middlewares/request_format_validator";

const SessionRouter = Router();

SessionRouter.post("/", 
    checkSchema(SessionRequestValidator.loginSchema()),
    RequestFormatValidator.validateRequestFormat,
    SessionController.login);

export default SessionRouter;