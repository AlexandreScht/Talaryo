import config from '@/config';
import { ServerException } from '@/exceptions';
import { logger } from '@/utils/logger';
import Redis, { Redis as RedisClient } from 'ioredis';
import { SkipInTest } from './decorators';

class RedisInstance {
  private static instance: RedisInstance;
  protected redisClient: RedisClient;

  private constructor() {
    const { PASSWORD, PORT } = config.redis;

    this.redisClient =
      process.env.NODE_ENV !== 'test'
        ? new Redis({
            host: '127.0.0.1',
            port: Number(PORT),
            ...(PASSWORD ? { password: PASSWORD } : {}),
            enableReadyCheck: false,
            maxRetriesPerRequest: null,
          })
        : (function () {
            const RedisMock = require('ioredis-mock');

            return new RedisMock({
              host: '127.0.0.1',
              port: Number(config.redis.PORT),
            }) as RedisClient;
          })();

    this.redisClient.on('error', err => {
      logger.error('Redis Client Error', err);
      throw new ServerException();
    });

    this.redisClient.on(
      'connect',
      SkipInTest(() => {
        console.info(`             Redis server port: ${this.redisClient.options.port}`);
      })(),
    );
  }

  public static getInstance(): RedisInstance {
    if (!RedisInstance.instance) {
      RedisInstance.instance = new RedisInstance();
    }
    return RedisInstance.instance;
  }

  public getRedisClient(): RedisClient {
    return this.redisClient;
  }

  public async disconnect(): Promise<void> {
    try {
      await this.redisClient.quit();
      console.info('Redis connection closed.');
    } catch (error) {
      logger.error('Error closing Redis connection:', error);
    }
  }
}

export default RedisInstance.getInstance();
