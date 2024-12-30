import redisClient from '@config/Redis';

const listSessions = async () => {
    try {
        const keys = await redisClient.keys('user_session_*');
        console.log('Active sessions:', keys);

        for (const key of keys) {
            const value = await redisClient.get(key);
            console.log(`Session Key: ${key}, Token: ${value}`);
        }
    } catch (error) {
        console.error('Error listing sessions:', error);
    }
};

export default listSessions;
