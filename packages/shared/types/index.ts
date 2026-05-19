import "express";

export interface ApiResponse<T = any> {
    success: boolean,
    data?: T,
    message?: string,
    error?: string,
    code?: string
}

export interface JWTPayload {
    user_id: string,
    email: string,
    iat: number,
    exp: number // durée de vie ex: 24*60*60*1000  
}


export type HttpStatus = 200 // ok
    | 201 // ressource créee
    | 400 //
    | 404 // ressource non trouvée
    | 401 // mauvaise requête ex: user_id manquant 
    | 500 // erreur serveur


export interface AuthUser {
    account_id: string;
    account_type: "admin" | "client";
    roles: string[];
    permissions: { code: string; description: string }[];
}

declare global {
    namespace Express {
        interface Request {
            user?: AuthUser;
            refreshToken?: string;
        }
    }
}