import winston from "winston";
import { config } from ".";
import fs from "fs";

if (!fs.existsSync("logs")) {
    fs.mkdirSync("logs");
}
const logger = winston.createLogger({
    level: config.LOG_LEVEL,
    defaultMeta: { service: config.SERVICE_NAME },
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.printf((info) => {
            const { level, message, timestamp } = info;
            const service = (info as any).service ?? config.SERVICE_NAME;

            return `[${timestamp}] [${level}] [${service}]: ${message}`;
        })
    ),
    transports: [
        new winston.transports.Console(),

        new winston.transports.File({
            filename: "logs/error.log",
            level: "error"
        }),

        new winston.transports.File({
            filename: "logs/combined.log"
        })
    ]
});

export default logger;