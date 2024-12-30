import { createClient, RedisClientType } from '@redis/client';
import logger from '@config/winston';

const redisClient: RedisClientType = createClient({
    url: 'redis://localhost:6379',
});

const connectRedis = async () => {
    try {
        await redisClient.connect();
        logger.info('Redis connected');
    } catch (err) {
        logger.error('Redis connection error:', err);
    }
};

connectRedis().catch((err) => console.error('Connection failed:', err));

process.on('SIGINT', async () => {
    await redisClient.quit();
    logger.info('Redis connection closed');
    process.exit(0);
});

export default redisClient;
