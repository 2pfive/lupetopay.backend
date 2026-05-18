import { Request, Response, NextFunction } from "express";
import { logger } from "./lib/helper";
import { prisma } from "./lib/prisma.client";
import { AppError } from "@app/shared";

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


interface AuthRequest extends Request {
    user?: {
        id: string;
        role: string;
    };
}

/**
 * Vérifie qu'un utilisateur possède une permission
 */
export const requirePermission = (permissionCode: string) => {

    return async (
        req: AuthRequest,
        _res: Response,
        next: NextFunction
    ) => {

        try {

            // utilisateur injecté par le middleware JWT
            const user = req.user;

            if (!user) {
                throw new AppError("Unauthorized", 401);
            }

            /**
             * récupération des permissions liées au rôle
             */
            const permissions = await prisma.adminRolePermission.findMany({
                where: {
                    admin_role: {
                        name: user.role
                    }
                },
                select: {
                    admin_permission: {
                        select: {
                            code: true
                        }
                    }
                }
            });

            /**
             * tableau des codes permissions
             */
            const permissionCodes = permissions.map(
                (p) => p.admin_permission.code
            );

            /**
             * vérification permission
             */
            const hasPermission = permissionCodes.includes(permissionCode);

            if (!hasPermission) {
                throw new AppError("Vous n'êtes pas authorisé à effectuer cette opération", 403);
            }

            next();

        } catch (error) {
            next(error);
        }
    };
};