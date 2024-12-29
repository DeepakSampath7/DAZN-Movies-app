import { Schema, model } from 'mongoose';

const movieSchema = new Schema({
    title: { type: String, required: true },
    genre: { type: String, required: true },
    rating: { type: Number, required: true },
    link: { type: String, required: true },
});

const Movie = model('Movie', movieSchema);

export default Movie;
