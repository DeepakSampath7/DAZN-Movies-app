import dotenv from 'dotenv';
dotenv.config();
import express, { Application } from 'express';
import cookieParser from 'cookie-parser';
import applySecurity from '@config/helmet';
import connectDB from '@config/mongoDB';
import cors from '@config/cors';
import { errorHandler } from '@middleware/ErrorMiddileware';
import userRoutes from '@routes/UserRoutes';
import moviesRoutes from '@routes/MoviesRoutes';

const app: Application = express();
const PORT: number = parseInt(process.env.PORT as string, 10) || 5000;

app.use(cors);
app.use(express.json());
app.use(cookieParser());

connectDB();
applySecurity(app);

app.use('/api/users', userRoutes);
app.use('/api/movies', moviesRoutes);

app.use(errorHandler);

app.listen(PORT, () =>
    console.log(`Server running on http://localhost:${PORT}`)
);
