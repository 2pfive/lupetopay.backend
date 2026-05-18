import { generateTemporaryPassword, hashPassword, validateCreateAdmin } from "./lib/helper";
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

}