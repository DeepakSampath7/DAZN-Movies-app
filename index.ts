import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import userRoutes from './src/routes/UserRoutes';
import moviesRoutes from './src/routes/MoviesRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const DB_URI = process.env.DB_URI || 'mongodb://localhost:27017/movielobby';

app.use(express.json());


mongoose
  .connect(DB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  } as mongoose.ConnectOptions)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.log('DB Connection Error:', err));


app.use('/api/users', userRoutes);
app.use('/api/movies', moviesRoutes);

app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
