import cors from 'cors';

const corsOptions = {
    origin: (origin: string | undefined, callback: Function) => {
        if (
            !origin ||
            origin === `http://localhost:${process.env.CLIENT}` ||
            origin === `http://127.0.0.1:${process.env.CLIENT}`
        ) {
            callback(null, true);
        } else {
            callback(new Error('CORS not allowed'), false);
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
};

export default cors(corsOptions);
