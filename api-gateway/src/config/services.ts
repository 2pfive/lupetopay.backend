import { Application, RequestHandler } from "express";
import { createProxyMiddleware, Options } from "http-proxy-middleware";
import { config, routeMiddlewares } from ".";
import logger from "./logger";
import { ServiceConfig } from "../types";

/**
 * Classe responsable de la configuration
 * et de l’enregistrement des proxies des micro-services.
 */
class ServiceProxy {

    /**
     * Liste des micro-services disponibles
     * et leurs configurations respectives.
     */
    private static readonly serviceConfigs: ServiceConfig[] = [
        {
            // Route exposée par l’API Gateway
            path: '/api/v1/auth',

            // URL cible du micro-service
            url: config.AUTH_SERVICE_URL,

            // Réécriture du chemin avant transmission
            // au micro-service cible
            pathRewrite: { "^/api/v1/auth": "" },

            // Nom interne du service
            name: 'auth-service',

            // Temps maximum d’attente avant timeout
            timeout: 5000
        },
        {
            // Route exposée par l’API Gateway
            path: '/api/v1/payment',

            // URL cible du micro-service
            url: config.PAYMENT_SERVICE,

            // Réécriture du chemin avant transmission
            // au micro-service cible
            pathRewrite: { "^/api/v1/payment": "" },

            // Nom interne du service
            name: 'payment-service',

            // Temps maximum d’attente avant timeout
            timeout: 15000
        }
    ];

    /**
     * Génère les options du proxy
     * pour un micro-service donné.
     */
    private static createProxyOptions(service: ServiceConfig): Options {

        return {
            target: service.url,
            changeOrigin: true,
            pathRewrite: service.pathRewrite,
            timeout: service.timeout ?? config.DEFAULT_TIMEOUT,

            // IMPORTANT
            preserveHeaderKeyCase: true,
            proxyTimeout: 10000,
            secure: false,

            onProxyReq: (_proxyReq, req) => {
                logger.info("proxy_request", {
                    service: service.name,
                    method: req.method,
                    url: req.url
                });

                //  NE PAS TOUCHER AU BODY 
            },

            onError: (err, _req, res: any) => {
                logger.error(`[${service.name}] Proxy error: ${err.message}`);

                res.status(502).json({
                    error: "Bad Gateway",
                    service: service.name
                });
            }
        };
    }

    /**
     * Enregistre tous les proxies
     * dans l’application Express.
     */
    public static setupProxy(app: Application): void {

        ServiceProxy.serviceConfigs.forEach((service) => {

            // Création des options du proxy
            const proxyOptions = ServiceProxy.createProxyOptions(service);

            // Création du middleware proxy
            const middleware: RequestHandler = createProxyMiddleware(proxyOptions);

            // Association du proxy à la route définie
            app.use(service.path, middleware);

            // Log d’enregistrement du service
            logger.info("proxy_registered", {
                service: service.name,
                path: service.path,
                target: service.url
            });
        });
    }
}

/**
 * Fonction exportée permettant
 * d’initialiser tous les proxies.
 */
export const proxyServices = (app: Application): void => {

    ServiceProxy.setupProxy(app);
};


export const registerRouteMiddlewares = (
    app: Application
) => {

    routeMiddlewares.forEach(route => {
        app.use(
            route.path,
            ...route.middlewares
        );
    });
};