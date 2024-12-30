import winston from 'winston';
import path from 'path';
import fs from 'fs';

const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir);
}

const logFormat = winston.format.printf(({ timestamp, level, message }) => {
    return `${timestamp} [${level}]: ${message}`;
});

const env = process.env.NODE_ENV || 'dev';

const logger = winston.createLogger({
    level: env === 'production' ? 'info' : 'debug',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.colorize(),
        logFormat
    ),
    transports: [
        new winston.transports.Console(),

        ...(env === 'production'
            ? [
                  new winston.transports.File({
                      filename: path.join(logsDir, 'app.log'),
                      level: 'info',
                  }),
              ]
            : []),
    ],
});

logger.exceptions.handle(
    new winston.transports.Console(),
    new winston.transports.File({
        filename: path.join(logsDir, 'exceptions.log'),
    })
);

process.on('unhandledRejection', (reason, promise) => {
    logger.error(`Unhandled Rejection at: ${promise}, reason: ${reason}`);
});

export default logger;
