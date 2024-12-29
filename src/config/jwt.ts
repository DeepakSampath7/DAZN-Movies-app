import jwt from 'jsonwebtoken';
import {Types} from 'mongoose';

const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;

if (!JWT_SECRET_KEY) {
  throw new Error('JWT_SECRET_KEY is not defined in the environment variables');
}

export const generateToken = (
  userId: string | Types.ObjectId,
  role: 'user' | 'admin'
): string => {
  const payload = {
    userId: userId.toString(),
    role,
  };

  return jwt.sign(payload, JWT_SECRET_KEY, {
    expiresIn: '1h',
  });
};

export const verifyToken = (token: string) => {
  try {
    return jwt.verify(token, JWT_SECRET_KEY);
  } catch (err) {
    throw new Error('Invalid token');
  }
};
