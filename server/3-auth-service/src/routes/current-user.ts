import { currentUser, resendEmail } from '@auth/controllers/current-user';
import { tokenRefresh } from '@auth/controllers/refresh-token';
import express, { Router } from 'express';

const router: Router = express.Router();

export function currentUserRoutes(): Router {
  router.get('/current-user', currentUser);
  router.post('/resend-email', resendEmail);
  router.get('/refresh-token/:username', tokenRefresh);
  return router;
}