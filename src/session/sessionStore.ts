import session from 'express-session';
const RedisStore = require('connect-redis')(session);
import redisClient from '../config/Redis';

const store = new RedisStore({
    client: redisClient,
    ttl: 86400,
});

export default store;
