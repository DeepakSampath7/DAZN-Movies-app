import {Request, Response, NextFunction} from 'express';
import {verifyToken} from '../config/jwt';

interface CustomRequest extends Request {
  user?: any; 
}

export const authenticateToken = async (
  req: CustomRequest, 
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.headers.authorization?.split(' ')[1];


    if (!token) {
      res.status(401).json({message: 'Session expired. Please log in again.'});
    }

    const decoded: any = verifyToken(token as string);

    if (decoded.role !== 'admin') {
      res.status(403).json({message: 'Access denied. Admin role is required.'});
    }

    req.user = decoded;

    next();
  } catch (err) {
    console.error('Authentication error:', err);
    res.status(401).json({message: 'Invalid token or session error'});
  }
};
