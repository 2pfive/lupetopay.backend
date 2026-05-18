import { Request, Response, CookieOptions } from "express";
import { AuthService } from "./auth.services";
import { CreateAdminDTO } from "./types";
import { AppError, createApiResponse } from "@app/shared"

export class AuthControllers {

    static setCookie(res: Response, name: string, value: any, options: CookieOptions = {}) {
        const defaultOptions: CookieOptions = {
            httpOnly: true,
            maxAge: options.maxAge || 86400000,
            secure: true,
            sameSite: "none"
        }
        res.cookie(name, value, { ...defaultOptions, ...options })
    }

    async createAdminController(req: Request, res: Response) {
        try {
            const {
                firstname,
                lastname,
                password,
                email,
                telephone,
                role
            } = req.body;

            // DTO construction propre
            const adminDto: CreateAdminDTO = {
                firstname,
                lastname,
                password,
                email,
                telephone,
                role
            };

            // call service
            const result = await AuthService.createAdmin(adminDto);

            return res.status(201).json(
                createApiResponse(
                    true,
                    result,
                    "Admin créé avec succès"
                )
            );

        } catch (error: any) {
            if (error instanceof AppError) return res.status(error.statusCode).json(
                createApiResponse(false,
                    null,
                    error.message,
                    undefined,
                    error.name
                )
            )

            // Lorsque l'erreur n'est pas connue (erreur serveur)
            return res.status(500).json(
                createApiResponse(
                    false,
                    null,
                    "Internal server error"
                )
            );
        }
    }

    async loginController(req: Request, res: Response) {
        try {
            const { email, password } = req.body;

            const result = await AuthService.loginAdmin(email, password);

            AuthControllers.setCookie(res, "ACCESS_TOKEN", result.tokens.access)
            AuthControllers.setCookie(res, "REFRESH_TOKEN", result.tokens.token, { maxAge: 2 * 86400000 })

            return res.status(200).json(
                createApiResponse(
                    true,
                    result,
                    "Connexion réussie"
                )
            );

        } catch (error: any) {

            if (error instanceof AppError) {
                return res.status(error.statusCode).json(
                    createApiResponse(
                        false,
                        null,
                        error.message,
                        undefined,
                        error.name
                    )
                );
            }

            return res.status(500).json(
                createApiResponse(
                    false,
                    null,
                    "Internal server error"
                )
            );
        }
    }

    async refreshTokenController(req: Request, res: Response) {
        try {
            const refreshToken = req.cookies?.REFRESH_TOKEN;
            const { account_id } = req.body
            if (!refreshToken) {
                throw new AppError("refresh token manquant", 401);
            }

            const result = await AuthService.rotateRefreshToken(account_id, refreshToken)

            // rotation cookie (important)
            AuthControllers.setCookie(
                res,
                "REFRESH_TOKEN",
                result.token,
                {
                    maxAge: 2 * 24 * 60 * 60 * 1000
                }
            );

            return res.status(200).json(
                createApiResponse(
                    true,
                    "Token rafraîchi avec succès"
                )
            );

        } catch (error: any) {

            if (error instanceof AppError) {
                return res.status(error.statusCode).json(
                    createApiResponse(
                        false,
                        null,
                        error.message,
                        undefined,
                        error.name
                    )
                );
            }

            return res.status(500).json(
                createApiResponse(
                    false,
                    null,
                    "Internal server error"
                )
            );
        }
    }
}