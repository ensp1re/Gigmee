import { config } from '@order/config';
import express, { Express } from 'express';
import { start } from '@order/server';
import { databaseConnection } from '@order/database';


const initialize = () => {
    config.cloudinaryConfig();
    databaseConnection();
    const app: Express = express();
    start(app);
};

initialize();