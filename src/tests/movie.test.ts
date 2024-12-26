import {Request, Response} from 'express';
import Movie from '../models/MoviesSchema';

import {
  getMovies,
  searchMovies,
  addMovie,
  updateMovie,
  deleteMovie,
} from '../controllers/MoviesController';

// Mock the Movie model

jest.mock('../models/MoviesSchema', () => {
  return {
    __esModule: true,

    default: {
      find: jest.fn(),

      findByIdAndUpdate: jest.fn(),

      findByIdAndDelete: jest.fn(),
    },
  };
});

// Define types

type MockResponse = {
  json: jest.Mock;

  status?: jest.Mock;
};

type MockModel = {
  find: jest.Mock;

  findByIdAndUpdate: jest.Mock;

  findByIdAndDelete: jest.Mock;

  prototype: {
    save: jest.Mock;
  };
};

const MockMovie = Movie as unknown as MockModel;

describe('Movie API Functions', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getMovies', () => {
    it('should return all movies', async () => {
      const mockMovies = [
        {title: 'Star Wars', genre: 'Sci-Fi', rating: 5, link: 'link1'},

        {title: 'The Matrix', genre: 'Action', rating: 4, link: 'link2'},
      ];

      MockMovie.find.mockResolvedValueOnce(mockMovies);

      const res = {json: jest.fn()} as MockResponse;

      const req = {} as Request;

      await getMovies(req, res as unknown as Response);

      expect(MockMovie.find).toHaveBeenCalled();

      expect(res.json).toHaveBeenCalledWith(mockMovies);
    });

    it('should return server error on failure', async () => {
      MockMovie.find.mockRejectedValueOnce(new Error('Internal Server Error'));

      const res = {
        json: jest.fn(),

        status: jest.fn().mockReturnThis(),
      } as MockResponse;

      const req = {} as Request;

      await getMovies(req, res as unknown as Response);

      expect(MockMovie.find).toHaveBeenCalled();

      expect(res.status).toHaveBeenCalledWith(500);

      expect(res.json).toHaveBeenCalledWith({error: 'Server Error'});
    });
  });

  describe('searchMovies', () => {
    it('should search movies by title (case-insensitive)', async () => {
      const mockMovies = [
        {title: 'Star Wars', genre: 'Sci-Fi', rating: 5, link: 'link1'},
      ];

      MockMovie.find.mockResolvedValueOnce(mockMovies);

      const res = {json: jest.fn()} as MockResponse;

      const req = {query: {q: 'star'}} as unknown as Request;

      await searchMovies(req, res as unknown as Response);

      expect(MockMovie.find).toHaveBeenCalledWith({
        $or: [
          {title: {$regex: 'star', $options: 'i'}},

          {genre: {$regex: 'star', $options: 'i'}},
        ],
      });

      expect(res.json).toHaveBeenCalledWith(mockMovies);
    });

    it('should search movies by genre (case-insensitive)', async () => {
      const mockMovies = [
        {title: 'The Matrix', genre: 'Action', rating: 4, link: 'link2'},
      ];

      MockMovie.find.mockResolvedValueOnce(mockMovies);

      const res = {json: jest.fn()} as MockResponse;

      const req = {query: {q: 'ACTion'}} as unknown as Request;

      await searchMovies(req, res as unknown as Response);

      expect(MockMovie.find).toHaveBeenCalledWith({
        $or: [
          {title: {$regex: 'ACTion', $options: 'i'}},

          {genre: {$regex: 'ACTion', $options: 'i'}},
        ],
      });

      expect(res.json).toHaveBeenCalledWith(mockMovies);
    });

    it('should return empty array if no movies found', async () => {
      MockMovie.find.mockResolvedValueOnce([]);

      const res = {json: jest.fn()} as MockResponse;

      const req = {query: {q: 'fantasy'}} as unknown as Request;

      await searchMovies(req, res as unknown as Response);

      expect(MockMovie.find).toHaveBeenCalled();

      expect(res.json).toHaveBeenCalledWith([]);
    });

    it('should return server error on failure', async () => {
      MockMovie.find.mockRejectedValueOnce(new Error('Internal Server Error'));

      const res = {
        json: jest.fn(),

        status: jest.fn().mockReturnThis(),
      } as MockResponse;

      const req = {query: {q: 'star'}} as unknown as Request;

      await searchMovies(req, res as unknown as Response);

      expect(MockMovie.find).toHaveBeenCalled();

      expect(res.status).toHaveBeenCalledWith(500);

      expect(res.json).toHaveBeenCalledWith({error: 'Server Error'});
    });
  });

  describe('addMovie', () => {
    it('should add a new movie', async () => {
      const newMovie = {
        title: 'The Lord of the Rings',

        genre: 'Fantasy',

        rating: 5,

        link: 'link3',
      };

      const mockSave = jest.fn();

      MockMovie.prototype.save = mockSave;

      const res = {json: jest.fn()} as MockResponse;

      const req = {body: newMovie} as Request;

      await addMovie(req, res as unknown as Response);

      expect(mockSave).toHaveBeenCalledTimes(1);

      expect(res.json).toHaveBeenCalledWith({
        message: 'Movie added successfully!',
      });
    });

    it('should return server error on failure', async () => {
      const newMovie = {
        title: 'The Lord of the Rings',

        genre: 'Fantasy',

        rating: 5,

        link: 'link3',
      };

      MockMovie.prototype.save = jest

        .fn()

        .mockRejectedValueOnce(new Error('Internal Server Error'));

      const res = {
        json: jest.fn(),

        status: jest.fn().mockReturnThis(),
      } as MockResponse;

      const req = {body: newMovie} as Request;

      await addMovie(req, res as unknown as Response);

      expect(MockMovie.prototype.save).toHaveBeenCalledTimes(1);

      expect(res.status).toHaveBeenCalledWith(500);

      expect(res.json).toHaveBeenCalledWith({error: 'Server Error'});
    });
  });

  describe('updateMovie', () => {
    it('should update an existing movie', async () => {
      const movieId = '123';

      const updateData = {
        title: 'Updated Title',

        genre: 'Updated Genre',

        rating: 4,

        link: 'updated-link',
      };

      MockMovie.findByIdAndUpdate.mockResolvedValueOnce(updateData);

      const res = {json: jest.fn()} as MockResponse;

      const req = {
        params: {id: movieId},

        body: updateData,
      } as unknown as Request;

      await updateMovie(req, res as unknown as Response);

      expect(MockMovie.findByIdAndUpdate).toHaveBeenCalledWith(
        movieId,

        updateData
      );

      expect(res.json).toHaveBeenCalledWith({
        message: 'Movie updated successfully!',
      });
    });

    it('should return server error when update fails', async () => {
      const movieId = '123';

      const updateData = {title: 'Updated Title'};

      MockMovie.findByIdAndUpdate.mockRejectedValueOnce(
        new Error('Update Failed')
      );

      const res = {
        json: jest.fn(),

        status: jest.fn().mockReturnThis(),
      } as MockResponse;

      const req = {
        params: {id: movieId},

        body: updateData,
      } as unknown as Request;

      await updateMovie(req, res as unknown as Response);

      expect(MockMovie.findByIdAndUpdate).toHaveBeenCalledWith(
        movieId,

        updateData
      );

      expect(res.status).toHaveBeenCalledWith(500);

      expect(res.json).toHaveBeenCalledWith({error: 'Server Error'});
    });
  });

  describe('deleteMovie', () => {
    it('should delete an existing movie', async () => {
      const movieId = '123';

      MockMovie.findByIdAndDelete.mockResolvedValueOnce({});

      const res = {json: jest.fn()} as MockResponse;

      const req = {
        params: {id: movieId},
      } as unknown as Request;

      await deleteMovie(req, res as unknown as Response);

      expect(MockMovie.findByIdAndDelete).toHaveBeenCalledWith(movieId);

      expect(res.json).toHaveBeenCalledWith({
        message: 'Movie deleted successfully!',
      });
    });

    it('should return server error when deletion fails', async () => {
      const movieId = '123';

      MockMovie.findByIdAndDelete.mockRejectedValueOnce(
        new Error('Deletion Failed')
      );

      const res = {
        json: jest.fn(),

        status: jest.fn().mockReturnThis(),
      } as MockResponse;

      const req = {
        params: {id: movieId},
      } as unknown as Request;

      await deleteMovie(req, res as unknown as Response);

      expect(MockMovie.findByIdAndDelete).toHaveBeenCalledWith(movieId);

      expect(res.status).toHaveBeenCalledWith(500);

      expect(res.json).toHaveBeenCalledWith({error: 'Server Error'});
    });
  });
});
