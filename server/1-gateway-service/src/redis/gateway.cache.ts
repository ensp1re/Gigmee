import { config } from '@gateway/config';
import { winstonLogger } from '@ensp1re/gigme-shared';
import { Logger } from 'winston';
import { createClient } from 'redis';

type RedisClient = ReturnType<typeof createClient>;
const log: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'gatewayCache', 'debug');

export class GatewayCache {
  client: RedisClient;

  constructor() {
    this.client = createClient({ url: config.REDIS_HOST as string });
  }

  public async saveUserSelectedCategory(key: string, value: string): Promise<void> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      await this.client.set(key, value);
    } catch (error) {
      log.log('error', 'GatewayCache.saveUserSelectedCategory() method error', error);
    }
  }
  public async saveLoggedInUserToCache(key: string, value: string): Promise<string[]>{
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      const index: number | null = await this.client.LPOS(key, value);
      if (index === null) {
        await this.client.LPUSH(key, value);
        log.info(`User ${value} saved`);
      } 
      const response: string[] = await this.client.LRANGE(key, 0, -1);
      return response;
    } catch (error) {
      log.log('error', 'GatewayCache.saveLoggedInUserToCache() method error', error);
      return [];
    }
  }

  public async getLoggedInUsersFromCache(key: string): Promise<string[]> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      const response: string[] = await this.client.LRANGE(key, 0, -1);
      return response;
    } catch (error) {
      log.log('error', 'GatewayCache.getLoggedInUsersFromCache() method error', error);
      return [];
    }
  }

  public async deleteLoggedInUserFromCache(key: string, value: string): Promise<string[]> {
    try {
       if (!this.client.isOpen) {
        await this.client.connect();
       } 
       await this.client.LREM(key, 1, value);
       log.info(`User ${key} deleted from cache`);
       const response: string[] = await this.client.LRANGE(key, 0, -1);
       return response;
    } catch (error) {
        log.log('error', 'GatewayCache.deleteLoggedInUserFromCache() method error', error);
      return [];
    }
}
}
