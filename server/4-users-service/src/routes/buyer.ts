import { currentUsername, email, username } from '@users/controllers/buyer/get';
import express, { Router } from 'express';


const router: Router = express.Router();

export const buyerRoutes = (): Router => {
    router.get('/:username', username);
    router.get('/email', email);
    router.get('/username', currentUsername);

    return router;
};