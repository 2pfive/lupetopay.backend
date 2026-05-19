import { Pool } from "pg";
import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import dotenv from "dotenv"

dotenv.config()

// console.log("[[[[ DB_URL ]]]]",process.env.DATABASE_URL);


const globalForPrisma = global as unknown as {
    prisma: PrismaClient | undefined
}

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
})

const adapter = new PrismaPg(pool)

export const prisma =
    globalForPrisma.prisma ??
    new PrismaClient({
        adapter,
        log: ["error", "warn"]
    })

if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = prisma
} 
