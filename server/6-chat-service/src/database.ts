import { Logger } from 'winston';
import { winstonLogger } from '@ensp1re/gigme-shared';
import { config } from '@chat/config';
import mongoose from 'mongoose';

const log: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'chatDatabaseServer', 'debug');

const databaseConnection = async (): Promise<void> => {
  try {
    await mongoose.connect(`${config.DATABASE_URL}`);
    log.info(`Gig service successfully connected to database: ${config.DATABASE_URL}`);
  } catch (error) {
    log.log('error', 'ChatService databaseConnection() method error', error);
  }
};

export { databaseConnection };
