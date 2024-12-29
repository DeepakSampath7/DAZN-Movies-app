// Import the required module
import 'express-session';

declare module 'express-session' {
    interface Session {
        userId?: string;
    }
}
