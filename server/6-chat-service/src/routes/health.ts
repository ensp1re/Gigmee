import { health } from '@chat/controllers/health';
import express, { Router } from 'express';

const router = express.Router();

const healthRouter = (): Router => {
    router.get('/chat-health', health);
    return router;
};

export { healthRouter };