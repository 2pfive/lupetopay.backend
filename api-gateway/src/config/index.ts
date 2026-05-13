import { Config } from "../types";

export const config: Config = {
    SERVICE_NAME: require('../../package.json').name,
    PORT: Number(process.env.PORT) || 3000,
    DEFAULT_TIMEOUT: Number(process.env.DEFAULT_TIMEOUT || '30000'),
    AUTH_JWT_SECRET: process.env.AUTH_JWT_SECRET || 'default-gateway-key',
    GATEWAY_JWT_SECRET: process.env.GATEWAY_JWT_SECRET || '',
    GATEWAY_JWT_EXPIRES_IN: process.env.GATEWAY_JWT_EXPIRES_IN || '1m',
    LOG_LEVEL: process.env.LOG_lEVEL || 'info',
    AUTH_SERVICE_URL: process.env.AUTH_SERVICE_URL || 'http://localhost:',
    PAYMENT_SERVICE: process.env.PAYMENT_SERVICE || 'http://localhost:'
}