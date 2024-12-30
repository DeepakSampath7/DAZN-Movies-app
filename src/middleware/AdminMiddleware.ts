import { Request, Response, NextFunction } from 'express';
import redisClient from '@config/Redis';
import { verifyToken } from '@config/jwt';
import listSessions from '@session/ListSession';

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
            res.status(401).json({
                message: 'Session expired. Please log in again.',
            });
            return;
        }

        if (decoded.role !== 'admin') {
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
        console.log(err);
        res.status(401).json({
            message: 'Invalid token or session error',
        });
    }
};
