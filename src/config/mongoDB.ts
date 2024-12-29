import mongoose from 'mongoose';

const DB_URI = process.env.DB_URI || 'mongodb://localhost:27017/movielobby';

const connectDB = async () => {
    try {
        await mongoose.connect(DB_URI);
        console.log('MongoDB connected');
    } catch (err) {
        console.error('DB Connection Error:', err);
        process.exit(1);
    }
};

export default connectDB;
