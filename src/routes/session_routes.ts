import { Router } from "express";
import { checkSchema } from "express-validator";
import SessionController from "@controllers/session_controller";
import SessionRequestValidator from "@request_schemas/session_request_validator";
import RequestFormatValidator from "@middlewares/request_format_validator";
import RateLimiter from "@middlewares/rate_limiter";

const SessionRouter = Router();

SessionRouter.post("/", 
    RateLimiter.limitPublicEndpointUse(),
    checkSchema(SessionRequestValidator.loginSchema()),
    RequestFormatValidator.validateRequestFormat,
    SessionController.login
);

export default SessionRouter;