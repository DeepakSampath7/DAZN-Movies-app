import { Request, Response, NextFunction } from 'express';

export const setSessionData = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    req.session.userId = '12345';
    console.log('Session Data:', req.session);

    next();
};
