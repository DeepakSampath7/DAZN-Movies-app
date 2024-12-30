import { Request, Response } from 'express';
import Movie from '@models/MoviesSchema';
import redisClient from '@config/redis';
import logger from '@src/config/winston';

Movie.collection.createIndex({ title: 1, genre: 1 });

export const getMovies = async (req: Request, res: Response): Promise<void> => {
    const cacheKey = 'movies_all';
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    try {
        const cachedData = await redisClient.get(
            `${cacheKey}_${page}_${limit}`
        );
        if (cachedData) {
            logger.info(
                `${req.method} API call made to /api/movies - cached data`
            );
            res.json(JSON.parse(cachedData));
            return;
        }

        const movies = await Movie.find().skip(skip).limit(limit);
        await redisClient.set(
            `${cacheKey}_${page}_${limit}`,
            JSON.stringify(movies),
            {
                EX: 3600,
            }
        );
        logger.info(`${req.method} API call made to /api/movies`);
        res.json(movies);
        return;
    } catch (err) {
        logger.error(err);
        res.status(500).json({ error: 'Server Error' });
        return;
    }
};

export const searchMovies = async (
    req: Request,
    res: Response
): Promise<void> => {
    const query = req.query.q as string;
    try {
        const movies = await Movie.find({
            $or: [
                { title: { $regex: query, $options: 'i' } },
                { genre: { $regex: query, $options: 'i' } },
            ],
        }).limit(10);
        logger.info(`${req.method} API call made to /api/movies/search`);
        res.json(movies);
        return;
    } catch (err) {
        logger.error(err);
        res.status(500).json({ error: 'Server Error' });
        return;
    }
};

export const addMovie = async (req: Request, res: Response): Promise<void> => {
    const { title, genre, rating, link } = req.body;
    try {
        if (!title || !genre || !rating || !link) {
            res.status(400).json({ error: 'Missing fields' });
            return;
        }

        const newMovie = new Movie({ title, genre, rating, link });
        await newMovie.save();
        await redisClient.del('movies_all');
        logger.info(`${req.method} API call made to /api/movies`);
        res.json({ message: 'Movie added successfully!' });
        return;
    } catch (err) {
        logger.error(err);
        res.status(500).json({ error: 'Server Error' });
        return;
    }
};

export const updateMovie = async (
    req: Request,
    res: Response
): Promise<void> => {
    const { id } = req.params;
    try {
        await Movie.findByIdAndUpdate(id, req.body);
        await redisClient.del('movies_all');
        logger.info(`${req.method} API call made to /api/movies/${id}`);
        res.json({ message: 'Movie updated successfully!' });
    } catch (err) {
        logger.error(err);
        res.status(500).json({ error: 'Server Error' });
    }
};

export const deleteMovie = async (
    req: Request,
    res: Response
): Promise<void> => {
    const { id } = req.params;
    try {
        await Movie.findByIdAndDelete(id);
        await redisClient.del('movies_all');
        logger.info(`${req.method} API call made to /api/movies/${id}`);
        res.json({ message: 'Movie deleted successfully!' });
    } catch (err) {
        logger.error(err);
        res.status(500).json({ error: 'Server Error' });
    }
};
