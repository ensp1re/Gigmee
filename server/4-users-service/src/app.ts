import { createDatabaseConnection } from '@users/database';
import { config } from '@users/config';
import express, { Application } from 'express';
import { start } from '@users/server';


const initialize = (): void => {
    config.cloudinaryConfig();
    createDatabaseConnection();
    const app: Application = express();
    start(app);
};

initialize();