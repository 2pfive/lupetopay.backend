import { Request, Response, NextFunction } from "express";
import { logger } from "./lib/helper";

export const errorMiddleware = (
    err: any,
    req: Request,
    res: Response,
    next: NextFunction
) => {

    logger.error("Unhandled error", {
        message: err.message,
        stack: err.stack,
        url: req.url,
        method: req.method
    });

    res.status(err.statusCode || 500).json({
        success: false,
        message: err.message || "Internal server error"
    });
};