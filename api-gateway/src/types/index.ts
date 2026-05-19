import {  RequestHandler } from "express";

export interface ServiceConfig {
    path: string,
    url: string,
    pathRewrite: Record<string, string>,
    name: string,
    timeout?: number,
    middlewares?: RequestHandler[]
}


export interface ProxyErrorResponse {
    message: string,
    status: number,
    timestamp: string
}

export interface Config {
    SERVICE_NAME: string,
    PORT: number,
    DEFAULT_TIMEOUT: number,
    AUTH_JWT_SECRET: string,
    GATEWAY_JWT_SECRET: string,
    GATEWAY_JWT_EXPIRES_IN: string,
    LOG_LEVEL: string,
    PUBLIC_KEY:string,
    AUTH_SERVICE_URL: string,
    PAYMENT_SERVICE: string,
}