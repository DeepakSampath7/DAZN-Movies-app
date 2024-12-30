import { Request, Response, NextFunction } from 'express';
import User from '@models/UsersSchema';
import { generateToken, verifyToken } from '@config/jwt';
import redisClient from '@config/Redis';

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

        res.status(201).json({
            message: 'User registered successfully',
            user: {
                username: newUser.username,
                email: newUser.email,
                role: newUser.role,
            },
        });
    } catch (error) {
        next(error);
    }
};

export const login = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    const { email, password } = req.body;

    if (!email || !password) {
        res.status(400).json({ message: 'Email and password are required' });
        return;
    }

    try {
        const user = await User.findOne({ email });
        if (!user) {
            res.status(401).json({ message: 'Invalid credentials' });
            return;
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            res.status(401).json({ message: 'Invalid credentials' });
            return;
        }

        const token = generateToken(user._id, user.role);

        const redisKey = `user_session_${user._id}`;

        await redisClient.set(redisKey, token, { EX: 3600 });
        const key = await redisClient.get(redisKey);
        console.log('login redis key', key);

        res.cookie('session', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'dev',
            sameSite: 'strict',
            maxAge: 3600 * 1000,
        });

        res.json({ message: 'Login successful' });
    } catch (error) {
        next(error);
    }
};

export const logout = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    const token = req.cookies.session;

    if (!token) {
        res.status(400).json({ message: 'No session found' });
        return;
    }

    try {
        const decoded: any = verifyToken(token);

        const redisKey = `user_session_${decoded.userId}`;
        await redisClient.del(redisKey);

        res.clearCookie('session', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'dev',
            sameSite: 'strict',
        });

        res.json({ message: 'Logout successful' });
    } catch (err) {
        next(err);
    }
};
