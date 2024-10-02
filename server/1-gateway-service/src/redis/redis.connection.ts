import { winstonLogger } from '@ensp1re/gigme-shared';
import { config } from '@gateway/config';
import { createClient } from 'redis';
import { Logger } from 'winston';

type RedisClient =  ReturnType<typeof createClient>;
const log: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'gatewayRedisConnection', 'debug');

class RedisConnection {
    client: RedisClient;

    constructor() {
        this.client = createClient({
            url: `${config.REDIS_HOST}`,
        });
    }

    async redisConnect(): Promise<void> {
        try {
            await this.client.connect();
            log.info(`GatewayService Connected to Redis. Ping: ${await this.client.ping}`);
            this.cacheError();
        } catch (error) {
            log.error('Failed to connect to Redis', error);
            throw error;
        }
    }
    // Add more Redis operations as needed
    private cacheError(): void {
        this.client.on('error', (error: unknown) => {
            log.error(error);
        });
    }
}

export const redisConnection = new RedisConnection();
