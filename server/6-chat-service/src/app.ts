import { config } from '@chat/config';
import { databaseConnection } from '@chat/database';
import express, {Express} from 'express';
import { start } from '@chat/server';

const initialize = () => {
    config.cloudinaryConfig();
    databaseConnection();
    const app: Express = express();
    start(app);
};

initialize();