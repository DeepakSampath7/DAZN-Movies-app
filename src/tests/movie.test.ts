import request from 'supertest';
import express from 'express';
import Movie from '@models/MoviesSchema';
import redisClient from '@config/Redis';

const app = express();

jest.mock('../config/Redis', () => ({
    get: jest.fn(),
    set: jest.fn(),
    flushAll: jest.fn(),
}));

jest.mock('../models/MoviesSchema');

beforeEach(() => {
    jest.clearAllMocks();
});

describe('Movies API', () => {
    describe('GET /movies', () => {
        it('should fetch movies from cache if available', async () => {
            const cachedMovies = JSON.stringify([
                { title: 'Inception', genre: 'Sci-Fi' },
            ]);
            (redisClient.get as jest.Mock).mockResolvedValue(cachedMovies);

            const res = await request(app).get('/movies?page=1&limit=10');

            expect(res.status).toBe(200);
            expect(res.body).toEqual(JSON.parse(cachedMovies));
            expect(redisClient.get).toHaveBeenCalledWith('movies_all_1_10');
        });

        it('should fetch movies from DB if not cached', async () => {
            const movies = [{ title: 'Inception', genre: 'Sci-Fi' }];
            (redisClient.get as jest.Mock).mockResolvedValue(null);
            (Movie.find as jest.Mock).mockResolvedValue(movies);

            const res = await request(app).get('/movies?page=1&limit=10');

            expect(res.status).toBe(200);
            expect(res.body).toEqual(movies);
            expect(Movie.find).toHaveBeenCalled();
            expect(redisClient.set).toHaveBeenCalled();
        });
    });

    describe('GET /movies/search', () => {
        it('should return matching movies based on query', async () => {
            const movies = [{ title: 'Avatar', genre: 'Fantasy' }];
            (Movie.find as jest.Mock).mockResolvedValue(movies);

            const res = await request(app).get('/movies/search?q=Avatar');

            expect(res.status).toBe(200);
            expect(res.body).toEqual(movies);
        });
    });

    describe('POST /movies', () => {
        it('should add a new movie', async () => {
            const newMovie = {
                title: 'Titanic',
                genre: 'Romance',
                rating: 8.5,
                link: 'http://example.com',
            };
            (Movie.prototype.save as jest.Mock).mockResolvedValue(newMovie);

            const res = await request(app).post('/movies').send(newMovie);

            expect(res.status).toBe(200);
            expect(res.body.message).toBe('Movie added successfully!');
            expect(redisClient.flushAll).toHaveBeenCalled();
        });

        it('should return 400 if fields are missing', async () => {
            const res = await request(app)
                .post('/movies')
                .send({ title: 'Titanic' });

            expect(res.status).toBe(400);
            expect(res.body.error).toBe('Missing fields');
        });
    });

    describe('PUT /movies/:id', () => {
        it('should update a movie', async () => {
            const res = await request(app)
                .put('/movies/123')
                .send({ title: 'Updated Title' });

            expect(res.status).toBe(200);
            expect(res.body.message).toBe('Movie updated successfully!');
            expect(redisClient.flushAll).toHaveBeenCalled();
        });
    });

    describe('DELETE /movies/:id', () => {
        it('should delete a movie', async () => {
            const res = await request(app).delete('/movies/123');

            expect(res.status).toBe(200);
            expect(res.body.message).toBe('Movie deleted successfully!');
            expect(redisClient.flushAll).toHaveBeenCalled();
        });
    });

    describe('Error handling', () => {
        it('should handle server errors gracefully', async () => {
            (Movie.find as jest.Mock).mockRejectedValue(
                new Error('Database Error')
            );
            const res = await request(app).get('/movies?page=1&limit=10');

            expect(res.status).toBe(500);
            expect(res.body.error).toBe('Server Error');
        });
    });
});
