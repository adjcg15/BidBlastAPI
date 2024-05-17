import { Router } from "express";
import SessionController from "@controllers/session_controller";
import AccountController from "@controllers/account_controller";
import RateLimiter from "@middlewares/rate_limiter";
import { checkSchema } from "express-validator";
import AccountRequestValidator from "@request_schemas/account_request_validator";
import RequestFormatValidator from "@middlewares/request_format_validator";

const AccountRouter = Router();

AccountRouter.post("/", 
    RateLimiter.limitPublicEndpointUse(),
    checkSchema(AccountRequestValidator.registerSchema()),
    RequestFormatValidator.validateRequestFormat,
    AccountController.createAccount
);

export default AccountRouter;
