import bcrypt from "bcrypt"
import { config } from "../config/config"
import { CreateAdminDTO } from "../types";
import crypto from "crypto";

export const validateCreateAdmin = (data: CreateAdminDTO) => {
    const errors: string[] = [];

    if (!data.email || !data.email.includes("@")) {
        errors.push("Email invalide");
    }

    if (!data.firstname || data.firstname.length < 2) {
        errors.push("Firstname trop court");
    }

    if (!data.lastname || data.lastname.length < 2) {
        errors.push("Lastname trop court");
    }

    if (!data.telephone || data.telephone.length < 6) {
        errors.push("Telephone invalide");
    }

    if (data.password && data.password.length < 6) {
        errors.push("Password trop court (min 6 caractères)");
    }

    return errors
};


export const hashPassword = async (pswd: string) => {
    const hashed = await bcrypt.hash(pswd, config.saltRounds)
    return hashed
}

export const comparePasswords = async (hashed_pswd: string, plain_pwsd: string) => {
    const is_same = await bcrypt.compare(plain_pwsd, hashed_pswd)
    return is_same
}


// pour générer un mot de passe temporaire
export const generateTemporaryPassword = (length = 10): string => {
    return crypto.randomBytes(length)
        .toString("base64")
        .slice(0, length);
};


export const logger = {
    info: (message: string, meta?: any) => {
        console.log(`[INFO] ${new Date().toISOString()} - ${message}`, meta || "");
    },

    error: (message: string, error?: any) => {
        console.error(`[ERROR] ${new Date().toISOString()} - ${message}`);
        if (error) console.error(error);
    },

    warn: (message: string, meta?: any) => {
        console.warn(`[WARN] ${new Date().toISOString()} - ${message}`, meta || "");
    }
};