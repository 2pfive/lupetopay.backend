import { comparePasswords, generateTemporaryPassword, hashPassword, validateCreateAdmin } from "./lib/helper";
import { generateRefreshToken, generateToken, hashToken } from "./lib/jsonwebtoken";
import { prisma } from "./lib/prisma.client";
import { CreateAdminDTO } from "./types";
import { AppError } from "@app/shared"

export class AuthService {

    static async createAdmin(admin: CreateAdminDTO) {

        const errors = validateCreateAdmin(admin)
        if (errors.length > 0) throw new AppError(errors.join(", "), 400)

        const existing = await prisma.adminAccount.findUnique({
            where: {
                email: admin.email
            }
        })

        if (existing) throw new AppError("Admin déjà existant", 409)

        let password_hash
        let temporaryPassword
        if (admin.password) {
            password_hash = await hashPassword(admin.password)
        } else {
            temporaryPassword = generateTemporaryPassword(10)
            password_hash = await hashPassword(temporaryPassword)
        }

        const new_admin = await prisma.adminAccount.create({
            data: {
                email: admin.email,
                firstname: admin.firstname,
                lastname: admin.lastname,
                telephone: admin.telephone,
                password_hash: password_hash,
                is_temporary_password: !admin.password,
                status: 'ACTIVE'
            }
        })

        if (temporaryPassword) {
            const random_str = generateTemporaryPassword(10)
            const reset_token = await hashPassword(random_str)
            await prisma.passwordResetToken.create({
                data: {
                    account_id: new_admin.id,
                    account_type: 'admin',
                    token_hash: reset_token,
                    expires_at: new Date(Date.now() + 48 * 60 * 60 * 1000) // expire après 48h
                }
            })
        }

        // configuration des rôles  
        const role = await prisma.adminRole.findUnique({
            where: {
                name: admin.role || 'admin'
            }
        })

        if (role) {
            await prisma.adminAccountRole.create({
                data: {
                    admin_account_id: new_admin.id,
                    admin_role_id: role.id
                }
            })
        }
        // ////////////////////////////////////////////////////

        const { password_hash: _, ...safeAdmin } = new_admin;

        return {
            ...safeAdmin,
            role,
            temporaryPassword: temporaryPassword
        }
    }

    static async loginAdmin(email: string, password: string) {

        if (!email || !password)
            throw new AppError("identifiants de connexion requis", 400)

        const existing = await prisma.adminAccount.findUnique({
            where: {
                email
            }
        })

        if (!existing)
            throw new AppError("identifiants incorrects", 400)

        const same_pswd = await comparePasswords(
            existing.password_hash,
            password
        )

        if (!same_pswd)
            throw new AppError("identifiants incorrects", 400)

        // récupération des rôles
        const roles = await prisma.adminAccountRole.findMany({
            where: {
                admin_account_id: existing.id
            },
            include: {
                admin_role: true
            }
        })

        // récupération des permissions
        const permissionsArrays = await Promise.all(
            roles.map(async (r) => {

                const res = await prisma.adminRolePermission.findMany({
                    where: {
                        admin_role_id: r.admin_role_id
                    },
                    select: {
                        admin_permission: {
                            select: {
                                code: true,
                                description: true
                            }
                        }
                    }
                })

                return res.map(p => ({
                    code: p.admin_permission.code,
                    description: p.admin_permission.description
                }))
            })
        )

        // fusion des tableaux
        const permissions = permissionsArrays.flat()

        // génération du refresh token
        // const refresh_expire_date = new Date(Date.now() + 48 * 60 * 60 * 1000)
        const { token, tokenHash } = generateRefreshToken()
        await prisma.refreshToken.create({
            data: {
                account_id: existing.id,
                account_type: "administrator",
                token: tokenHash,
                expires_at: new Date(Date.now() + 48 * 60 * 60 * 1000)
            }
        })

        const access_token = await generateToken({
            account_id: existing.id,
            roles: roles.map(r => r.admin_role.name),
            permissions,
            account_type: "administrator"
        })


        return {
            user: {
                id: existing.id,
                email: existing.email,
                firstname: existing.firstname,
                lastname: existing.lastname,
                account_type: "administrator"
            },
            roles: roles.map(r => r.admin_role.name),
            permissions,
            tokens: {
                access: access_token,
                token
            }
        }
    }

    static async rotateRefreshToken(account_id: string, oldToken: string) {

        if (!account_id) {
            throw new AppError("account_id requis", 400)
        }

        if (!oldToken) {
            throw new AppError("refresh token requis", 400)
        }

        // récupérer le token actuel
        const hash_old = hashToken(oldToken)
        console.log("############## old token hashed #############", hash_old);

        const existingToken = await prisma.refreshToken.findUnique({
            where: {
                token: hash_old
            }
        })

        if (!existingToken) {
            throw new AppError("refresh token invalide", 401)
        }

        if (existingToken.revoked_at || existingToken.expires_at < new Date()) {
            throw new AppError("refresh token expiré ou révoqué", 401)
        }

        // révoquer l'ancien
        await prisma.refreshToken.update({
            where: {
                token: hash_old
            },
            data: {
                revoked_at: new Date()
            }
        })

        const { token, tokenHash } = generateRefreshToken()

        const expires_at = new Date(Date.now() + 48 * 60 * 60 * 1000)

        // sauvegarder nouveau token
        await prisma.refreshToken.create({
            data: {
                account_id,
                account_type: existingToken.account_type,
                token: tokenHash,
                expires_at
            }
        })

        return {
            token,
            expires_at
        }
    }
}