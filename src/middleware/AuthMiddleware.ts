import { Request, Response, NextFunction } from 'express';
import redisClient from '@config/redis';
import { verifyToken } from '@config/jwt';
import listSessions from '@session/ListSession';
import logger from '@src/config/winston';

interface CustomRequest extends Request {
    user?: any;
}

export const authenticateToken = async (
    req: CustomRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const token = req.cookies.session;

        if (!token) {
            res.status(401).json({
                message: 'Session expired. Please log in again.',
            });
            return;
        }

        const decoded: any = verifyToken(token);
        const redisKey = `user_session_${decoded.userId}`;
        const redisToken = await redisClient.get(redisKey);

        listSessions();

        if (!redisToken || redisToken !== token) {
            logger.error('Session expired. Please log in again.');
            res.status(401).json({
                message: 'Session expired. Please log in again.',
            });
            return;
        }

        if (decoded.role !== 'admin') {
            logger.error('Access denied. Admin role is required.');
            res.status(403).json({
                message: 'Access denied. Admin role is required.',
            });
            return;
        }

        req.user = {
            userId: decoded.userId,
            role: decoded.role,
        };

        next();
    } catch (err) {
        logger.error(err);
        res.status(401).json({
            message: 'Invalid token or session error',
        });
    }
};
