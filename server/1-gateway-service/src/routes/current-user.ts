import { CurrentUser } from '@gateway/controllers/auth/current-user';
import { RefreshToken } from '@gateway/controllers/auth/refresh-token';
import { authMiddleware } from '@gateway/services/auth.middleware';
import express, { Router } from 'express';

class CurrentUserRoutes {
  private router: Router;

  constructor() {
    this.router = express.Router();
  }

  public routes(): Router {
    this.router.get('/auth/refresh-token/:username', authMiddleware.checkAuthentication, RefreshToken.prototype.tokenRefresh);
    this.router.get('/auth/current-user', authMiddleware.checkAuthentication, CurrentUser.prototype.currentUser);
    this.router.post('/auth/resend-email', authMiddleware.checkAuthentication, CurrentUser.prototype.resendEmail);
    this.router.get('/auth/logged-in-user', authMiddleware.checkAuthentication, CurrentUser.prototype.getLoggedInUsers);
    this.router.delete('/auth/logged-in-user/:username', authMiddleware.checkAuthentication, CurrentUser.prototype.removeLoggedInUser);
    return this.router;
  }
}

export const currentUserRoutes: CurrentUserRoutes = new CurrentUserRoutes();