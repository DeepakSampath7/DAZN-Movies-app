import mongoose from 'mongoose';
import logger from '@config/winston';

const DB_URI = process.env.DB_URI || 'mongodb://localhost:27017/movielobby';

const connectDB = async () => {
    try {
        await mongoose.connect(DB_URI);
        logger.info('MongoDB connected');
    } catch (err) {
        logger.error('DB Connection Error:', err);
        process.exit(1);
    }
};

export default connectDB;
