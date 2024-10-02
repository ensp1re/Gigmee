import { verifyGatewayRequest } from '@ensp1re/gigme-shared';
import { Application } from 'express';
import { healthRoutes } from '@review/routes/health';
import { reviewRoutes } from '@review/routes/review';


const BASE_URL = '/api/v1/review';

const appRoutes = (app: Application): void => {
  app.use('', healthRoutes());
  app.use(BASE_URL, verifyGatewayRequest, reviewRoutes());
};

export {appRoutes};