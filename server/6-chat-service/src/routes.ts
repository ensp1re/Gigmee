import { verifyGatewayRequest } from '@ensp1re/gigme-shared';
import { Application } from 'express';
import { healthRouter } from '@chat/routes/health';
import { messageRoutes } from '@chat/routes/message';

const BASE_PATH = '/api/v1/chat';

const appRoutes = (app: Application): void => {
  app.use('', healthRouter());
  app.use(BASE_PATH, verifyGatewayRequest, messageRoutes());
};

export { appRoutes };
