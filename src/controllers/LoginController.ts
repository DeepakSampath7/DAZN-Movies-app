import { Request, Response, NextFunction } from 'express';
import User from '@models/UsersSchema';
import { generateToken, verifyToken } from '@config/jwt';
import redisClient from '@config/redis';
import logger from '@src/config/winston';

export const register = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    const { username, email, password, role = 'user' } = req.body;

    if (!username || !email || !password) {
        res.status(400).json({ message: 'All fields are required' });
        return;
    }

    try {
        const existingUser = await User.findOne({
            $or: [{ email }, { username }],
        });
        if (existingUser) {
            logger.error(
                `${req.method} API call made to /api/users/register - User already exists`
            );
            res.status(400).json({ message: 'User already exists' });
            return;
        }

        const hashedPassword = await User.hashPassword(password);

        const newUser = new User({
            username,
            email,
            password: hashedPassword,
            role,
        });

        await newUser.save();
        logger.info(`${req.method} API call made to /api/users/register`);
        res.status(201).json({
            message: 'User registered successfully',
            user: {
                username: newUser.username,
                email: newUser.email,
                role: newUser.role,
            },
        });
    } catch (err) {
        logger.error(err);
        next(err);
    }
};

export const login = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    const { email, password } = req.body;

    if (!email || !password) {
        logger.error(
            `${req.method} API call made to /api/users/login - Email and password are required`
        );
        res.status(400).json({ message: 'Email and password are required' });
        return;
    }

    try {
        const user = await User.findOne({ email });
        if (!user) {
            logger.error(
                `${req.method} API call made to /api/users/login - Invalid credentials`
            );
            res.status(401).json({ message: 'Invalid credentials' });
            return;
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            logger.error(
                `${req.method} API call made to /api/users/login - Invalid credentials`
            );
            res.status(401).json({ message: 'Invalid credentials' });
            return;
        }

        const token = generateToken(user._id, user.role);

        const redisKey = `user_session_${user._id}`;

        await redisClient.set(redisKey, token, { EX: 3600 });

        res.cookie('session', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'dev',
            sameSite: 'strict',
            maxAge: 3600 * 1000,
        });

        logger.info(`${req.method} API call made to /api/users/login`);

        res.json({ message: `${user.username} - Login successful` });
    } catch (err) {
        logger.error(err);
        next(err);
    }
};

export const logout = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    const token = req.cookies.session;

    if (!token) {
        logger.error(
            `${req.method} API call made to /api/users/logout - No session found`
        );
        res.status(400).json({ message: 'No session found' });
        return;
    }

    try {
        const decoded: any = verifyToken(token);

        const redisKey = `user_session_${decoded.userId}`;
        await redisClient.del(redisKey);
        await redisClient.flushAll();

        res.clearCookie('session', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'dev',
            sameSite: 'strict',
        });
        logger.info(`${req.method} API call made to /api/users/logout`);
        res.json({ message: 'Logout successful' });
    } catch (err) {
        logger.error(err);
        next(err);
    }
};
