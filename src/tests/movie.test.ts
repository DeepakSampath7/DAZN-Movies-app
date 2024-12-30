import request from 'supertest';
import redisClient from '@config/redis';
import Movie from '@models/MoviesSchema';
import express, { Application } from 'express';

const app: Application = express();
app.use(express.json());

jest.mock('@models/MoviesSchema', () => ({
    find: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
    save: jest.fn(),
    collection: { createIndex: jest.fn() },
}));

// Mock Redis client
jest.mock('@redis/client', () => {
    const originalModule = jest.requireActual('@redis/client');
    return {
        ...originalModule,
        createClient: jest.fn(() => ({
            get: jest.fn(),
            set: jest.fn(),
            flushAll: jest.fn(),
            connect: jest.fn().mockResolvedValueOnce(true),
        })),
    };
});

describe('Movie Controller Tests', () => {
    // Clear mocks after each test to prevent leaks
    afterEach(() => {
        jest.clearAllMocks();
    });

    // Test for GET /movies route
    describe('GET /movies', () => {
        it('should return cached movies if available', async () => {
            const cachedMovies = JSON.stringify([
                { title: 'Movie 1', genre: 'Action' },
            ]);
            (redisClient.get as jest.Mock).mockResolvedValueOnce(cachedMovies);

            const response = await request(app).get('/movies?page=1&limit=10');

            expect(response.status).toBe(200);
            expect(response.body).toEqual(JSON.parse(cachedMovies));
            expect(redisClient.get).toHaveBeenCalledWith('movies_all_1_10');
            expect(Movie.find).not.toHaveBeenCalled();
        });

        it('should fetch movies from DB if not cached', async () => {
            const movies = [{ title: 'Movie 1', genre: 'Action' }];
            (redisClient.get as jest.Mock).mockResolvedValueOnce(null); // Simulate cache miss
            (Movie.find as jest.Mock).mockResolvedValueOnce(movies);

            const response = await request(app).get('/movies?page=1&limit=10');

            expect(response.status).toBe(200);
            expect(response.body).toEqual(movies);
            expect(redisClient.set).toHaveBeenCalledWith(
                'movies_all_1_10',
                JSON.stringify(movies),
                { EX: 3600 }
            );
        });
    });

    // Test for POST /movies route
    describe('POST /movies', () => {
        it('should add a new movie and clear cache', async () => {
            const newMovie = {
                title: 'Movie 1',
                genre: 'Action',
                rating: 8,
                link: 'link.com',
            };
            (Movie.prototype.save as jest.Mock).mockResolvedValueOnce(newMovie);

            const response = await request(app).post('/movies').send(newMovie);

            expect(response.status).toBe(200);
            expect(response.body).toEqual({
                message: 'Movie added successfully!',
            });
            expect(Movie.prototype.save).toHaveBeenCalledWith(newMovie);
            expect(redisClient.flushAll).toHaveBeenCalled(); // Cache should be cleared
        });
    });

    // Test for PUT /movies/:id route
    describe('PUT /movies/:id', () => {
        it('should update a movie and clear cache', async () => {
            const movieId = '123';
            const updateData = { title: 'Updated Movie' };
            (Movie.findByIdAndUpdate as jest.Mock).mockResolvedValueOnce({
                ...updateData,
                _id: movieId,
            });

            const response = await request(app)
                .put(`/movies/${movieId}`)
                .send(updateData);

            expect(response.status).toBe(200);
            expect(response.body).toEqual({
                message: 'Movie updated successfully!',
            });
            expect(Movie.findByIdAndUpdate).toHaveBeenCalledWith(
                movieId,
                updateData
            );
            expect(redisClient.flushAll).toHaveBeenCalled(); // Cache should be cleared
        });
    });

    // Test for DELETE /movies/:id route
    describe('DELETE /movies/:id', () => {
        it('should delete a movie and clear cache', async () => {
            const movieId = '123';
            (Movie.findByIdAndDelete as jest.Mock).mockResolvedValueOnce({
                _id: movieId,
            });

            const response = await request(app).delete(`/movies/${movieId}`);

            expect(response.status).toBe(200);
            expect(response.body).toEqual({
                message: 'Movie deleted successfully!',
            });
            expect(Movie.findByIdAndDelete).toHaveBeenCalledWith(movieId);
            expect(redisClient.flushAll).toHaveBeenCalled(); // Cache should be cleared
        });
    });
});
