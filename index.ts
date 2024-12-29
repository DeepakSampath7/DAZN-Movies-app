import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import userRoutes from './src/routes/UserRoutes';
import moviesRoutes from './src/routes/MoviesRoutes';
import {errorHandler} from './src/middleware/ErrorMiddileware';
import connectDB from './src/config/mongoDB';
import applySecurity from './src/config/helmet';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

connectDB();
applySecurity(app);

app.use('/api/users', userRoutes);
app.use('/api/movies', moviesRoutes);

app.use(errorHandler);

app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
