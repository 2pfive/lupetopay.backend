import { Request, Response } from "express";
import { AuthService } from "./auth.services";
import { CreateAdminDTO } from "./types";
import { AppError, createApiResponse } from "@app/shared"

export class AuthControllers {

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
}