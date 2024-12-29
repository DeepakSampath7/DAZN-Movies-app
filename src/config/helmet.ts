import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});

const applySecurity = (app: any) => {
  app.use(helmet());
  app.use(limiter);
};

export default applySecurity;
