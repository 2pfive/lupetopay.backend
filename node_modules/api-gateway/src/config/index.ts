import { Config } from "../types";
import fs from "fs"
import path from "path";
import { requireAuth,requireRefreshToken} from "../middlewares/auth.middlewares";


const PUBLIC_KEY = fs.readFileSync(path.join(process.cwd(), 'keys/admin_lupeto_pay_key_public.pem'), "utf8")

export const config: Config = {
    SERVICE_NAME: require('../../package.json').name,
    PORT: Number(process.env.PORT) || 3000,
    DEFAULT_TIMEOUT: Number(process.env.DEFAULT_TIMEOUT || '30000'),
    AUTH_JWT_SECRET: process.env.AUTH_JWT_SECRET || 'default-gateway-key',
    GATEWAY_JWT_SECRET: process.env.GATEWAY_JWT_SECRET || '',
    GATEWAY_JWT_EXPIRES_IN: process.env.GATEWAY_JWT_EXPIRES_IN || '1m',
    LOG_LEVEL: process.env.LOG_lEVEL || 'info',
    AUTH_SERVICE_URL: process.env.AUTH_SERVICE_URL || 'http://localhost:',
    PAYMENT_SERVICE: process.env.PAYMENT_SERVICE || 'http://localhost:',
    PUBLIC_KEY
}


export const routeMiddlewares = [

    /**
     * AUTH
     */
    {
        path: "/api/v1/auth/refresh",
        middlewares: [requireRefreshToken]
    },

    {
        path: "/api/v1/auth/me",
        middlewares: [requireAuth]
    },

    {
        path: "/api/v1/auth/admins",
        middlewares: [
            requireAuth
        ]
    },

    /**
     * PAYMENT
     */
    {
        path: "/api/v1/payment/create",
        middlewares: [requireAuth]
    },

    {
        path: "/api/v1/payment/history",
        middlewares: [requireAuth]
    }
];