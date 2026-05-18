import dotenv from "dotenv"

dotenv.config()

export const config={
    saltRounds:process.env.SAT_ROUNDS || 10,
    jwt_secret_ket:process.env.JWT_SECRET_KEY || ''
}