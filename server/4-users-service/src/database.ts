import { winstonLogger } from '@ensp1re/gigme-shared';
import { Logger } from 'winston';
import { config } from '@users/config';
import mongoose from 'mongoose';


const log: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'usersDatabaseServer', 'debug');

export async function createDatabaseConnection(): Promise<void> {
    try {
        await mongoose.connect(`${config.DATABASE_URL}`, {});
        log.info('Users Service successfully connected to database');
    } catch (error) {
        log.log('error', 'UsersService createDatabaseConnection() method error', error);
    }
}