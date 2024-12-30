import express from 'express';
import { login, logout, register } from '@src/controllers/LoginController';
import { authenticateToken } from '@src/middleware/AuthMiddleware';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', authenticateToken, logout);

export default router;
