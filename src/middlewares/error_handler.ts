import Logger from "@lib/logger";
import { HttpStatusCodes } from "@ts/enums";
import { NextFunction, Request, Response } from "express";

class ErrorHandler {
    public static handleError(error: any, req: Request, res: Response, next: NextFunction) {
        let statusCode = HttpStatusCodes.INTERNAL_SERVER_ERROR;
        const responseDetails = {
            error: true,
            statusCode: HttpStatusCodes.INTERNAL_SERVER_ERROR,
            details: "It was not possible to process your request, please try it again later"
        };
    
        Logger.error(error.name, error.message);
        
        res.status(statusCode).json(responseDetails);
    }
}

export default ErrorHandler;