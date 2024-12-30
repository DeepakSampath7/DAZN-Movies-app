import express from 'express';
import { login, logout, register } from '@controllers/LoginControler';
import { authenticateToken } from '@src/middleware/AdminMiddleware';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', authenticateToken, logout);

export default router;
