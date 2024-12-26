import {Request, Response} from 'express';
import Movie from '../models/MoviesSchema';

export const getMovies = async (req: Request, res: Response): Promise<void> => {
  try {
    const movies = await Movie.find();
    res.json(movies);
  } catch (err) {
    res.status(500).json({error: 'Server Error'});
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
        {title: {$regex: query, $options: 'i'}},
        {genre: {$regex: query, $options: 'i'}},
      ],
    });
    res.json(movies);
  } catch (err) {
    res.status(500).json({error: 'Server Error'});
  }
};

export const addMovie = async (req: Request, res: Response): Promise<void> => {
  const {title, genre, rating, link} = req.body;
  try {
    const newMovie = new Movie({title, genre, rating, link});
    await newMovie.save();
    res.json({message: 'Movie added successfully!'});
  } catch (err) {
    res.status(500).json({error: 'Server Error'});
  }
};

export const updateMovie = async (
  req: Request,
  res: Response
): Promise<void> => {
  const {id} = req.params;
  try {
    await Movie.findByIdAndUpdate(id, req.body);
    res.json({message: 'Movie updated successfully!'});
  } catch (err) {
    res.status(500).json({error: 'Server Error'});
  }
};

export const deleteMovie = async (
  req: Request,
  res: Response
): Promise<void> => {
  const {id} = req.params;
  try {
    await Movie.findByIdAndDelete(id);
    res.json({message: 'Movie deleted successfully!'});
  } catch (err) {
    res.status(500).json({error: 'Server Error'});
  }
};
