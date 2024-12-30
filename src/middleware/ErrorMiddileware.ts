import logger from '@src/config/winston';
import { Request, Response, NextFunction } from 'express';

export const errorHandler = (
    err: any,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    logger.error(err.stack);
    res.status(500).json({ error: 'Internal Server Error' });
};
