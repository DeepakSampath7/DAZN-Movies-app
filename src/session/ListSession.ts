import redisClient from '@config/redis';
import logger from '@src/config/winston';

const listSessions = async () => {
    try {
        const keys = await redisClient.keys('user_session_*');
        logger.info('Active sessions:', keys);

        for (const key of keys) {
            const value = await redisClient.get(key);
            logger.error(`Session Key: ${key}, Token: ${value}`);
        }
    } catch (error) {
        logger.error('Error listing sessions:', error);
    }
};

export default listSessions;
