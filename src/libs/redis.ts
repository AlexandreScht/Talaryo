import config from '@/config';
import { ServerException } from '@/exceptions';
import { logger } from '@/utils/logger';
import Redis, { Redis as RedisClient } from 'ioredis';

//; Create a singleton instance of the Redis class
class RedisInstance {
  private static instance: RedisInstance;
  protected redisClient: RedisClient;

  protected constructor() {
    if (RedisInstance.instance) {
      return RedisInstance.instance;
    }

    const { PASSWORD, PORT } = config.redis;
    this.redisClient = new Redis({
      host: '127.0.0.1',
      port: Number(PORT),
      // Configure redis password if needed
      ...(PASSWORD ? { password: PASSWORD } : {}),
      enableReadyCheck: false,
      maxRetriesPerRequest: null,
    });

    this.redisClient.on('error', err => {
      logger.error('Redis Client Error', err);
      throw new ServerException();
    });

    this.redisClient.on('connect', () => {
      console.info(`             Redis server port: ${this.redisClient.options.port}`);
    });
  }

  public static getInstance(): RedisInstance {
    if (!RedisInstance.instance) {
      RedisInstance.instance = new RedisInstance();
    }
    return RedisInstance.instance;
  }

  getRedisClient(): Redis {
    return this.redisClient;
  }
}

const getRedisInstance = () => RedisInstance.getInstance();

export default getRedisInstance;
