import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { Request, Response } from "express";
import { prisma } from "./lib/prisma.client";
import router from "./auth.router";
import { logger } from "./lib/helper";
import { errorMiddleware } from "./auth.middlewares";

dotenv.config();

const app = express();

app.use(express.json());
app.use(cors());

// log des requêtes entrantes
app.use((req, _res, next) => {
    logger.info(`Incoming request`, {
        method: req.method,
        url: req.url
    });
    next();
});

app.use(router);

// route test
app.get('/roles', async (_req: Request, res: Response) => {
    try {
        const response = await prisma.adminRole.findUnique({
            where: {
                name: 'super_admin'
            }
        })
        logger.info("Roles fetched successfully");

        res.json(response);

    } catch (error) {
        logger.error("Error fetching roles", error);
        res.status(500).json({ message: "Error fetching roles" });
    }
});

// middleware global d'erreur (IMPORTANT)
app.use(errorMiddleware);

app.listen(3300, () => {
    logger.info("Auth service started on port 3300");
});

export default app;