import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AppError } from "@app/shared";
import { config } from "../config";



export function requireRoles(...allowedRoles: string[]) {
    return (req: Request, _res: Response, next: NextFunction) => {
        try {
            const user = req.user;

            if (!user) {
                throw new AppError("Non authentifié", 401);
            }

            const hasRole = user.roles.some(role =>
                allowedRoles.includes(role)
            );

            if (!hasRole) {
                throw new AppError("Accès refusé", 403);
            }

            next();

        } catch (error) {
            next(error);
        }
    };
}


export function requirePermissions(...allowedPermissions: string[]) {
    return (req: Request, _res: Response, next: NextFunction) => {
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

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {

    const token = req.cookies[`ACCESS_TOKEN`] || req.headers.authorization?.split(" ")[1];;

    if (!token) {
        // console.log("################### TOKEN INVALIDE OU MANQUANT #############");
        return res.status(401).json({ error: 'Token manquant ou invalide' });
    }

    jwt.verify(token, config.PUBLIC_KEY, (err: any, decoded: any) => {
        if (err) {
            return res.status(401).json({ error: 'Token invalide' });
        }
        // console.log(decoded);
        req.user = decoded.payload;
        next();
    });
};

export const requireRefreshToken = (
    req: Request,
    res: Response,
    next: NextFunction
) => {

    const token =
        req.cookies?.REFRESH_TOKEN ||
        req.headers["x-refresh-token"];

    if (!token) {
        return res.status(401).json({
            error: "Refresh token manquant"
        });
    }

    req.refreshToken = token as string;

    next();
};