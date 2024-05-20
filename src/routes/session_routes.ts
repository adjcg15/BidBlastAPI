import { Router } from "express";
import { checkSchema } from "express-validator";
import SessionController from "@controllers/session_controller";
import SessionRequestValidator from "@request_schemas/session_request_validator";
import RequestFormatValidator from "@middlewares/request_format_validator";
import RateLimiter from "@middlewares/rate_limiter";

const SessionRouter = Router();

/**
 * @openapi
 * '/api/sessions':
 *  post:
 *     tags:
 *     - Session Controller
 *     summary: Start the session for a particular user (log in)
 *     requestBody:
 *      required: true
 *      content:
 *        application/json:
 *           schema:
 *            type: object
 *            required:
 *              - email
 *              - password
 *            properties:
 *              email:
 *                type: string
 *                default: johndoe@mail.com
 *              password:
 *                type: string
 *                default: johnDoe20!@
 *     responses:
 *      201:
 *        description: Login successful
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                token: 
 *                  type: string
 *                  default: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MjcsImVtYWlsI...
 *                  description: JSON Web Token of the session created
 *                id:
 *                  type: integer
 *                  default: 1
 *                fullName:
 *                  type: string
 *                  default: John Doe
 *                phoneNumber:
 *                  type: string
 *                  default: 2288888888
 *                avatar:
 *                  type: string
 *                  default: iVBORw0KGgoAAAANSUhEUgAAAIIAAADACAMAAAD/TUuoAAADAFBMVEXW1d...
 *                  description: The avatar image content in base64 format
 *                email:
 *                  type: string
 *                  default: johndoe@mail.com
 *                roles:
 *                  type: array
 *                  items:
 *                    type: string
 *                  default: ["AUCTIONEER", "CUSTOMER", "MODERATOR"]
 *      400:
 *        description: Invalid credentials
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                error: 
 *                  type: boolean
 *                  default: true
 *                statusCode:
 *                  type: integer
 *                  default: 400
 *                details:
 *                  type: string
 *                  default: Invalid credentials. Check your email and password and try it again
 *      500:
 *        description: Server error
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                error: 
 *                  type: boolean
 *                  default: true
 *                statusCode:
 *                  type: integer
 *                  default: 500
 *                details:
 *                  type: string
 *                  default: There was an unexpeted error, please try it again later
 */
SessionRouter.post("/", 
    RateLimiter.limitPublicEndpointUse(),
    checkSchema(SessionRequestValidator.loginSchema()),
    RequestFormatValidator.validateRequestFormat,
    SessionController.login);

export default SessionRouter;