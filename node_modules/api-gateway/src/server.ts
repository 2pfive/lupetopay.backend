import dotenv from "dotenv"

dotenv.config()

import express, { Request, NextFunction, Response } from "express"
import helmet from "helmet"
import cors from "cors"

import { config } from "./config"
import logger from "./config/logger"
import { proxyServices, registerRouteMiddlewares } from "./config/services"


const app = express()

app.use(helmet())
app.use(cors())
// app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// logging des requêtes
app.use((req: Request, _res: Response, next: NextFunction) => {
    logger.debug("incoming_request", {
        method: req.method,
        url: req.url,
        ip: req.ip
    });
    next()
})

// Health check endpoint
app.get('/health', (_req: Request, res: Response) => {
    res.status(200).json({ status: 'ok' })
})


//application des middlewares
registerRouteMiddlewares(app)


// services routes
proxyServices(app)

// 404 handler (routes inexistantes, ressouces introuvables)
app.use((req: Request, res: Response) => {
    logger.warn(`Resource not found: ${req.method} ${req.url}`)
    res.status(404).json({
        message: 'resource not found'
    })
})

app.use((req, _res, next) => {
    if (req.originalUrl.startsWith("/api/v1/")) {
        delete req.body; // important
    }
    next();
});

// Gestionnaire d'erreurs non géré
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    logger.error('Unhandled error', {
        message: err.message,
        stack: err.stack
    });

    res.status(500).json({
        message: 'Internal server error'
    });
});

const server = app.listen(config.PORT, () => {

    logger.info("server_started", {
        service: config.SERVICE_NAME,
        port: config.PORT
    });
});

/**
 * Gestion des erreurs serveur
 */
server.on("error", (error) => {

    logger.error("server_start_error", {
        error
    });

    process.exit(1);
});