import express from 'express';
import { authenticateToken } from '@middleware/AdminMiddleware';
import * as movieController from '@controllers/MoviesController';

const router = express.Router();

router.get('/', movieController.getMovies);
router.get('/search', movieController.searchMovies);
router.post('/', authenticateToken, movieController.addMovie);
router.put('/:id', authenticateToken, movieController.updateMovie);
router.delete('/:id', authenticateToken, movieController.deleteMovie);

export default router;
