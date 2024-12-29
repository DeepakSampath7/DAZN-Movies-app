import dotenv from 'dotenv';
dotenv.config();
import express, { Application } from 'express';
import userRoutes from '@routes/UserRoutes';
import moviesRoutes from '@routes/MoviesRoutes';
import { errorHandler } from '@middleware/ErrorMiddileware';
import connectDB from '@config/mongoDB';
import applySecurity from '@config/helmet';
import cors from '@config/cors';

const app: Application = express();
const PORT: number = parseInt(process.env.PORT as string, 10) || 5000;

app.use(express.json());
app.use(cors);

connectDB();
applySecurity(app);

app.use('/api/users', userRoutes);
app.use('/api/movies', moviesRoutes);

app.use(errorHandler);

app.listen(PORT, () =>
    console.log(`Server running on http://localhost:${PORT}`)
);
