import dotenv from "dotenv"
import path from "path"
import fs from "fs"

dotenv.config()
const PRIVATE_KEY = fs.readFileSync(path.join(process.cwd(), 'keys/admin_lupeto_pay_key_private.pem'), "utf8")
const PUBLIC_KEY = fs.readFileSync(path.join(process.cwd(), 'keys/admin_lupeto_pay_key_public.pem'), "utf8")
// console.log(PRIVATE_KEY);

export const config = {
    saltRounds: process.env.SALT_ROUND || 10,
    jwt_secret_key: process.env.AUTH_JWT_SECRET || '',
    admin_private_key: PRIVATE_KEY,
    admin_public_key: PUBLIC_KEY,
    refresh_secret:process.env.REFRESH_SECRET
}