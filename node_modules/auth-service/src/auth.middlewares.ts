import { Request, Response, NextFunction } from "express";
import { logger } from "./lib/helper";
import { AppError } from "@app/shared";
import jwt from "jsonwebtoken"
import { readFileSync } from "fs"


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



/**
 * Vérifie qu'un utilisateur possède une permission
 */
export function requirePermissions(...allowedPermissions: string[]) {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            const user = req.user;

            if (!user) {
                throw new AppError("Non authentifié", 401);
            }

            const hasPermission = user.permissions.some(p =>
                allowedPermissions.includes(p.code)
            );

            if (!hasPermission) {
                throw new AppError("Permission refusée", 403);
            }

            next();

        } catch (error) {
            next(error);
        }
    };
}

export const extractRefreshToken = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const refreshToken = req.cookies?.REFRESH_TOKEN;

    if (!refreshToken) {
        return next(new AppError("refresh token manquant", 401));
    }

    // on l’attache à la requête pour la suite
    (req as any).refreshToken = refreshToken;

    next();
};


