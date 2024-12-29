import {createClient, RedisClientType} from '@redis/client';

const redisClient: RedisClientType = createClient({
  url: 'redis://localhost:6379',
});

const connectRedis = async () => {
  try {
    await redisClient.connect();
    console.log('Redis connected');
  } catch (err) {
    console.error('Redis connection error:', err);
  }
};

connectRedis().catch((err) => console.error('Connection failed:', err));

process.on('SIGINT', async () => {
  await redisClient.quit();
  console.log('Redis connection closed');
  process.exit(0);
});

export default redisClient;
